import {fileURLToPath} from "node:url";
import alias from "@rollup/plugin-alias";
import cjs from "rollup-plugin-cjs-es";
import {glob} from "glob";
import inline from "rollup-plugin-inline-js";
import re from "rollup-plugin-re";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import analyzer from "rollup-plugin-analyzer";
import esInfo from "rollup-plugin-es-info";
import {visualizer} from "rollup-plugin-visualizer";
import ownPkg from "./package.json" with { type: 'json' };

const DST_FILE = ownPkg.unpkg;
const DEBUG = process.env.DEBUG === "1";
const NO_TERSER = DEBUG || process.env.NO_TERSER === "1";
const resolvePkg = id => fileURLToPath(import.meta.resolve(id.replaceAll('\\', '/')));

export default {
  input: "src/index.js",
  output: {
    file: DST_FILE,
    format: "umd",
    sourcemap: true,
    name: "stylus"
  },
  plugins: [
    alias({
      entries: {
        events: resolvePkg("./src/shim/events"),
        url: resolvePkg("./src/shim/url"),
        crypto: resolvePkg("./src/shim/crypto"),
        glob: resolvePkg("./src/shim/glob"),
        fs: resolvePkg("./src/shim/fs"),
        util: resolvePkg("./src/shim/util"),
        path: resolvePkg("path-browserify")
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
          match: /[/\\]cache[/\\](fs|memory)\.js$/,
          test: "crypto.createHash",
          replace: "crypto"
        },
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
    !NO_TERSER && terser({
      keep_fnames: true,
      compress: {
        reduce_funcs: false,
      }
    }),
    DEBUG && esInfo({
      file: "stats.json"
    }),
    DEBUG && analyzer(),
    DEBUG && visualizer({
      open: true
    }),
  ]
};

function shimEmpty(files) {
  files = files.map(f => resolvePkg(f));
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
