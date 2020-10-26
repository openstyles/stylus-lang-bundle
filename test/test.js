const assert = require("assert");
const fs = require("fs");
const path = require("path");

const CASES_ROOT = `${__dirname}/cases`;

eval(fs.readFileSync(`${__dirname}/../dist/stylus-renderer.min.js`, "utf8"));

describe("stylus renderer", () => {
  before(() => {
    global.TextEncoder = class {
      encode(data) {
        return Buffer.from(data);
      }
    };
  });
  for (const {name, hasOptions} of getFiles()) {
    it(name, function () {
      if (hasOptions) {
        this.skip();
        return;
      }
      const source = crlf(fs.readFileSync(`${CASES_ROOT}/${name}.styl`, "utf8"));
      const expect = crlf(fs.readFileSync(`${CASES_ROOT}/${name}.css`, "utf8"));
      if (/@(import|require)|(json|image-size|use|embedurl)\([\s\S]+?\)/.test(source)) {
        this.skip("file related");
        return;
      }
      assert.equal(new StylusRenderer(source).render().trim(), expect.trim());
    });
  }
  after(() => {
    delete global.TextEncoder;
  });
});

function getFiles() {
  const files = new Map;
  for (const file of fs.readdirSync(CASES_ROOT)) {
    const stat = fs.statSync(`${CASES_ROOT}/${file}`);
    if (!stat.isFile()) {
      continue;
    }
    // https://github.com/openstyles/stylus-lang/blob/83591b28f283c787cf0acdf030d2dd83e38677df/test/run.js#L22-L26
    const {name, ext} = path.parse(file);
    if (files.has(name)) {
      files.get(name)[ext] = true;
    } else {
      files.set(name, {
        name,
        hasOptions: /compress|include|prefix\.|hoist\.|resolver/.test(file),
        [ext]: true
      });
    }
  }
  return [...files.values()].filter(f => f[".styl"] && f[".css"]);
}

function crlf(s) {
  return s.replace(/\r/g, "");
}
