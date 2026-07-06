// js/terminal.js – Terminal UI, input, history, multi-line

(function() {
    const terminal = document.getElementById('terminal');
    const input = document.getElementById('input');

    // ─── STATE ──────────────────────────────────────────────────
    let history = [];
    let historyIndex = -1;
    let multiline = '';
    let inBlock = false;
    let currentProject = null;

    // ─── PRINT ──────────────────────────────────────────────────
    function print(text, className = 'output') {
        if (!text) return;
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // ─── EXECUTE LYNX CODE ──────────────────────────────────────
    function executeLynx(code) {
        if (!code || !code.trim()) return;

        const oldLog = console.log;
        const logs = [];
        console.log = (...args) => {
            logs.push(args.join(' '));
            oldLog(...args);
        };

        try {
            if (typeof lynx !== 'undefined' && lynx.run) {
                lynx.run(code);
            } else {
                print('Error: Lynx interpreter not loaded.', 'error');
                return;
            }

            if (logs.length > 0) {
                logs.forEach(log => print(log, 'output'));
            }
        } catch (e) {
            print(`Error: ${e.message || e}`, 'error');
        } finally {
            console.log = oldLog;
        }
    }

    // ─── HANDLE COMMAND ──────────────────────────────────────────
    function handleCommand(inputText) {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        // Check if it's a lynx command
        if (trimmed.startsWith('lynx ')) {
            const args = trimmed.slice(5).trim();
            const cmd = args.split(/\s+/)[0];

            if (typeof lynxCommands !== 'undefined' && lynxCommands[cmd]) {
                lynxCommands[cmd](args.slice(cmd.length).trim());
            } else {
                print(`Unknown command: lynx ${cmd}`, 'error');
                print('Type "lynx help" for available commands', 'info');
            }
            return;
        }

        // Raw Lynx code — run it
        print(`🐱 lynx> ${inputText}`, 'info');
        executeLynx(inputText);
        history.push(inputText);
        historyIndex = history.length;
    }

    // ─── INPUT HANDLING ──────────────────────────────────────────
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const cmd = input.value;

            // Multi-line detection
            const openBraces = (multiline + cmd).match(/\{/g) || [];
            const closeBraces = (multiline + cmd).match(/\}/g) || [];

            if (cmd.trim().endsWith('{') || (openBraces.length > closeBraces.length)) {
                multiline += cmd + '\n';
                input.value = '';
                inBlock = true;
                print('... ', 'info');
                return;
            }

            if (inBlock) {
                multiline += cmd + '\n';
                const totalOpen = (multiline.match(/\{/g) || []).length;
                const totalClose = (multiline.match(/\}/g) || []).length;
                if (totalOpen === totalClose) {
                    inBlock = false;
                    handleCommand(multiline);
                    multiline = '';
                    input.value = '';
                } else {
                    print('... ', 'info');
                    input.value = '';
                }
                return;
            }

            handleCommand(cmd);
            input.value = '';
            setTimeout(() => input.focus(), 10);
            return;
        }

        // ─── HISTORY ──────────────────────────────────────────────
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex] || '';
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex] || '';
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        }
    });

    // ─── FOCUS ──────────────────────────────────────────────────
    document.addEventListener('click', () => input.focus());

    // ─── CLEAR ──────────────────────────────────────────────────
    function clearTerminal() {
        terminal.innerHTML = '';
        print('🐱 Lynx Web Terminal v1.0 — Type "lynx help" for commands', 'info');
        print('---', 'output');
    }

    // ─── EXPOSE ──────────────────────────────────────────────────
    window.terminal = {
        print,
        executeLynx,
        clear: clearTerminal,
        get currentProject() { return currentProject; },
        set currentProject(name) { currentProject = name; }
    };

    // ─── WELCOME ──────────────────────────────────────────────────
    clearTerminal();
})();
