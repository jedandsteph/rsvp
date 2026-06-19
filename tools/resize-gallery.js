/* One-off: generate web-optimized gallery images from the originals.
   - thumb/  ~600px  → used in the grid (small, sharp on tiles)
   - large/ ~1600px  → used in the lightbox (crisp full view)
   Originals in img/gallery/*.JPG are left untouched.
   Run: node resize-gallery.js
*/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'img', 'gallery');
const THUMB = path.join(SRC, 'thumb');
const LARGE = path.join(SRC, 'large');
const COUNT = 16;

fs.mkdirSync(THUMB, { recursive: true });
fs.mkdirSync(LARGE, { recursive: true });

(async () => {
  for (let i = 1; i <= COUNT; i++) {
    const src = path.join(SRC, `${i}.JPG`);
    if (!fs.existsSync(src)) { console.log(`skip ${i}.JPG (missing)`); continue; }

    await sharp(src)
      .rotate()                                   // respect EXIF orientation
      .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(THUMB, `${i}.jpg`));

    await sharp(src)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(LARGE, `${i}.jpg`));

    console.log(`done ${i}`);
  }
  console.log('All gallery images optimized.');
})();
