// usage: node qa.js 1-20 out.png [phases]   -> contact sheet of sims
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [range, out, ph] = process.argv.slice(2);
  let nums = [];
  for (const part of range.split(',')) { const [a, b] = part.split('-').map(Number); for (let i = a; i <= (b || a); i++) nums.push(i); }
  const phases = (ph || '0,1.2,2.4,3.6,4.8').split(',').map(Number);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/TUNNEL/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + path.resolve(process.env.SITE || '/home/claude/repo507/index.html'));
  await p.waitForTimeout(500); if(process.env.CW) await p.evaluate(c=>window.__CW=c, +process.env.CW);
  const data = await p.evaluate(({ nums, phases }) => {
    const W = 800, H = 520, cw = +(window.__CW||300), ch = cw * H / W, lab = 150;
    const C = window.MB.C; const s = getComputedStyle(document.documentElement);
    ['sheet','ink','muted','rule','grid','brass','brass-fill','steel','steel-fill','part','part2','hi'].forEach(k => C[k] = s.getPropertyValue('--' + k).trim());
    const sheet = document.createElement('canvas'); sheet.width = lab + cw * phases.length; sheet.height = ch * nums.length;
    const S = sheet.getContext('2d'); S.fillStyle = '#fff'; S.fillRect(0, 0, sheet.width, sheet.height);
    const errs = [];
    nums.forEach((n, r) => {
      const sim = window.MB.SIMS[n]; const m = window.MOVEMENTS[n - 1];
      S.fillStyle = '#000'; S.font = 'bold 22px sans-serif'; S.fillText(n, 6, r * ch + 26);
      S.font = '12px sans-serif'; const words = (m ? m.t : '').split(' '); let line = '', y = r * ch + 46;
      for (const w of words) { if ((line + w).length > 22) { S.fillText(line, 6, y); y += 14; line = ''; } line += w + ' '; } S.fillText(line, 6, y);
      if (sim && sim.concept) { S.fillStyle = '#c00'; S.fillText('concept', 6, r * ch + ch - 8); }
      if (!sim) return;
      phases.forEach((phi, c) => {
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d');
        try {
          sim.reset && sim.reset(); const k = Math.max(1, Math.ceil(phi / 0.02)); for (let i = 0; i <= k; i++) sim.update(phi * i / k);
          g.setTransform(cw / W, 0, 0, cw / W, 0, 0); g.fillStyle = C.sheet; g.fillRect(0, 0, W, H); g.lineJoin = 'round';
          window.MB.setCtx(g); sim.draw();
        } catch (e) { errs.push(n + ': ' + e.message); }
        S.drawImage(cv, lab + c * cw, r * ch); S.strokeStyle = '#999'; S.strokeRect(lab + c * cw, r * ch, cw, ch);
      });
    });
    return { url: sheet.toDataURL('image/png'), errs };
  }, { nums, phases });
  require('fs').writeFileSync(out, Buffer.from(data.url.split(',')[1], 'base64'));
  console.log('saved', out, data.errs.concat(errs).join('\n'));
  await b.close();
})();
