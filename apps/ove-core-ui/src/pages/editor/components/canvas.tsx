import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { env } from "../../../env";
import type { Section } from ".prisma/client";
import ResizeContainer from "./resize-container";
import { useCanvas, useCells } from "../hooks/canvas";
import { useObservatory } from "../../../hooks/observatories";
import { useSections, usePartialUpdateSection } from "../hooks/sections";
import { useSectionStore, useStateStore } from "../hooks/stores";
import type { Bounds } from "@ove/ove-types";
import { api } from "../../../utils/api";

const useSectionFileInfo = (section: Section) => {
  return useMemo(() => {
    const parsed =
      /^\/store\/(.+)\/(.+)\.(.+)\?versionId=(.+)$/.exec(section.asset);
    if (parsed === null || parsed.length !== 5) return null;
    return {
      bucketName: parsed[1],
      name: parsed[2],
      ext: parsed[3],
      version: parsed[4],
    };
  }, [section.asset]);
};

const useObjectName = (file: ReturnType<typeof useSectionFileInfo>, dataType: string) =>
  useMemo(() => {
    if (!file) return null;
    const { name, ext } = file;

    switch (dataType) {
      case "images":
      case "videos":
      case "audio":
      case "svg":
        return `${name}.${ext}`;

      case "data-table":
        return `${name}.${ext}_OVE_FORMAT.html`;

      case "geojson":
        return `${name}_OVE_FORMAT.json`;

      case "json":
      case "html":
      case "latex":
      case "markdown":
        return `${name}_OVE_FORMAT.html`;

      default:
        return `${name}_OVE_FORMAT.${ext}`;
    }
  }, [file, dataType]);

const SectionContent: React.FC<{
  section: Section;
}> = ({ section }) => {
  const file = useSectionFileInfo(section);
  const objectName = useObjectName(file, section.dataType);

  const getURL = api.projects.getPresignedGetURL.useQuery(
    {
      bucketName: file?.bucketName ?? "ERROR",
      objectName: objectName ?? "ERROR",
      versionId: file?.version ?? "ERROR",
    },
    { enabled: file !== null }
  );

  const url = useMemo(() => {
    if (file === null) return section.asset;
    if (getURL.status !== "success") return undefined;
    return getURL.data;
  }, [file, getURL.status, getURL.data, section.asset]);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    width: '100%',
    height: '100%',
    backgroundColor: "rgba(132, 132, 132, 0.7)",
    pointerEvents: "none" as const,
    objectFit: 'contain' as const,
  };

  switch (section.dataType) {
    case "html":
    case "latex":
    case "markdown":
    case "json":
    case "data-table":
    case "geojson":
      return (
        <iframe
          key={section.id}
          className="absolute"
          style={{ ...baseStyle, border: "none" }}
          src={url}
          title={`section-${section.id}`}
        />
      );
    case "images":
      return (
        <img
          key={section.id}
          className="absolute"
          style={baseStyle}
          src={url}
          alt="Image Section"
        />
      );
    case "videos":
      return (
        <video
          key={section.id}
          className="absolute"
          style={baseStyle}
          src={url}
        />
      );
    default:
      return (
        <div
          key={section.id}
          className="absolute bg-red-500/30"
          style={baseStyle}
        />
      );
  }
};

interface DraggableSectionProps {
  section: Section;
  bounds: Bounds;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onNewPosition: (xNorm: number, yNorm: number) => void;
  onNewSize: (widthNorm: number, heightNorm: number) => void; 
}


const snapToGrid = (configMode: 'grid' | 'custom', value: number, step: number): number => {
  if (configMode === 'grid' && step > 0) {
    return Math.round(value / step) * step;
  }
  return value;
};

const snapPosition = (
  posNorm: number,
  sizeNorm: number,
  cellsCount: number,
  sensitivity: number
): number => {
  const cellSize = 1 / cellsCount;
  const rightBottomBound = 1 - sizeNorm;

  for (let i = 0; i <= cellsCount; i++) {
    const line = i * cellSize;
    if (Math.abs(line - posNorm) < cellSize * sensitivity) {
      return Math.max(0, Math.min(rightBottomBound, line));
    }
    if (Math.abs(line - (posNorm + sizeNorm)) < cellSize * sensitivity) {
      return Math.max(0, Math.min(rightBottomBound, line - sizeNorm));
    }
  }

  return Math.max(0, Math.min(rightBottomBound, posNorm));
};

