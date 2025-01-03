import fs from 'fs';
import decompress from 'decompress';

const DIR = "test/cases";
const URL = "https://github.com/stylus/stylus/archive/dev.zip";

fs.rmSync(DIR, {recursive: true, force: true});
console.log(`Fetching tests from ${URL}...`);

const b = Buffer.from(await (await fetch(URL)).arrayBuffer());
const files = await decompress(b, "test/cases", {
  filter: file => /test[\\/]cases[\\/][^\\/]+$/.test(file.path),
  map: file => {
    file.path = file.path.split(/cases[\\/]/)[1] || file.path;
    return file;
  }
});
console.log("Tests created.");
