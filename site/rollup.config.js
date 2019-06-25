import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

let commonPlugins = [
  resolve({
    dedupe: ["flyps"],
  }),
  commonjs(),
  babel({ exclude: "node_modules/**" }),
  terser(),
];

export default [{
  input: "index.js",
  output: {
    file: "static/js/bundle.js",
    format: "umd",
    name: "bundle",
  },
  plugins: commonPlugins,
}];
