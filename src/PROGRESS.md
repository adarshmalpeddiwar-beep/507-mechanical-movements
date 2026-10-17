# Audit + CAD progress (working notes)

Goal (user, 2026-10-16): check every 2D sim works the way Brown's movement really works (e.g. 29, 33 were wrong),
fix them with attention to detail, and give EVERY mechanism a 3D-printable model (2D and 3D both detailed).

## Tooling
- Build: `cd repo507 && python3 src/build.py` (writes index.html, js/mechanisms.js, js/cad.js, js/cad/<chunk>.js + CAD.INDEX)
- 2D QA sheet: `cd /home/claude/tools && CW=300 node qa.js 21-35 out.png [phases]`
- 3D QA sheet: `cd /home/claude/tools && NODE_PATH=/opt/node-tools/node_modules node qa3d.js 24 out.png 0,100` (+BED=1 for print layout); prints part sizes and LEAK flags
- Tools live in /home/claude/tools (qa.js, qa3d.js, sheet.py) - recreate if lost.
- WIP is pushed to branch `audit-cad` on GitHub; main is only updated at the end.

## 3D conventions (src/cad_pk.js, "PK")
- `PK.def(n,{S,summary,parts,ground,fixed,pose,ropes,read,up,drive,steps,hardware})`
- Coordinates are the sim's canvas px (y down); S = mm per px (default 0.3). Pose values `[x,y,angle]` in canvas px / canvas angle
  (same numbers the sim draws with), or a 16-number M4 matrix in mm for non-planar parts.
- Layers: z = BT+GAP+layer*(TH+GAP), TH=4, GAP=0.5. Part `t` = thickness in layers. Gears usually t:2.
- `ground:[[x,y,l0,l1]]` = boss up to layer l0 + pin through layer l1 + cap, printed on base.
- Part `pins:[[lx,ly,topLayer]]` = pin printed on that moving part (local px) + cap. `bosses:[[lx,ly,h,r]]` knobs.
- `fixed:[{shape,l1}]` = guides/walls printed on the base (absolute px).
- `up:true` stands the board upright (for elevation-view sims: pumps, engines, clocks...).
- Shapes (Sh): gear(R,Z), ring(R,Z,ro), disk, annulus, bar(L,w,holes), lever(circles,holes), rect, poly, slotPts, rack, ratchet, polar.
- 2D gears now use involute teeth (kit gearPts); 3D gear phase matches the 2D angle (tooth centred on angle 0).
- Models 1-10: bespoke file cad_models_001.js. New models: cad_models_011.js (11-50), _051 ... by range of 40-50.

## Spatial kit (added): PK.defS(n,{base:P=>[meshes], parts:[{id,mesh}], pose(phi,g,sim,P)->{id:M4|[M4]}, params, read, cam})
- PK.U (mm): spur, helical, bevel (printed back face down, z toward apex), worm, rack, shaft (octagonal, lying along x), wall(cx,cy,axis|angle,[[across,z,r]]),
  post, plate, crank, collar, capMesh, printed(meshAsm,R)->{mesh,inv}; pose helpers U.at(o,n,a,u), U.shaftAt(c,dir,a). K.loftS(sections) lofts rings with holes.
- 2D: R3 now renders through WebGL z-buffer (GL3) with painter fallback; non-circular gears have real teeth (pitchCurve/toothedCurve/ncPhase in sims_d5.js, exported on MB).

## Status
(update after each batch: range, 2D fixes done, 3D done)
- 24: 3D test model done.
- 25–50: 2D audited and fixed (33 phase+teeth, 25 params bug, 29 3D, 35/201/221/222 exact follower, 36 single pin row, 37 fixed long pinion, 45 section, 46 upright axes, 49 rebuilt per Brown, 50 yokes). 3D models done for 25–50 (cad_models_025.js).
- 51–80: 2D fixed (51 ring joint, 54/65/70/71 real tappet-stud solver, 63 drop pawl, 64/66/67 worm drop, 68/69/241 exact Geneva-type, 74 mutilated bevel, 76 counter, 77/78/206/236 double pawl, leverPawl crank is a true 4-bar, bevelDiff (61,62,226,495,503,506) drawn as solids). 3D models 51–80 in cad_models_051.js.
- Template sims still to review when their numbers come up: stepper (364, 398), shifter, gearStyle, mangle (192-194,371), pinionFollower ok.
- Tools: /home/claude/tools/simsrc.py N-M (print sim source), dbg2.js <chunk> <expr> (load a CAD chunk and eval).
- Brown text: WebFetch https://dn760104.eu.archive.org/0/items/fivehundredseven00browiala/fivehundredseven00browiala_djvu.txt with prompt 'precise paraphrase of movements A through B'.
- 81–115: 2D fixed (81 rack teeth, 82 one ratchet two treadles, 94 spiral/slot plates, 98 groove in the arm, 115 rack pitch, 84/139 rack frame pitch, screwSlide travels back and forth). Models in cad_models_081.js.
- 116–150: 2D fixed 143 (worm on sliding frame). Models in cad_models_116.js incl. M119–M127 and generic link models (PK.Lib.linkModel) for all link() sims, governors (govModel in 116 chunk).
- PK.Lib (cad_pk.js): pxPoly, offsetLoop, pip, groovedPlate, camFlatModel(n,summary), linkModel(n,summary). Use them from any chunk.
- 151–190: 2D fixed 153/154 (stud contact), 166 (slotted rod dwell). Models in cad_models_151.js. TODO: 171 is an alias of 344 — give 171 the same model when 344 is modelled.
- 191–230: 2D in sims_d8.js: 191 toothed scroll with exact sliding pinion, mangle template rewritten (exact pin track, round ends, groove; geo stored for models: 36,192–194,371), 195 worm between two wheels + rolls, 196 epicyclic arm, 198 rack on parallel rods (Brown), 208 exact pin pitches, 211 Geneva with lock (lockTooth), 212–215 Geneva stop with blank place (sorted rim — genevaWheel has a wrap bug for odd N; use the 212 builder), 216 part-gear + part-ring quick return, 219 exact contact radius, 223 three sector planes with teeth, 224 slotted plate, 227–229 pocket wheels. Helpers sectorExt/sectorInt/polyAt in sims_d8.
  Models: cad_models_191.js; mangle loop moved into chunk 025; loops extended: 31→202, 30/38→209, 55→200, 77/78→206/236, 61/62→226/495/503/506, 68/69/241→211–215, 114→199, 119→197. TODO: 225 = alias of 232 (model with 232).
