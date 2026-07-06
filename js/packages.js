// js/packages.js – Package management for Lynx Web Terminal

(function() {
    // ─── STORAGE ──────────────────────────────────────────────────
    const PKG_STORAGE_KEY = 'lynx_installed_packages';

    function getInstalledPackages() {
        try {
            return JSON.parse(localStorage.getItem(PKG_STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveInstalledPackages(packages) {
        localStorage.setItem(PKG_STORAGE_KEY, JSON.stringify(packages));
    }

    // ─── REGISTRY ──────────────────────────────────────────────────
    const REGISTRY_URL = 'https://raw.githubusercontent.com/justdev-chris/lynx-registry/main/packages.json';

    async function fetchRegistry() {
        try {
            const resp = await fetch(REGISTRY_URL);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            terminal.print(`Failed to fetch registry: ${e.message}`, 'error');
            return null;
        }
    }

    // ─── ADD ──────────────────────────────────────────────────────
    async function addPackage(pkg) {
        if (!pkg) {
            terminal.print('Usage: lynx add <package>', 'error');
            return;
        }

        const registry = await fetchRegistry();
        if (!registry) return;

        const pkgData = registry.packages && registry.packages[pkg];
        if (!pkgData) {
            terminal.print(`Package "${pkg}" not found in registry.`, 'error');
            return;
        }

        const installed = getInstalledPackages();
        if (installed[pkg]) {
            terminal.print(`Package "${pkg}" already installed (${installed[pkg]}).`, 'warning');
            return;
        }

        const version = pkgData.latest || pkgData.versions?.[0] || '0.1.0';
        installed[pkg] = version;
        saveInstalledPackages(installed);

        terminal.print(`✅ Added "${pkg}" (${version})`, 'success');
        terminal.print('Run "lynx install" to download and install it.', 'info');
    }

    // ─── INSTALL ──────────────────────────────────────────────────
    async function installPackages() {
        const installed = getInstalledPackages();
        const names = Object.keys(installed);

        if (names.length === 0) {
            terminal.print('No packages to install. Add one with: lynx add <package>', 'info');
            return;
        }

        const registry = await fetchRegistry();
        if (!registry) return;

        terminal.print(`📦 Installing ${names.length} package(s)...`, 'info');

        const projectName = projects.getActive() || 'default';
        const project = projects.getProject(projectName);

        for (const name of names) {
            const version = installed[name];
            const pkgData = registry.packages && registry.packages[name];
            if (!pkgData) {
                terminal.print(`⚠️ Package "${name}" not found in registry.`, 'warning');
                continue;
            }

            const url = `https://raw.githubusercontent.com/justdev-chris/lynx-registry/main/packages/${name}/${version}/package.tar.gz`;
            terminal.print(`  ⬇️ Fetching ${name} (${version})...`, 'info');

            try {
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                // For now, we just simulate installation
                // In a real implementation, we'd extract the tarball
                terminal.print(`  ✅ Installed ${name} (${version})`, 'success');

                // If project exists, add to its libs/ folder
                if (project) {
                    if (!project.files[`libs/${name}/main.lnx`]) {
                        project.files[`libs/${name}/main.lnx`] = `# ${name} package\nRoar "Loaded ${name}"\n`;
                        // Save project
                        const projects = JSON.parse(localStorage.getItem('lynx_projects') || '[]');
                        const idx = projects.findIndex(p => p.name === projectName);
                        if (idx !== -1) {
                            projects[idx] = project;
                            localStorage.setItem('lynx_projects', JSON.stringify(projects));
                        }
                    }
                }

            } catch (e) {
                terminal.print(`  ❌ Failed to install ${name}: ${e.message}`, 'error');
            }
        }

        terminal.print('✅ Installation complete.', 'success');
    }

    // ─── REMOVE ──────────────────────────────────────────────────
    function removePackage(pkg) {
        if (!pkg) {
            terminal.print('Usage: lynx remove <package>', 'error');
            return;
        }

        const installed = getInstalledPackages();
        if (!installed[pkg]) {
            terminal.print(`Package "${pkg}" is not installed.`, 'warning');
            return;
        }

        delete installed[pkg];
        saveInstalledPackages(installed);

        // Also remove from project libs/ if present
        const projectName = projects.getActive();
        if (projectName) {
            const project = projects.getProject(projectName);
            if (project && project.files) {
                const libPath = `libs/${pkg}/main.lnx`;
                if (project.files[libPath]) {
                    delete project.files[libPath];
                    const allProjects = JSON.parse(localStorage.getItem('lynx_projects') || '[]');
                    const idx = allProjects.findIndex(p => p.name === projectName);
                    if (idx !== -1) {
                        allProjects[idx] = project;
                        localStorage.setItem('lynx_projects', JSON.stringify(allProjects));
                    }
                }
            }
        }

        terminal.print(`🗑️ Removed "${pkg}"`, 'success');
    }

    // ─── LIST ──────────────────────────────────────────────────
    function listPackages() {
        const installed = getInstalledPackages();
        const names = Object.keys(installed);

        if (names.length === 0) {
            terminal.print('No packages installed.', 'info');
            return;
        }

        terminal.print(`📦 Installed packages (${names.length}):`, 'info');
        names.forEach(name => {
            terminal.print(`  ${name} (${installed[name]})`, 'output');
        });
    }

    // ─── UPDATE ──────────────────────────────────────────────────
    async function updatePackages() {
        const installed = getInstalledPackages();
        const names = Object.keys(installed);

        if (names.length === 0) {
            terminal.print('No packages to update.', 'info');
            return;
        }

        const registry = await fetchRegistry();
        if (!registry) return;

        terminal.print(`🔄 Checking for updates...`, 'info');

        let updated = 0;
        for (const name of names) {
            const currentVersion = installed[name];
            const pkgData = registry.packages && registry.packages[name];
            if (!pkgData) continue;

            const latest = pkgData.latest || pkgData.versions?.[0] || currentVersion;
            if (latest !== currentVersion) {
                installed[name] = latest;
                updated++;
                terminal.print(`  ⬆️ ${name}: ${currentVersion} → ${latest}`, 'info');
            }
        }

        if (updated > 0) {
            saveInstalledPackages(installed);
            terminal.print(`✅ Updated ${updated} package(s).`, 'success');
        } else {
            terminal.print('✅ All packages are up to date.', 'success');
        }
    }

    // ─── SEARCH ──────────────────────────────────────────────────
    async function searchRegistry(term) {
        if (!term) {
            terminal.print('Usage: lynx search <term>', 'error');
            return;
        }

        const registry = await fetchRegistry();
        if (!registry) return;

        const results = [];
        const packages = registry.packages || {};
        for (const [name, data] of Object.entries(packages)) {
            if (name.toLowerCase().includes(term.toLowerCase()) ||
                (data.description && data.description.toLowerCase().includes(term.toLowerCase()))) {
                results.push({ name, description: data.description || '', version: data.latest || '0.1.0' });
            }
        }

        if (results.length === 0) {
            terminal.print(`No packages found matching "${term}"`, 'info');
            return;
        }

        terminal.print(`🔍 Found ${results.length} package(s):`, 'info');
        results.forEach(pkg => {
            terminal.print(`  ${pkg.name} (${pkg.version}) — ${pkg.description || 'No description'}`, 'output');
        });
    }

    // ─── EXPOSE ──────────────────────────────────────────────────
    window.packages = {
        add: addPackage,
        install: installPackages,
        remove: removePackage,
        list: listPackages,
        update: updatePackages,
        search: searchRegistry
    };
})();
