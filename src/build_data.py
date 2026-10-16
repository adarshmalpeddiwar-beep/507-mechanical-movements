import json,re
rows={}
for f in ['src/raw_001_200.txt','src/raw_201_300.txt','src/raw_328_.txt']:
    for line in open(f):
        if not line.strip(): continue
        n,s,u=[x.strip() for x in line.split('|')]
        rows[int(n)]=(s,u)
titles={}
for line in open('src/titles.txt'):
    n,t=line.strip().split(' ',1); titles[int(n)]=t
def R(a,b): return list(range(a,b+1))
CATS=[
 ('belts','Belts, pulleys & chains',R(1,23)+[141,227,228,229,243,254,255,256,257,258,259,374,224]),
 ('gears','Gears & gear trains',R(24,45)+[191,192,193,194,195,196,200,201,202,204,205,207,208,209,219,221,222,223,226,264,371,414,495,R(502,507)]),
 ('clutch','Clutches & couplings',[46,47,48,50,51,52,53,55,56,57,58,59,60,61,62,245,248,249,267,361,413]),
 ('intermittent','Ratchets & intermittent motion',[49,54]+R(63,88)+[206,211,212,213,214,215,216,217,218,225,232,233,235,236,237,239,240,241,271,277,278,280,364,390,397,398,400,415]),
 ('cranks','Cranks, cams & eccentrics',R(89,101)+R(135,138)+[145,146,148,149,150,153,154,155,156,157,158,159,160,165,166,167,168,169,172,175,176,177,178,203,210,220,230,231,268,272,276,279,281,282,286,348,350,354,362,401,416,417,419,166]),
 ('screws','Screws',R(102,112)+[151,260,266,275,285,365,399]),
 ('racks','Racks',R(113,125)+[127,128,131,139,197,198,199,269,283,284,351,391,394]),
 ('linkages','Levers & linkages',[126,140,144,164,252,273,363,350,410]),
 ('clocks','Clocks & escapements',[234,238]+R(288,321)+[369,396,402]),
 ('engines','Engines & valve gear',[171,179]+R(181,189)+R(326,347)+[395,418]+R(421,429)),
 ('governors','Governors',[147,161,162,163,170,274,287,357]),
 ('water','Water & wind power',R(430,447)+[484,485,486]),
 ('pumps','Pumps, hydraulics & air',R(448,483)+[497]),
 ('gauges','Gauges & instruments',[244,372,373,411,498,499,500,501,355,356]),
 ('drawing','Drawing instruments',[152,246,322,323,324,325,349,367,368,384,403,404,405,406,407,408,409]),
 ('ships','Ships & boats',R(487,492)),
 ('tools','Tools, presses & lifting',[]),
]
cat_of={}
for key,name,nums in CATS:
    flat=[]
    for x in nums: flat+= x if isinstance(x,list) else [x]
    for n in flat:
        cat_of.setdefault(n,key)
