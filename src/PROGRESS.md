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
- Next: 151+ (cad_models_151.js).
