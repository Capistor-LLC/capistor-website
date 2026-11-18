import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { StaticRouter } from "react-router-dom";
import type { HelmetServerState } from "react-helmet-async";
import App from "./App";
import type { BuildContent } from "./commerce/BuildContent";
export async function render(path: string, content: BuildContent = {}) {
  const context: { helmet?: HelmetServerState } = {};
  const html = await new Promise<string>((resolve, reject) => {
    const out = new PassThrough();
    let text = "";
    out.on("data", (part) => {
      text += part.toString();
    });
    out.on("end", () => resolve(text));
    out.on("error", reject);
    const stream = renderToPipeableStream(
      <StaticRouter location={path}>
        <App helmetContext={context} content={content} />
      </StaticRouter>,
      {
        onAllReady() {
          stream.pipe(out);
        },
        onError: reject,
      },
    );
  });
  const h = context.helmet;
  return {
    html,
    head: h
      ? [h.title, h.meta, h.link, h.script].map((v) => v.toString()).join("\n")
      : "",
  };
}
