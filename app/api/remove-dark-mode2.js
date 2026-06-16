import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

const replacements = [
  // Backgrounds
  { regex: /bg-\[\#111C2E\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#0A1628\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[\#0E1925\]/g, replacement: 'bg-white' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-slate-50' },
  { regex: /bg-slate-700/g, replacement: 'bg-slate-100' },
  
  // Borders
  { regex: /border-white\/\[0\.06\]/g, replacement: 'border-slate-200' },
  { regex: /border-white\/5/g, replacement: 'border-slate-200' },
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /border-white\/20/g, replacement: 'border-slate-200' },
  { regex: /border-slate-700/g, replacement: 'border-slate-200' },
  { regex: /border-slate-800/g, replacement: 'border-slate-200' },
  { regex: /border-slate-600/g, replacement: 'border-slate-200' },
  
  // Text
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-slate-200/g, replacement: 'text-slate-800' },
  { regex: /text-slate-300/g, replacement: 'text-slate-700' },
  { regex: /text-slate-400/g, replacement: 'text-slate-600' },
  
  // Hovers
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-slate-100' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-slate-100' },
  { regex: /hover:border-cyan-500\/20/g, replacement: 'hover:border-cyan-500/50 hover:shadow-md' },
  { regex: /hover:border-yellow-500\/20/g, replacement: 'hover:border-yellow-500/50 hover:shadow-md' },
  { regex: /hover:border-slate-200/g, replacement: 'hover:border-slate-300 hover:shadow-md' },
  
  // Other effects
  { regex: /ring-white\/10/g, replacement: 'ring-slate-200' },
  { regex: /shadow-md/g, replacement: 'shadow-sm' }, // lighten shadows
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      if (file === 'Login.tsx' || file === 'Sidebar.tsx' || file === 'TopBar.tsx') {
        // Keep our custom colors for these, but replace border-white/[0.06] and bg-[#111C2E] if they snuck in
        let localMod = false;
        let modifiedContent = content.replace(/bg-\[\#111C2E\]/g, 'bg-white').replace(/border-white\/\[0\.06\]/g, 'border-slate-200');
        if (content !== modifiedContent) {
           fs.writeFileSync(fullPath, modifiedContent, 'utf-8');
           console.log(`Updated ${fullPath}`);
        }
        continue;
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
console.log('Finished replacing aggressive dark mode classes.');
