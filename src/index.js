const Evaluator = require("stylus/lib/visitor/evaluator");
const Parser = require("stylus/lib/parser");
const {Renderer} = require("stylus/lib/renderer");
const nodes = require("stylus/lib/nodes");

const stylus = (str, options) => new Renderer(str, options);
stylus.Evaluator = Evaluator;
stylus.Parser = Parser;
stylus.Renderer = Renderer;
stylus.nodes = nodes;

module.exports = stylus;
