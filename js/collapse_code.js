(() => {
// 当代码块内容高度超出多少像素时折叠，默认是500px
  const codeMaxHeight = 500;

// 添加样式
  addStyle(`
.code-block .code-down {
    width: 100%;
    text-align: center;
    position: absolute;
    bottom: 0px;
    left: 0;
}
    .code-block .code-down-btn {
        padding: 3px 14px 1px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        cursor: pointer;
    }
    .code-block .code-down-arrow{
        width: 13px;
        height: 13px;
    }
    [data-theme-mode="dark"] .code-block .code-down-btn {
        background-color: rgba(0, 0, 0, 0.5);
    }
    div:not(#preview) > .protyle-wysiwyg .code-block .hljs {
        max-height: ${codeMaxHeight || 300}px;
    }
    @media (max-width: 768px) {
        .code-block .code-down-btn {
            padding: 10px 20px;
        }
    }
    `);

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  whenElementExist('body').then(async el => {
    let protyle;
    await whenElementExist(() => {
      protyle = el.querySelector('.protyle');
      return protyle && protyle?.dataset?.loading === 'finished';
    });
    addCodeExtends(protyle.querySelectorAll('.code-block'));

    let scrollContainer = isMobile() ? window : protyle.querySelector(".protyle-content");
    let debounceTimer;
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        addCodeExtends(protyle.querySelectorAll('.code-block'));
      }, 100);
    });

    observeProtyleAddition(el, protyles => {
      protyles.forEach(async protyle => {
        if (!protyle.classList.contains('protyle')) {
          protyle = protyle.closest('.protyle');
        }
        addCodeExtends(protyle.querySelectorAll('.code-block'));
        let scrollContainer = isMobile() ? window : protyle.querySelector(".protyle-content");
        scrollContainer.addEventListener('scroll', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            addCodeExtends(protyle.querySelectorAll('.code-block'));
          }, 100);
        });
      });
    });
  });

  let runing = false;

  function addCodeExtends(codeBlocks) {
    if (codeBlocks.length === 0) return;
    if (runing) return;
    runing = true;
    setTimeout(() => {
      runing = false;
    }, 300);
    codeBlocks.forEach(async codeBlock => {
      if (isCursorInCodeBlock(codeBlock)) {
        codeBlock.querySelector('.hljs').style.maxHeight = '100%';
        return;
      }
      if (codeBlock.querySelector('.code-down')) return;
      const hljs = await whenElementExist(() => codeBlock.querySelector('.hljs'));
      if (hljs && hljs.scrollHeight > codeMaxHeight) {
        const expand = document.createElement('div');
        expand.className = 'code-down protyle-custom';
        expand.innerHTML = `<span class="code-down-btn"><svg class="code-down-arrow"><use xlink:href="#iconDown"></use></svg></span>`;
        codeBlock.appendChild(expand);
        expand.closest('.code-block').querySelector('.hljs').style.maxHeight = codeMaxHeight + 'px';
        expand.querySelector('.code-down-btn').onclick = () => {
          let curHeight = expand.closest('.code-block').querySelector('.hljs').style.maxHeight;
          if (curHeight === "100%") {
            expand.closest('.code-block').querySelector('.hljs').style.maxHeight = codeMaxHeight + 'px';
            expand.firstChild.innerHTML = `<svg class="code-down-arrow"><use xlink:href="#iconUp"></use></svg>`;
          } else {
            expand.closest('.code-block').querySelector('.hljs').style.maxHeight = '100%';
            expand.firstChild.innerHTML = `<svg class="code-down-arrow"><use xlink:href="#iconUp"></use></svg>`;
          }
        };
      }
    });
  }

  function addStyle(cssRules) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = cssRules;
    document.head.appendChild(styleElement);
  }

  function observeProtyleAddition(el, callback) {
    const config = {attributes: false, childList: true, subtree: true};
    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
          const protyles = Array.from(mutation.addedNodes).filter(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.classList.contains('protyle') || node.classList.contains('protyle-content'))
          );
          if (protyles.length > 0) {
            callback(protyles);
          }
        }
      });
    });
    observer.observe(el, config);
    return () => {
      observer.disconnect();
    };
  }

  function isCursorInCodeBlock(codeBlock) {
    if (!codeBlock) return false;
    let cursorEl = getCursorElement();
    if (!cursorEl) return false;
    cursorEl = cursorEl.closest('.code-block');
    if (!cursorEl) return false;
    return cursorEl === codeBlock;
  }

  function getCursorElement() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const cursorElement = startContainer.nodeType === Node.TEXT_NODE
        ? startContainer.parentElement
        : startContainer;
      return cursorElement;
    }
    return null;
  }

  function whenElementExist(selector) {
    return new Promise(resolve => {
      const checkForElement = () => {
        let element = null;
        if (typeof selector === 'function') {
          element = selector();
        } else {
          element = document.querySelector(selector);
        }
        if (element) {
          resolve(element);
        } else {
          requestAnimationFrame(checkForElement);
        }
      };
      checkForElement();
    });
  }
})();
