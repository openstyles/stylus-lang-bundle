const fs = require("fs");
eval(fs.readFileSync("dist/stylus-renderer.min.js", "utf8"));
global.TextEncoder = class {
  encode(data) {
    return Buffer.from(data);
  }
};
const source = `
fontColor = #123456
navPos = bottom
fixNav = 0
navHeight = 60px

@-moz-document domain("stackoverflow.com") {
  body {
    color: fontColor;
    background: #eee;
  }
  if navPos == "bottom" {
    body > .container {
      padding-top: 0 !important;
    }
    body > footer {
      padding-bottom: 60px !important;
    }
    body > header {
      top: auto !important;
      bottom: 0 !important;
    }
  }
  if not fixNav {
    body {
      position: relative !important;
    }
    body > header {
      position: absolute !important;
    }
  }
  body > header {
    height: navHeight !important;
  }
}
`;
console.log(new StylusRenderer(source).render());
