// rollup.config.mjs
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/main.ts",
  output: [
    {
      file: "dist/main.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/main.esm.js",
      format: "es",
    },
  ],
  plugins: [typescript()],
};
