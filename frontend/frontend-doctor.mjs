#!/usr/bin/env node
// Frontend Doctor (ESM) — fixes Vite+React config, normalizes lucide-react imports, dedupes React imports,
// sets @ alias, creates a single icons barrel, and optionally reinstalls deps & runs dev server.
//
// Run: node frontend-doctor.mjs --apply --reinstall --run-dev

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

/* -------------------------- tiny utils -------------------------- */
const log = (...a) => console.log('🌟', ...a);
const warn = (...a) => console.warn('⚠️ ', ...a);
const fail = (...a) => { console.error('❌', ...a); process.exit(1); };
const cwd = process.cwd();
const isWin = process.platform === 'win32';

function readJson(p, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function hasFile(...rel) { return fs.existsSync(path.join(cwd, ...rel)); }
function readText(...rel) { return fs.readFileSync(path.join(cwd, ...rel), 'utf8'); }
function writeText(relPath, text) { ensureDir(path.dirname(path.join(cwd, relPath))); fs.writeFileSync(path.join(cwd, relPath), text, 'utf8'); }
function listSourceFiles() {
  const out = [];
  function walk(dir) {
    const ents = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        // Skip obvious build/vendor dirs
        if (/(^|\\|\/)(dist|build|.next|out|coverage|node_modules|.git)(\\|\/|$)/i.test(p)) continue;
        walk(p);
      } else if (/\.(jsx?|tsx?)$/i.test(e.name)) {
        out.push(p);
      }
    }
  }
  if (hasFile('src')) walk(path.join(cwd, 'src'));
  return out;
}
function backupFile(absPath, backupRoot) {
  const rel = path.relative(cwd, absPath);
  const dest = path.join(backupRoot, rel);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(absPath, dest);
}

/* -------------------------- flags -------------------------- */
const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply') || args.has('-a');
const REINSTALL = args.has('--reinstall') || args.has('-R');
const RUN_DEV = args.has('--run-dev') || args.has('-D');

/* -------------------- preflight checks --------------------- */
if (!hasFile('package.json')) fail('Run this inside your FRONTEND folder (where package.json lives).');
if (!hasFile('src')) fail('No src/ folder found in this directory.');
const pkgPath = path.join(cwd, 'package.json');
const pkg = readJson(pkgPath, {});
const isESM = pkg.type === 'module';

log('Project root:', cwd);
log('ESM mode:', isESM ? 'yes ("type":"module")' : 'no');

/* -------------------------- plan --------------------------- */
const backupRoot = path.join(cwd, 'frontend-doctor-backup-' + new Date().toISOString().replace(/[:.]/g, '-'));
if (APPLY) ensureDir(backupRoot);

/* ------------------ step 1: ensure deps -------------------- */
function ensureDeps() {
  const wantDeps = [
    'react', 'react-dom', 'lucide-react',
    'class-variance-authority', 'clsx', 'tailwind-merge', 'date-fns'
  ];
  const wantDev = ['vite', '@vitejs/plugin-react'];

  const missing = [];
  const missingDev = [];

  const allDeps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
  for (const d of wantDeps) if (!allDeps[d]) missing.push(d);
  for (const d of wantDev) if (!allDeps[d]) missingDev.push(d);

  if (missing.length || missingDev.length) {
    log('Installing deps…');
    if (missing.length) execSync(`npm i ${missing.join(' ')}`, { stdio: 'inherit' });
    if (missingDev.length) execSync(`npm i -D ${missingDev.join(' ')}`, { stdio: 'inherit' });
    log('Dependencies ensured.');
  } else {
    log('Dependencies already present.');
  }

  // scripts
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.dev = pkg.scripts.dev || 'vite';
  pkg.scripts.build = pkg.scripts.build || 'vite build';
  pkg.scripts.preview = pkg.scripts.preview || 'vite preview';
  writeJson(pkgPath, pkg);
}

