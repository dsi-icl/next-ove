import * as d3 from "d3";
import { type Section } from "@prisma/client";
import { type MutableRefObject, useRef } from "react";

import styles from "./canvas.module.scss";

type PreviewProps = {
  sections: Section[]
  space: { width: number, height: number, rows: number, columns: number }
  container: { width: number, height: number }
  dragSection: (id: string, x: number, y: number) => void
  select: (id: string) => void
}

function drawSpaces({
  container,
  space,
  sections,
  dragSection,
  select
}: PreviewProps, svg_: MutableRefObject<SVGSVGElement | null>) {
  const x = d3.scaleLinear().range([0, container.width]).domain([0, space.width]);
  const inverseX = d3.scaleLinear().range([0, space.width]).domain([0, container.width]);
  const y = d3.scaleLinear().range([0, container.height]).domain([0, space.height]);
  const inverseY = d3.scaleLinear().range([0, space.height]).domain([0, container.height]);
  const spaces = Array.from({ length: space.rows }, (_x, row) => Array.from({ length: space.columns }, (_y, col) => ({
    x: (space.width / space.columns) * col,
    y: (space.height / space.rows) * row,
    w: space.width / space.columns,
    h: space.height / space.rows
  }))).flat();

  const svg = d3.select(svg_.current)
    .attr("width", () => container.width)
    .attr("height", () => container.height);

  svg.selectAll("*").remove();

  svg.selectAll("rect")
    .data(() => spaces)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("width", d => x(d.w))
    .attr("height", d => x(d.h))
    .classed(styles.cell, true)
    .append("title")
    .text((_d, i) => `Client Id: ${i}`);

  const colors = ["dodgerblue", "crimson", "darkorange", "darkviolet", "#4daf4a"];
  svg.selectAll(".sections")
    .data(() => sections)
    .enter()
    .append("rect")
    .call(d3.drag().on("start", dragStart).on("drag", dragging).on("end", dragEnd) as any)
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("width", d => x(d.width))
    .attr("height", d => y(d.height))
    .attr("id", d => `section-${d.id}`)
    .style("fill", (_d, i) => colors[i % colors.length])
    .classed(styles.section, true)
    .append("title")
    .text(d => `Section Id: ${d.id}`);

  function dragStart(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "");
    select(section.attr("id").slice(8))
  }

  function dragging(this: Element, event: {
    x: number,
    y: number,
    subject: { x: number, y: number }
  }) {
    const section = d3.select(this);
    const label = d3.select(`#label-${section.attr("id").slice(8)}`);

    const nx = Math.max(0, Math.min(x(space.width) - parseFloat(section.attr("width")), x(event.subject.x) + (event.x - event.subject.x)));
    const ny = Math.max(0, Math.min(y(space.height) - parseFloat(section.attr("height")), y(event.subject.y) + (event.y - event.subject.y)));

    section
      .attr("x", nx)
      .attr("y", ny);
    label
      .attr("x", ((+nx) + (+section.attr("width")) / 2) - sectionTextSize * 0.25)
      .attr("y", ((+ny) + (+section.attr("height")) / 2) + sectionTextSize * 0.5);
  }

  function dragEnd(this: Element) {
    const section = d3.select(this);
    section.style("stroke", "black");
    dragSection(section.attr("id").slice(8), inverseX(parseFloat(section.attr("x"))) / space.width, inverseY(parseFloat(section.attr("y"))) / space.height);
  }

  const minSectionHeight = d3.min(sections.map(d => x(d.height)))!;
  const minSectionWidth = d3.min(sections.map(d => x(d.width)))!;
  const sectionTextSize = Math.min(minSectionHeight, minSectionWidth) / 4;
  svg.selectAll(".section-label")
    .data(() => sections)
    .enter()
    .append("text")
    .text(d => d.ordering)
    .attr("id", d => `label-${d.id}`)
    .attr("x", d => x((+d.x) + (+d.width) / 2) - sectionTextSize * 0.25)
    .attr("y", d => y((+d.y) + (+d.height) / 2) + sectionTextSize * 0.5)
    .style("font-size", `${sectionTextSize}px`)
    .classed(styles.label, true);
}

const Canvas = (props: PreviewProps) => {
  const svg_ = useRef<SVGSVGElement | null>(null);
  const defs_ = useRef<SVGDefsElement | null>(null);

  drawSpaces({
    ...props, sections: props.sections.map(s => ({
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