import { createServer } from "node:http";
import handler from "./handler.js";
createServer(handler).listen(3001, "127.0.0.1", () =>
  console.log("Commerce API: http://127.0.0.1:3001"),
);
