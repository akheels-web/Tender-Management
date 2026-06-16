import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

const replacements = [
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-slate-200/g, replacement: 'text-slate-800' },
  { regex: /text-slate-300/g, replacement: 'text-slate-700' },
  { regex: /text-slate-400/g, replacement: 'text-slate-600' },
  { regex: /bg-slate-900\/50/g, replacement: 'bg-white' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800\/50/g, replacement: 'bg-slate-50' },
  { regex: /bg-slate-800/g, replacement: 'bg-slate-50' },
  { regex: /bg-slate-700/g, replacement: 'bg-slate-100' },
  { regex: /bg-\[\#0A1628\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[\#0E1925\]/g, replacement: 'bg-white' },
  { regex: /border-white\/5/g, replacement: 'border-slate-200' },
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /border-slate-700/g, replacement: 'border-slate-200' },
  { regex: /border-slate-800/g, replacement: 'border-slate-200' },
  { regex: /bg-white\/5/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/10/g, replacement: 'bg-slate-100' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-slate-100' },
  { regex: /ring-white\/10/g, replacement: 'ring-slate-200' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Do not touch Login.tsx or Sidebar.tsx or TopBar.tsx if they are already customized for light mode and special text
      if (file === 'Login.tsx' || file === 'Sidebar.tsx' || file === 'TopBar.tsx') {
        continue; // We already styled these manually!
      }
      
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Finished replacing dark mode classes.');
