/* Module 16 widgets: Electric Motors */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: nameplate mismatch */
  var A=[["Volts","208–230"],["Hz / Phase","60 / 1"],["HP","1/4"],["RPM","1075"],["Rotation","CCW (shaft end)"],["Cap","5 µF 370 V"]];
  var B=[["Volts","208–230"],["Hz / Phase","60 / 1"],["HP","1/4"],["RPM","825"],["Rotation","CW (shaft end)"],["Cap","5 µF 370 V"]];
  S("w-hook","Two motors, one problem",
    '<p class="lbl">Tap the fields on the replacement that don\'t match the original.</p><div class="nameplates"><div class="nplate"><h4>Original (dead)</h4>'+A.map(function(f){return '<button type="button" disabled><span>'+f[0]+'</span><b>'+f[1]+'</b></button>';}).join("")+'</div>'+
    '<div class="nplate" id="npB"><h4>"Fits" replacement</h4>'+B.map(function(f,k){return '<button type="button" data-k="'+k+'"><span>'+f[0]+'</span><b>'+f[1]+'</b></button>';}).join("")+'</div></div><p class="status" id="npOut" aria-live="polite"></p>');
  var found={};
  each($("npB").querySelectorAll("button"),function(b){b.addEventListener("click",function(){var k=+b.getAttribute("data-k"), mis=A[k][1]!==B[k][1];
    b.classList.add(mis?"bad":"okk"); if(mis) found[k]=1;
    $("npOut").innerHTML=Object.keys(found).length===2?'<span class="no">Rotation and RPM don\'t match. This one would push air the wrong way.</span>':mis?"Mismatch found. Keep looking.":"That field matches.";});});

  /* S1: rotor and stator */
  S("w-s1","Magnets chasing magnets",
    '<div class="svgbox"><svg id="rsSvg" viewBox="0 0 320 170" role="img" aria-label="Rotor between two stator poles"></svg></div>'+
    '<div class="row"><button type="button" id="rsFlip">🔁 Flip poles</button><label class="toggle"><input type="checkbox" id="rsAuto"> Auto (commutator / AC does the timing)</label></div><p class="status" id="rsOut" aria-live="polite"></p>');
  var rang=90, target=180, pol=1, turns=0;
  function rsDraw(){var c=160,cy=85,g='';
    g+='<rect x="20" y="55" width="50" height="60" rx="6" fill="'+(pol>0?"#ff6b5b":"#5ab4ff")+'"/><text x="45" y="92" font-weight="800" text-anchor="middle" fill="#fff">'+(pol>0?"N":"S")+'</text>';
    g+='<rect x="250" y="55" width="50" height="60" rx="6" fill="'+(pol>0?"#5ab4ff":"#ff6b5b")+'"/><text x="275" y="92" font-weight="800" text-anchor="middle" fill="#fff">'+(pol>0?"S":"N")+'</text>';
    var r=rang*Math.PI/180, x=Math.cos(r)*60, y=Math.sin(r)*60;
    g+='<line x1="'+(c-x)+'" y1="'+(cy-y)+'" x2="'+(c+x)+'" y2="'+(cy+y)+'" stroke="#9AA0A6" stroke-width="18" stroke-linecap="round"/>';
    g+='<circle cx="'+(c+x*0.8)+'" cy="'+(cy+y*0.8)+'" r="9" fill="#ff6b5b"/><circle cx="'+(c-x*0.8)+'" cy="'+(cy-y*0.8)+'" r="9" fill="#5ab4ff"/><circle cx="'+c+'" cy="'+cy+'" r="6" fill="#EDEAE4"/>';
    g+='<text x="160" y="165" fill="#9AA0A6" font-size="11" text-anchor="middle">half-turns: '+turns+'</text>';
    $("rsSvg").innerHTML=g;}
  /* rotor's red (N) end is pulled toward the stator S pole; target alternates 0° / 180° */
  function rsTick(){
    var d=target-rang; if(Math.abs(d)>0.5){rang+=Math.sign(d)*Math.min(Math.abs(d),4);}
    else{ rang=target; if($("rsAuto").checked) flip(); else $("rsOut").textContent="Stalled: poles lined up. Tap Flip poles to keep it turning."; }
    rsDraw(); setTimeout(rsTick,30);}
  function flip(){ if(Math.abs(target-rang)<=0.5){pol=-pol; target+=180; turns++; $("rsOut").textContent="Spinning…";} else $("rsOut").textContent="Too early! Wait until the poles line up."; }
  $("rsFlip").addEventListener("click",flip); rsTick();

  /* S2: motor-type matcher + speed calc */
  S("w-s2","Motor-type matcher",
    '<p class="lbl">Add parts to a single-phase motor:</p><label class="toggle"><input type="checkbox" id="mtSW" checked> Start winding</label><label class="toggle"><input type="checkbox" id="mtSC"> Start capacitor (drops out after start)</label><label class="toggle"><input type="checkbox" id="mtRC"> Run capacitor (always in circuit)</label><label class="toggle"><input type="checkbox" id="mtSH"> Shading coils, no start winding</label>'+
    '<p class="result-big" id="mtOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:14px"><b>Speed calculator</b></p><div class="grid3">'+EW.sel("spP","Poles",["2","4","6","8"])+EW.sel("spF","Frequency",[["60","60 Hz"],["50","50 Hz"]])+EW.fld("spN","Nameplate rpm",1725)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Synchronous</span><span class="v" id="spSync">–</span></div><div class="ro"><span class="k">Slip</span><span class="v" id="spSlip">–</span></div></div><p class="wnote">Synchronous speed = 120 × Hz ÷ poles. Slip = (sync − actual) ÷ sync.</p>');
  function mt(){var sw=$("mtSW").checked,sc=$("mtSC").checked,rc=$("mtRC").checked,sh=$("mtSH").checked,t;
    if(sh&&!sw&&!sc&&!rc) t="Shaded-pole: cheap, weak, inefficient. Small fans.";
    else if(sh) t="Shading coils go on shaded-pole motors only. Remove the other parts.";
    else if(!sw) t="No start winding: a single-phase motor can't start by itself (it will just hum).";
    else if(sc&&rc) t="CSCR: start and run capacitors. Compressors needing extra starting torque.";
    else if(sc) t="CSIR (capacitor-start): start cap boosts torque, then drops out.";
    else if(rc) t="PSC: run capacitor always in. Most common for condenser fans and older blowers.";
    else t="Split-phase: start winding drops out at speed. Low starting torque.";
    $("mtOut").textContent=t;}
  ["mtSW","mtSC","mtRC","mtSH"].forEach(function(id){$(id).addEventListener("change",mt);}); mt();
  $("spP").value="4";
  function spd(){var s=120*v("spF")/v("spP"), n=v("spN"), sl=(s-n)/s*100; $("spSync").textContent=fmt(s,0)+" rpm"; $("spSlip").textContent=isFinite(sl)?fmt(sl,1)+"%":"–";}
  ["spP","spF","spN"].forEach(function(id){$(id).addEventListener("input",spd);$(id).addEventListener("change",spd);}); spd();

  /* S3: PSC vs ECM */
  S("w-s3","PSC vs. ECM blower race (illustrative numbers)",
    '<div class="svgbox"><svg viewBox="0 0 320 120" role="img" aria-label="Two blower wheels"><g transform="translate(80 55)"><g id="pscFan"><circle r="34" fill="none" stroke="#9AA0A6" stroke-width="3" stroke-dasharray="6 5"/><line x1="-30" y1="0" x2="30" y2="0" stroke="#9AA0A6" stroke-width="3"/><line x1="0" y1="-30" x2="0" y2="30" stroke="#9AA0A6" stroke-width="3"/></g></g><text x="80" y="110" text-anchor="middle" fill="#EDEAE4" font-size="12">PSC</text>'+
    '<g transform="translate(240 55)"><g id="ecmFan"><circle r="34" fill="none" stroke="#2EC4B6" stroke-width="3" stroke-dasharray="6 5"/><line x1="-30" y1="0" x2="30" y2="0" stroke="#2EC4B6" stroke-width="3"/><line x1="0" y1="-30" x2="0" y2="30" stroke="#2EC4B6" stroke-width="3"/></g></g><text x="240" y="110" text-anchor="middle" fill="#EDEAE4" font-size="12">ECM (constant airflow)</text></svg></div>'+
    '<label class="lbl" for="ecR">Duct restriction: <b id="ecRv">0</b>%</label><input type="range" id="ecR" min="0" max="90" value="20">'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">PSC airflow</span><span class="v" id="pscC">–</span></div><div class="ro"><span class="k">PSC watts</span><span class="v" id="pscW">–</span></div><div class="ro"><span class="k">ECM airflow</span><span class="v" id="ecmC">–</span></div><div class="ro"><span class="k">ECM watts</span><span class="v" id="ecmW">–</span></div></div>'+
    '<p class="wnote">Teaching model, not a real fan curve: PSC airflow drops as restriction rises; the ECM speeds up to hold 1,000 CFM and its watts climb, but stay below the PSC in this range.</p>');
  var aP=0,aE=0;
  function ec(){var r=+$("ecR").value/100; $("ecRv").textContent=Math.round(r*100);
    $("pscC").textContent=fmt(1000*(1-0.5*r),0)+" CFM"; $("pscW").textContent=fmt(480-80*r,0)+" W"; $("ecmC").textContent="1,000 CFM"; $("ecmW").textContent=fmt(220+180*r,0)+" W";}
  $("ecR").addEventListener("input",ec); ec();
  (function spin(){var r=+$("ecR").value/100; if(!H.reduceMotion){aP+=8*(1-0.5*r); aE+=8*(1+0.6*r);} $("pscFan").setAttribute("transform","rotate("+(aP%360)+")"); $("ecmFan").setAttribute("transform","rotate("+(aE%360)+")"); requestAnimationFrame(spin);})();

  /* S4: nameplate chips + replacement game */
  var NP=[["Volts / Hz / Phase","What power it needs. Must match the supply.","208–230 V, 60 Hz, 1 ph"],["HP","Output power. 1 hp ≈ 746 W.","1/3 hp"],["RPM","Rated full-load speed.","1,075 rpm"],["FLA","Current at full rated load.","2.8 A"],["LRA","Inrush at startup, often 4–6× running current.","Compressors: e.g. 82 LRA"],["SF","Service factor: SF 1.15 means 15% over rated hp is OK.","1.15"],["Rotation","CW or CCW, viewed from a stated end.","CCW, lead end"],["Frame / Enclosure / Insulation","Mounting size, open or totally enclosed, insulation class.","48 frame, TEAO, Class B"],["Capacitor","µF and voltage rating for PSC motors.","5 µF, 370 V"]];
  var s4=S("w-s4","Tap the nameplate",
    '<div class="nplate"><h4>MOTOR NAMEPLATE</h4>'+NP.map(function(f,k){return '<button type="button" data-k="'+k+'"><span>'+f[0]+'</span><b>'+f[2]+'</b></button>';}).join("")+'</div><div class="tree-node" id="npInfo" aria-live="polite">Tap a field.</div><p class="lbl" style="margin-top:14px"><b>Replacement check</b></p>');
  each(s4.querySelectorAll(".nplate button"),function(b){b.addEventListener("click",function(){var f=NP[+b.getAttribute("data-k")]; $("npInfo").innerHTML="<b>"+f[0]+"</b>: "+f[1]+"<br>Typical: "+f[2];});});
  EW.chooser(s4,[
    {prompt:"Old: 1/4 hp, 208–230 V, 1,075 rpm, CCW, 5 µF. New: 1/4 hp, 208–230 V, 1,075 rpm, CCW, 5 µF, TEAO.",options:["Can replace","Can't replace"],answer:0,why:"Everything that matters matches. TEAO (totally enclosed) is fine outdoors."},
    {prompt:"Old: 1/3 hp, 115 V, 1,075 rpm. New: 1/3 hp, 208–230 V, 1,075 rpm.",options:["Can replace","Can't replace"],answer:1,why:"Voltage doesn't match. A 230 V motor won't run right on 115 V."},
    {prompt:"Old: 1/6 hp, 1,075 rpm, CW. New: 1/6 hp, 1,075 rpm, reversible (CW or CCW by lead change).",options:["Can replace","Can't replace"],answer:0,why:"A reversible motor works if you set it for CW before installing."},
    {prompt:"Old: 1/2 hp, 1,075 rpm. New: 1/2 hp, 1,725 rpm.",options:["Can replace","Can't replace"],answer:1,why:"Wrong speed: 1,725 rpm moves far more air and overloads the motor. Match the rpm."}],{label:"Pair"});

  /* S5: split-system cutaway */
  var MO=[["Compressor","Pumps refrigerant (hermetic, cooled by refrigerant).","Hermetic: PSC or CSCR single-phase, or 3-phase","Weak run capacitor, open internal overload, shorted/grounded winding.",210,60],
    ["Condenser fan","Pulls air through the outdoor coil.","PSC or ECM, direct-drive, often totally enclosed","Run capacitor, worn bearings, wrong rotation after replacement.",210,25],
    ["Indoor blower","Moves house air across the evaporator.","PSC (speed taps) or ECM","Dirty wheel, capacitor, ECM module.",70,85],
    ["Inducer motor","Pushes combustion gases out of the furnace.","Shaded-pole or PSC","Bearing noise; pressure switch won't close.",70,45],
    ["Condensate pump","Lifts condensate water to a drain.","Small shaded-pole pump","Clogged inlet, float stuck, overflow switch trips.",120,120],
    ["Damper actuator","Positions zone or economizer dampers.","Small gear motor (24 V)","Stuck damper, failed actuator, no signal.",40,15]];
  S("w-s5","Find the motors",
    '<div class="svgbox"><svg id="moSvg" viewBox="0 0 320 140" role="img" aria-label="Split system with motors"><rect x="20" y="10" width="140" height="125" rx="6" fill="#1a2430" stroke="#59616c"/><text x="90" y="135" dy="-4" fill="#9AA0A6" font-size="10" text-anchor="middle">indoor</text><rect x="180" y="10" width="120" height="90" rx="6" fill="#1a2430" stroke="#59616c"/><text x="240" y="96" fill="#9AA0A6" font-size="10" text-anchor="middle">outdoor</text>'+
    MO.map(function(m,k){return '<g data-k="'+k+'" style="cursor:pointer"><circle cx="'+m[4]+'" cy="'+m[5]+'" r="12" fill="#173a38" stroke="#2EC4B6" stroke-width="3"/><text x="'+m[4]+'" y="'+(m[5]+4)+'" fill="#EDEAE4" font-size="11" text-anchor="middle">'+(k+1)+'</text></g>';}).join("")+'</svg></div>'+
    '<div class="chips" id="moChips">'+MO.map(function(m,k){return '<button data-v="'+k+'">'+(k+1)+'. '+m[0]+'</button>';}).join("")+'</div><div class="tree-node" id="moOut" aria-live="polite">Tap a glowing motor or a chip.</div>');
  var mc=H.chipGroup($("moChips"),function(k){var m=MO[+k]; $("moOut").innerHTML="<b>"+m[0]+"</b><br>Job: "+m[1]+"<br>Type: "+m[2]+"<br>⚠️ What fails: "+m[3];});
  each($("moSvg").querySelectorAll("g[data-k]"),function(g){g.addEventListener("click",function(){mc.pick(g.getAttribute("data-k"));});});

  /* Action: 3-column worksheet */
  var cols=[1,2,3].map(function(n){return '<div class="widget" style="margin:8px 0"><span class="wtitle">Motor '+n+'</span>'+EW.txt("a16n"+n,"Which motor",n===1?"Condenser fan":n===2?"Blower":"Inducer")+
    '<div class="grid3">'+EW.fld("a16v"+n,"Volts","")+EW.sel("a16ph"+n,"Phase",["1","3"])+EW.txt("a16hp"+n,"HP","")+EW.fld("a16rpm"+n,"RPM","")+EW.fld("a16fla"+n,"FLA","")+EW.sel("a16rot"+n,"Rotation",["CW","CCW","Reversible"])+'</div>'+
    EW.sel("a16t"+n,"Motor type",["PSC","ECM","Shaded-pole","Other"])+'<p class="result-big" id="a16p'+n+'" aria-live="polite"></p></div>';}).join("");
  S("w-action","Nameplate hunt worksheet",cols+'<div class="grid2">'+EW.fld("a16uf","Capacitor µF","")+EW.fld("a16cv","Capacitor volts","")+'</div><p class="wnote">Copy the label only. Don\'t touch the capacitor terminals.</p>');
  var ids=["a16uf","a16cv"]; [1,2,3].forEach(function(n){ids=ids.concat(["a16n"+n,"a16v"+n,"a16ph"+n,"a16hp"+n,"a16rpm"+n,"a16fla"+n,"a16rot"+n,"a16t"+n]);});
  EW.keep(ids,function(){[1,2,3].forEach(function(n){var r=v("a16rpm"+n), e=$("a16p"+n);
    if(!(r>0)){e.textContent="Enter rpm to estimate poles.";return;}
    var syncs=[900,1200,1800,3600].filter(function(s){return s>r;}), s=syncs[0];
    e.textContent=s?"Sync "+fmt(s,0)+" rpm → poles = 7,200 ÷ "+fmt(s,0)+" = "+(7200/s):"Above 3,600 rpm: check the reading.";});});
})();
