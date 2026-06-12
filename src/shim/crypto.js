const sha1 = require("tiny-sha1/dist/tiny-sha1.mjs");

module.exports = () => {
  let data = "";
  let enc = new TextEncoder();
  return {
    digest: () => sha1(enc.encode(data)),
    update(_data) { data += _data; }
  };
};
