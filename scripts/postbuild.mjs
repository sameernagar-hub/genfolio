// `output: "standalone"` leaves static assets out of the server bundle.
// Copy them in so `node .next/standalone/server.js` serves everything.
import { cpSync, existsSync } from "node:fs";

const standalone = ".next/standalone";
if (existsSync(standalone)) {
  cpSync("public", `${standalone}/public`, { recursive: true });
  cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });
  console.log("postbuild: copied public/ and .next/static into the standalone bundle");
}
