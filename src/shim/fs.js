function notImplemented() {
  throw new Error("Not implemented");
}

module.exports = {
  statSync: file => {
    if (file === "functions.styl") {
      return {mtime: 0};
    }
    return notImplemented();
  },
  readFileSync: file => {
    if (file === "functions.styl") {
      return $inline("../../node_modules/stylus/lib/functions/index.styl|stringify");
    }
    return notImplemented();
  },
  realpathSync: notImplemented
};
