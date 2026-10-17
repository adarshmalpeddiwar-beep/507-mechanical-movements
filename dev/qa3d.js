// usage: node qa3d.js 1-10 out.png [angles deg] -> sheet of 3D views + printability report
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
(async () => {
  const [range, out, angs] = process.argv.slice(2);
  let nums = [];
  for (const part of range.split(',')) { const [a, b] = part.split('-').map(Number); for (let i = a; i <= (b || a); i++) nums.push(i); }
  const angles = (angs || '0,100').split(',').map(Number);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/TUNNEL|favicon/.test(m.text())) errs.push(m.text()); });
  const site = 'file://' + path.resolve(process.env.SITE || '/home/claude/repo507/index.html');
  const tmp = fs.mkdtempSync('/tmp/q3');
  const rows = [];
  for (const n of nums) {
    await p.goto(site + '#m' + n); await p.waitForTimeout(150);
    const has = await p.evaluate(n => window.CAD.has(n), n);
    if (!has) { rows.push({ n, files: [], rep: 'no model' }); continue; }
    await p.evaluate(() => { const c = document.querySelector('#cad'); c && c.scrollIntoView(); });
    try { await p.waitForSelector('.cadcv', { timeout: 8000 }); } catch (e) { rows.push({ n, files: [], rep: 'mount failed ' + errs.slice(-2).join(' ') }); continue; }
    await p.waitForTimeout(300);
    const rep = await p.evaluate(n => {
      const M = window.CAD.MODELS[n]; const P = {}; (M.params || []).forEach(q => P[q.id] = q.value);
      const parts = M.parts(P); const K = window.CAD.K; const o = [];
      for (const q of parts) { const w = K.watertight(q.mesh), bb = K.bbox(q.mesh); const d = [0, 1, 2].map(k => (bb.hi[k] - bb.lo[k]).toFixed(0)).join('x'); o.push(`${q.id}${q.qty > 1 ? '×' + q.qty : ''} ${d}${w.bad ? ' LEAK' + w.bad : ''}${w.vol < 0 ? ' NEGVOL' : ''}`); }
      return o.join(' | ');
    }, n);
    const files = [];
    for (const a of angles) {
      await p.evaluate(a => { const i = document.querySelector('.c-ang'); i.value = a; i.dispatchEvent(new Event('input')); }, a);
      await p.waitForTimeout(250);
      const f = `${tmp}/${n}_${a}.png`; await (await p.$('.cadstage')).screenshot({ path: f }); files.push(f);
    }
    if (process.env.BED) { await p.click('.c-view button[data-v=bed]'); await p.waitForTimeout(250); const f = `${tmp}/${n}_bed.png`; await (await p.$('.cadstage')).screenshot({ path: f }); files.push(f); }
    rows.push({ n, files, rep });
  }
  fs.writeFileSync(tmp + '/rows.json', JSON.stringify(rows));
  execFileSync('python3', [path.join(__dirname, 'sheet.py'), tmp + '/rows.json', out]);
  for (const r of rows) console.log(r.n, r.rep);
  if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].join('\n'));
  await b.close();
})();
