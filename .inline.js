module.exports = {
  transforms: [
    {
      name: "crlf",
      transform: (context, text) => text.replace(/\r/g, "")
    }
  ]
};
