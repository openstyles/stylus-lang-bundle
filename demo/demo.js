const textarea = document.querySelector("textarea");
const output = document.querySelector("output");
const DEFAULT_SOURCE = `body {
  font: 14px/1.5 Helvetica, arial, sans-serif;
  #logo {
    border-radius: 5px;
  }
}`;
let timer = null;
textarea.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(update, 500);
});
textarea.addEventListener("change", () => {
  if (timer === null) {
    return;
  }
  clearTimeout(timer);
  update();
});
textarea.value = DEFAULT_SOURCE;
update();
function update() {
  timer = null;
  new StylusRenderer(textarea.value).render((err, code) => {
    if (err) {
      output.textContent = String(err);
      output.classList.add("error");
    } else {
      output.textContent = code;
      output.classList.remove("error");
    }
  });
}
