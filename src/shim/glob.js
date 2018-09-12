module.exports = {
  sync: path => {
    if (path === "functions.styl") {
      return [path];
    }
    return [];
  }
};
