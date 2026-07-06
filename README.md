# 🐱 Lynx Web Terminal

A browser-based terminal for the Lynx programming language — with project management, package manager, and full REPL.

---

## ✨ Features

- **Full Lynx REPL** — Write and run Lynx code in your browser
- **Multi-line support** — Shift+Enter for new lines
- **Command history** — Arrow up/down
- **Project management** — `init`, `list`, `open`, `save`, `files`, `cat`, `rm`
- **Package manager** — `add`, `install`, `remove`, `list pkgs`, `update`, `search`
- **Build & run** — `build`, `run`, `publish`
- **LocalStorage** — All projects and packages saved in your browser
- **Dark theme** — Easy on the eyes
- **Mobile-friendly** — Works on phones too

---

## 🚀 Quick Start

1. Clone this repo or download the files
2. Open `index.html` in your browser
3. Start typing Lynx commands!

```
lynx help
```

## 📁 Folder Structure

```
lynx-web-terminal/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── lynx.min.js
│   ├── terminal.js
│   ├── commands.js
│   ├── projects.js
│   └── packages.js
├── README.md
└── LICENSE
```


---

## 🛠️ Commands

### Core

| Command | Description |
|---------|-------------|
| `lynx help` | Show help menu |
| `lynx version` | Show version info |
| `lynx clear` | Clear terminal |

### Project Management

| Command | Description |
|---------|-------------|
| `lynx init <name>` | Create a new project |
| `lynx list` | List all projects |
| `lynx open <name>` | Open a project |
| `lynx save` | Save current code to `src/main.lnx` |
| `lynx files` | List files in current project |
| `lynx cat <file>` | Print file contents |
| `lynx rm <file>` | Delete a file |
| `lynx project info` | Show current project details |

### Package Management

| Command | Description |
|---------|-------------|
| `lynx add <pkg>` | Add a dependency |
| `lynx install` | Install all dependencies |
| `lynx remove <pkg>` | Remove a dependency |
| `lynx list pkgs` | List installed packages |
| `lynx update` | Update all packages |
| `lynx search <term>` | Search registry |

### Build & Run

| Command | Description |
|---------|-------------|
| `lynx build` | Run `src/main.lnx` |
| `lynx run <file.lnx>` | Run a Lynx file |
| `lynx publish` | Download project as `.tar.gz` |
Here's the Examples → Credits section — ready to drop in:

---

## 🧪 Example

```lynx
Set x = 10
Set y = 20
Set sum = x + y
Roar sum
```

---

## 🐾 License

MIT — see LICENSE

---

## 🙏 Credits

· Lynx — The language
· justdev-chris — Creator



