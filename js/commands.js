// js/commands.js – All lynx commands (help, init, build, etc.)

(function() {
    // ─── REGISTRY STATE ──────────────────────────────────────────
    let registryPage = 0;
    const PAGE_SIZE = 50;
    let registryCache = [];

    // ─── HELP ──────────────────────────────────────────────────────
    function showHelp() {
        terminal.print(`
🐱 LYNX WEB TERMINAL — COMMANDS

  lynx help              Show this help menu
  lynx version           Show version info
  lynx clear             Clear terminal

  lynx init <name>       Create a new project
  lynx list              List all projects
  lynx list pkgs         List installed packages
  lynx list registry     List all packages in registry (50 per page)
  lynx next              Next page of registry
  lynx prev              Previous page of registry
  lynx open <name>       Open a project
  lynx save              Save current code to src/main.lnx
  lynx files             List files in current project
  lynx cat <file>        Print file contents
  lynx rm <file>         Delete a file
  lynx project info      Show current project details

  lynx add <pkg>         Add a dependency
  lynx install           Install all dependencies
  lynx remove <pkg>      Remove a dependency

  lynx build             Run src/main.lnx
  lynx run <file.lnx>    Run a Lynx file
  lynx publish           Download project as .tar.gz
  lynx update            Update all packages
  lynx search <term>     Search registry
        `, 'help');
    }

    // ─── VERSION ──────────────────────────────────────────────────
    function showVersion() {
        terminal.print('🐱 Lynx Web Terminal v1.0.0', 'info');
        terminal.print('Lynx interpreter: ' + (typeof lynx !== 'undefined' ? 'loaded' : 'not loaded'), 'output');
    }

    // ─── CLEAR ──────────────────────────────────────────────────
    function clearTerminal() {
        terminal.clear();
    }

    // ─── INIT ────────────────────────────────────────────────────
    function initProject(name) {
        if (!name) {
            terminal.print('Usage: lynx init <name>', 'error');
            return;
        }
        if (typeof projects !== 'undefined' && projects.create) {
            projects.create(name);
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── LIST ────────────────────────────────────────────────────
    function listProjects() {
        if (typeof projects !== 'undefined' && projects.list) {
            projects.list();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── OPEN ────────────────────────────────────────────────────
    function openProject(name) {
        if (!name) {
            terminal.print('Usage: lynx open <name>', 'error');
            return;
        }
        if (typeof projects !== 'undefined' && projects.open) {
            projects.open(name);
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── SAVE ────────────────────────────────────────────────────
    function saveProject() {
        if (typeof projects !== 'undefined' && projects.save) {
            projects.save();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── FILES ────────────────────────────────────────────────────
    function listFiles() {
        if (typeof projects !== 'undefined' && projects.files) {
            projects.files();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── CAT ────────────────────────────────────────────────────
    function catFile(filename) {
        if (!filename) {
            terminal.print('Usage: lynx cat <filename>', 'error');
            return;
        }
        if (typeof projects !== 'undefined' && projects.cat) {
            projects.cat(filename);
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── RM ──────────────────────────────────────────────────────
    function rmFile(filename) {
        if (!filename) {
            terminal.print('Usage: lynx rm <filename>', 'error');
            return;
        }
        if (typeof projects !== 'undefined' && projects.rm) {
            projects.rm(filename);
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── PROJECT INFO ────────────────────────────────────────────
    function projectInfo() {
        if (typeof projects !== 'undefined' && projects.info) {
            projects.info();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── REGISTRY FETCH ──────────────────────────────────────────
    async function fetchRegistry() {
        const REGISTRY_URL = 'https://raw.githubusercontent.com/justdev-chris/lynx-registry/main/packages.json';
        try {
            const resp = await fetch(REGISTRY_URL);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            terminal.print(`Failed to fetch registry: ${e.message}`, 'error');
            return null;
        }
    }

    // ─── LIST REGISTRY ──────────────────────────────────────────
    async function listRegistry(page) {
        if (page !== undefined) registryPage = page;

        const registry = await fetchRegistry();
        if (!registry) return;

        const packages = registry.packages || {};
        registryCache = Object.entries(packages).map(([name, data]) => ({
            name,
            description: data.description || '',
            version: data.latest || data.versions?.[0] || '0.1.0'
        }));

        const total = registryCache.length;
        const start = registryPage * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, total);
        const pageData = registryCache.slice(start, end);

        if (pageData.length === 0) {
            terminal.print('No more packages.', 'info');
            return;
        }

        terminal.print(`📦 Registry packages (${start + 1}-${end} of ${total}):`, 'info');
        pageData.forEach(pkg => {
            terminal.print(`  ${pkg.name} (${pkg.version}) — ${pkg.description || 'No description'}`, 'output');
        });

        const hasNext = end < total;
        const hasPrev = registryPage > 0;
        let nav = '';
        if (hasPrev) nav += ' [prev]';
        if (hasNext) nav += ' [next]';
        terminal.print(`--- Page ${registryPage + 1} of ${Math.ceil(total / PAGE_SIZE)}${nav}`, 'info');
        terminal.print('Type "lynx next" or "lynx prev" to navigate.', 'info');
    }

    // ─── NEXT ──────────────────────────────────────────────────
    function nextPage() {
        registryPage++;
        listRegistry();
    }

    // ─── PREV ──────────────────────────────────────────────────
    function prevPage() {
        if (registryPage > 0) {
            registryPage--;
            listRegistry();
        } else {
            terminal.print('Already on first page.', 'info');
        }
    }

    // ─── ADD ──────────────────────────────────────────────────────
    function addPackage(pkg) {
        if (!pkg) {
            terminal.print('Usage: lynx add <package>', 'error');
            return;
        }
        if (typeof packages !== 'undefined' && packages.add) {
            packages.add(pkg);
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── INSTALL ──────────────────────────────────────────────────
    function installPackages() {
        if (typeof packages !== 'undefined' && packages.install) {
            packages.install();
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── REMOVE ──────────────────────────────────────────────────
    function removePackage(pkg) {
        if (!pkg) {
            terminal.print('Usage: lynx remove <package>', 'error');
            return;
        }
        if (typeof packages !== 'undefined' && packages.remove) {
            packages.remove(pkg);
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── LIST PACKAGES ────────────────────────────────────────────
    function listPackages() {
        if (typeof packages !== 'undefined' && packages.list) {
            packages.list();
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── BUILD ────────────────────────────────────────────────────
    function buildProject() {
        if (typeof projects !== 'undefined' && projects.build) {
            projects.build();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── RUN ──────────────────────────────────────────────────────
    function runFile(filename) {
        if (!filename) {
            terminal.print('Usage: lynx run <file.lnx>', 'error');
            return;
        }
        if (typeof projects !== 'undefined' && projects.run) {
            projects.run(filename);
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── PUBLISH ──────────────────────────────────────────────────
    function publishProject() {
        if (typeof projects !== 'undefined' && projects.publish) {
            projects.publish();
        } else {
            terminal.print('Project manager not loaded.', 'error');
        }
    }

    // ─── UPDATE ──────────────────────────────────────────────────
    function updatePackages() {
        if (typeof packages !== 'undefined' && packages.update) {
            packages.update();
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── SEARCH ──────────────────────────────────────────────────
    function searchRegistry(term) {
        if (!term) {
            terminal.print('Usage: lynx search <term>', 'error');
            return;
        }
        if (typeof packages !== 'undefined' && packages.search) {
            packages.search(term);
        } else {
            terminal.print('Package manager not loaded.', 'error');
        }
    }

    // ─── COMMAND MAP ──────────────────────────────────────────────
    window.lynxCommands = {
        'help': showHelp,
        'version': showVersion,
        'clear': clearTerminal,

        'init': initProject,
        'list': function(args) {
            if (args === 'pkgs') {
                listPackages();
            } else if (args === 'registry') {
                registryPage = 0;
                listRegistry();
            } else if (args && args.startsWith('registry page ')) {
                const page = parseInt(args.split(' ')[2]) - 1;
                if (!isNaN(page) && page >= 0) {
                    registryPage = page;
                    listRegistry();
                } else {
                    terminal.print('Usage: lynx list registry page <number>', 'error');
                }
            } else if (args && args !== 'pkgs' && args !== 'registry') {
                // If it's not a known subcommand, treat it as a project name? No, just list projects.
                listProjects();
            } else {
                listProjects();
            }
        },
        'open': openProject,
        'save': saveProject,
        'files': listFiles,
        'cat': catFile,
        'rm': rmFile,
        'project': function(args) {
            if (args === 'info') {
                projectInfo();
            } else {
                terminal.print('Usage: lynx project info', 'error');
            }
        },

        'add': addPackage,
        'install': installPackages,
        'remove': removePackage,

        'build': buildProject,
        'run': runFile,
        'publish': publishProject,
        'update': updatePackages,
        'search': searchRegistry,

        'next': nextPage,
        'prev': prevPage
    };
})();
