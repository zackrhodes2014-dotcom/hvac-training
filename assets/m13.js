/* Module 13 widgets: Basic Electricity */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, each=EW.each, S=EW.slot;

  /* Hook: what is Zach checking? */
  var hk=S("w-hook","The fan that wouldn't spin",
    '<div class="svgbox"><svg viewBox="0 0 320 170" role="img" aria-label="Condenser with a stopped fan">'+
    '<rect x="70" y="40" width="180" height="110" rx="8" fill="#2a3038" stroke="#4a525d" stroke-width="2"/>'+
    '<circle cx="160" cy="95" r="42" fill="#11161c" stroke="#59616c" stroke-width="2"/>'+
    '<g id="h13fan"><path d="M160 95 L160 58 Q176 70 160 95 Z M160 95 L192 113 Q172 120 160 95 Z M160 95 L128 113 Q140 98 160 95 Z" fill="#9AA0A6"/></g>'+
    '<text x="160" y="30" fill="#ff6b5b" font-size="13" text-anchor="middle" font-weight="700">Compressor hums… fan stuck</text></svg></div>'+
    '<button type="button" id="h13btn">🔍 What\'s Zach checking?</button><div id="h13chips" class="chips" hidden style="margin-top:10px">'+
    '<a class="tpill" href="#s1">Voltage (E)</a><a class="tpill" href="#s1">Current (I)</a><a class="tpill" href="#s1">Resistance (R)</a><a class="tpill" href="#s3">Open circuit?</a></div>');
  $("h13btn").addEventListener("click",function(){$("h13chips").hidden=!$("h13chips").hidden;});

  /* S1: Ohm's law calculator */
  S("w-s1","Ohm's law calculator (E = I × R)",
    '<p class="lbl">Solve for:</p><div class="chips" id="ohmPick"><button data-v="I">Current I (amps)</button><button data-v="E">Voltage E (volts)</button><button data-v="R">Resistance R (ohms)</button></div>'+
    '<div class="grid3"><div class="fld"><label for="ohmE">Volts (E)</label><input type="number" inputmode="decimal" step="any" id="ohmE" value="240"></div>'+
    '<div class="fld"><label for="ohmI">Amps (I)</label><input type="number" inputmode="decimal" step="any" id="ohmI" value="10"></div>'+
    '<div class="fld"><label for="ohmR">Ohms (R)</label><input type="number" inputmode="decimal" step="any" id="ohmR" value="24"></div></div>'+
    '<p class="result-big" id="ohmOut" aria-live="polite"></p>'+
    '<div class="svgbox"><svg viewBox="0 0 320 90" role="img" aria-label="Hose analogy"><rect x="10" y="38" width="300" height="16" rx="8" fill="#1e2b38"/>'+
    '<rect id="hoseP" x="10" y="38" width="10" height="16" rx="8" fill="#5ab4ff"/><rect id="hoseK" x="200" y="30" width="14" height="32" rx="4" fill="#ff9f43"/>'+
    '<text x="10" y="24" fill="#9AA0A6" font-size="11">Pressure = volts</text><text x="150" y="80" fill="#9AA0A6" font-size="11" id="hoseF">Flow = amps</text><text x="215" y="24" fill="#ff9f43" font-size="11">Kink = ohms</text></svg></div>'+
    '<p class="wnote">Pick what you want to find. That box becomes the answer; type the other two.</p>');
  var solve="I";
  function ohm(){
    var E=v("ohmE"),I=v("ohmI"),R=v("ohmR"),out=$("ohmOut");
    ["E","I","R"].forEach(function(k){$("ohm"+k).readOnly=(k===solve);});
    if(solve==="I"){ I=E/R; if(isFinite(I)&&R>0){$("ohmI").value=+I.toFixed(3); out.textContent="I = "+fmt(E,0)+" ÷ "+fmt(R,2)+" = "+fmt(I,2)+" A";} else out.textContent="Enter volts and a resistance above 0."; }
    if(solve==="E"){ E=I*R; if(isFinite(E)){$("ohmE").value=+E.toFixed(3); out.textContent="E = "+fmt(I,2)+" × "+fmt(R,2)+" = "+fmt(E,1)+" V";} else out.textContent="Enter amps and ohms."; }
    if(solve==="R"){ R=E/I; if(isFinite(R)&&I>0){$("ohmR").value=+R.toFixed(3); out.textContent="R = "+fmt(E,0)+" ÷ "+fmt(I,2)+" = "+fmt(R,2)+" Ω";} else out.textContent="Enter volts and amps above 0."; }
    var p=Math.max(4,Math.min(300,E/480*300)); $("hoseP").setAttribute("width",isFinite(p)?p:4);
    var k=Math.max(6,Math.min(30,R/100*30)); $("hoseK").setAttribute("height",isFinite(k)?k:6); $("hoseK").setAttribute("y",46-(isFinite(k)?k:6)/2);
    $("hoseF").textContent="Flow = "+(isFinite(I)?fmt(I,2):"–")+" A";
  }
  var cg=H.chipGroup($("ohmPick"),function(val){solve=val;ohm();}); cg.pick("I");
  ["ohmE","ohmI","ohmR"].forEach(function(id){$(id).addEventListener("input",function(){if(id!=="ohm"+solve)ohm();});});

  /* S2: material sorter + DC vs AC */
  var s2=S("w-s2","Sort the materials","");
  EW.sorter(s2,["Conductor","Insulator","Semiconductor"],[
    {label:"Copper wire",bin:0,why:"Copper's loose outer electrons carry current easily."},
    {label:"Rubber glove",bin:1,why:"Rubber resists current. That's why lineman's gloves are rubber."},
    {label:"Aluminum fin",bin:0,why:"Aluminum is a conductor (it also moves heat well)."},
    {label:"Silicon chip",bin:2,why:"Silicon is a semiconductor, the base of diodes and transistors (Module 15)."},
    {label:"Plastic wire jacket",bin:1,why:"Insulation keeps current inside the wire where it belongs."},
    {label:"Glass",bin:1,why:"Glass is an insulator."},
    {label:"Silver contact",bin:0,why:"Silver is the best conductor of all; it's used on relay contacts."}]);
  var dc=document.createElement("div");
  dc.innerHTML='<p class="lbl" style="margin-top:14px">Compare current types:</p><div class="chips" id="acdc"><button data-v="dc">DC (battery)</button><button data-v="ac">AC (60 Hz)</button></div>'+
    '<div class="svgbox"><svg viewBox="0 0 320 110" role="img" aria-label="Current versus time"><line x1="10" y1="55" x2="310" y2="55" stroke="#343b45"/><path id="acdcPath" fill="none" stroke="#2EC4B6" stroke-width="3"/></svg></div><p class="wnote" id="acdcNote"></p>';
  s2.appendChild(dc);
  H.chipGroup($("acdc"),function(k){
    var d="";
    if(k==="dc"){d="M10 30 L310 30"; $("acdcNote").textContent="DC: one direction, steady. Batteries make DC.";}
    else{for(var x=0;x<=300;x+=2){d+=(x?" L":"M")+(10+x)+" "+(55-35*Math.sin(x/300*2*Math.PI*3)).toFixed(1);} $("acdcNote").textContent="AC: reverses direction over and over. In the U.S., 60 full cycles every second (60 Hz). The graph shows 3 cycles = 1/20 of a second.";}
    $("acdcPath").setAttribute("d",d);
  }).pick("ac");

  /* S3: series / parallel builder */
  S("w-s3","Series / parallel circuit builder",
    '<div class="chips" id="spMode"><button data-v="series">Series</button><button data-v="parallel">Parallel</button></div>'+
    '<div class="grid3"><div class="fld"><label for="spV">Supply volts</label><input type="number" inputmode="decimal" step="any" id="spV" value="120"></div>'+
    '<div class="fld"><label for="spR1">Bulb 1 (Ω)</label><input type="number" inputmode="decimal" step="any" id="spR1" value="10"></div>'+
    '<div class="fld"><label for="spR2">Bulb 2 (Ω)</label><input type="number" inputmode="decimal" step="any" id="spR2" value="20"></div></div>'+
    '<label class="toggle"><input type="checkbox" id="spSw" checked> Switch closed</label>'+
    '<div class="row"><label class="toggle"><input type="checkbox" id="spCut1"> ✂️ Cut wire at bulb 1</label><label class="toggle"><input type="checkbox" id="spCut2"> ✂️ Cut wire at bulb 2</label></div>'+
    '<div class="svgbox"><svg id="spSvg" viewBox="0 0 320 150" role="img" aria-label="Circuit diagram"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Total R</span><span class="v" id="spRt">–</span></div><div class="ro"><span class="k">Total I</span><span class="v" id="spIt">–</span></div>'+
    '<div class="ro"><span class="k">Bulb 1</span><span class="v" id="spI1">–</span></div><div class="ro"><span class="k">Bulb 2</span><span class="v" id="spI2">–</span></div></div>');
  var spm="series";
  function bulb(x,y,on,lvl){return '<circle cx="'+x+'" cy="'+y+'" r="13" fill="'+(on?"rgba(255,214,102,"+(0.35+0.65*lvl)+")":"#1e2b38")+'" stroke="#9AA0A6" stroke-width="2"/>'+(on?'<circle cx="'+x+'" cy="'+y+'" r="'+(16+8*lvl)+'" fill="none" stroke="rgba(255,214,102,.35)" stroke-width="3"/>':'');}
  function sp(){
    var V=v("spV"),R1=v("spR1"),R2=v("spR2"),sw=$("spSw").checked,c1=$("spCut1").checked,c2=$("spCut2").checked;
    var Rt,I1=0,I2=0,It=0;
    if(spm==="series"){ Rt=R1+R2; if(sw&&!c1&&!c2&&Rt>0){It=V/Rt;I1=I2=It;} }
    else{ Rt=(R1*R2)/(R1+R2); if(sw){ if(!c1&&R1>0)I1=V/R1; if(!c2&&R2>0)I2=V/R2; } It=I1+I2;
      if(c1&&!c2)Rt=R2; if(c2&&!c1)Rt=R1; if(c1&&c2)Rt=Infinity; }
    $("spRt").textContent=isFinite(Rt)?fmt(Rt,2)+" Ω":"open (∞)"; $("spIt").textContent=fmt(It,2)+" A";
    $("spI1").textContent=fmt(I1,2)+" A"; $("spI2").textContent=fmt(I2,2)+" A";
    var mx=Math.max(I1,I2,0.0001), on=It>0, wc=on?"#2EC4B6":"#59616c", g="";
    g+='<rect x="18" y="55" width="22" height="40" rx="3" fill="#262b33" stroke="#9AA0A6"/><text x="29" y="80" fill="#EDEAE4" font-size="11" text-anchor="middle">'+(isFinite(V)?V:"")+'V</text>';
    g+='<line x1="29" y1="55" x2="29" y2="20" stroke="'+wc+'" stroke-width="4"/><line x1="29" y1="95" x2="29" y2="130" stroke="'+wc+'" stroke-width="4"/>';
    g+='<line x1="29" y1="20" x2="70" y2="20" stroke="'+wc+'" stroke-width="4"/>'+(sw?'<line x1="70" y1="20" x2="100" y2="20" stroke="'+wc+'" stroke-width="4"/>':'<line x1="70" y1="20" x2="96" y2="6" stroke="#ff9f43" stroke-width="4"/>')+'<text x="85" y="40" fill="#9AA0A6" font-size="10" text-anchor="middle">switch</text>';
    if(spm==="series"){
      g+='<path d="M100 20 H180 M180 20 H300 V130 H29" stroke="'+wc+'" stroke-width="4" fill="none"/>';
      g+=bulb(160,20,I1>0,I1/mx)+bulb(250,130,I2>0,I2/mx);
      if(c1) g+='<text x="160" y="50" fill="#ff6b5b" font-size="16" text-anchor="middle">✂️ open</text>'; if(c2) g+='<text x="250" y="112" fill="#ff6b5b" font-size="16" text-anchor="middle">✂️ open</text>';
      g+='<text x="160" y="4" dy="8" fill="#9AA0A6" font-size="10" text-anchor="middle">bulb 1</text><text x="250" y="150" fill="#9AA0A6" font-size="10" text-anchor="middle">bulb 2</text>';
    } else {
      g+='<path d="M100 20 H300 V130 H29" stroke="'+wc+'" stroke-width="4" fill="none"/>';
      g+='<path d="M170 20 V130" stroke="'+(I1>0?"#2EC4B6":"#59616c")+'" stroke-width="4"/><path d="M240 20 V130" stroke="'+(I2>0?"#2EC4B6":"#59616c")+'" stroke-width="4"/>';
      g+=bulb(170,75,I1>0,I1/mx)+bulb(240,75,I2>0,I2/mx);
      if(c1) g+='<text x="170" y="112" fill="#ff6b5b" font-size="14" text-anchor="middle">✂️</text>'; if(c2) g+='<text x="240" y="112" fill="#ff6b5b" font-size="14" text-anchor="middle">✂️</text>';
    }
    $("spSvg").innerHTML=g;
  }
  H.chipGroup($("spMode"),function(m){spm=m;sp();}).pick("series");
  ["spV","spR1","spR2","spSw","spCut1","spCut2"].forEach(function(id){$(id).addEventListener("input",sp);$(id).addEventListener("change",sp);});

  /* S4: electromagnet */
  S("w-s4","Electromagnet demo",
    '<div class="svgbox"><svg id="emSvg" viewBox="0 0 320 130" role="img" aria-label="Nail electromagnet with paper clips"></svg></div>'+
    '<label class="toggle"><input type="checkbox" id="emOn"> ⚡ Switch on (send current through the coil)</label>'+
    '<label class="lbl" for="emT">Turns of wire: <b id="emTv">20</b></label><input type="range" id="emT" min="5" max="60" step="5" value="20">'+
    '<p class="status" id="emOut" aria-live="polite"></p>');
  function em(){
    var on=$("emOn").checked, t=+$("emT").value; $("emTv").textContent=t;
    var clips=on?Math.round(t/6):0, g='<rect x="60" y="40" width="200" height="16" rx="3" fill="#9AA0A6"/><polygon points="260,40 290,48 260,56" fill="#9AA0A6"/>';
    var n=Math.round(t/3); for(var k=0;k<n;k++){var x=70+k*(180/n); g+='<ellipse cx="'+x.toFixed(1)+'" cy="48" rx="3" ry="12" fill="none" stroke="'+(on?"#ff9f43":"#b87333")+'" stroke-width="2"/>';}
    g+='<line x1="60" y1="48" x2="30" y2="20" stroke="#b87333" stroke-width="2"/><line x1="60" y1="48" x2="30" y2="80" stroke="#b87333" stroke-width="2"/><rect x="8" y="10" width="22" height="80" rx="3" fill="#262b33" stroke="#9AA0A6"/>';
    for(var c=0;c<10;c++){var stuck=c<clips; var cx=stuck?(100+c*16):(70+c*22), cy=stuck?66:118;
      g+='<rect x="'+cx+'" y="'+(cy-4)+'" width="'+(stuck?6:16)+'" height="'+(stuck?16:6)+'" rx="3" fill="none" stroke="#2EC4B6" stroke-width="2"/>';}
    $("emSvg").innerHTML=g;
    $("emOut").textContent=on?clips+" paper clips stuck. More turns = stronger field.":"No current, no magnetism. The clips fall off.";
  }
  $("emOn").addEventListener("change",em); $("emT").addEventListener("input",em); em();

  /* S5: hand-crank generator */
  S("w-s5","Hand-crank generator",
    '<div class="svgbox"><svg id="genSvg" viewBox="0 0 320 170" role="img" aria-label="Generator and sine wave graph"></svg></div>'+
    '<label class="lbl" for="genRpm">Crank speed: <b id="genRpmV">3600</b> rpm (2-pole)</label><input type="range" id="genRpm" min="600" max="4200" step="60" value="3600">'+
    '<label class="toggle"><input type="checkbox" id="gen3"> Show 3-phase (three waves, 120° apart)</label>'+
    '<div class="readouts"><div class="ro"><span class="k">Frequency</span><span class="v" id="genHz">60 Hz</span></div><div class="ro"><span class="k">Cycles shown</span><span class="v" id="genCyc">–</span></div></div>'+
    '<p class="wnote">For a 2-pole generator, Hz = rpm ÷ 60. 3,600 rpm makes 60 Hz. The graph shows a 1/20-second window.</p>');
  var ang=0, last=0;
  function genDraw(){
    var rpm=+$("genRpm").value, hz=rpm/60, three=$("gen3").checked; $("genRpmV").textContent=rpm; $("genHz").textContent=fmt(hz,0)+" Hz";
    $("genCyc").textContent=fmt(hz/20,1);
    var g='<circle cx="45" cy="85" r="34" fill="none" stroke="#59616c" stroke-width="2"/><text x="8" y="90" fill="#ff6b5b" font-weight="800">N</text><text x="74" y="90" fill="#5ab4ff" font-weight="800">S</text>';
    g+='<line x1="'+(45-28*Math.cos(ang)).toFixed(1)+'" y1="'+(85-28*Math.sin(ang)).toFixed(1)+'" x2="'+(45+28*Math.cos(ang)).toFixed(1)+'" y2="'+(85+28*Math.sin(ang)).toFixed(1)+'" stroke="#ff9f43" stroke-width="5" stroke-linecap="round"/>';
    g+='<line x1="100" y1="85" x2="312" y2="85" stroke="#343b45"/>';
    var cols=["#2EC4B6","#ff9f43","#b388ff"];
    for(var ph=0;ph<(three?3:1);ph++){var d="";for(var x=0;x<=210;x+=2){var t=x/210*(1/20);d+=(x?" L":"M")+(102+x)+" "+(85-60*Math.sin(2*Math.PI*hz*t-ph*2*Math.PI/3)).toFixed(1);}
      g+='<path d="'+d+'" fill="none" stroke="'+cols[ph]+'" stroke-width="2.5"/>';}
    $("genSvg").innerHTML=g;
  }
  function genTick(ts){ if(!last) last=ts; var dt=(ts-last)/1000; last=ts; var rpm=+$("genRpm").value;
    if(!H.reduceMotion) ang+=dt*(rpm/60)*2*Math.PI/40; /* slowed 40x so you can see it */ genDraw(); requestAnimationFrame(genTick);}
  $("genRpm").addEventListener("input",genDraw); $("gen3").addEventListener("change",genDraw); genDraw(); requestAnimationFrame(genTick);

  /* S6: transformer */
  S("w-s6","Transformer calculator",
    '<div class="grid2">'+EW.fld("trVp","Primary volts",240)+EW.fld("trVA","VA rating",40)+EW.fld("trNp","Primary turns",1000)+EW.fld("trNs","Secondary turns",100)+'</div>'+
    EW.fld("trLoad","Connected 24 V load (VA)",22)+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Secondary volts</span><span class="v" id="trVs">–</span></div><div class="ro"><span class="k">Turns ratio</span><span class="v" id="trRatio">–</span></div>'+
    '<div class="ro"><span class="k">Max secondary amps</span><span class="v" id="trIs">–</span></div><div class="ro"><span class="k">Primary amps (full load)</span><span class="v" id="trIp">–</span></div><div class="ro" id="trLoadRo"><span class="k">Load vs rating</span><span class="v" id="trPct">–</span></div></div>');
  function tr(){
    var Vp=v("trVp"),Np=v("trNp"),Ns=v("trNs"),VA=v("trVA"),L=v("trLoad");
    var Vs=Vp*Ns/Np; $("trVs").textContent=isFinite(Vs)?fmt(Vs,1)+" V":"–";
    $("trRatio").textContent=(Np>0&&Ns>0)?(Np>=Ns?fmt(Np/Ns,2)+":1 step-down":"1:"+fmt(Ns/Np,2)+" step-up"):"–";
    $("trIs").textContent=(Vs>0&&VA>0)?fmt(VA/Vs,2)+" A":"–"; $("trIp").textContent=(Vp>0&&VA>0)?fmt(VA/Vp,2)+" A":"–";
    var pct=L/VA*100; $("trPct").textContent=isFinite(pct)?fmt(pct,0)+"%"+(pct>100?" OVERLOAD":""):"–";
    EW.setBand($("trLoadRo"),!isFinite(pct)?null:pct>100?"band-r":pct>80?"band-y":"band-g");
  }
  ["trVp","trNp","trNs","trVA","trLoad"].forEach(function(id){$(id).addEventListener("input",tr);}); tr();

  /* Action worksheet */
  var aw=S("w-action","Meter basics worksheet",
    '<div class="grid2">'+EW.fld("a13bat","9 V battery reading (V DC)","")+EW.fld("a13lead","Leads touching (Ω)","")+EW.fld("a13bulb","Bulb / resistor (Ω)","")+'</div>'+
    '<p class="lbl" style="margin-top:12px">Furnace control transformer (locked out):</p><div class="grid3">'+EW.fld("a13vp","Primary V","")+EW.fld("a13vs","Secondary V","")+EW.fld("a13va","VA","")+'</div>'+
    '<p class="result-big" id="a13out" aria-live="polite"></p>'+EW.chk("a13zach","Zach checked this"));
  EW.keep(["a13bat","a13lead","a13bulb","a13vp","a13vs","a13va","a13zach"],function(){
    var a=v("a13va")/v("a13vs"); $("a13out").textContent=isFinite(a)&&a>0?"Max secondary amps = "+fmt(v("a13va"),0)+" ÷ "+fmt(v("a13vs"),0)+" = "+fmt(a,2)+" A":"Enter secondary volts and VA to calculate max amps.";
  });
})();
