import fs from "fs";
import alias from "@rollup/plugin-alias";
import cjs from "rollup-plugin-cjs-es";
import glob from "glob";
import externalGlobals from "rollup-plugin-external-globals";
import inline from "rollup-plugin-inline-js";
import re from "rollup-plugin-re";
import resolve from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";

const DST_FILE = JSON.parse(fs.readFileSync('package.json', 'utf8')).unpkg;

export default {
	input: "src/index.js",
  output: {
    file: DST_FILE,
    format: "iife",
    sourcemap: true,
    name: "StylusRenderer"
  },
  plugins: [
    alias({
      entries: {
        events: require.resolve("./src/shim/events"),
        url: require.resolve("./src/shim/url"),
        crypto: require.resolve("./src/shim/crypto"),
        glob: require.resolve("./src/shim/glob"),
        fs: require.resolve("./src/shim/fs"),
        path: require.resolve("path-browserify")
      }
    }),
    shimEmpty([
      "stylus/lib/visitor/sourcemapper.js",
      "stylus/lib/functions/image-size.js",
      ...glob.sync("node_modules/debug/src/**.js").map(f => f.slice("node_modules/".length)),
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
          match: /utils\.js$/,
          test: /if \(!found && .+?node_modules[\s\S]+?(?=[\r\n]};)/,
          replace: "return found;"
        },
        {
          match: /utils\.js$/,
          test: /[\r\n]\s*\/\/ Absolute[\r\n].+?[\r\n](?=\s*\/\/ Relative[\r\n])|,\s*{windowsPathsNoEscape[^}]+}/gs,
          replace: ""
        },
        {
          match: /[/\\]use\.js$/,
          test: /([\r\n]function use)\(plugin.+?[\r\n]}(?=[\r\n])/s,
          replace: "$1(){}"
        },
        {
          match: /renderer\.js$/,
          test: /__dirname/,
          replace: '"/"'
        },
        {
          match: /\bs\.js$/,
          test: /self\.options/g,
          replace: "self && self.options"
        }
      ]
    }),
    cjs({
      nested: true
    }),
    re({
      patterns: [
        {
          // https://github.com/rollup/rollup/issues/2322
          test: /export default \(function/g,
          replace: "export default (null, function"
        }
      ]
    }),
    externalGlobals({
      util: "nodeUtil"
    }),
    terser({
      keep_fnames: true,
      compress: {
        reduce_funcs: false,
      }
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
