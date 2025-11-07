import * as d3 from "d3";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import type { Geometry } from "../types";
import type { Section } from ".prisma/client";
import ResizeContainer from "./resize-container";
import { useCanvas, useCells } from "../hooks/canvas";
import { type Bounds, dataTypes } from "@ove/ove-types";
import { useObservatory } from "../../../hooks/observatories";
import React, { type RefObject, useMemo, useRef } from "react";
import { useDragSection, usePartialUpdateSection, useSections } from "../hooks/sections";
import { useSectionStore, useStateStore } from "../hooks/stores";

function drawObservatory(
  sections: Section[],
  container: {
    width: number;
    height: number;
  },
  dragSection: (id: string, x: number, y: number) => void,
  select: (id: string) => void,
  selected: string | null,
  bounds: Bounds | null,
  cells: Geometry[],
  svg_: RefObject<SVGSVGElement | null>,
  partialUpdate: (part: Partial<Section>) => void,
) {
  const x = d3
    .scaleLinear()
    .range([0, container.width])
    .domain([0, assert(bounds).width]);
  const inverseX = d3
    .scaleLinear()
    .range([0, assert(bounds).width])
    .domain([0, container.width]);
  const y = d3
    .scaleLinear()
    .range([0, container.height])
    .domain([0, assert(bounds).height]);
  const inverseY = d3
    .scaleLinear()
    .range([0, assert(bounds).height])
    .domain([0, container.height]);

  const HANDLE_SIZE = 8;
  const MIN_SIZE_PX = 24;
  function placeSEHandle(g: d3.Selection<SVGGElement, Section, any, any>, wPx: number, hPx: number) {
    g.select<SVGRectElement>("rect.handle.se")
      .attr("x", wPx - HANDLE_SIZE / 2)
      .attr("y", hPx - HANDLE_SIZE / 2);
  }

  const svg = d3
    .select(svg_.current)
    .attr("width", () => container.width)
    .attr("height", () => container.height);

  svg
    .selectAll<SVGRectElement, Geometry>("rect.cell")
    .data(assert(cells), (_d, i) => i)
    .join(
      enter =>
        enter
          .append("rect")
          .attr("class", "cell fill-[#002147] stroke-white stroke-1")
          .append("title"),
      update => update,
      exit => exit.remove()
    )
    .attr("x", (d) => x(d.x))
    .attr("y", (d) => y(d.y))
    .attr("width", (d) => x(d.width))
    .attr("height", (d) => y(d.height))
    .select("title").text((_d, i) => `Cell No: ${i}`);

  const sectionG = svg
    .selectAll<SVGGElement, Section>("g.section")
    .data(sections, (d: any) => d.id)
    .join(
      enter => {
        const g = enter.append("g").attr("class", "section");

        g.append("rect")
          .attr("id", (d) => `section-${d.id}`)
          .attr("rx", 0)
          .attr("ry", 0)
          .classed("stroke-none opacity-70 stroke-0", true)
          .append("title")
          .text((d) => `Section No.: ${d.ordering}\nAsset URL: ${d.asset}`);

        g.append("text")
          .attr("id", (d) => `label-${d.id}`)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("alignment-baseline", "middle")
          .classed("fill-white section-label", true);

        const handles = g.append("g")
          .attr("class", "handles pointer-events-auto");

        handles.append("rect")
          .attr("class", "handle se fill-white stroke-[#002147] stroke-1 cursor-nwse-resize")
          .attr("width", HANDLE_SIZE)
          .attr("height", HANDLE_SIZE);

        g.on("mousedown", (_ev, d) => select(d.id));

        handles.select<SVGRectElement>("rect.handle.se").call(
          d3.drag<SVGRectElement, Section>()
            .container(() => svg_.current as any)
            .on("start", resizeStart)
            .on("drag", resizing)
            .on("end", resizeEnd) as any
        );

        g.call(
          d3
            .drag<SVGGElement, Section>()
            .on("start", dragStart)
            .on("drag", dragging)
            .on("end", dragEnd) as any
        );

        return g;
      },
      update => update,
      exit => exit.remove()
    );

  sectionG.select("rect")
    .style("fill", d => 
      dataTypes.find(({ name }) => name === (d.dataType ?? "").toLowerCase())?.color 
      ?? "#888888"
    );

  sectionG.each(function (d) {
    const g = d3.select<SVGGElement, Section>(this);
    const rect = g.select<SVGRectElement>("rect");
    const wPx = +rect.attr("width") - 4;
    const hPx = +rect.attr("height") - 4;
    placeSEHandle(g, wPx, hPx);

    g.attr("transform", `translate(${x(d.x)}, ${y(d.y)})`);

    g.select("rect")
      .attr("width", x(d.width))
      .attr("height", y(d.height));

    const baseSize = Math.min(x(d.width), y(d.height)) / 8;

    g.select("text")
      .text(d.ordering)
      .attr("x", x(d.width) / 2)
      .attr("y", y(d.height) / 2)
      .style("font-size", `${d.id === selected ? baseSize * 2 : baseSize}px`)
      .style("font-weight", d.id === selected ? 700 : 400);

    g.select<SVGGElement>("g.handles")
      .style("display", d.id === selected ? "block" : "none")
      .style("pointer-events", d.id === selected ? "auto" : "none");
  });

  const clampX = (x: number, w: number) => {
    for (const cell of assert(cells)) {
      if (
        Math.abs(cell.x - x) <
        (assert(bounds).width / assert(bounds).columns) *
          env.CONSTANTS.DRAG_SENSITIVITY.X
      )
        return cell.x;
      if (
        Math.abs(cell.x + cell.width - (x + w)) <
        (assert(bounds).width / assert(bounds).columns) *
          env.CONSTANTS.DRAG_SENSITIVITY.X
      ) {
        return cell.x + cell.width - w;
      }
    }

    return x;
  };

  const clampY = (y: number, h: number) => {
    for (const cell of assert(cells)) {
      if (
        Math.abs(cell.y - y) <
        (assert(bounds).height / assert(bounds).rows) *
          env.CONSTANTS.DRAG_SENSITIVITY.Y
      )
        return cell.y;
      if (
        Math.abs(cell.y + cell.height - (y + h)) <
        (assert(bounds).height / assert(bounds).rows) *
          env.CONSTANTS.DRAG_SENSITIVITY.Y
      ) {
        return cell.y + cell.height - h;
      }
    }

    return y;
  };

  function dragStart(this: SVGGElement, _event: any, d: Section) {
    select(d.id);

    d3.select(this).raise();

    const rect = d3.select(this).select<SVGRectElement>("rect");
    const w = parseFloat(rect.attr("width"));
    const h = parseFloat(rect.attr("height"));
    const base = Math.min(w, h) / 8;

    d3.select(this)
      .select("text")
      .style("font-size", `${base * 2}px`)
      .style("font-weight", "700");
  }

  function dragging(this: SVGGElement, event: any, d: Section) {
    const g = d3.select(this);
    const rect = g.select<SVGRectElement>("rect");
    const w = +rect.attr("width");
    const h = +rect.attr("height");

    const m = g.node()!.transform.baseVal.consolidate()?.matrix;
    const px0 = m ? m.e : x(d.x);
    const py0 = m ? m.f : y(d.y);

    const nx = Math.max(0, Math.min(x(assert(bounds).width) - w, px0 + event.dx));
    const ny = Math.max(0, Math.min(y(assert(bounds).height) - h, py0 + event.dy));

    const snappedX = x(clampX(inverseX(nx), inverseX(w)));
    const snappedY = y(clampY(inverseY(ny), inverseY(h)));

    g.attr("transform", `translate(${snappedX}, ${snappedY})`);

    const xNorm = inverseX(snappedX) / assert(bounds).width;
    const yNorm = inverseY(snappedY) / assert(bounds).height;
    const xPct  = parseFloat(`${xNorm * 100}`.slice(0, 5));
    const yPct  = parseFloat(`${yNorm * 100}`.slice(0, 5));

    let raf = null;
    if (raf == null) {
      raf = requestAnimationFrame(() => {
        useSectionStore.getState().setPreviewPos({ id: d.id, xPct, yPct });
        raf = null;
      });
    }

  }

  function dragEnd(this: SVGGElement, _event: any, d: Section) {
    const g = d3.select(this);
    const rect = g.select<SVGRectElement>("rect");
    const w = +rect.attr("width");
    const h = +rect.attr("height");
    const base = Math.min(w, h) / 8;

    g.select("text")
      .style("font-size", `${base}px`)
      .style("font-weight", "400");

    select(d.id);

    const m = g.node()!.transform.baseVal.consolidate()!.matrix;
    dragSection(
      d.id,
      inverseX(m.e) / assert(bounds).width,
      inverseY(m.f) / assert(bounds).height
    );

    g.select("rect").style("stroke", "black");
  }

  function resizeStart(this: SVGRectElement, _event: any, d: Section) {
    select(d.id);
    d3.select<SVGGElement, Section>(this.parentNode!.parentNode as SVGGElement).raise();

    const g = d3.select<SVGGElement, Section>(this.parentNode!.parentNode as SVGGElement);
    const rect = g.select<SVGRectElement>("rect");
    const w = +rect.attr("width");
    const h = +rect.attr("height");
    const base = Math.min(w, h) / 8;

    g.select("text")
      .style("font-size", `${base * 2}px`)
      .style("font-weight", "700");
  }

  function resizing(this: SVGRectElement, event: any, d: Section) {
    const sectionG = d3.select<SVGGElement, Section>(this.parentNode!.parentNode as SVGGElement);
    const rect = sectionG.select<SVGRectElement>("rect");

    const m = sectionG.node()!.transform.baseVal.consolidate()?.matrix;
    const left = m ? m.e : x(d.x);
    const top  = m ? m.f : y(d.y);

    const w0 = +rect.attr("width");
    const h0 = +rect.attr("height");

    let right  = left + w0 + event.dx;
    let bottom = top  + h0 + event.dy;

    const maxRight  = x(assert(bounds).width);
    const maxBottom = y(assert(bounds).height);
    right  = Math.min(maxRight,  Math.max(left + MIN_SIZE_PX, right));
    bottom = Math.min(maxBottom, Math.max(top  + MIN_SIZE_PX, bottom));

    const xDom = inverseX(left);
    const yDom = inverseY(top);
    const wDomDesired = inverseX(right - left);
    const hDomDesired = inverseY(bottom - top);

    const snappedWDom = clampX(xDom + wDomDesired, wDomDesired) - xDom;
    const snappedHDom = clampY(yDom + hDomDesired, hDomDesired) - yDom;

    const minWDom = inverseX(MIN_SIZE_PX);
    const minHDom = inverseY(MIN_SIZE_PX);
    const finalWDom = Math.max(minWDom, snappedWDom);
    const finalHDom = Math.max(minHDom, snappedHDom);

    const newWpx = x(xDom + finalWDom) - x(xDom);
    const newHpx = y(yDom + finalHDom) - y(yDom);

    sectionG.attr("transform", `translate(${left}, ${top})`);
    rect.attr("width", newWpx).attr("height", newHpx);

    const base = Math.min(newWpx, newHpx) / 8;
    sectionG.select("text")
      .attr("x", newWpx / 2)
      .attr("y", newHpx / 2)
      .style("font-size", `${base * 2}px`)
      .style("font-weight", "700");

    placeSEHandle(sectionG, newWpx, newHpx);
  }

  function resizeEnd(this: SVGRectElement, _event: any, d: Section) {
    const sectionG = d3.select<SVGGElement, Section>(this.parentNode!.parentNode as SVGGElement);
    const rect = sectionG.select<SVGRectElement>("rect");
    const wPx = +rect.attr("width");
    const hPx = +rect.attr("height");

    const m = sectionG.node()!.transform.baseVal.consolidate()!.matrix;
    const left = m.e;
    const top  = m.f;

    const newW = inverseX(wPx) / assert(bounds).width;
    const newH = inverseY(hPx) / assert(bounds).height;

    partialUpdate({ width: newW, height: newH });

    const base = Math.min(wPx, hPx) / 8;
    sectionG.select("text")
      .style("font-size", `${base}px`)
      .style("font-weight", "400");

    sectionG.select("rect").style("stroke", "black");
  }
}