for n in range(1,508): cat_of.setdefault(n,'tools')
TODAY={
'belts':'Belt and chain drives still run car engine accessories, bicycles, treadmills, 3D printers and CNC machines. Pulley blocks are in every crane, sailing rig and gym cable machine.',
'gears':'Gear trains sit inside wristwatches, cordless drills, kitchen mixers, car gearboxes, robot joints and wind turbines.',
'clutch':'Clutches and couplings connect motors to loads in cars, motorcycles, power tools and conveyors. Quick-release joints appear on everything from garden hoses to camera mounts.',
'intermittent':'Step-by-step motions index assembly lines, advance film and labels, count revolutions and make ratchet tools work.',
'cranks':'Cranks, cams and eccentrics turn rotation into strokes in car engines, compressors, pumps, sewing machines and packaging machines.',
'screws':'Lead screws and screw jacks position 3D-printer beds, CNC tables, car jacks, vises and microscope stages.',
'racks':'Racks and pinions steer most cars and move CNC gantries, stair lifts and camera sliders.',
'linkages':'Linkages shape the motion in robot grippers, car suspensions, folding furniture, excavator arms and locking pliers.',
'clocks':'Escapements still regulate mechanical watches and clocks. The same tick-by-tick release idea is used in some timers and toys.',
'engines':'These steam-era layouts survive in compressors, pumps, model engines and preserved locomotives. Their straight-line linkages are still studied and used.',
'governors':'Speed governors are the ancestors of cruise control and the feedback loops that run engines, turbines and robots.',
'water':'Water wheels led to the hydro turbines in today\'s dams, and windmills to modern wind turbines.',
'pumps':'These pumps and pressure devices are the ancestors of car brakes, hydraulic presses, jacks, compressors and heating systems.',
'gauges':'Dial gauges, manometers and dynamometers are still everyday tools for checking pressure and power.',
'drawing':'Drafting instruments like these live on in CNC copy routers, engraving machines and the geometry inside CAD software.',
'ships':'Propellers, capstans, winches and quick-release hooks are still standard on ships and boats.',
'tools':'Variations of these appear in workshop tools, presses, clamps, lifting gear and hand-powered machines.',
}
OVR={
1:'Car engine accessory belts, treadmill motors, and the timing belts in 3D printers and CNC machines.',
2:'Old line-shaft workshops used crossed belts to reverse a machine. Today a gear or a reversing motor usually does the job.',
8:'Drill presses and wood lathes still change speed by moving the belt between stepped pulleys.',
9:'The cone idea lives on in scooter CVTs and other continuously variable transmissions.',
12:'Flagpoles, window blinds and simple hoists.',13:'Cranes, sailboat rigging, gym cable machines and rescue rope systems.',14:'Cranes, sailboat rigging, gym cable machines and rescue rope systems.',
24:'Gearboxes, cordless drills, kitchen mixers and clocks.',25:'Car differentials, hand drills and angle grinders.',
31:'Guitar tuning pegs, gate openers, conveyor drives and lifts. A worm resists being driven backwards, so the load stays put.',202:'Guitar tuning pegs, gate openers, conveyor drives and lifts.',
33:'Some packaging, printing and flow-metering machines use elliptical gears for a deliberately varying speed.',
34:'Compact geared motors and planetary gearboxes use internal gears.',39:'The sun-and-planet idea lives on in planetary gearboxes.',
46:'High-end mechanical watches still use a fusee. Compound bows use cams to even out the pull in a similar way.',
47:'Car, motorcycle and tractor clutches.',50:'Car drive shafts, steering columns and socket-wrench extensions.',51:'Car drive shafts, steering columns and socket-wrench extensions.',
72:'Power hammers in forges and blacksmith shops.',85:'Stamp mills crushed ore. Pile drivers and drop forges use the same lift-and-drop idea.',
89:'Punch presses, jaw crushers and vibrating screens are driven by eccentrics.',92:'Car engines, air compressors and reciprocating saws.',
93:'Pipeline valve actuators and some compact engines and pumps.',96:'Bobbin winders on sewing machines and the level-wind on fishing reels lay thread evenly this way.',
100:'Metal shapers and slotting machines, where the fast return stroke saves time.',102:'Vises, car jacks, 3D-printer Z axes and CNC ball screws.',103:'3D-printer and CNC lead screws.',
105:'Coin and medal presses, wine presses and bookbinding presses.',111:'Micrometers and fine-adjustment stages in optics labs.',266:'Micrometers and fine-adjustment stages in optics labs.',
112:'Push-drills (Yankee screwdrivers) still use a quick-pitch spiral.',113:'Car steering, CNC routers, stair lifts and camera sliders.',
126:'Bicycle brake levers, car pedal linkages and railway signal wires.',140:'Locking pliers, toggle clamps on jigs, stone crushers and injection-moulding clamps.',164:'Locking pliers, toggle clamps and presses.',
141:'Band saws in woodworking shops and meat processing.',144:'Scissor lifts, extending mirrors and folding gates.',
145:'Beam engines pumped water and drained mines; preserved ones still run at museums.',152:'Woodworkers draw ellipses with this trammel, and the same geometry is used in CNC ellipse cutting.',
158:'Treadle sewing machines and pottery wheels.',161:'The ancestor of cruise control and feedback control; still used on some generators.',
185:'Steam locomotives used it to reverse and set the cut-off.',211:'Film projectors and rotary indexing tables on assembly lines.',212:'Swiss watches used it to stop over-winding.',
231:'Drag links appear in shapers and in some packaging machines to vary speed.',232:'Socket-wrench ratchets, bicycle freewheels and tie-down straps.',
234:'Early tower clocks.',242:'Winches, go-karts and the bands inside some automatic gearboxes.',244:'Measuring engine power before electric dynamometers.',
246:'Copy routers, engraving machines and signature-copying machines.',254:'Bicycle chains, motorcycle drives and conveyor chains.',258:'V-belts on car engines, drill presses and washing machines.',
264:'Odometers and counters use the same one-extra-tooth trick.',267:'Freewheel clutches in bicycles and starter motors.',
288:'Grandfather clocks still use the anchor escapement.',289:'Precision pendulum clocks.',296:'Almost every mechanical wristwatch today has a lever escapement.',
313:'Marine chronometers used for navigation.',315:'Smooth-running clock and telescope drives.',316:'Precision pendulum clocks.',319:'Chronometers and fine watches.',
329:'Straight-line mechanisms and the planetary gear sets in many machines use this geometry.',335:'Car rear suspensions still use Watt\'s linkage to keep the axle centred.',
344:'Toy and model steam engines and early paddle steamers.',355:'Gyrocompasses, drones and spacecraft use gyroscopes; phones use tiny MEMS versions.',356:'Gyrocompasses and aircraft instruments.',
359:'Bead makers and bushcraft kits still use pump drills.',369:'Huygens\' idea for precise clocks. The cycloid is also the fastest slide between two points.',
375:'Edge-runner mills still grind oilseeds, clay and spices.',420:'Clock chimes and church bells.',430:'Small hydro schemes and heritage mills.',431:'Small hydro schemes and heritage mills.',
434:'The ancestor of the Francis turbines in today\'s hydro dams.',436:'An ancestor of the Kaplan and Francis turbines in hydro dams.',438:'Spinning lawn sprinklers work on the same reaction principle.',
443:'Sewage plants, grain augers, fish-friendly hydro screws and pellet extruders.',444:'Hydraulic rams still pump water to farms with no power supply.',
448:'Hand pumps on village wells.',451:'Fire engines and garden sprayers.',462:'Rope-and-washer pumps are still used for irrigation in many regions.',
464:'Garden fountains and science demonstrations.',466:'Hydraulic presses, car jacks, excavators and car brakes.',467:'Bottle jacks for cars and trucks.',
470:'Forging hammers.',474:'The first steam turbine idea. Jet engines and sprinklers use the same reaction thrust.',475:'Venturi ejectors, vacuum generators and some bilge pumps.',
477:'Steam traps in heating systems and factories.',481:'Gas metering.',483:'Household gas meters still use the bellows principle.',482:'Gas regulators on cylinders and cookers.',
485:'Wind turbines.',487:'Paddle steamers and pedal boats.',488:'Every ship, boat and drone propeller.',491:'Capstans and winches on ships and docks.',493:'Stonemasons still lift blocks with a lewis.',494:'Scissor-type lifting clamps for stone, logs and steel plate.',
495:'Car differentials let the outer wheel turn faster in a corner.',503:'Car differentials let the outer wheel turn faster in a corner.',496:'Ring spinning frames in textile mills.',497:'Fans, vacuum cleaners and turbochargers.',
498:'HVAC technicians measure gas pressure and airflow with manometers.',499:'The dial gauge on tyre inflators, boilers and gas cylinders.',500:'Low-pressure dial gauges and some barometers.',501:'Weather barometers.',
502:'Automatic gearboxes, e-bike hub motors, electric screwdrivers and robot joints.',505:'Automatic gearboxes, e-bike hub motors, electric screwdrivers and robot joints.',507:'Very slow drives such as telescope and clock mechanisms.',
}
out=[]
for n in range(1,508):
    s,u=rows[n]
    if s.startswith('(Text not'):
        s='Brown\'s description for this movement could not be retrieved from the source copy used for this edition.'
    out.append({'n':n,'t':titles[n],'s':s.rstrip('.')+'.','b':'' if u in ('-','') else u,'c':cat_of[n],'u':OVR.get(n,TODAY[cat_of[n]]),'g':0 if n in OVR else 1})
cats=[{'k':k,'name':name} for k,name,_ in CATS]
js='window.CATS='+json.dumps(cats)+';\nwindow.MOVEMENTS='+json.dumps(out,ensure_ascii=False)+';\n'
open('site/js/data.js','w').write(js)
from collections import Counter
print(Counter(cat_of.values()))
