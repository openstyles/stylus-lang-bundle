import alias from "rollup-plugin-alias";
import cjs from "rollup-plugin-cjs-es";
import externalGlobals from "rollup-plugin-external-globals";
import inline from "rollup-plugin-inline-js";
import re from "rollup-plugin-re";
import resolve from "rollup-plugin-node-resolve";
import {terser} from "rollup-plugin-terser";

export default {
	input: "src/index.js",
  output: {
    file: "dist/stylus-renderer.min.js",
    format: "iife",
    name: "StylusRenderer"
  },
  plugins: [
    alias({
      events: require.resolve("./src/shim/events"),
      url: require.resolve("./src/shim/url"),
      crypto: require.resolve("./src/shim/crypto"),
      glob: require.resolve("./src/shim/glob"),
      fs: require.resolve("./src/shim/fs"),
      path: require.resolve("path-browserify")
    }),
    shimEmpty([
      "stylus/lib/visitor/sourcemapper.js",
      "stylus/lib/functions/image-size.js",
    ]),
    inline(),
    resolve({
      browser: true
    }),
    re({
      patterns: [
        {
          match: /selector.js$/,
          test: /\bnew require\b/g,
          replace: "require"
        },
        {
          match: /renderer.js$/,
          test: /module\.exports = /g,
          replace: "module.exports.Renderer = "
        },
        {
          match: /arguments\.js$/,
          test: /require\('\.\.\/nodes'\)/g,
          replace: "{Expression: require('./expression')}"
        },
        {
          match: /utils\.js$/,
          test: /this\.indent/g,
          replace: "this && this.indent"
        },
        {
          match: /(utils|renderer)\.js$/,
          test: /__dirname/,
          replace: '"/"'
        }
      ]
    }),
    cjs({
      nested: true
    }),
    re({
      patterns: [
        {
          test: /export default \(function/g,
          replace: "export default (null, function"
        }
      ]
    }),
    externalGlobals({
      util: "nodeUtil"
    }),
    terser({
      keep_fnames: true
    })
  ]
};

function shimEmpty(files) {
  files = files.map(f => require.resolve(f));
  return {
    name: "rollup-plugin-shim-empty",
    transform(code, id) {
      if (id[0] === "\x00") {
        return;
      }
      if (files.includes(id)) {
        return {
          code: `
            const noop = () => noop;
            module.exports = noop;
          `
        };
      }
    }
  };
}
