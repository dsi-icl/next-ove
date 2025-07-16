import { io } from "socket.io-client";
import { env } from "../env";
import { params, type State, state } from "../state";

const buildSection = () => {
  console.log(state.state, state.observatory.bounds)
  if (state.state?.type !== "section" || state.observatory.bounds === undefined) return;
  const cellWidth = 1 / state.observatory.bounds!.columns;
  const cellHeight = 1 / state.observatory.bounds!.rows;
  const iframe = document.createElement("iframe");
  iframe.src = state.state.section.asset;
  iframe.style.zIndex = state.state.section.ordering.toString();
  iframe.style.width = `${(state.state.section.width / cellWidth) * 100}vw`;
  iframe.style.height = `${(state.state.section.height / cellHeight) * 100}vh`;
  iframe.style.left = `${((state.state.section.x - cellWidth * state.observatory.column) / cellWidth) * 100}vw`;
  iframe.style.top = `${((state.state.section.y - cellHeight * state.observatory.row) / cellHeight) * 100}vh`;
  iframe.style.position = "absolute";
  console.log(state.state.section.x, cellWidth, state.observatory.column, params.get("column"))
  console.log(state.state.section.y, cellHeight, state.observatory.row)
  console.log(iframe.style.left, iframe.style.top)
  document.body.appendChild(iframe);
}

export const init = () => {
  console.log("I am a HTML view");
  const client = io(`${env.SOCKETS.URL}/${params.get("sectionId") ?? ""}`, {
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
    buildSection();
  });

  client.connect();

  state.socket = client;
};
