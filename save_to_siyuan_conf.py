import json
import os
import time
from itertools import chain

siyuan_doc_path = "b:/note/Siyuan"  # 填写实际的思源文本路径,
siyuan_doc_path_test = "./output/"  # 测试路径
conf_path = "data/snippets/conf.json"

siyuan_conf_path = os.path.join(siyuan_doc_path, conf_path)
test_conf_path = os.path.join(siyuan_doc_path_test, conf_path)
# 这里增加屏蔽的代码片段文件
# 也可以将不要的代码片段文件添加到 just_collection 中 也不会生成
ban_snippets = set()

do_time = time.strftime("%Y%m%d%H%M%S", time.localtime())
snippet_id = 0


def get_id():
    """
    Generate a unique snippet ID based on the script run timestamp and an incremented counter.

    This function uses a global counter, `snippet_id`, which is incremented each time
    the function is called. The ID consists of the script run date and time in the format
    'YYYYMMDDHHMMSS', followed by a hyphen and a zero-padded seven-digit counter.

    Returns:
        str: A unique snippet ID in the format 'YYYYMMDDHHMMSS-XXXXXXX'.
    """
    global snippet_id
    snippet_id += 1
    return f"{do_time}-{str(snippet_id).zfill(7)}"


class OutputFlag:
    TEST = 1 << 1
    SIYUAN = 1 << 2


class BaseSnippets:
    _type = ""

    def __init__(self, name, enable, file_path):
        self.id = get_id()
        self.name = name
        self.enable = enable
        self.content = self.load_from_file(file_path)

    def load_from_file(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return "\n".join(f.readlines())

    def data_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self._type,
            "enabled": self.enable,
            "content": self.content,
        }


class CSSSnippets(BaseSnippets):
    _type = "css"


class JSSnippets(BaseSnippets):
    _type = "js"


class SnippetConfig:
    def __init__(self):
        self.js = []
        self.css = []
        self.Init()

    def Init(self):
        self.load_css()
        self.load_js()

    def load_js(self):
        for snippet_name, file_path in self.traverse_directory_os(
                path="./js",
                extensions=['.js']
        ):
            self.js.append(JSSnippets(snippet_name, snippet_name not in ban_snippets, file_path))

    def load_css(self):
        for snippet_name, file_path in self.traverse_directory_os(
                path="./css",
                extensions=['.css']
        ):
            self.css.append(CSSSnippets(snippet_name, snippet_name not in ban_snippets, file_path))

    def output_json(self, output_target):
        _all = []
        for i in chain(self.css, self.js):
            _all.append(i.data_json())

        def output(path):
            self.check_and_create_not_exist_save_path(path)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(_all, f, indent=2, ensure_ascii=False)

        if output_target & OutputFlag.SIYUAN:
            output(siyuan_conf_path)
        if output_target & OutputFlag.TEST:
            output(test_conf_path)

    @staticmethod
    def check_and_create_not_exist_save_path(path):
        if os.path.exists(path):
            return
        if os.path.isdir(path):
            os.makedirs(path, exist_ok=True)
        else:
            os.makedirs("/".join(path.split("/")[:-1]), exist_ok=True)

    @staticmethod
    def traverse_directory_os(path: str, ignore_hidden: bool = True, extensions: list = None):
        for root, dirs, files in os.walk(path):
            # 可选：排除隐藏子目录（如 .git等）
            if ignore_hidden:
                dirs[:] = [d for d in dirs if not d.startswith('.')]

            for filename in files:
                if ignore_hidden and filename.startswith('.'):
                    continue
                if extensions and os.path.splitext(filename)[1].lower() not in extensions:
                    continue
                snippet_name = f"{root[len(path) + 1:].replace("\\", "-")}-{os.path.splitext(filename)[0]}"
                file_path = os.path.join(root, filename)
                yield snippet_name, file_path


if __name__ == '__main__':
    flag = 0
    # flag += OutputFlag.SIYUAN  # 输出思源
    flag += OutputFlag.TEST  # 输出测试
    SnippetConfig().output_json(flag)
