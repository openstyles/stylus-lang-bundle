# Stylus Language Bundle

This repository bundles [Stylus language compiler](https://github.com/stylus/stylus) into a single file that can be used in the browser.

The current version of the compiler is 0.58.1.

## Live demo

https://raw.githack.com/openstyles/stylus-lang-bundle/master/demo/

## Install

Via [npm](https://npmjs.org/):

```bash
$ npm install stylus-bundle
```

Or via [unpkg CDN](https://unpkg.com/):

```html
<script src="https://unpkg.com/stylus-lang-bundle@0.58.1/dist/stylus-renderer.min.js"></script>
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