/* -------- step 2: vite + jsconfig/tsconfig with @ alias ----- */
function ensureViteAndAlias() {
  // Prefer vite.config.mjs in ESM projects; otherwise vite.config.js
  const viteMjs = 'vite.config.mjs';
  const viteJs = 'vite.config.js';
  const vitePath = hasFile(viteMjs) ? viteMjs : (hasFile(viteJs) ? viteJs : viteMjs);

  let viteBody = '';
  if (hasFile(vitePath)) viteBody = readText(vitePath);

  const want = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
  server: { port: 5173, strictPort: false }
});
`;

  if (!hasFile(vitePath) || !/@vitejs\/plugin-react/.test(viteBody) || !/alias:\s*\{[^}]*@/.test(viteBody)) {
    writeText(vitePath, want);
    log('Wrote', vitePath);
  } else {
    log('Vite config already OK ->', vitePath);
  }

  // jsconfig or tsconfig for editor/IDE paths + JSX runtime
  const tsPath = hasFile('tsconfig.json') ? 'tsconfig.json' : null;
  const jsPath = hasFile('jsconfig.json') ? 'jsconfig.json' : null;
  const confPath = tsPath || jsPath || 'jsconfig.json';
  const conf = readJson(confPath, {});
  conf.compilerOptions = conf.compilerOptions || {};
  conf.compilerOptions.baseUrl = conf.compilerOptions.baseUrl || '.';
  conf.compilerOptions.paths = conf.compilerOptions.paths || {};
  conf.compilerOptions.paths['@/*'] = ['src/*'];
  conf.compilerOptions.jsx = conf.compilerOptions.jsx || 'react-jsx';
  conf.include = conf.include || ['src'];
  writeJson(confPath, conf);
  log('Paths configured in', confPath);
}

/* ------- step 3: icons barrel with only …Icon exports ------- */
function ensureIconsBarrel() {
  const barrel = `/**
 * Central Lucide export: import all icons as …Icon to avoid collisions.
 * Usage: import { UserIcon, StarIcon } from "@/lib/icons";
 */
