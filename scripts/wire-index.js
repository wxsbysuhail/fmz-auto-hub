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
const indexJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const mainCss = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!indexJs) {
  console.error("❌ Could not find compiled index JS chunk!");
  process.exit(1);
}

console.log(`✅ Found JS entry point: ${indexJs}`);
if (mainCss) console.log(`✅ Found CSS entry point: ${mainCss}`);

let html = fs.readFileSync("index.html", "utf8");

if (mainCss) {
  const cssLink = `<link rel="stylesheet" href="/assets/${mainCss}">`;
  html = html.replace("</head>", `  ${cssLink}\n  </head>`);
}

html = html.replace("/src/main.tsx", `/assets/${indexJs}`);

fs.writeFileSync(path.join(clientDist, "index.html"), html, { flag: "w" });
const finalSize = fs.statSync(path.join(clientDist, "index.html")).size;
console.log(`🚀 index.html fully wired! Size: ${finalSize} bytes`);
