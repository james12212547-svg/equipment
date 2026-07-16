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
  
  // Add no-print to main header
  content = content.replace(
    /<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'1rem',\s*marginBottom:\s*'2rem'\s*\}\}>/g, 
    '<div className="no-print" style={{ display: \'flex\', alignItems: \'center\', gap: \'1rem\', marginBottom: \'2rem\' }}>'
  );
  
  // Add print-block to grid container
  content = content.replace(
    /<div style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\\(auto-fit,\s*minmax\\(320px,\s*1fr\\)\\)',\s*gap:\s*'2rem'\s*\}\}>/g, 
    '<div className="print-block" style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(320px, 1fr))\', gap: \'2rem\' }}>'
  );
  
  fs.writeFileSync(path, content);
  console.log('Patched', path);
});
