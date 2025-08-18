/*
// 自动勾选取消父任务
see https://ld246.com/article/1755052956165
version 0.0.2
0.0.2 增加新需求
需求：
一个任务列表中有多个子任务, 当子任务全部勾选后, 父任务自动勾选,
当子任务有一个取消勾选后, 父任务也自动取消勾选
支持多层级任务列表, 比如，当三级任务列表都勾选后, 二级任务列表自动勾选,
当此二级任务列表为最后一个未勾选的, 那么这第一级任务列表也自动勾选

新增需求：
1. 当一个已完成的父任务新增一个子任务时，由于新子任务默认是未完成（未勾选），所以父任务应自动取消勾选。
2. 当父任务下只剩一个未完成子任务时，若删除该子任务，则父任务应自动变为已完成（勾选）。
*/
setTimeout(() => {
    const container = document.querySelector('.layout__center, #editor');
    if (!container) return;
    container.addEventListener('click', async (e) => {
        if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || !e.target.closest('.protyle-action--task')) return;
        await new Promise(resolve => setTimeout(resolve, 50));
        // 获取祖先元素并模拟点击
        const item = e.target.closest('[data-subtype="t"][data-type="NodeListItem"]');
        clickParentItems(item);
    }, true);

    // 观察 container 的子树变化（基于规律的处理，可能有bug）
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            // 处理新增的子任务
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches('div[data-type="NodeListItem"][data-subtype="t"]')) {
                    clickParentItems(node);
                }
                else if (node.matches('div[data-type="NodeList"][data-subtype="t"]')) {
                    const items = node.querySelectorAll('div[data-type="NodeListItem"][data-subtype="t"]');
                    items.forEach(item => clickParentItems(item));
                } else {
                    const items = node.querySelectorAll('div[data-type="NodeListItem"][data-subtype="t"]');
                    if (items.length) items.forEach(item => clickParentItems(item));
                }
            }
            // 处理删除的子任务
            for (const node of mutation.removedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches('div[data-type="NodeListItem"][data-subtype="t"]')) {
                    clickParentItems(mutation.target.querySelector('div[data-type="NodeListItem"][data-subtype="t"]'));
                }
            }
        }
    });
    observer.observe(container, { childList: true, subtree: true, attributes: false });

    function clickParentItems(item) {
        const parentItems = getParentsItems(item);
        if (parentItems.length === 0) return;
        for (const item of parentItems) {
            const list = item?.closest('[data-type="NodeList"][data-subtype="t"]');
            const hasUnDone = list?.querySelector(':scope > [data-subtype="t"][data-type="NodeListItem"] > .protyle-action--task use[*|href="#iconUncheck"]');
            const parentItem = item.parentElement?.closest('[data-type="NodeListItem"][data-subtype="t"]');
            const parentTaskCheck = parentItem?.querySelector('.protyle-action--task');
            const parentIsChecked = parentTaskCheck?.querySelector('use[*|href="#iconUncheck"]') ? false : true;
            // 当存在不可勾选的任务项目时，终止，不再向上级遍历，如果你想继续遍历可把此处的return改为continue
            if (!parentTaskCheck) return;
            if (hasUnDone) {
                // 当有未完成的子任务时，如果父任务已勾选需求要取消
                if (parentIsChecked) parentTaskCheck.click();
            } else {
                // 当全部勾选了子任务时，如果父任务未勾选则勾选
                if (!parentIsChecked) parentTaskCheck.click();
            }
        }
    }

    // 获取祖先任务项
    function getParentsItems(item, includeSelf = true) {
        if (!item) return [];
        const items = [];
        // 是否包含自己
        if (includeSelf) {
            items.push(item);
        }
        // 向上遍历所有符合条件的祖先 NodeListItem
        let current = item;
        while (true) {
            const parentItem = current.parentElement?.closest('[data-subtype="t"][data-type="NodeListItem"]');
            if (!parentItem) break;
            items.push(parentItem);
            current = parentItem;
        }
        return items;
    }
}, 2000);