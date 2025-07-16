from setting import OutputFlag
from snippets import SnippetConfig

if __name__ == '__main__':
    flag = 0
    flag |= OutputFlag.SIYUAN  # 输出思源
    flag |= OutputFlag.TEST  # 输出测试
    SnippetConfig().output_json(flag)
    print(f"finish {bin(flag)[2:-1]}")
