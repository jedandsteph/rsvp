/* One-off: optimize the large feature images (originals kept as backup). */
const sharp = require('sharp');
const path = require('path');
const jobs = [
  { src: 'img/OurStory.jpg', out: 'img/OurStory-web.jpg', w: 1400, q: 82 },
  { src: 'img/hero.jpg',     out: 'img/hero-web.jpg',     w: 2000, q: 80 },
];
(async () => {
  for (const j of jobs) {
    await sharp(path.join(__dirname, j.src))
      .rotate()
      .resize({ width: j.w, withoutEnlargement: true })
      .jpeg({ quality: j.q, mozjpeg: true })
      .toFile(path.join(__dirname, j.out));
    console.log('done', j.out);
  }
})();
