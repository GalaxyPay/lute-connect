import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  fixedExtension: false,
  clean: true,
  format: ["cjs", "esm"],
  outputOptions: { exports: "named" },
});
