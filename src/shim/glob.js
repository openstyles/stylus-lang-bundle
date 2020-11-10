module.exports = {
  sync: path => {
    if (path === "functions/index.styl") {
      return [path];
    }
    return [];
  }
};
