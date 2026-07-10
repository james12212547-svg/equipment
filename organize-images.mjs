import fs from 'fs';
import path from 'path';

const publicDir = './public/images';
const acDir = path.join(publicDir, 'ac');
const solarDir = path.join(publicDir, 'solar');
const equipmentFile = './src/data/equipment.js';

// Create directories if they don't exist
if (!fs.existsSync(acDir)) fs.mkdirSync(acDir);
if (!fs.existsSync(solarDir)) fs.mkdirSync(solarDir);

let content = fs.readFileSync(equipmentFile, 'utf8');

// Use a regex to extract each equipment object and rewrite its image path
// It's safer to just do a global replace based on categories if possible,
// but since we want to move files too, we'll parse the file carefully.

const acKeywords = [
  'Gemini', 'pistol', 'คอมเพรสเซอร์', 'แผงคอยล์', 'วาล์ว', 'แคพิลลารี', 'อีวาพอเรเตอร์',
  'สารทำความเย็น', 'ระบบปรับอากาศ', 'Chilled', 'CoolingTower', 'ชิลเลอร์', 'แอร์', 'category-ac'
];

const existingFiles = fs.readdirSync(publicDir).filter(f => fs.statSync(path.join(publicDir, f)).isFile());

// Move files based on keyword matching
existingFiles.forEach(file => {
  const isAc = acKeywords.some(kw => file.toLowerCase().includes(kw.toLowerCase()));
  if (isAc) {
    fs.renameSync(path.join(publicDir, file), path.join(acDir, file));
    console.log(`Moved ${file} to ac/`);
  } else if (file === 'category-solar.jpg') {
    fs.renameSync(path.join(publicDir, file), path.join(solarDir, file));
    console.log(`Moved ${file} to solar/`);
  }
});

// Update equipment.js
// We'll replace `/images/` with `/images/ac/` or `/images/solar/` depending on the category context.
// Actually, an easier way is to just replace the known filenames.

const allAcFiles = fs.existsSync(acDir) ? fs.readdirSync(acDir) : [];
const allSolarFiles = fs.existsSync(solarDir) ? fs.readdirSync(solarDir) : [];

// Replace ac paths
allAcFiles.forEach(file => {
  const oldPath = `/images/${file}`;
  const newPath = `/images/ac/${file}`;
  // Escape regex specials in filename if any
  const regex = new RegExp(oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  content = content.replace(regex, newPath);
});

// Replace solar paths
allSolarFiles.forEach(file => {
  const oldPath = `/images/${file}`;
  const newPath = `/images/solar/${file}`;
  const regex = new RegExp(oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  content = content.replace(regex, newPath);
});

// For those that weren't uploaded yet (mostly solar), they currently have `/images/ชื่อไฟล์.jpg`
// We can use a regex to find all `/images/xxx.jpg` and if the item is in Solar category, change to `/images/solar/xxx.jpg`.
// Since solar items are mostly from line 300 onwards, let's just do a string replace for solar keywords.

const solarKeywords = [
  'แผงโซลาร์เซลล์', 'อินเวอร์เตอร์', 'แบตเตอรี่', 'โครงยึด', 'ระบบออนกริด', 'ระบบออฟกริด',
  'ระบบไฮบริด', 'การเดินสายไฟ', 'ท่อร้อยสายไฟ', 'อุปกรณ์ป้องกันไฟกระชาก', 'ยุทธศาสตร์'
];

solarKeywords.forEach(kw => {
  const oldPath = `/images/${kw}`;
  const newPath = `/images/solar/${kw}`;
  content = content.replace(new RegExp(oldPath, 'g'), newPath);
});

fs.writeFileSync(equipmentFile, content, 'utf8');
console.log("Done organizing images and updating equipment.js");
