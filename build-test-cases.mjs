import fetch from "make-fetch-happen";
import decompress from "decompress";

const r = await fetch("https://github.com/stylus/stylus/archive/dev.zip");
const b = await r.buffer();
const files = await decompress(b, "test/cases", {
  filter: file => /test[\\/]cases[\\/][^\\/]+$/.test(file.path),
  map: file => {
    file.path = file.path.split(/cases[\\/]/)[1] || file.path;
    return file;
  }
});
