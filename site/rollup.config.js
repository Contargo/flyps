import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import path from "path";
import fs from "fs";

let listFiles = dir =>
  fs.readdirSync(dir).reduce((acc, filename) => {
    let filepath = path.join(dir, filename);
    if (fs.lstatSync(filepath).isDirectory()) {
      return [...acc, ...listFiles(filepath)];
    }
    return [...acc, filepath];
  }, []);

let examples = listFiles("content/example")
  .filter(file => file.endsWith(".js") && !file.endsWith(".dist.js"))
  .map(js => ({
    input: js,
    output: {
      file: path.join(path.dirname(js), path.basename(js, ".js") + ".dist.js"),
      format: "umd",
      name: path.basename(js, ".js"),
    },
    plugins: [babel({ exclude: "node_modules/**" })],
  }));

export default [
  {
    input: "index.js",
    output: {
      file: "static/js/bundle.js",
      format: "umd",
      name: "bundle",
    },
    plugins: [
      resolve({
        dedupe: ["flyps"],
      }),
      commonjs(),
      babel({ exclude: "node_modules/**" }),
      terser(),
    ],
  },
  ...examples,
];
