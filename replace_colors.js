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
  
  // Colors
  content = content.replace(/#1d1d1f/g, 'primary');
  content = content.replace(/#f5f5f7/g, 'bg');
  
  // Emerald
  content = content.replace(/emerald-500/g, 'accent');
  content = content.replace(/emerald-600/g, 'accent-dark');
  content = content.replace(/emerald-400/g, 'accent-light');
  content = content.replace(/emerald-700/g, 'accent-darker');
  content = content.replace(/emerald-800/g, 'accent-darkest');
  content = content.replace(/emerald-50/g, 'accent/10');
  content = content.replace(/emerald-100/g, 'accent/20');
  content = content.replace(/emerald-900/g, 'accent-darkest');
  
  // Fix classes that might have become `bg-primary` instead of `bg-[#1d1d1f]`
  // Wait, the original was `bg-[#1d1d1f]`. If I replace `#1d1d1f` with `primary`, it becomes `bg-[primary]`.
  // Let's fix that.
  content = content.replace(/\[primary\]/g, 'primary');
  content = content.replace(/\[bg\]/g, 'bg');
  
  fs.writeFileSync(file, content);
});

console.log('Done replacing colors.');
