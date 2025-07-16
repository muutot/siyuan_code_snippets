# SiYuan Code Snippets

A collection of CSS and JavaScript snippets for customizing and enhancing the [SiYuan](https://github.com/siyuan-note/siyuan) note-taking application.

## Overview

This repository contains a collection of code snippets that can be used to customize the appearance and functionality of SiYuan. It also includes a Python script for automatically generating the
`conf.json` file that SiYuan uses to load these snippets.

## Repository Structure

```
├── css/                  # CSS snippets for styling SiYuan
│   ├── blocking/         # CSS for blocking elements
│   ├── main/             # Main CSS customizations
│   ├── markdown/         # Markdown-specific styling
│   ├── miscellaneous/    # Miscellaneous CSS tweaks
│   ├── pop_window/       # Styling for popup windows
│   └── sidebar/          # Sidebar customizations
├── js/                   # JavaScript snippets for adding functionality
│   ├── Middle-click_to-expand_file_tree.js
│   ├── block_ctrl_w_close_pin_tab.js
│   ├── change_link_to_mode.js
│   ├── collapse_code.js
│   └── slash_menu_arrow_keys_command.js
├── just_collection/      # Additional snippets collection
├── output/               # Generated output files
└── save_to_siyuan_conf.py  # Script to generate conf.json
```

## Usage

### Setting Up

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/siyuan_code_snippets.git
   cd siyuan_code_snippets
   ```

2. Modify the `siyuan_doc_path` variable in `setting.py` to point to your SiYuan workspace directory:
   ```python
   siyuan_doc_path = "path/to/your/siyuan/workspace"
   ```

### Generating the Configuration File

1. Run the script to generate the configuration file:
   ```bash
   python main.py
   ```

2. By default, the script will generate a test configuration in the `./output/` directory. To generate the configuration directly in your SiYuan installation, modify the flags in the script:
   ```python
   flag = 0
   flag += OutputFlag.SIYUAN  # Uncomment to output to SiYuan
   # flag += OutputFlag.TEST  # Comment out to disable test output
   ```

## Adding New Snippets

### CSS Snippets

Place your CSS files in the appropriate subdirectory under `snippets/css/`. The script will automatically detect and include them in the configuration.

### JavaScript Snippets

Place your JavaScript files in the `snippets/js/` directory. The script will automatically detect and include them in the configuration.

### Excluding Snippets

To exclude specific snippets from being included in the configuration, add their names to the `ban_snippets` set in `setting.py`.

## Features

- **Automatic ID Generation**: Each snippet gets a unique ID based on timestamp and counter
- **Organized Structure**: Snippets are organized by type and functionality
- **Flexible Output**: Can generate configuration for testing or direct use in SiYuan

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [SiYuan](https://github.com/siyuan-note/siyuan) - The note-taking application these snippets are designed for
