import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
    }
  });
  return filelist;
};

const files = walkSync('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // We want to replace accent with primary for non-CTAs.
  // Let's do some specific replacements first.
  
  // Text colors
  content = content.replace(/text-accent-light/g, 'text-white/90');
  content = content.replace(/text-accent-darkest/g, 'text-primary');
  content = content.replace(/text-accent-darker/g, 'text-primary');
  content = content.replace(/text-accent-dark/g, 'text-primary');
  content = content.replace(/text-accent(?!\/)/g, 'text-primary'); // text-accent but not text-accent/something
  content = content.replace(/text-accent\/([0-9]+)/g, 'text-primary/$1');
  
  // Background colors (non-CTA)
  content = content.replace(/bg-accent\/([0-9]+)/g, 'bg-primary/$1');
  
  // Border colors
  content = content.replace(/border-accent\/([0-9]+)/g, 'border-primary/$1');
  content = content.replace(/border-accent(?!\-)/g, 'border-primary'); // border-accent but not border-accent-dark
  
  // Ring colors
  content = content.replace(/ring-accent\/([0-9]+)/g, 'ring-primary/$1');
  content = content.replace(/ring-accent(?!\-)/g, 'ring-primary');
  
  // Shadow colors
  content = content.replace(/shadow-accent\/([0-9]+)/g, 'shadow-primary/$1');
  
  // Selection
  content = content.replace(/selection:bg-accent\/([0-9]+)/g, 'selection:bg-primary/$1');
  
  // Gradients
  content = content.replace(/to-accent/g, 'to-primary');
  
  // Fill/Stroke
  content = content.replace(/fill-accent/g, 'fill-primary');
  content = content.replace(/stroke-accent/g, 'stroke-primary');
  
  // Hex colors in JS (like Recharts or Leaflet)
  content = content.replace(/'#FF7500'/g, "isTargetFootprint ? '#FF7500' : '#082E29'"); // Wait, this might break things. Let's be careful.
  
  fs.writeFileSync(file, content);
});

console.log('Done replacing non-CTA accents.');