export {
  User as UserIcon,
  Review as ReviewIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
  MapPin as MapPinIcon,
  DollarSign as DollarSignIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Bell as BellIcon,
  Search as SearchIcon,
  Heart as HeartIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Upload as UploadIcon,
  Download as DownloadIcon
} from "lucide-react";
`;
  // Use JS to avoid requiring TypeScript
  writeText('src/lib/icons.js', barrel);
  log('Wrote src/lib/icons.js');
}

/* ---- step 4: rewrite source files to use the barrel -------- */
const ICON_POOL = [
  'User','Review','Calendar','Settings','Star','Shield','MapPin','DollarSign','CheckCircle','TrendingUp',
  'Bell','Search','Heart','X','Plus','Minus','Edit','Trash','Upload','Download'
];

function uniq(arr) { return Array.from(new Set(arr)); }

function detectUsedIcons(code) {
  const used = new Set();
  for (const n of ICON_POOL) {
    const open = new RegExp(`<\\s*${n}(\\b|[\\s>/])`);
    const close = new RegExp(`</\\s*${n}\\s*>`);
    const openIcon = new RegExp(`<\\s*${n}Icon(\\b|[\\s>/])`);
    const closeIcon = new RegExp(`</\\s*${n}Icon\\s*>`);
    if (open.test(code) || close.test(code) || openIcon.test(code) || closeIcon.test(code)) {
      used.add(n);
    }
  }
  return Array.from(used);
}

function normalizeLucideImports() {
  const files = listSourceFiles();
  const rxLucide = /(^\s*import\s*\{[\s\S]*?\}\s*from\s*['"]lucide-react['"]\s*;?\s*$)/gm;
  const rxReactStar = /^\s*import\s+\*\s+as\s+React\s+from\s+['"]react['"]\s*;?\s*$/m;
  const rxReactDefault = /^\s*import\s+React\s+from\s+['"]react['"]\s*;?\s*$/m;

  let changedCount = 0;

  for (const abs of files) {
    const rel = path.relative(cwd, abs);
    let code = fs.readFileSync(abs, 'utf8');
    let changed = false;

    // remove duplicate default React when namespace React exists
    if (rxReactStar.test(code) && rxReactDefault.test(code)) {
      code = code.replace(rxReactDefault, '');
      changed = true;
    }

    // collect icons from existing lucide imports BEFORE removing them
    const importIcons = [];
    code.replace(rxLucide, (full) => {
      const m = full.match(/\{([\s\S]*?)\}/);
      if (m) {
        const inside = m[1];
        inside.split(',').forEach(tok => {
          const t = tok.trim();
          if (!t) return;
          const mm = t.match(/^([A-Za-z_]\w*)(?:\s+as\s+[A-Za-z_]\w*)?$/);
          if (mm) importIcons.push(mm[1]);
        });
      }
      return full;
    });

    // remove all lucide-react imports
    if (rxLucide.test(code)) {
      code = code.replace(rxLucide, '');
      changed = true;
    }

    // detect icons from JSX usage too
    const jsxIcons = detectUsedIcons(code);

    // union set
    let used = uniq([...importIcons, ...jsxIcons]);

    // if none detected but file used to import lucide, seed with a common set
    if (used.length === 0 && importIcons.length > 0) {
      used = ['User','Star','MapPin','CheckCircle','TrendingUp'];
    }

    if (used.length > 0) {
      // Rewrite JSX <Name> -> <NameIcon>, </Name> -> </NameIcon>
      for (const n of used) {
        const open = new RegExp(`<\\s*${n}(\\b|[\\s>/])`, 'g');
        const close = new RegExp(`</\\s*${n}\\s*>`, 'g');
        code = code.replace(open, `<${n}Icon$1`);
        code = code.replace(close, `</${n}Icon>`);
      }

      // Compose a single barrel import
      const spec = used.sort().map(n => `${n} as ${n}Icon`).join(', ');
      const importLine = `import { ${spec} } from '@/lib/icons.js';\n`;

      // insert after "use client" pragma if present, else at top (before other code)
      const uc = code.match(/^(\s*['"]use client['"];\s*\r?\n)/);
      if (uc) code = uc[1] + importLine + code.slice(uc[1].length);
      else code = importLine + code;

      changed = true;
    }

    if (changed) {
      if (APPLY) {
        backupFile(abs, backupRoot);
        fs.writeFileSync(abs, code, 'utf8');
      }
      changedCount++;
      log('Fixed', rel);
    }
  }

  if (changedCount === 0) warn('No lucide/react issues detected in src/. If errors persist, share the exact file/lines.');
}

/* --------- step 5: reinstall (optional) & run dev ---------- */
function reinstall() {
  if (!REINSTALL) return;
  log('Reinstalling dependencies (clean)…');
  if (fs.existsSync(path.join(cwd, 'node_modules'))) {
    try { fs.rmSync(path.join(cwd, 'node_modules'), { recursive: true, force: true }); } catch {}
  }
  if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
    try { fs.rmSync(path.join(cwd, 'package-lock.json'), { force: true }); } catch {}
  }
  execSync('npm install', { stdio: 'inherit' });
  log('Install complete.');
}

function runDev() {
  if (!RUN_DEV) return;
  log('Starting Vite dev server… (Ctrl+C to stop)');
  // Use npm to ensure local binaries & scripts
  if (isWin) {
    execSync('npm run dev', { stdio: 'inherit', shell: 'cmd.exe' });
  } else {
    execSync('npm run dev', { stdio: 'inherit' });
  }
}

/* --------------------------- go ---------------------------- */
try {
  ensureDeps();
  ensureViteAndAlias();
  ensureIconsBarrel();
  normalizeLucideImports();

  if (APPLY) log('Backups saved at:', backupRoot);

  reinstall();
  runDev();

  log('Frontend Doctor finished.');
} catch (e) {
  fail(e && e.stack ? e.stack : String(e));
}
