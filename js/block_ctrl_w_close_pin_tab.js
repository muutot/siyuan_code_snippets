// version 1
(()=>{
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

  // 是否在最近打开文档中，将钉住标签移动到最上面，默认不移动，改为true时则移动
  const isMovePinTabToTopInRecentlyDialog  = true;

  //////////////// 以下代码，不涉及样式调整，非必要勿动 //////////////////////

  // 等待标签页容器渲染完成后开始监听
  whenElementExist('.layout__center').then(async element => {
    // 激活焦点文档，监控前触发一次
    focusActiveTab();

    // 监听页签切换事件
    let stopObserving;
    const onTabChange = (tab) => {
      // 暂停监听，防止修改class属性不停回调引起死循环
      stopObserving();
      console.log(tab, "tab");
      // 如果是钉住标签，则取消焦点样式（取消后ctrl+w无法关闭），使用pin焦点样式代替
      if(tab.classList.contains("item--pin")) {
        clearPinFocus();
        tab.classList.remove("item--focus");
        tab.classList.add("item--pin--focus");
      } else {
        // 如果不是钉住标签分两种情况，一是取消了标签，二是切换到其他标签
        if(tab.classList.contains("item--pin--focus")) {
          // 如果是取消钉住，则还原原焦点样式
          tab.classList.remove("item--pin--focus");
          tab.classList.add("item--focus");

        } else {
          // 切换到其他标签时，清除现在的钉住标签样式即可
          clearPinFocus();
        }
      }
      // 重新拉起监听
      stopObserving = observeTabChanged(element, onTabChange);
    };
    // 开始监听
    stopObserving = observeTabChanged(element, onTabChange);

    // 激活焦点文档，监控后触发一次
    focusActiveTab();

    // 当按ctrl+w时，把钉住标签的激活时间临时改为0，防止连续按键时，钉住标签被切换成焦点的情况发生
    modifyActiveTimeOnShortcut(".layout__center .layout-tab-bar li.item--pin", 0);

    // 监听最近打开文档
    if(isMovePinTabToTopInRecentlyDialog) {
      observeRecentlyDialog((node)=>{
        // 获取所有钉住的标签
        const pinTabNodeIds = getAllPinTabNodeIds();
        // 把所有最近文档的钉住标签，移动到顶部
        movePinTabItemToTop(node, pinTabNodeIds);
      });
    }

  });

  // 激活焦点文档
  function focusActiveTab() {
    // 激活焦点文档
    document.querySelector(".layout__center .layout-tab-bar li.item--focus")?.click();
  }

  // 获取所有的指定标签的nodeId
  function getAllPinTabNodeIds() {
    const pinTabs = document.querySelectorAll(".layout__center .layout-tab-bar li.item--pin");
    let pinTabNodeIds = [];
    pinTabs.forEach(pin => {
      const dataId = pin.getAttribute("data-id");
      const parents = pin.closest("div.fn__flex");
      const nodeId = parents?.nextElementSibling?.querySelector('div[data-id="'+dataId+'"] .protyle-breadcrumb__item svg.popover__block')?.getAttribute("data-id");
      if(nodeId) {
        pinTabNodeIds.push(nodeId);
      }
    });
    return pinTabNodeIds;
  }

  // 移动最近打开文档列表的node-id在pinTabNodeIds中的元素置顶
  async function movePinTabItemToTop(node, pinTabNodeIds) {
    const ulElement = await whenElementExist(()=>{
      return node.querySelector("ul.b3-list--background.fn__flex-1");
    });
    pinTabNodeIds.reverse();
    // 遍历 pinTabNodeIds 数组
    pinTabNodeIds.forEach(nodeId => {
      // 查找具有相应 data-node-id 的 li 元素
      const item = ulElement.querySelector(`li[data-node-id="${nodeId}"]`);
      if (item) {
        // 将找到的 li 元素移动到 ul 的顶部
        ulElement.prepend(item);
      }
    });
  }

  // 清除上次的pin焦点
  function clearPinFocus() {
    document.querySelector(".item--pin--focus")?.classList.remove("item--pin--focus");
  }

  // 当按ctrl+w时，把钉住标签的激活时间临时改为0，防止连续按键时，钉住标签被切换成焦点的情况发生
  function modifyActiveTimeOnShortcut(selector, tempValue) {
    const elements = document.querySelectorAll(selector);
    let isCtrlOrCmdPressed = false;
    let isWPressed = false;
    let originalValues = {};
    // 添加 keydown 事件监听器
    document.addEventListener('keydown', function(event) {
      if ((event.key === 'Control' || event.metaKey) && !isCtrlOrCmdPressed) {
        isCtrlOrCmdPressed = true;
      }
      if (event.key === 'w' && isCtrlOrCmdPressed) {
        isWPressed = true;
        // 阻止默认行为
        event.preventDefault();
        // 改变所有元素的 data-activetime 属性
        elements.forEach(function(element) {
          originalValues[element] = element.dataset.activetime;
          element.dataset.activetime = tempValue;
        });
      }
    });
    // 添加 keyup 事件监听器
    document.addEventListener('keyup', function(event) {
      if (event.key === 'Control' || event.metaKey) {
        isCtrlOrCmdPressed = false;
      }
      if (event.key === 'w') {
        isWPressed = false;
        // 检查是否两个键都已释放
        if (!isCtrlOrCmdPressed && !isWPressed) {
          // 恢复所有元素的原始 data-activetime 属性
          elements.forEach(function(element) {
            if (originalValues[element]) {
              element.dataset.activetime = originalValues[element];
            }
          });
        }
      }
    });
  }

  // 监听页签切换事件
  function observeTabChanged(parentNode, callback) {
    // 创建一个回调函数来处理观察到的变化
    const observerCallback = function(mutationsList, observer) {
      // 用常规方式遍历 mutationsList 中的每一个 mutation
      for (let mutation of mutationsList) {
        // 属性被修改
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target;
          if (element.tagName.toLowerCase() === 'li' && element.getAttribute('data-type') === 'tab-header' && (element.classList.contains('item--focus')||element.classList.contains('item--pin--focus'))) {
            if(typeof callback === 'function') callback(element);
          }
        }
        // 如果有新的子节点被添加
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'li') {
              if (node.getAttribute('data-type') === 'tab-header' && (node.classList.contains('item--focus')||node.classList.contains('item--pin--focus'))) {
                if(typeof callback === 'function') callback(node);
              }
            }
          });
        }
      }
    };
    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(observerCallback);
    // 配置观察器：传递一个对象来指定观察器的行为
    const config = { attributes: true, attributeFilter: ['class'], childList: true, subtree: true };
    // 开始观察目标节点
    observer.observe(parentNode, config);
    // 返回一个函数，用于停止观察
    return function stopObserving() {
      observer.disconnect();
    };
  }

  // 监听最近打开的文档
  function observeRecentlyDialog(callback) {
    // 创建 MutationObserver 实例
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // 遍历新增的子元素
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'div') {
              if (node.hasAttribute('data-key') && node.getAttribute('data-key') === 'dialog-recentdocs') {
                if(typeof callback === 'function') callback(node);
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
