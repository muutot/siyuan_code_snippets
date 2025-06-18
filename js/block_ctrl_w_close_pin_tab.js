// see https://ld246.com/article/1723109908986
(() => {
  // 注入样式，模拟激活标签的样式，可根据自己的样式进行调整
  addStyle(`
        .layout__wnd--active .layout-tab-bar .item--pin--focus:after {
            background-color: var(--b3-theme-primary);
        }
        .layout-tab-bar .item--pin--focus:after {
            content: "";
            width: 100%;
            height: 3px;
            border-radius: var(--b3-border-radius);
            bottom: 0;
            position: absolute;
            background-color: var(--b3-theme-background-light);
        }
    `);

  // 是否在最近打开文档对话框中，将钉住标签移动到当前焦点的下面，默认不移动，改为true时则移动
  const isMovePinTabToFocusNextInRecentlyDialog = true;

  // 是否在标签切换对话框中，将钉住标签移动到当前焦点的下面，默认不移动，改为true时则移动
  const isMovePinTabToFocusNextInTabSwitchDialog = true;

  //////////////// 以下代码，不涉及样式调整，非必要勿动 //////////////////////

  // 等待标签页容器渲染完成后开始监听
  whenElementExist('.layout__center').then(async element => {
    // 记录按键前的数据状态
    let originalValues = {};

    // 当按ctrl+w时，临时修改item--focus为item--pin--focus
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        // 临时修改item--focus为item--pin--focus
        const focusPinTab = element.querySelector('.layout-tab-bar .item--pin.item--focus');
        if (focusPinTab) {
          focusPinTab.classList.remove('item--focus');
          focusPinTab.classList.add('item--pin--focus');
        }

        // 临时修改activetime为0，值为0可以避免被获得焦点
        if (Object.keys(originalValues).length === 0) {
          const items = element.querySelectorAll('.layout-tab-bar .item--pin');
          let maxActivetimeItem = null;
          let maxActivetime = 0;
          items.forEach(item => {
            originalValues[item.getAttribute("data-id")] = item.dataset.activetime;
            if (item.dataset.activetime > maxActivetime) {
              maxActivetime = item.dataset.activetime;
              maxActivetimeItem = item;
            }
            item.dataset.activetime = 0;
          });
          // 把最后激活的文档设为下一个焦点
          if (maxActivetimeItem) maxActivetimeItem.dataset.activetime = 1;
        }
      }
    }, {capture: true});

    // 当按释放按键是，恢复item--pin--focus为item--focus
    document.addEventListener('keyup', function (event) {
      // 恢复item--pin--focus为item--focus
      const focusPinTab = element.querySelector('.layout-tab-bar .item--pin.item--pin--focus');
      if (focusPinTab) {
        focusPinTab.classList.remove('item--pin--focus');
        focusPinTab.classList.add('item--focus');
      }

      // 恢复activetime的值
      if (Object.keys(originalValues).length > 0) {
        const items = element.querySelectorAll('.layout-tab-bar .item--pin');
        items.forEach(item => {
          if (item.dataset.activetime <= 1) item.dataset.activetime = originalValues[item.getAttribute("data-id")];
        });
        //清空originalValues
        Object.keys(originalValues).forEach(key => {
          delete originalValues[key];
        });
      }
    }, true);

    // 监听最近打开文档 和 页签切换
    if (isMovePinTabToFocusNextInRecentlyDialog || isMovePinTabToFocusNextInTabSwitchDialog) {
      observeDialogShow((node, dialog) => {
        // 监听最近打开文档
        if (dialog === 'dialog-recentdocs') {
          // 获取所有钉住的标签
          const pinTabNodeIds = getAllPinTabNodeIds();
          // 把所有最近文档的钉住标签，移动到当前焦点的下面
          movePinTabItemToFocusTabNext(node, pinTabNodeIds);
        }
        // 监听页签切换
        if (dialog === 'dialog-switchtab') {
          // 获取所有钉住的标签
          const pinTabNodeIds = getAllPinTabNodeIds();
          // 把所有最近文档的钉住标签，移动到当前焦点的下面
          movePinTabItemToFocusTabNext(node, pinTabNodeIds);
        }
      });
    }

  });

  // 获取所有的指定标签的nodeId
  function getAllPinTabNodeIds() {
    const pinTabs = document.querySelectorAll(".layout__center .layout-tab-bar li.item--pin");
    let pinTabNodeIds = [];
    pinTabs.forEach(pin => {
      let initData = pin.getAttribute("data-initdata");
      if (initData) {
        // 初始化时的数据
        initData = JSON.parse(initData);
        if (initData && initData.blockId) {
          pinTabNodeIds.push(initData.blockId);
        }
      } else {
        // 内容加载后的数据
        const dataId = pin.getAttribute("data-id");
        const parents = pin.closest("div.fn__flex");
        const nodeId = parents?.nextElementSibling?.querySelector('div[data-id="' + dataId + '"] .protyle-breadcrumb__item svg.popover__block')?.getAttribute("data-id");
        if (nodeId) {
          pinTabNodeIds.push(nodeId);
        }
      }
    });
    return pinTabNodeIds;
  }

  // 移动最近打开文档或文档切换列表的node-id在pinTabNodeIds中的元素到当前焦点的下面
  async function movePinTabItemToFocusTabNext(node, pinTabNodeIds) {
    let ulElement = null;
    let focusElement = null;
    await whenElementExist(() => {
      ulElement = node.querySelector("ul.b3-list--background.fn__flex-1");
      focusElement = ulElement?.querySelector("li.b3-list-item--focus");
      return ulElement && focusElement;
    });
    pinTabNodeIds.reverse();
    // 遍历 pinTabNodeIds 数组
    pinTabNodeIds.forEach(nodeId => {
      // 查找具有相应 data-node-id 的 li 元素
      const item = ulElement.querySelector(`li[data-node-id="${nodeId}"]`);
      if (item) {
        // 将 item 插入到 focusElement 后面
        focusElement.parentElement.insertBefore(item, focusElement.nextSibling);
      }
    });
  }

  // 监听对话框
  function observeDialogShow(callback) {
    // 创建 MutationObserver 实例
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // 遍历新增的子元素
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'div') {
              if (node.hasAttribute('data-key') && node.getAttribute('data-key') === 'dialog-recentdocs') {
                if (typeof callback === 'function') callback(node, 'dialog-recentdocs');
              }
              if (node.hasAttribute('data-key') && node.getAttribute('data-key') === 'dialog-switchtab') {
                if (typeof callback === 'function') callback(node, 'dialog-switchtab');
              }
            }
          }
        }
      }
    });
    // 配置 MutationObserver
    const config = {
      childList: true,
    };
    // 开始观察 body 的子元素
    observer.observe(document.body, config);
    // observer.disconnect()
  }

  // 延迟执行
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 等待元素渲染完成后执行
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

  // 注入样式
  function addStyle(styleContent) {
    // 获取现有的 <style> 标签
    let styleTag = document.head.querySelector('ctrl-w-not-close-tab-style');
    // 如果已存在 <style> 标签
    if (styleTag) {
      // 删除已存在的 <style> 标签
      styleTag.parentNode.removeChild(styleTag);
    }
    // 创建新的 <style> 标签
    styleTag = document.createElement('style');
    styleTag.textContent = styleContent;
    // 将新的 <style> 标签添加到文档头部
    document.head.appendChild(styleTag);
  }
})();
