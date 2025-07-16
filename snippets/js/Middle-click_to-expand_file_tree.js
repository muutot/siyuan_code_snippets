/* 中键点击展开文档树 JS片段 */
(async () => {
  let g_reset = setInterval(main, 2000);

  function main() {
    if (document.querySelector('.sy__file')) {
      clearInterval(g_reset);
    } else {
      return false;
    }
    document.querySelector('.sy__file').addEventListener('mousedown', event => {
      if (event.button !== 1) return;
      if (!event.target.classList.contains('b3-list-item__text'))
        let target = event.target.parentNode;
      let temp = event.target;
      for (let i = 0; i < 4 && temp; i++) {
        if (temp?.getAttribute("data-type") === "navigation-file"
          || temp?.getAttribute("data-type") === "navigation-root") {
          target = temp;
          break;
        }
        temp = temp?.parentNode;
      }
      if (target?.getAttribute("data-type") === "navigation-file"
        || target?.getAttribute("data-type") === "navigation-root") {
        const b3ListItemToggle = target.querySelector('.b3-list-item__toggle');
        const title = target.querySelector('.b3-list-item__text');
        if (b3ListItemToggle.classList.contains('fn__hidden')) return;
        event.preventDefault();
        b3ListItemToggle.click();
        if (event.ctrlKey) {
          title.click();
        }
      }
    }, true);
  }
})();
