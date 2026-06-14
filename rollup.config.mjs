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
const toMatch = new Set();

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
        ["**/cache/{fs|memory}.js",
          "crypto.createHash",
          "crypto",
        ],
        ["**/functions/selector.js",
          /\bnew require\b/g,
          "require",
        ],
        ["**/renderer.js",
          /module\.exports = /g,
          "module.exports.Renderer = ",
        ],
        ["**/arguments.js",
          /require\('\.\.\/nodes'\)/g,
          "{Expression: require('./expression')}",
        ],
        ["**/utils.js",
          /this\.indent/g,
          "this && this.indent",
        ],
        ["**/utils.js",
          /if \(!found && .+?node_modules[\s\S]+?(?=[\r\n]};)/,
          "return found;",
        ],
        ["**/utils.js",
          /[\r\n]\s*\/\/ Absolute[\r\n].+?[\r\n](?=\s*\/\/ Relative[\r\n])|,\s*{windowsPathsNoEscape[^}]+}/gs,
          "",
        ],
        ["**/use.js",
          /([\r\n]function use)\(plugin.+?[\r\n]}(?=[\r\n])/s,
          "$1(){}",
        ],
        ["**/renderer.js",
          /__dirname/,
          '"/"',
        ],
        ["**/functions/s.js",
          "self.options",
          "self && self.options",
        ],
      ].map(mustMatch),
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
    {
      name: "<re> did not match some files",
      buildEnd(error) {
        if (toMatch.size) {
          throw new Error('\n' + [...toMatch].join(',\n'));
        }
      }
    },
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

function mustMatch([match, test, replace]) {
  toMatch.add(match);
  return {
    match,
    transform(code, id) {
      const code2 = code.replace(test, replace);
      if (code2 === code) throw new Error(`${id}: could not find ${test}`);
      toMatch.delete(match);
      return code2;
    }
  };
}

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
