import * as d3 from "d3";
import { dataTypes } from "../utils";
import { assert } from "@ove/ove-utils";
import { type Geometry } from "../types";
import { type Section } from "@prisma/client";
import React, { type MutableRefObject, useRef } from "react";

import styles from "./canvas.module.scss";

type PreviewProps = {
  sections: Section[]
  space: {
    width: number,
    height: number,
    rows: number,
    columns: number,
    cells: Geometry[]
  }
  container: { width: number, height: number }
  dragSection: (id: string, x: number, y: number) => void
  select: (id: string) => void
  selected: string | null
}

const THRESHOLDX = 0.01;
const THRESHOLDY = 0.02;

function drawSpaces({
  container,
  space,
  sections,
  dragSection,
  select,
  selected
}: PreviewProps, svg_: MutableRefObject<SVGSVGElement | null>) {
  const x = d3.scaleLinear()
    .range([0, container.width]).domain([0, space.width]);
  const inverseX = d3.scaleLinear()
    .range([0, space.width]).domain([0, container.width]);
  const y = d3.scaleLinear()
    .range([0, container.height]).domain([0, space.height]);
  const inverseY = d3.scaleLinear()
    .range([0, space.height]).domain([0, container.height]);

  const svg = d3.select(svg_.current)
    .attr("width", () => container.width)
    .attr("height", () => container.height);

  svg.selectAll("*").remove();

  svg.selectAll("rect")
    .data(() => space.cells)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("width", d => x(d.width))
    .attr("height", d => y(d.height))
    .classed(styles.cell, true)
    .append("title")
    .text((_d, i) => `Cell No: ${i}`);

  svg.selectAll(".sections")
    .data(() => sections)
    .enter()
    .append("rect")
    .call(d3.drag().on("start", dragStart)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("drag", dragging).on("end", dragEnd) as any)
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("width", d => x(d.width))
    .attr("height", d => y(d.height))
    .attr("id", d => `section-${d.id}`)
    .style("fill", d =>
      assert(dataTypes.find(({ name }) => name ===
        d.dataType.toLowerCase())).color)
    .classed(styles.section, true)
    .append("title")
    .text(d =>
      `Section No.: ${d.ordering}\nAsset URL: ${d.asset}`);

  function dragStart(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "");
    select(section.attr("id").slice(8));
  }

  const clampX = (x: number, w: number) => {
    for (const cell of space.cells) {
      if (Math.abs(cell.x - x) < ((space.width / space.columns) *
        THRESHOLDX)) return cell.x;
      if (Math.abs((cell.x + cell.width) - (x + w)) <
        ((space.width / space.columns) * THRESHOLDX)) {
        return (cell.x + cell.width) - w;
      }
    }

    return x;
  };

  const clampY = (y: number, h: number) => {
    for (const cell of space.cells) {
      if (Math.abs(cell.y - y) < ((space.height / space.rows) *
        THRESHOLDY)) return cell.y;
      if (Math.abs((cell.y + cell.height) - (y + h)) <
        ((space.height / space.rows) * THRESHOLDY)) {
        return (cell.y + cell.height) - h;
      }
    }

    return y;
  };

  function dragging(this: Element, event: {
    x: number,
    y: number,
    subject: { x: number, y: number }
  }) {
    const section = d3.select(this);
    const label =
      d3.select(`#label-${section.attr("id").slice(8)}`);

    const nx = Math.max(0, Math.min(x(space.width) -
      parseFloat(section.attr("width")), x(event.subject.x) +
      (event.x - event.subject.x)));
    const ny = Math.max(0, Math.min(y(space.height) -
      parseFloat(section.attr("height")), y(event.subject.y) +
      (event.y - event.subject.y)));

    section
      .attr("x", x(clampX(inverseX(nx),
        inverseX(parseFloat(section.attr("width"))))))
      .attr("y", y(clampY(inverseY(ny),
        inverseY(parseFloat(section.attr("height"))))));
    label
      .attr("x", ((+nx) + (+section.attr("width")) / 2) -
        (selected === section.attr("id").slice(8) ?
          sectionTextSize * 2 : sectionTextSize) * 0.25)
      .attr("y", ((+ny) + (+section.attr("height")) / 2) +
        (selected === section.attr("id").slice(8) ?
          sectionTextSize * 2 : sectionTextSize) * 0.5);
  }

  function dragEnd(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "black");
    dragSection(
      section.attr("id").slice(8),
      inverseX(parseFloat(section.attr("x"))) / space.width,
      inverseY(parseFloat(section.attr("y"))) / space.height
    );
  }

  const minSectionHeight = assert(d3.min(sections.map(d =>
    x(d.height))));
  const minSectionWidth = assert(d3.min(sections.map(d =>
    x(d.width))));
  const sectionTextSize = Math.min(minSectionHeight, minSectionWidth) / 4;
  svg.selectAll(".section-label")
    .data(() => sections)
    .enter()
    .append("text")
    .text(d => d.ordering)
    .attr("id", d => `label-${d.id}`)
    .attr("x", d =>
      x((+d.x) + (+d.width) / 2) - (d.id === selected ?
        sectionTextSize * 2 : sectionTextSize) * 0.25)
    .attr("y", d =>
      y((+d.y) + (+d.height) / 2) + (d.id === selected ?
        sectionTextSize * 2 : sectionTextSize) * 0.5)
    .style("font-size", d =>
      `${d.id === selected ? sectionTextSize * 2 : sectionTextSize}px`)
    .style("font-weight", d => d.id === selected ? 700 : 400)
    .classed(styles.label, true);
}

const Canvas = (props: PreviewProps) => {
  const svg_ = useRef<SVGSVGElement | null>(null);
  const defs_ = useRef<SVGDefsElement | null>(null);

  drawSpaces({
    selected: props.selected,
    container: props.container,
    select: props.select,
    space: props.space,
    dragSection: props.dragSection,
    sections: props.sections.map(s => ({
      ...s,
      width: s.width * props.space.width,
      height: s.height * props.space.height,
      x: s.x * props.space.width,
      y: s.y * props.space.height
    }))
  }, svg_);

  return <svg ref={svg_} width={props.container.width}
              height={props.container.height}>
    <defs ref={defs_} />
  </svg>;
};

export default Canvas;
