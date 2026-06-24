import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

function build() {
  const siteData = JSON.parse(
    readFileSync(join(root, "content", "site.json"), "utf8")
  );

  mkdirSync(join(publicDir, "data"), { recursive: true });
  writeFileSync(
    join(publicDir, "data", "site.json"),
    `${JSON.stringify(siteData, null, 2)}\n`
  );

  cpSync(join(root, "src", "index.html"), join(publicDir, "index.html"));
  cpSync(join(root, "src", "script.js"), join(publicDir, "script.js"));
  cpSync(join(root, "src", "styles.css"), join(publicDir, "styles.css"));
  writeFileSync(join(publicDir, ".nojekyll"), "\n");

  console.log("Built static site to public/");
}

build();
