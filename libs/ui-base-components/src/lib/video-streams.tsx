import React from "react";

export const VideoStreams = ({
  streams,
}: {
  streams: string[] | undefined;
}) => (
  <main className="grid size-full grid-cols-2 gap-8 p-8">
    {streams?.map((stream, i) => (
      <article key={stream}>
        <div className="max-h-[calc(90vh-8rem)]">
          <iframe
            className="aspect-square size-full max-h-[calc(90vh-8rem)]"
            src={stream}
            title={`CAMERA-${i}`}
          ></iframe>
        </div>
      </article>
    ))}
  </main>
);
