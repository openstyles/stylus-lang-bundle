const sha1 = require("tiny-sha1/dist/tiny-sha1.mjs");

function createHash() {
  let data = "";
  return {update, digest};
  
  function update(_data) {
    data += _data;
  }
  
  function digest() {
    return sha1((new TextEncoder).encode(data));
  }
}

module.exports = {createHash};
