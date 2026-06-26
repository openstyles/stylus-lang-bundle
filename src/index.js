const Compiler = require("stylus/lib/visitor/compiler");
const Evaluator = require("stylus/lib/visitor/evaluator");
const Normalizer = require("stylus/lib/visitor/normalizer");
const Parser = require("stylus/lib/parser");
const {Renderer} = require("stylus/lib/renderer");
const nodes = require("stylus/lib/nodes");
const Visitor = require("stylus/lib/visitor");

const stylus = (str, options) => new Renderer(str, options);
stylus.Compiler = Compiler;
stylus.Evaluator = Evaluator;
stylus.Normalizer = Normalizer;
stylus.Parser = Parser;
stylus.Renderer = Renderer;
stylus.Visitor = Visitor;
stylus.nodes = nodes;

module.exports = stylus;