const Canvas = () => {
  const { getSections } = useSections();
  const { bounds } = useObservatory();
  const selectedState = useStateStore((state) => state.selectedState);
  const selectedSection = useSectionStore((state) => state.selectedSection);
  const setSelectedSection = useSectionStore(
    (state) => state.setSelectedSection,
  );
  const partialUpdate = usePartialUpdateSection();
  const sections = useMemo(
    () =>
      getSections(selectedState).map((s) => ({
        ...s,
        width: s.width * (bounds?.width ?? 0),
        height: s.height * (bounds?.height ?? 0),
        x: s.x * (bounds?.width ?? 0),
        y: s.y * (bounds?.height ?? 0),
      })),
    [getSections, selectedState, bounds?.width, bounds?.height],
  );
  const cells = useCells();
  const canvas = useCanvas();
  const svg_ = useRef<SVGSVGElement | null>(null);
  const defs_ = useRef<SVGDefsElement | null>(null);
  const dragSection = useDragSection();

  if (bounds !== null && cells !== null) {
    drawObservatory(
      sections,
      canvas,
      dragSection,
      setSelectedSection,
      selectedSection,
      bounds,
      cells,
      svg_,
      partialUpdate,
    );
  } else {
    d3.select(svg_.current).selectAll("*").remove();
  }

  return (
    <ResizeContainer canvas={canvas}>
      <svg ref={svg_} width={canvas.width} height={canvas.height}>
        <defs ref={defs_} />
      </svg>
    </ResizeContainer>
  );
};

export default Canvas;
