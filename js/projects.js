// js/projects.js – Project management with localStorage

(function() {
    const STORAGE_KEY = 'lynx_projects';
    const ACTIVE_KEY = 'lynx_active';

    // ─── HELPERS ──────────────────────────────────────────────────
    function getProjects() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveProjects(projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }

    function getActive() {
        return localStorage.getItem(ACTIVE_KEY) || null;
    }

    function setActive(name) {
        if (name) {
            localStorage.setItem(ACTIVE_KEY, name);
        } else {
            localStorage.removeItem(ACTIVE_KEY);
        }
    }

    function getProject(name) {
        const projects = getProjects();
        return projects.find(p => p.name === name) || null;
    }

    // ─── INIT ──────────────────────────────────────────────────────
    function createProject(name) {
        if (!name) {
            terminal.print('Usage: lynx init <name>', 'error');
            return;
        }

        const projects = getProjects();
        if (projects.find(p => p.name === name)) {
            terminal.print(`Project "${name}" already exists.`, 'error');
            return;
        }

        const project = {
            name: name,
            created: new Date().toISOString(),
            files: {
                'lynx.toml': `[package]\nname = "${name}"\nversion = "0.1.0"\nauthors = ["You"]\ndescription = "A Lynx project"\n\n[dependencies]\n`,
                'src/main.lnx': `Roar "Hello from Lynx!"\n`
            }
        };

        projects.push(project);
        saveProjects(projects);
        setActive(name);
        terminal.print(`✅ Project "${name}" created and opened.`, 'success');
        terminal.print('📁 Files: lynx.toml, src/main.lnx', 'info');
    }

    // ─── LIST ──────────────────────────────────────────────────────
    function listProjects() {
        const projects = getProjects();
        if (projects.length === 0) {
            terminal.print('No projects found. Create one with: lynx init <name>', 'info');
            return;
        }

        const active = getActive();
        terminal.print('📁 Projects:', 'info');
        projects.forEach(p => {
            const marker = p.name === active ? '▶ ' : '  ';
            terminal.print(`  ${marker}${p.name} (${p.files ? Object.keys(p.files).length : 0} files)`, 'output');
        });
    }

    // ─── OPEN ──────────────────────────────────────────────────────
    function openProject(name) {
        if (!name) {
            terminal.print('Usage: lynx open <name>', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        setActive(name);
        terminal.print(`📂 Opened project "${name}"`, 'success');
        terminal.print(`Files: ${Object.keys(project.files).join(', ')}`, 'info');
    }

    // ─── SAVE ──────────────────────────────────────────────────────
    function saveProject(content) {
        const name = getActive();
        if (!name) {
            terminal.print('No project open. Create one with: lynx init <name>', 'error');
            return;
        }

        const projects = getProjects();
        const project = projects.find(p => p.name === name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        if (content) {
            project.files['src/main.lnx'] = content;
            saveProjects(projects);
            terminal.print('✅ Saved src/main.lnx', 'success');
            return;
        }

        terminal.print('⚠️ No content provided. Use: lynx save "content" or save via terminal', 'warning');
    }

    // ─── FILES ──────────────────────────────────────────────────────
    function listFiles() {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        const files = Object.keys(project.files);
        if (files.length === 0) {
            terminal.print('No files in this project.', 'info');
            return;
        }

        terminal.print(`📁 Files in "${name}":`, 'info');
        files.forEach(f => terminal.print(`  - ${f}`, 'output'));
    }

    // ─── CAT ──────────────────────────────────────────────────────
    function catFile(filename) {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        if (!project.files[filename]) {
            terminal.print(`File "${filename}" not found.`, 'error');
            return;
        }

        terminal.print(`📄 ${filename}:`, 'info');
        terminal.print(project.files[filename], 'output');
    }

    // ─── RM ──────────────────────────────────────────────────────
    function rmFile(filename) {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        if (filename === 'lynx.toml' || filename === 'src/main.lnx') {
            terminal.print(`⚠️ Cannot delete required file: ${filename}`, 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        if (!project.files[filename]) {
            terminal.print(`File "${filename}" not found.`, 'error');
            return;
        }

        delete project.files[filename];
        saveProjects(getProjects());
        terminal.print(`🗑️ Deleted "${filename}"`, 'success');
    }

    // ─── PROJECT INFO ──────────────────────────────────────────────
    function projectInfo() {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        terminal.print(`📦 Project: ${name}`, 'info');
        terminal.print(`  Created: ${project.created}`, 'output');
        terminal.print(`  Files: ${Object.keys(project.files).length}`, 'output');
        terminal.print(`  lynx.toml: ${project.files['lynx.toml'] ? '✅' : '❌'}`, 'output');
        terminal.print(`  src/main.lnx: ${project.files['src/main.lnx'] ? '✅' : '❌'}`, 'output');
    }

    // ─── BUILD ──────────────────────────────────────────────────────
    function buildProject() {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        const main = project.files['src/main.lnx'];
        if (!main) {
            terminal.print('No src/main.lnx found. Create it first.', 'error');
            return;
        }

        terminal.print(`🐱 Building "${name}"...`, 'info');
        terminal.print('---', 'output');
        try {
            if (typeof lynx !== 'undefined' && lynx.run) {
                lynx.run(main);
            } else {
                terminal.print('Lynx interpreter not loaded.', 'error');
            }
        } catch (e) {
            terminal.print(`Error: ${e.message || e}`, 'error');
        }
        terminal.print('---', 'output');
        terminal.print('✅ Build complete.', 'success');
    }

    // ─── RUN ──────────────────────────────────────────────────────
    function runFile(filename) {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        const code = project.files[filename];
        if (!code) {
            terminal.print(`File "${filename}" not found.`, 'error');
            return;
        }

        terminal.print(`🐱 Running "${filename}"...`, 'info');
        terminal.print('---', 'output');
        try {
            if (typeof lynx !== 'undefined' && lynx.run) {
                lynx.run(code);
            } else {
                terminal.print('Lynx interpreter not loaded.', 'error');
            }
        } catch (e) {
            terminal.print(`Error: ${e.message || e}`, 'error');
        }
        terminal.print('---', 'output');
        terminal.print('✅ Done.', 'success');
    }

    // ─── PUBLISH ──────────────────────────────────────────────────
    function publishProject() {
        const name = getActive();
        if (!name) {
            terminal.print('No project open.', 'error');
            return;
        }

        const project = getProject(name);
        if (!project) {
            terminal.print(`Project "${name}" not found.`, 'error');
            return;
        }

        const files = project.files;
        const tar = new Tar();

        for (const [path, content] of Object.entries(files)) {
            tar.append(path, content);
        }

        const tarBytes = tar.out;
        const gzipped = pako.gzip(tarBytes);
        const blob = new Blob([gzipped], { type: 'application/gzip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}.tar.gz`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        terminal.print(`📦 Published "${name}" as ${name.replace(/\s+/g, '_')}.tar.gz`, 'success');
    }

    // ─── EXPOSE ──────────────────────────────────────────────────
    window.projects = {
        create: createProject,
        list: listProjects,
        open: openProject,
        save: saveProject,
        files: listFiles,
        cat: catFile,
        rm: rmFile,
        info: projectInfo,
        build: buildProject,
        run: runFile,
        publish: publishProject,
        getActive: getActive,
        getProject: getProject
    };
})();