- 231–270: 2D in sims_d9.js: 233 lantern stops (filled space / stud), 239 gear stops, 252 slots inside the slide, 260 geared differential screw (20/21), 269 frame moves steadily with part-racks (Brown). Models in cad_models_231.js (+266 via screwModel in 081, 225/237 with 232).
  TODO: 234 verge and 238 pallet escapement → do with the escapement group (288–314): esc template's wheel motion is not tied to the pallets.
- 271–320: escapements rebuilt on a contact solver (sims_db.js, ESC): the wheel is urged forward and stopped by the real pallet/detent/cylinder/roller shapes, so lock, impulse, drop and recoil come from geometry. Engines: nibEsc (anchor/side/gravity layouts; recoil, deadbeat, pins (half-round), lantern, three-legged, lever via fork map), detentEsc (291, 313, 308, 396), duplexEsc (300, 301; impulse pins drawn but contact only on the roller), cylEsc (294, 295), vergeEsc 3D (234, 293, 298, 299). Also 271 (two-pawl bar), 275 (worm meshes rack), 286 (rocking toe), 320 (Huygens chain moves).
  Models: cad_models_271.js (all escapements planar from the same shapes, verge spatial). PK.Lib now also has grooveLeverModel, crankSlideModel, govModel (use for later grooveLever/crankSlide/gov sims: 326, 327, 330, 331, 417, 418, …). 272 joined the 95 swash model.
- 321–360: 2D in sims_dc.js: 321 Harrison maintaining power (going ratchet on spokes, springs inside, detent, click; RAT ratchet/pawl helper exposed as SIMS[321].RAT), rulers 322 (triangles), 323 (rolling, plan + side inset), 324 (crossed arms, pins in slots), 349 (jointed, middle bar), 340 (rocking pillar = Scott Russell with radius bar, optimised), 342 (arch heads, chains wrap), 347 (disk engine section + plan), 348 (rose groove r=a·cos2θ), 353 (wipers above the tail), 358 (fusee cord traverse), 360 (beam, drum, pawl, ratchet, flywheel; simulated coast). Earlier: 334 rack, 344 cylinder, 345 cylinder length, 351 rack stamp, shapedYoke offset.
  Models: cad_models_321.js; crankSlideModel now does roller (327) and fork (330); 129 loop → 352; 344 loop → 171.
  Lesson: never write `x.length?…:null` inside K.merge (meshes have no length).
- 361–400: 2D in sims_dd.js: 361 pin clutch (pins meet; simulated pick-up), 362 slanted groove drum, 364/398 exact Geneva via lockTooth (N 12 / 4), 366 drill press (bevel, sliding spindle, lever), 372 White's dynamometer, 379/380 cramp drills (distinct), 381 wedge clamp (1 in 2), 384 log-spiral volute drawer, 385 door closer (fixed-length link, slide below the wall), 390 two drums/pawls/ratchets + flywheel (simulated), 391 weighted racks taking turns on one side, 397 dwell slot (clipped cosine).
  Models: cad_models_361.js; loops extended: 364/398 → Geneva loop (051, ext summaries), 371 → mangle (025), 389 → leverPawlModel (051), 394 → 119 (116).
- 401–440: 2D in sims_de.js: 402 twin balances geared on a real cylinder escapement (cylEsc), 403 cyclograph (inscribed angle), 408 centrolinead (circle through pins and far point), 412 capstan purchase consistent, 419 cradle four-bar, 421 trunk of fixed length, 422 vane fast with arm, 423 crank-rocker with two vanes, 426–428 vanes slide to follow the case (ROT.vaneL; abutment draw-in).
  Models: cad_models_401.js; loops: 402 → cylinder loop (twin balance + gears), 414 → 191, 416 → 158, 429 → noncirc (025).
- 441–475: 2D in sims_df.js: 445/446 cone-valve water lifter (own drawing, close-up), 455/456 vanes (vaneL, heart cam with abutment), 460 scoop crank-rocker, 463 weir leaf on a third-height axle, 467 jack lever-link, 470 steam hammer rigid piston/head; sims_c4 airHammer rod rigid and pump rod fixed length.
  Models: cad_models_441.js (sections for pumps/rams), rotary loop in 401 extended to 455/456.
- 476–507: models for every mechanism in cad_models_476.js (489 printable eccentric-ring feathering wheel, 502/504/505/507 epicyclic trains with meshing phases); 2D fixes 493 lewis, 507 slow epicyclic (41/40 with 39+40 planet), 486, 489.
