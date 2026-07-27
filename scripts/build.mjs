import * as esbuild from "esbuild";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const watch = process.argv.includes("--watch");
const browsers = ["chrome", "firefox"];

function cleanDist() {
  rmSync(join(root, "dist"), { recursive: true, force: true });
  for (const browser of browsers) {
    mkdirSync(join(root, "dist", browser), { recursive: true });
  }
}

function copyStatic(browser) {
  const out = join(root, "dist", browser);
  cpSync(join(root, "assets", "detoxify.png"), join(out, "detoxify.png"));
  cpSync(join(root, "src", "popup", "popup.html"), join(out, "popup.html"));
  cpSync(join(root, "src", "popup", "popup.css"), join(out, "popup.css"));

  const manifestPath = join(root, "browsers", browser, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  writeFileSync(join(out, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function copyBundlesToFirefox() {
  const chromeOut = join(root, "dist", "chrome");
  const firefoxOut = join(root, "dist", "firefox");
  for (const file of ["content.js", "popup.js", "background.js"]) {
    cpSync(join(chromeOut, file), join(firefoxOut, file));
  }
}

async function buildOnce() {
  cleanDist();

  const shared = {
    bundle: true,
    format: "iife",
    target: ["chrome109", "firefox109"],
    logLevel: "info",
    sourcemap: false,
  };

  const chromeOut = join(root, "dist", "chrome");

  await Promise.all([
    esbuild.build({
      ...shared,
      entryPoints: [join(root, "src", "content", "main.js")],
      outfile: join(chromeOut, "content.js"),
    }),
    esbuild.build({
      ...shared,
      entryPoints: [join(root, "src", "popup", "popup.js")],
      outfile: join(chromeOut, "popup.js"),
    }),
    esbuild.build({
      ...shared,
      entryPoints: [join(root, "src", "background", "background.js")],
      outfile: join(chromeOut, "background.js"),
    }),
  ]);

  copyStatic("chrome");
  copyBundlesToFirefox();
  copyStatic("firefox");

  console.log("✓ Built dist/chrome and dist/firefox");
}

if (watch) {
  const ctx = await esbuild.context({
    entryPoints: [join(root, "src", "content", "main.js")],
    bundle: true,
    write: false,
    logLevel: "silent",
    plugins: [
      {
        name: "rebuild-all",
        setup(build) {
          build.onEnd(async (result) => {
            if (result.errors.length) return;
            try {
              await buildOnce();
            } catch (err) {
              console.error(err);
            }
          });
        },
      },
    ],
  });
  await buildOnce();
  await ctx.watch();
  console.log("Watching src/ …");
} else {
  await buildOnce();
}
