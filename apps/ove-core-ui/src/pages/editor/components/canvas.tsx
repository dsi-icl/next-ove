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
import { useDragSection, useSections } from "../hooks/sections";
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
    const g = d3.select(this);

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
}

const Canvas = () => {
  const { getSections } = useSections();
  const { bounds } = useObservatory();
  const selectedState = useStateStore((state) => state.selectedState);
  const selectedSection = useSectionStore((state) => state.selectedSection);
  const setSelectedSection = useSectionStore(
    (state) => state.setSelectedSection,
  );
  const sections = useMemo(
    () =>
      getSections(selectedState).map((s) => ({
        ...s,
        width: s.width * assert(bounds).width,
        height: s.height * assert(bounds).height,
        x: s.x * assert(bounds).width,
        y: s.y * assert(bounds).height,
      })),
    [getSections, selectedState, bounds],
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
