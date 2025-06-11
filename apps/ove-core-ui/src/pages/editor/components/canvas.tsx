import * as d3 from "d3";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import type { Geometry } from "../types";
import type { Section } from "@ove/ove-server-utils";
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

  svg.selectAll("*").remove();

  svg
    .selectAll("rect")
    .data(() => assert(cells))
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.x))
    .attr("y", (d) => y(d.y))
    .attr("width", (d) => x(d.width))
    .attr("height", (d) => y(d.height))
    .classed("fill-[#002147] stroke-white stroke-1", true)
    .append("title")
    .text((_d, i) => `Cell No: ${i}`);

  svg
    .selectAll(".sections")
    .data(() => sections)
    .enter()
    .append("rect")
    .call(
      d3
        .drag()
        .on("start", dragStart)
        .on("drag", dragging)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on("end", dragEnd) as any,
    )
    .attr("x", (d) => x(d.x))
    .attr("y", (d) => y(d.y))
    .attr("width", (d) => x(d.width))
    .attr("height", (d) => y(d.height))
    .attr("id", (d) => `section-${d.id}`)
    .style(
      "fill",
      (d) =>
        assert(dataTypes.find(({ name }) => name === d.dataType.toLowerCase()))
          .color,
    )
    .classed("stroke-none opacity-70 stroke-0", true)
    .append("title")
    .text((d) => `Section No.: ${d.ordering}\nAsset URL: ${d.asset}`);

  function dragStart(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "");
    select(section.attr("id").slice(8));
  }

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

  function dragging(
    this: Element,
    event: {
      x: number;
      y: number;
      subject: { x: number; y: number };
    },
  ) {
    const section = d3.select(this);
    const label = d3.select(`#label-${section.attr("id").slice(8)}`);

    const nx = Math.max(
      0,
      Math.min(
        x(assert(bounds).width) - parseFloat(section.attr("width")),
        x(event.subject.x) + (event.x - event.subject.x),
      ),
    );
    const ny = Math.max(
      0,
      Math.min(
        y(assert(bounds).height) - parseFloat(section.attr("height")),
        y(event.subject.y) + (event.y - event.subject.y),
      ),
    );

    section
      .attr(
        "x",
        x(clampX(inverseX(nx), inverseX(parseFloat(section.attr("width"))))),
      )
      .attr(
        "y",
        y(clampY(inverseY(ny), inverseY(parseFloat(section.attr("height"))))),
      );
    const sectionTextSize =
      Math.min(
        x(parseFloat(section.attr("width"))),
        y(parseFloat(section.attr("height"))),
      ) / 8;
    label
      .attr(
        "x",
        +nx +
          +section.attr("width") / 2 -
          (selected === section.attr("id").slice(8)
            ? sectionTextSize * 2
            : sectionTextSize) *
            0.25,
      )
      .attr(
        "y",
        +ny +
          +section.attr("height") / 2 +
          (selected === section.attr("id").slice(8)
            ? sectionTextSize * 2
            : sectionTextSize) *
            0.5,
      );
  }

  function dragEnd(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "black");
    dragSection(
      section.attr("id").slice(8),
      inverseX(parseFloat(section.attr("x"))) / assert(bounds).width,
      inverseY(parseFloat(section.attr("y"))) / assert(bounds).height,
    );
  }

  svg
    .selectAll(".section-label")
    .data(() => sections)
    .enter()
    .append("text")
    .text((d) => d.ordering)
    .attr("id", (d) => `label-${d.id}`)
    .attr("x", (d) => {
      const sectionTextSize = Math.min(x(d.width), y(d.height)) / 8;
      return (
        x(+d.x + +d.width / 2) -
        (d.id === selected ? sectionTextSize * 2 : sectionTextSize) * 0.25
      );
    })
    .attr("y", (d) => {
      const sectionTextSize = Math.min(x(d.width), y(d.height)) / 8;
      return (
        y(+d.y + +d.height / 2) +
        (d.id === selected ? sectionTextSize * 2 : sectionTextSize) * 0.5
      );
    })
    .style("font-size", (d) => {
      const sectionTextSize = Math.min(x(d.width), y(d.height)) / 8;
      return `${d.id === selected ? sectionTextSize * 2 : sectionTextSize}px`;
    })
    .style("font-weight", (d) => (d.id === selected ? 700 : 400))
    .classed("fill-white", true);
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
