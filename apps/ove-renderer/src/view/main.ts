import { env } from "../env";
import { io } from "socket.io-client";
import { type State, state } from "../state";
import type { Section } from ".prisma/client";

const buildLayout = () => {
  if (state.state?.type !== "observatory" || state.state.sections === undefined || state.observatory.bounds === undefined)
    return;
  const cellWidth = 1 / state.observatory.bounds!.columns;
  const cellHeight = 1 / state.observatory.bounds!.rows;
  state.state.sections.filter((section: Section) => {
    const minX = section.x;
    const maxX = section.x + section.width;
    const minY = section.y;
    const maxY = section.y + section.height;

    return !(
      maxX <= cellWidth * state.observatory.column ||
      minX >= cellWidth * (state.observatory.column + 1) ||
      maxY <= cellHeight * state.observatory.row ||
      minY >= cellHeight * (state.observatory.row + 1)
    );
  }).toSorted((a, b) => a.ordering - b.ordering).map((section: Section) => {
    const iframe = document.createElement("iframe");
    iframe.src = `${window.location.origin}?observatory=${state.observatory.name}&row=${state.observatory.row}&column=${state.observatory.column}&type=view&data-type=${section.dataType}&sectionId=${section.id}`;
    iframe.style.zIndex = section.ordering.toString();
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.left = "0";
    iframe.style.top = "0";
    iframe.style.position = "relative";
    document.body.appendChild(iframe);
  });
};

export const init = () => {
  const client = io(`${env.SOCKETS.URL}/${state.observatory.name}`, {
    path: `${env.SOCKETS.PATH ?? ""}/${env.CORE_API_VERSION}`,
    withCredentials: true,
    autoConnect: false,
    auth: {
      uuid: state.uuid,
    },
  });

  client.on("connect", () => console.log("Connected"));
  client.on("disconnect", () => console.log("Disconnected"));
  client.on("connect_error", (err) => {
    console.error(err);
  });
  client.on("init", async (initState) => {
    state.state = initState as State["state"];
    buildLayout();
  });

  client.connect();

  state.socket = client;
};
