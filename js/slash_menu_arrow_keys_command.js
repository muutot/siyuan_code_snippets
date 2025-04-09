/* from wilsons
当开启筛选后, 为个人代码, 如果需要全部 wilsons 代码请关注
https://ld246.com/article/1724305128590/comment/1724740441386#comments
*/

// see https://ld246.com/article/1723539516115
(() => {

  // 使用兼容模式，
  // 如果左右箭头有问题，可以使用兼容模式，兼容模式用ctrl/cmd + 方向键移动
  // 默认false，未开启，设为true开启
  const useCompatibilityMode = false;

  ////////////// 以下代码不涉及配置项，如无必要勿动 //////////////////////////
  // 判断是否Asri主题
  const theme = siyuan.config.appearance.mode === 0 ? siyuan.config.appearance.themeLight : siyuan.config.appearance.themeDark;
  if (theme !== 'Asri') return;

  // 设置下一个元素的焦点
  function nextElementFocus(currentFocus, nextElement) {
    currentFocus.classList.remove("b3-list-item--focus");
    nextElement?.classList.add("b3-list-item--focus");
  }


  // 等待元素渲染完成后执行
  function whenElementExist(selector) {
    return new Promise(resolve => {
      const checkForElement = () => {
        let element;
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

  function monitorHintMenu(layoutCenter) {
    // 定义一个回调函数处理 DOM 变化
    const observerCallback = (mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 当 layout__center 元素有新的子元素被添加或删除时触发
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('hint--menu')) {
              // 检查新添加的节点是否是 .hint--menu
              checkFnNoneClass(node);
            }
          });
        } else if (mutation.type === 'attributes' && mutation.target.classList.contains('hint--menu')) {
          // 当 .hint--menu 元素的属性发生变化时触发
          checkFnNoneClass(mutation.target);
        }
      });
    };

    // 检查是否有 .fn_none 类
    function checkFnNoneClass(node) {
      const hasFnNoneClass = node.classList.contains('fn__none');
      if (!hasFnNoneClass) {
        // 显示menu
        hintMenuShow = true;
        if (hintMenuTimer) clearTimeout(hintMenuTimer);
      } else {
        // 隐藏menu
        if (hintMenuTimer) clearTimeout(hintMenuTimer);
        hintMenuTimer = setTimeout(() => {
          hintMenuShow = false;
        }, 100);
      }
    }

    // 配置 MutationObserver
    const config = {childList: true, subtree: true, attributes: true, attributeFilter: ['class']};

    // 创建一个新的 MutationObserver 实例
    const observer = new MutationObserver(observerCallback);

    // 开始观察 layout__center 元素
    observer.observe(layoutCenter, config);

    // 返回一个函数以停止观察
    return () => {
      observer.disconnect();
    };
  }

  // region group mode
  // 获取下一个分组元素的焦点
  function focusNextGroupButton() {
    const menu = document.querySelector(".hint--menu:not(.fn__none)");
    const currentFocus = menu.querySelector('.b3-list-item--focus');
    let nextElement = currentFocus.nextElementSibling;

    // 继续查找下一个元素，直到找到一个按钮或.b3-menu__separator
    while (nextElement && nextElement.classList.contains('b3-list-item') && !nextElement.classList.contains('b3-menu__separator')) {
      nextElement = nextElement.nextElementSibling;
    }

    // 如果找到了.b3-menu__separator，就聚焦到它的前一个按钮
    if (nextElement && nextElement.classList.contains('b3-menu__separator')) {
      nextElement = nextElement.nextElementSibling;
    }

    // 如果没有找到任何按钮或.b3-menu__separator，循环到列表开头
    if (!nextElement || !nextElement.classList.contains('b3-list-item')) {
      nextElement = menu.querySelector('.b3-list-item');
    }

    nextElementFocus(currentFocus, nextElement);
  }

  // 获取上一个分组元素的焦点
  function focusPreviousGroupButton() {
    const menu = document.querySelector(".hint--menu:not(.fn__none)");
    const currentFocus = menu.querySelector('.b3-list-item--focus');
    let previousElement = currentFocus.previousElementSibling;

    // 继续查找上一个元素，直到找到一个按钮或.b3-menu__separator
    while (previousElement && previousElement.classList.contains('b3-list-item') && !previousElement.classList.contains('b3-menu__separator')) {
      previousElement = previousElement.previousElementSibling;
    }

    // 如果找到了.b3-menu__separator，就聚焦到它的前一个按钮
    if (previousElement && previousElement.classList.contains('b3-menu__separator')) {
      previousElement = previousElement.previousElementSibling;
    }

    // 如果没有找到任何按钮或.b3-menu__separator，循环到列表结尾
    if (!previousElement || !previousElement.classList.contains('b3-list-item')) {
      previousElement = menu.querySelector('.b3-list-item:last-child');
    }

    nextElementFocus(currentFocus, getGroupFirstElement(previousElement));
  }

  // 获取分组的第一个元素
  function getGroupFirstElement(currentFocus) {
    const menu = document.querySelector(".hint--menu:not(.fn__none)");
    let previousElement = currentFocus.previousElementSibling;

    // 继续查找上一个元素，直到找到一个按钮或.b3-menu__separator
    while (previousElement && previousElement.classList.contains('b3-list-item') && !previousElement.classList.contains('b3-menu__separator')) {
      previousElement = previousElement.previousElementSibling;
    }

    // 如果找到了.b3-menu__separator，就聚焦到它的前一个按钮
    if (previousElement && previousElement.classList.contains('b3-menu__separator')) {
      previousElement = previousElement.nextElementSibling;
    }

    // 如果没有找到任何按钮或.b3-menu__separator，循环到列表结尾
    if (!previousElement || !previousElement.classList.contains('b3-list-item')) {
      previousElement = menu.querySelector('.b3-list-item');
    }
    return previousElement;
  }

  // endregion group mode

  // region search mode
  function GetColData() {
    const menu = document.querySelector(".hint--menu:not(.fn__none)");
    const currentFocus = menu.querySelector('.b3-list-item--focus');
    const parent = currentFocus.parentNode;
    const b3ItemStyle = window.getComputedStyle(document.querySelector(".hint--menu .b3-list-item"))
    const lineHeight = +b3ItemStyle.lineHeight.slice(0, -2)
    const marginBottom = +b3ItemStyle.marginBottom.slice(0, -2)
    // 每个组有groupSize个元素
    const groupSize = Math.floor(menu.offsetHeight / (lineHeight + marginBottom))

    // 计算当前聚焦元素在其父元素中的索引
    const currentFocusIndex = Array.prototype.indexOf.call(parent.children, currentFocus);
    const totalGroup = Math.ceil(parent.children.length / groupSize);
    const curGroup = Math.ceil((currentFocusIndex + 1) / groupSize);
    let rowNum = (currentFocusIndex + 1) % groupSize;
    if (rowNum === 0) {
      rowNum = groupSize;
    }
    return {
      parent: parent, rowNum: rowNum, groupSize: groupSize, curGroup: curGroup,
      totalGroup: totalGroup, currentFocusIndex: currentFocusIndex, currentFocus: currentFocus
    }
  }

  function moveFocusByCol(isToRight) {
    const data = GetColData();
    const menuParent = data.parent;
    let newFocusIndex;
    if (data.curGroup === 1 && !isToRight) {
      newFocusIndex = SkipMenuToEnd(data, menuParent);
    } else if (data.curGroup === data.totalGroup && isToRight) {
      newFocusIndex = data.rowNum - 1;
    } else if (data.curGroup === data.totalGroup - 1 && isToRight) {
      newFocusIndex = SkipMenuToEnd(data, menuParent);
    } else {
      newFocusIndex = data.currentFocusIndex + (isToRight ? data.groupSize : -data.groupSize);
    }
    nextElementFocus(data.currentFocus, menuParent.children[newFocusIndex]);
  }

  function SkipMenuToEnd(data, menuParent) {
    let lastGroupButtonNum = menuParent.children.length % data.groupSize;
    if (lastGroupButtonNum === 0) {
      lastGroupButtonNum = data.groupSize;
    }
    if (data.rowNum <= lastGroupButtonNum) {
      return menuParent.children.length + data.rowNum - lastGroupButtonNum - 1;
    } else {
      return menuParent.children.length - 1;
    }
  }

  // endregion search mode

  // region key monitor
  function AddKeyEventListener() {
    document.addEventListener('keydown', function (event) {
      let menu;
      if (useCompatibilityMode) {
        if (!(event.ctrlKey || event.metaKey)) return
        menu = document.querySelector(".hint--menu:not(.fn__none)");
      } else {
        if (!hintMenuShow) return;
        menu = document.querySelector(".hint--menu");
        menu.classList.remove("fn__none");
      }


      if (menu) Do(menu, event,)
    });
  }

  function Do(menu, event) {
    const sepEl = document.querySelector("div.b3-menu__separator");
    if (event.key === 'ArrowLeft' || (event.shiftKey && event.key === "Tab"))
      sepEl ? focusPreviousGroupButton() : moveFocusByCol(false);
    else if (event.key === "ArrowRight" || event.key === "Tab")
      sepEl ? focusNextGroupButton() : moveFocusByCol(true);
    else if (event.key === 'Escape')
      menu.classList.add("fn__none");
    else return;
    event.preventDefault();
    event.stopPropagation();
  }

  // endregion key monitor

  // region Main
  let hintMenuShow = false;
  let hintMenuTimer = null;

  // 监控menu显示状态
  if (!useCompatibilityMode) {
    whenElementExist('.layout__center').then(async element => {
      monitorHintMenu(element); // 等待标签页容器渲染完成后开始监听
    });
  }
  // 监听按键
  AddKeyEventListener()
  // endregion Main
})();
