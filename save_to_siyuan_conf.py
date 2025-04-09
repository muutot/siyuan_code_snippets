import json
import time
from itertools import chain
import os

# siyuan_doc_path = "b:/note/Siyuan" # 填写实际的思源文本路径,
siyuan_doc_path = "./output/"  # 测试路径
siyuan_conf_path = os.path.join(siyuan_doc_path, "data/snippets/conf.json")
ban_snippets = set()

do_time = time.strftime("%Y%m%d%H%M%S", time.localtime())
snippet_id = 0


def get_id():
    global snippet_id
    snippet_id += 1
    return f"{do_time}-{str(snippet_id).zfill(7)}"


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

    def output_json(self):
        _all = []
        for i in chain(self.css, self.js):
            _all.append(i.data_json())

        self.check_and_create_not_exist_save_path()

        with open(siyuan_conf_path, "w", encoding="utf-8") as f:
            json.dump(_all, f, indent=2, ensure_ascii=False)

    def check_and_create_not_exist_save_path(self):
        if os.path.exists(siyuan_conf_path):
            return
        if os.path.isdir(siyuan_conf_path):
            os.makedirs(siyuan_conf_path, exist_ok=True)
        else:
            os.makedirs("/".join(siyuan_conf_path.split("/")[:-1]), exist_ok=True)

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
    SnippetConfig().output_json()
