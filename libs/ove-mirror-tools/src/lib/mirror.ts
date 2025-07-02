/* global document, window, HTMLElement, Event, UIEvent, MessageEventSource, MouseEvent, KeyboardEvent, CSS, WheelEvent */

import seedrandom from "seedrandom";

const SEED = "ove-mirror";

export const syncRandom = () => {
  seedrandom(SEED, { global: true });
};

type Message = {
  selector?: string;
  type: string;
  button?: number;
  deltaX?: number;
  deltaY?: number;
  key?: string;
  code?: string;
  ts: number;
  location: string;
  frames: string[];
  id: string;
};

const dispatchEvent = (msg: Message, id: string) => {
  if (msg.id === id) return;
  if (msg.type === "click") {
    {
      if (msg.selector === undefined) return;
      const el = document.querySelector(msg.selector) as HTMLElement;
      if (el === null) return;
      const ev = new MouseEvent("click", {
        clientX: el.offsetLeft,
        clientY: el.offsetTop,
        button: msg.button,
        bubbles: true,
        cancelable: true
      });
      el.dispatchEvent(ev);
    }
  } else if (msg.type === "wheel") {
    window.scrollBy(msg.deltaX ?? 0, msg.deltaY ?? 0);
  } else if (msg.type.startsWith("key")) {
    {
      if (msg.selector === undefined) return;
      const el = document.querySelector(msg.selector) as HTMLElement;
      const kev = new KeyboardEvent(msg.type, {
        key: msg.key,
        code: msg.code,
        bubbles: true,
        cancelable: true
      });
      el.dispatchEvent(kev);
    }
  }
};

const getUniqueSelector = (el: HTMLElement) => {
  const path = [];
  while (el && el.nodeType === 1) {
    let selector = el.tagName.toLowerCase();
    // 1) if it has an ID, we can stop here
    if (el.id) {
      selector += "#" + CSS.escape(el.id);
      path.unshift(selector);
      break;
    }
    // 2) otherwise see how many siblings of that tag there are
    const parent = el.parentNode;
    if (parent) {
      const sameTagSiblings = Array.from(parent.children)
        .filter(e => e.tagName === el.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(el) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    path.unshift(selector);
    el = parent as HTMLElement;
  }
  return path.join(" > ");
};

const isMouseEvent = (e: unknown): e is MouseEvent => typeof e === "object" && e !== null && "type" in e && e.type === "click";
const isWheelEvent = (e: unknown): e is WheelEvent => typeof e === "object" && e !== null && "type" in e && e.type === "wheel";
const isKeyEvent = (e: unknown): e is KeyboardEvent => typeof e === "object" && e !== null && "type" in e && typeof e.type === "string" && e.type.startsWith("key");

// Controller: capture events, send to bg
// Listen for user interactions
const capture = (e: Event | UIEvent | KeyboardEvent | MouseEvent | WheelEvent, id: string) => {
  if (!e.isTrusted) return;
  const msg: Message = { ts: Date.now(), type: e.type, id: id, frames: [], location: window.location.href };
  if (isMouseEvent(e)) {
    msg.button = e.button;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element === null) return;
    msg.selector = getUniqueSelector(element as HTMLElement);
  }
  if (isWheelEvent(e)) {
    msg.deltaX = e.deltaX;
    msg.deltaY = e.deltaY;
  }
  if (isKeyEvent(e)) {
    msg.selector = getUniqueSelector(document.activeElement as HTMLElement);
    msg.key = e.key;
    msg.code = e.code;
  }
  window.parent.postMessage({ action: "next-ove:up", ...msg });
};

const findIframeByContentWindow = (win: MessageEventSource) => {
  const iframes = Array.from(document.getElementsByTagName("iframe"));
  for (const frame of iframes) {
    if (frame.contentWindow === win) {
      return getUniqueSelector(frame);
    }
  }
  return null;
};

export const setup = (id: string, sectionId: string | null) => {
  ["click", "wheel", "keydown", "keyup"].forEach((ev) =>
    window.addEventListener(ev, (e) => capture(e, id), { passive: true })
  );

  const frames = Array.from(document.getElementsByTagName("iframe"));

  window.addEventListener("message", (e) => {
    if (e?.data?.action === "next-ove:down") {
      const frameSelector = e.data.frames.shift();
      if (frameSelector === null) {
        frames.forEach((frame) => {
          frame.contentWindow?.postMessage(e.data);
        });
      } else {
        document.querySelector(frameSelector)?.postMessage(e.data);
      }

      if (e.data.location !== window.location.href) return;
      dispatchEvent(e.data, id);
    } else if (e?.data?.action === "next-ove:up") {
      if (sectionId !== null || e.source === null) return;
      window.parent.postMessage({
        ...e.data,
        frames: [findIframeByContentWindow(e.source), ...e.data.frames]
      });
    }
  });
};
