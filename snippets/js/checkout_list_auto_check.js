/*
// 自动勾选取消父任务
see https://ld246.com/article/1755052956165
需求：
一个任务列表中有多个子任务, 当子任务全部勾选后, 父任务自动勾选,
当子任务有一个取消勾选后, 父任务也自动取消勾选
支持多层级任务列表, 比如，当三级任务列表都勾选后, 二级任务列表自动勾选, 
当此二级任务列表为最后一个未勾选的, 那么这第一级任务列表也自动勾选
*/
setTimeout(()=>{
    const container = document.querySelector('.layout__center, #editor');
    if(!container) return;
    container.addEventListener('click', async (e) => {
        if(e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || !e.target.closest('.protyle-action--task')) return;
        await new Promise(resolve => setTimeout(resolve, 50));
        // 获取祖先元素并模拟点击
        const item = e.target.closest('[data-subtype="t"][data-type="NodeListItem"]');
        const parentItems = getParentsItems(item);
        if(parentItems.length === 0) return;
        for(const item of parentItems) {
            const list = item?.closest('[data-type="NodeList"][data-subtype="t"]');
            const hasUnDone = list?.querySelector(':scope > [data-subtype="t"][data-type="NodeListItem"] > .protyle-action--task use[*|href="#iconUncheck"]');
            const parentItem = item.parentElement?.closest('[data-type="NodeListItem"][data-subtype="t"]');
            const parentTaskCheck = parentItem?.querySelector('.protyle-action--task');
            const parentIsChecked = parentTaskCheck?.querySelector('use[*|href="#iconUncheck"]') ? false : true;
            // 当存在不可勾选的任务项目时，终止，不再向上级遍历，如果你想继续遍历可把此处的return改为continue
            if(!parentTaskCheck) return;
            if(hasUnDone) {
                // 当有未完成的子任务时，如果父任务已勾选需求要取消
                if(parentIsChecked) parentTaskCheck.click();
            } else {
                // 当全部勾选了子任务时，如果父任务未勾选则勾选
                if(!parentIsChecked) parentTaskCheck.click();
            }
        }
    }, true);

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
