# Stylus Language Bundle

Because we needed to provide a tagged release source file for use in our [Stylus](https://github.com/openstyles/stylus) WebExtension, this repository *currently* copies the minified bundled version of the Stylus Language code from http://stylus-lang.com/try/stylus.min.js.

Eventually, it will be updated to bundle the [stylus language](https://github.com/stylus/stylus) code from the source. The original attempt is located here: https://github.com/eight04/stylus-lang-bundle; but due to some limitations, it is not currently working.

## Live demo

https://rawgit.com/openstyles/stylus-lang-bundle/master/demo/

## Install

Via [npm](https://npmjs.org/):

```bash
$ npm install stylus-bundle
```

Or via [unpkg CDN](https://unpkg.com/):

```html
<script src="https://unpkg.com/stylus-lang-bundle@latest"></script>
```

## Usage

```js
// stylus-renderer.min.js exports a single class `StylusRenderer` to global
function render(input) {
  try {
    return new StylusRenderer(input).render();
  } catch (err) {
    console.error(err);
  }
}
```

## Home page

Home page for this program with examples, documentation and a live demo: http://stylus-lang.com/
