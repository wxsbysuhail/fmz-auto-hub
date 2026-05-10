import fs from "fs";
import path from "path";

const clientDist = "dist/client";
const assetsDir = path.join(clientDist, "assets");

console.log("🛠️ Starting Studio-Grade Index Wiring...");

if (!fs.existsSync(assetsDir)) {
  console.error("❌ Assets directory not found!");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
// Find the main index chunk. TanStack Start usually names it index-XXXX.js
const indexJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));

if (!indexJs) {
  console.error("❌ Could not find compiled index JS chunk!");
  process.exit(1);
}

console.log(`✅ Found entry point: ${indexJs}`);

let html = fs.readFileSync("index.html", "utf8");
// Replace the raw source path with the compiled asset path
html = html.replace("/src/main.tsx", `/assets/${indexJs}`);

fs.writeFileSync(path.join(clientDist, "index.html"), html);
console.log("🚀 index.html wired and deployed to dist/client!");