const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  bounds,
  canvasRef,
  isSelected,
  onSelect,
  onNewPosition,
  onNewSize,
}) => {
  const configMode = useSectionStore((store) => store.configMode);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [xNorm, setXNorm] = useState(section.x);
  const [yNorm, setYNorm] = useState(section.y);
  const [wNorm, setWNorm] = useState(section.width);
  const [hNorm, setHNorm] = useState(section.height);

  const dragStart = useRef({ 
    px: {x: 0, y: 0 }, 
    norm: { x: section.x, y:  section.y } 
  });

  const resizeStart = useRef({ 
    mouse: { x: 0, y: 0 }, 
    sizeNorm: { w: section.width, h: section.height }
  });

  useEffect(() => {
    if (!isDragging && !isResizing) {
      setXNorm(section.x);
      setYNorm(section.y);
      setWNorm(section.width);
      setHNorm(section.height);
    }
  }, [section.x, section.y, section.width, section.height, isDragging, isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;

    e.stopPropagation();
    onSelect(section.id);
    setIsDragging(true);

    dragStart.current = { 
      px: { x: e.clientX, y: e.clientY },
      norm: { x: xNorm, y: yNorm },
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(section.id);
    setIsResizing(true);

    resizeStart.current.mouse = { x: e.clientX, y: e.clientY };
    resizeStart.current.sizeNorm = { w: wNorm, h: hNorm };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      const stepX = 1 / bounds.columns;
      const stepY = 1 / bounds.rows;

      if (isDragging) {
        const dxNorm = (e.clientX - dragStart.current.px.x) / rect.width;
        const dyNorm = (e.clientY - dragStart.current.px.y) / rect.height;

        let newXNorm = dragStart.current.norm.x + dxNorm;
        let newYNorm = dragStart.current.norm.y + dyNorm;

        if (configMode === "grid") {
          newXNorm = snapToGrid(configMode, newXNorm, stepX);
          newYNorm = snapToGrid(configMode, newYNorm, stepY);

          newXNorm = Math.max(0, Math.min(1 - wNorm, newXNorm));
          newYNorm = Math.max(0, Math.min(1 - hNorm, newYNorm));
        } else {
          newXNorm = snapPosition(
            newXNorm,
            wNorm,
            bounds.columns,
            env.CONSTANTS.DRAG_SENSITIVITY.X
          );
          newYNorm = snapPosition(
            newYNorm,
            hNorm,
            bounds.rows,
            env.CONSTANTS.DRAG_SENSITIVITY.Y
          );
        }

        setXNorm(newXNorm);
        setYNorm(newYNorm);

        useSectionStore.getState().setPreviewPos({
          id: section.id,
          xPct: parseFloat(`${newXNorm * 100}`.slice(0, 5)),
          yPct: parseFloat(`${newYNorm * 100}`.slice(0, 5)),
          wPct: parseFloat(`${wNorm * 100}`.slice(0, 5)),
          hPct: parseFloat(`${hNorm * 100}`.slice(0, 5)),
          xGrid: Math.round(newXNorm * bounds.columns),
          yGrid: Math.round(newYNorm * bounds.rows),
          wGrid: Math.round(wNorm * bounds.columns),
          hGrid: Math.round(hNorm * bounds.rows),
        });
      } else if (isResizing) {
        const dxSizeNorm = (e.clientX - resizeStart.current.mouse.x) / rect.width;
        const dySizeNorm = (e.clientY - resizeStart.current.mouse.y) / rect.height;

        let newWNorm = resizeStart.current.sizeNorm.w + dxSizeNorm;
        let newHNorm = resizeStart.current.sizeNorm.h + dySizeNorm;

        const minWNorm =
          configMode === "grid"
            ? stepX
            : 15 / rect.width;

        const minHNorm =
          configMode === "grid"
            ? stepY
            : 15 / rect.height;

        const right = xNorm + newWNorm;
        const snappedRight =
          configMode === "grid"
            ? snapToGrid(configMode, right, stepX)
            : snapPosition(right - newWNorm, newWNorm, bounds.columns, env.CONSTANTS.DRAG_SENSITIVITY.X) + newWNorm;

        newWNorm = Math.max(minWNorm, Math.min(1 - xNorm, snappedRight - xNorm));

        const bottom = yNorm + newHNorm;
        const snappedBottom =
          configMode === "grid"
            ? snapToGrid(configMode, bottom, stepY)
            : snapPosition(bottom - newHNorm, newHNorm, bounds.rows, env.CONSTANTS.DRAG_SENSITIVITY.Y) + newHNorm;

        newHNorm = Math.max(minHNorm, Math.min(1 - yNorm, snappedBottom - yNorm));

        setWNorm(newWNorm);
        setHNorm(newHNorm);

        useSectionStore.getState().setPreviewPos({
          id: section.id,
          xPct: parseFloat(`${xNorm * 100}`.slice(0, 5)),
          yPct: parseFloat(`${yNorm * 100}`.slice(0, 5)),
          wPct: parseFloat(`${newWNorm * 100}`.slice(0, 5)),
          hPct: parseFloat(`${newHNorm * 100}`.slice(0, 5)),
          xGrid: Math.round(xNorm * bounds.columns),
          yGrid: Math.round(yNorm * bounds.rows),
          wGrid: Math.round(newWNorm * bounds.columns),
          hGrid: Math.round(newHNorm * bounds.rows),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onNewPosition(xNorm, yNorm);
      }
      if (isResizing) {
        setIsResizing(false);
        onNewSize(wNorm, hNorm);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    bounds.columns,
    bounds.rows,
    canvasRef,
    xNorm,
    yNorm,
    wNorm,
    hNorm,
    onNewPosition,
    onNewSize,
    section.id,
  ]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${xNorm * 100}%`,
        top: `${yNorm * 100}%`,
        width: `${wNorm * 100}%`,
        height: `${hNorm * 100}%`,
        boxSizing: "border-box",
        border: isSelected ? "1px solid red" : "1px solid #cccccc",
        cursor: isDragging ? "grabbing" : "grab",
        overflow: "hidden",
        userSelect: 'none',
      }}
    >
      <SectionContent section={{ ...section, x: xNorm, y: yNorm, width: wNorm, height: hNorm }} />

      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          padding: "2px 6px",
          borderRadius: 4,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          fontSize: 12,
        }}
      >
        {section.ordering}
      </div>

      {isSelected && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeMouseDown}
          style={{
            position: "absolute",
            bottom: -5,
            right: -5,
            width: 12,
            height: 12,
            backgroundColor: "white",
            cursor: "nwse-resize",
            borderRadius: "50%",
            border: "2px solid white",
          }}
        />
      )}
    </div>
  );
};


const Canvas: React.FC = () => {
  const canvas = useCanvas();
  const cells = useCells();
  const { bounds } = useObservatory();
  const { getSections } = useSections();
  const selectedState = useStateStore((state) => state.selectedState);
  const selectedSectionId = useSectionStore((state) => state.selectedSection);
  const setSelectedSection = useSectionStore((state) => state.setSelectedSection);

  const partialUpdateSection = usePartialUpdateSection();

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const sections = useMemo(
    () => (bounds ? getSections(selectedState) : []),
    [bounds, getSections, selectedState]
  );

  const handleNewPosition = useCallback(
    (xNorm: number, yNorm: number) => {
      partialUpdateSection({ x: xNorm, y: yNorm });
    },
    [partialUpdateSection]
  );

  const handleNewSize = useCallback(
    (widthNorm: number, heightNorm: number) => {
      partialUpdateSection({ width: widthNorm, height: heightNorm });
    },
    [partialUpdateSection]
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      setSelectedSection(null);
    }
  };

  if (!bounds) {
    return null;
  }

  const scaleX = (n: number) => (canvas.width / bounds.width) * n;
  const scaleY = (n: number) => (canvas.height / bounds.height) * n;

  return (
    <ResizeContainer canvas={canvas}>
      <div
        ref={canvasRef}
        onMouseDown={handleCanvasClick}
        className="relative border border-#002147 overflow-hidden"
        style={{
          width: canvas.width + 2,
          height: canvas.height + 2,
        }}
      >
        {cells?.map((cell, i) => (
          <div
            key={i}
            title={`Cell No: ${i}`}
            style={{
              position: "absolute",
              left: scaleX(cell.x),
              top: scaleY(cell.y),
              width: scaleX(cell.width),
              height: scaleY(cell.height),
              backgroundColor: "#002147",
              border: "1px solid white",
              boxSizing: "border-box"
            }}
          />
        ))}
        {sections.map((section) => (
          <DraggableSection
            key={section.id}
            section={section}
            bounds={bounds}
            canvasRef={canvasRef}
            isSelected={selectedSectionId === section.id}
            onSelect={setSelectedSection}
            onNewPosition={handleNewPosition}
            onNewSize={handleNewSize}
          />
        ))}
      </div>
    </ResizeContainer>
  );
};

export default Canvas;
