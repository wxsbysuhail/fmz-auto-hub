import fs from "fs";
import path from "path";

const clientDist = "dist";
const assetsDir = path.join(clientDist, "assets");

console.log("🛠️ Starting Studio-Grade Index Wiring...");

if (!fs.existsSync(assetsDir)) {
  console.error("❌ Assets directory not found!");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir)
  .map(name => ({ name, time: fs.statSync(path.join(assetsDir, name)).mtimeMs }))
  .sort((a, b) => b.time - a.time);

const indexJs = files.find((f) => f.name.startsWith("index-") && f.name.endsWith(".js"))?.name;
const mainCss = files.find((f) => f.name.startsWith("styles-") && f.name.endsWith(".css"))?.name;

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

// 🛡️ Safety Filter: Remove any @media source(none) wrappers that break Tailwind v4 in production
const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith(".css"));
cssFiles.forEach(file => {
  const filePath = path.join(assetsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("@media source(none)")) {
    console.log(`🧹 Cleaning up CSS metadata in ${file}...`);
    content = content.replace(/@media source\(none\)\s*\{([\s\S]*?)\}\s*$/g, "$1");
    content = content.replace(/@media source\(none\)\s*\{/g, "");
    fs.writeFileSync(filePath, content);
  }
});

fs.writeFileSync(path.join(clientDist, "index.html"), html, { flag: "w" });
const finalSize = fs.statSync(path.join(clientDist, "index.html")).size;
console.log(`🚀 index.html fully wired! Size: ${finalSize} bytes`);
