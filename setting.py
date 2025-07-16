import os


class OutputFlag:
    TEST = 1 << 1
    SIYUAN = 1 << 2


siyuan_doc_path = "b:/note/Siyuan"  # 填写实际的思源文本路径,
siyuan_doc_path_test = "./output/"  # 测试输出路径

conf_path_postfix = "data/snippets/conf.json"

siyuan_conf_path = os.path.join(siyuan_doc_path, conf_path_postfix)
test_conf_path = os.path.join(siyuan_doc_path_test, conf_path_postfix)
# 这里增加屏蔽的代码片段文件
# 也可以将不要的代码片段文件添加到 just_collection 中 也不会生成
ban_snippets = {
    # "blocking-arsi_behavior-color",
    # "blocking-arsi_behavior-content_block",
    # "blocking-arsi_behavior-file_tree",
    # "blocking-arsi_behavior-tab_bar",
    # "main-background",
    # "main-doc_title",
    # "main-editor_area",
    # "main-main",
    # "main-status_bar",
    # "main-toolbar",
    # "markdown-code",
    # "markdown-comment",
    # "markdown-content",
    # "markdown-label",
    # "markdown-line_code",
    # "markdown-link",
    # "markdown-list",
    # "markdown-photo",
    # "markdown-refference",
    # "markdown-table",
    # "markdown-title",
    # "markdown-siyuan-block_refenerce",
    # "markdown-siyuan-database",
    # "markdown-siyuan-super_block",
    # "miscellaneous-plugin",
    # "miscellaneous-search",
    # "pop_window-color_choice",
    # "pop_window-emoji",
    # "pop_window-slash_menu",
    # "sidebar-filetree",
    # "sidebar-main",
    # "sidebar-outline"
}
