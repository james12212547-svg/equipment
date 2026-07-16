const fs = require('fs');
const files = [
  'CableSizing.jsx', 
  'LightingCalculator.jsx', 
  'LoadSchedule.jsx', 
  'MotorCalculator.jsx', 
  'PfcCalculator.jsx', 
  'VoltageDrop.jsx'
];

files.forEach(file => {
  const path = 'src/pages/' + file;
  if (!fs.existsSync(path)) return;
  
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(
    /<div style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*.*?\s*\}\}>/g, 
    match => match.replace('<div ', '<div className="print-block" ')
  );
  
  fs.writeFileSync(path, content);
  console.log('Patched grid for', path);
});
