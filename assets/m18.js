/* Module 18 widgets: Electrical Troubleshooting Fundamentals */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: receipts */
  S("w-hook","Guessing costs money",
    '<div class="grid2"><div class="tree-node" style="border-color:#ff6b5b"><b>🧾 Parts swapper</b><br>Contactor, capacitor, thermostat<br><span class="big-num no">$380</span><br>2 hours · still broken</div>'+
    '<div class="tree-node" style="border-color:#2EC4B6"><b>🧾 Method</b><br>1 fuse, 1 wire repair<br><span class="big-num ok">$12</span><br>15 minutes · fixed</div></div>'+
    '<button type="button" id="h18btn">How?</button><ol id="h18list" hidden><li><a href="#s1">Electrical Test Equipment</a></li><li><a href="#s2">Electrical Diagrams</a></li><li><a href="#s3">Electrical Troubleshooting Process</a></li><li><a href="#s4">Electrical Troubleshooting Strategies</a></li></ol>');
  $("h18btn").addEventListener("click",function(){$("h18list").hidden=false;});

  /* S1: virtual DMM + live-dead-live drill */
  var DIAL=["V DC","V AC","Ω","Continuity","Clamp A","µF"];
  var SC=[["Check a 9 V battery","V DC","A battery makes DC. Use V DC."],
    ["Check a fuse with power off and locked out","Continuity","Continuity (or Ω) on a de-energized part. Beep = good fuse."],
    ["Read amps on a condenser fan lead","Clamp A","Clamp around ONE wire. No need to break the circuit."],
    ["Zach checks 240 V at the disconnect","V AC","Building power is AC. (Zach takes live readings, not Ian.)"],
    ["Check a run capacitor after Zach discharges it","µF","Capacitance mode reads microfarads."]];
  var WHY={"Ω":"Ohms/continuity on a live circuit gives false readings and can destroy the meter.","Continuity":"Ohms/continuity on a live circuit gives false readings and can destroy the meter.","Clamp A":"The clamp reads current, not voltage or resistance.","µF":"Capacitance mode is only for a discharged, disconnected capacitor.","V DC":"This isn't a DC source.","V AC":"This isn't AC (or isn't a voltage reading)."};
  S("w-s1","Virtual DMM",
    '<div class="tree-node" id="dmmCard"></div><div class="svgbox"><svg viewBox="0 0 320 150" role="img" aria-label="Meter dial"><rect x="100" y="5" width="120" height="140" rx="14" fill="#262b33" stroke="#9AA0A6"/><rect x="115" y="15" width="90" height="30" rx="4" fill="#0f1114"/><text id="dmmDisp" x="160" y="36" fill="#2EC4B6" font-size="15" text-anchor="middle" font-family="monospace">----</text><circle cx="160" cy="100" r="30" fill="#1e2b38" stroke="#59616c"/><line id="dmmPtr" x1="160" y1="100" x2="160" y2="74" stroke="#ff9f43" stroke-width="4" stroke-linecap="round"/></svg></div>'+
    '<div class="chips" id="dmmDial">'+DIAL.map(function(d){return '<button data-v="'+d+'">'+d+'</button>';}).join("")+'</div><div class="ch-fb" id="dmmFb" aria-live="polite"></div><div class="row"><button type="button" class="secondary" id="dmmNext">Next scenario →</button></div>'+
    '<p class="lbl" style="margin-top:16px"><b>Live-dead-live drill</b>: tap the three steps in order.</p><div class="chips" id="ldl"></div><p class="status" id="ldlOut" aria-live="polite"></p>');
  var sci=0;
  function dmmShow(){ $("dmmCard").innerHTML="<b>Scenario "+(sci+1)+" of "+SC.length+":</b> "+SC[sci][0]; $("dmmFb").className="ch-fb"; $("dmmDisp").textContent="----";
    each($("dmmDial").querySelectorAll("button"),function(b){b.setAttribute("aria-pressed","false");b.classList.remove("right","wrong");}); }
  each($("dmmDial").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){var d=b.getAttribute("data-v"), k=DIAL.indexOf(d), ok=d===SC[sci][1]||(sci===1&&d==="Ω");
    $("dmmPtr").setAttribute("transform","rotate("+(-75+k*30)+" 160 100)"); b.classList.add(ok?"right":"wrong");
    $("dmmDisp").textContent=ok?["9.42 V","OL→beep","1.8 A","242 V","4.9 µF"][sci].replace("OL→beep","0.2 Ω ♪"):"⚠";
    var fb=$("dmmFb"); fb.className="ch-fb show "+(ok?"good":"bad"); fb.innerHTML=ok?"✓ "+SC[sci][2]:"✗ "+(WHY[d]||"Wrong function.")+" Try again.";});});
  $("dmmNext").addEventListener("click",function(){sci=(sci+1)%SC.length;dmmShow();}); dmmShow();
  var LDL=["Test meter on a known live source","Test the de-energized circuit (should read 0)","Test the known live source again"], ldlStep=0;
  function ldlRender(){var order=[2,0,1]; $("ldl").innerHTML=order.map(function(k){return '<button type="button" data-k="'+k+'">'+LDL[k]+'</button>';}).join("");
    each($("ldl").querySelectorAll("button"),function(b){b.addEventListener("click",function(){var k=+b.getAttribute("data-k");
      if(k===ldlStep){b.classList.add("right");b.disabled=true;ldlStep++; $("ldlOut").innerHTML=ldlStep===3?'<span class="ok">✓ Live, dead, live. Proven safe, and the meter proven working.</span>':"Good. Next step?";}
      else{ $("ldlOut").innerHTML='<span class="no">Not yet. Step '+(ldlStep+1)+' comes first.</span>'; }});});}
  ldlRender();

  /* S2: symbols + find it */
  var SYM={"NO contacts":'<line x1="10" y1="20" x2="30" y2="20" stroke="#EDEAE4" stroke-width="3"/><line x1="30" y1="8" x2="30" y2="32" stroke="#EDEAE4" stroke-width="3"/><line x1="44" y1="8" x2="44" y2="32" stroke="#EDEAE4" stroke-width="3"/><line x1="44" y1="20" x2="64" y2="20" stroke="#EDEAE4" stroke-width="3"/>',
    "NC contacts":'<line x1="10" y1="20" x2="30" y2="20" stroke="#EDEAE4" stroke-width="3"/><line x1="30" y1="8" x2="30" y2="32" stroke="#EDEAE4" stroke-width="3"/><line x1="44" y1="8" x2="44" y2="32" stroke="#EDEAE4" stroke-width="3"/><line x1="24" y1="34" x2="50" y2="6" stroke="#EDEAE4" stroke-width="3"/><line x1="44" y1="20" x2="64" y2="20" stroke="#EDEAE4" stroke-width="3"/>',
    "Motor":'<circle cx="37" cy="20" r="15" fill="none" stroke="#EDEAE4" stroke-width="3"/><text x="37" y="25" fill="#EDEAE4" font-size="14" text-anchor="middle">M</text>',
    "Coil":'<circle cx="37" cy="20" r="14" fill="none" stroke="#EDEAE4" stroke-width="3"/><text x="37" y="24" fill="#EDEAE4" font-size="10" text-anchor="middle">CC</text>',
    "Resistance / heater":'<path d="M5 20 L15 20 L20 8 L28 32 L36 8 L44 32 L52 8 L58 20 L68 20" fill="none" stroke="#EDEAE4" stroke-width="3"/>'};
  var s2=S("w-s2","Symbols, then find it",'<div class="chips" id="symChips">'+Object.keys(SYM).map(function(k,i){return '<button data-v="'+i+'" aria-label="Symbol '+(i+1)+'"><svg viewBox="0 0 74 40" width="60" height="32">'+SYM[k]+'</svg></button>';}).join("")+'</div><p class="status" id="symOut">Tap a symbol to name it.</p>'+
    '<p class="lbl" style="margin-top:12px"><b>Find it</b>: <span id="fiAsk"></span></p><div class="svgbox" style="overflow:auto"><svg id="fiSvg" viewBox="0 0 320 170" style="min-width:300px" role="img" aria-label="Ladder diagram"></svg></div><p class="status" id="fiOut" aria-live="polite"></p>');
  H.chipGroup($("symChips"),function(i){$("symOut").textContent=Object.keys(SYM)[+i];});
  var parts=[["HPS","High-pressure switch (NC)",60,30,"NC contacts"],["LPS","Low-pressure switch (NC)",130,30,"NC contacts"],["CC","Contactor coil",250,30,"Coil"],["COMP","Compressor motor",120,95,"Motor"],["OFM","Outdoor fan motor",220,95,"Motor"],["CH","Crankcase heater",140,145,"Resistance / heater"]];
  var asks=[0,4,2,5,3,1], ai=0;
  function fi(){var g='<line x1="15" y1="10" x2="15" y2="165" stroke="#9AA0A6" stroke-width="2"/><line x1="305" y1="10" x2="305" y2="165" stroke="#9AA0A6" stroke-width="2"/>';
    [30,95,145].forEach(function(y){g+='<line x1="15" y1="'+y+'" x2="305" y2="'+y+'" stroke="#59616c" stroke-width="2"/>';});
    parts.forEach(function(p,k){g+='<g data-k="'+k+'" style="cursor:pointer"><rect x="'+(p[2]-6)+'" y="'+(p[3]-22)+'" width="86" height="44" fill="#0f1114"/><g transform="translate('+(p[2]-0)+' '+(p[3]-20)+')">'+SYM[p[4]]+'</g><text x="'+(p[2]+37)+'" y="'+(p[3]+30)+'" fill="#9AA0A6" font-size="9" text-anchor="middle">'+p[0]+'</text></g>';});
    $("fiSvg").innerHTML=g; $("fiAsk").textContent="Tap the "+parts[asks[ai]][1]+".";
    each($("fiSvg").querySelectorAll("g[data-k]"),function(e){e.addEventListener("click",function(){var k=+e.getAttribute("data-k");
      if(k===asks[ai]){ai++; $("fiOut").innerHTML='<span class="ok">✓ That\'s the '+parts[k][0]+'.</span>'; if(ai>=asks.length){ai=0;$("fiOut").innerHTML='<span class="ok">✓ All found! Starting over.</span>';} $("fiAsk").textContent="Tap the "+parts[asks[ai]][1]+".";}
      else $("fiOut").innerHTML='<span class="no">That\'s the '+parts[k][1]+'. Try again.</span>';});});}
  fi();

  /* S3: order puzzle */
  var s3=S("w-s3","Put the seven steps in order","");
  EW.orderPuzzle(s3,["Gather info","Observe","Check power","Isolate the circuit","Test the suspect part","Repair or replace","Verify"],
    ["What happened, when, thermostat settings, fault codes.","Burn marks, hum, smell, tripped breaker, water.","Right voltage at the unit? Most \u201cdead\u201d units are power problems.","Which rung or part on the diagram isn't doing its job.","Voltage across it while it should run (Zach), or ohms with power locked out.","Correct matching part.","Full cycle, readings, and ask WHY it failed."]);

  /* S4: decision tree + hopscotch + FLA */
  var TREE={start:{q:"Outdoor unit not running. Thermostat calling for cooling. 24 V between Y and C at the outdoor unit?",a:[["Yes, 24 V",'hps'],["No, 0 V","fuse"]]},
    fuse:{q:"24 V between R and C at the furnace board?",a:[["Yes","wire"],["No","fuse2"]]},
    wire:{end:"Fault: open thermostat wire between the furnace and the outdoor unit (or the thermostat isn't closing Y). Check the wire run.",ok:false},
    fuse2:{end:"Fault: blown low-voltage fuse or bad transformer. Find out why the fuse blew (rubbed wire!).",ok:false},
    hps:{q:"Zach measures voltage across the HPS. Reading?",a:[["24 V across it","hpsopen"],["About 0 V","coil"]]},
    hpsopen:{end:"✓ Actual fault: the high-pressure switch is OPEN (full voltage across an open switch). Dirty condenser coil tripped it.",ok:true},
    coil:{q:"24 V across the contactor coil, but it doesn't pull in?",a:[["Yes","badcoil"]]},
    badcoil:{end:"Fault: open contactor coil (check ohms with power locked out).",ok:false}};
  S("w-s4","Troubleshooting decision tree",
    '<div id="dtWrap"></div><div class="row"><button type="button" class="secondary" id="dtReset">↺ Start over</button></div>'+
    '<p class="lbl" style="margin-top:16px"><b>Hopscotch</b>: one lead on C, move the other along the 24 V rung.</p><div class="svgbox"><svg id="hsSvg" viewBox="0 0 320 90" role="img" aria-label="Probe moving along a rung"></svg></div><div class="row"><button type="button" id="hsMove">Move probe →</button><button type="button" class="secondary" id="hsReset">↺</button></div><p class="status" id="hsOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:16px"><b>Amp check vs. nameplate</b></p><div class="grid3">'+EW.fld("faA","Measured A",6.2)+EW.fld("faF","Nameplate FLA",5.8)+EW.fld("faS","Service factor",1.15)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro" id="faRo"><span class="k">% of FLA</span><span class="v" id="faP">–</span></div><div class="ro"><span class="k">SF limit</span><span class="v" id="faL">–</span></div></div><p class="status" id="faMsg"></p>');
  function dt(){var path=["start"]; function render(){var h=""; path.forEach(function(id,k){var n=TREE[id], last=k===path.length-1;
      if(n.end){h+='<div class="tree-node end" style="border-color:'+(n.ok?"#2EC4B6":"#ff9f43")+'">'+n.end+'</div>';return;}
      h+='<div class="tree-node'+(last?"":" done")+'">'+n.q+(last?'<div class="chips" style="margin-top:6px">'+n.a.map(function(a){return '<button type="button" data-go="'+a[1]+'">'+a[0]+'</button>';}).join("")+'</div>':'')+'</div>';});
      $("dtWrap").innerHTML=h; each($("dtWrap").querySelectorAll("[data-go]"),function(b){b.addEventListener("click",function(){path.push(b.getAttribute("data-go"));render();});});}
    render(); $("dtReset").onclick=function(){path=["start"];render();};}
  dt();
  var pts=[["R",24],["after T-stat",24],["after HPS",0],["after LPS",0],["coil (CC)",0]], hp=0;
  function hs(){var g='<line x1="20" y1="45" x2="300" y2="45" stroke="#59616c" stroke-width="4"/>';
    pts.forEach(function(p,k){var x=30+k*65; g+='<circle cx="'+x+'" cy="45" r="7" fill="'+(k<=hp?(p[1]?"#2EC4B6":"#ff6b5b"):"#1e2b38")+'" stroke="#9AA0A6"/><text x="'+x+'" y="75" fill="#9AA0A6" font-size="9" text-anchor="middle">'+p[0]+'</text>';});
    g+='<text x="'+(30+hp*65)+'" y="22" fill="#ff9f43" font-size="12" text-anchor="middle">▼ '+pts[hp][1]+' V</text>'; $("hsSvg").innerHTML=g;
    $("hsOut").textContent=hp>=2?"Reading dropped to 0 V between \u201cafter T-stat\u201d and \u201cafter HPS.\u201d The fault is the HPS.":"Still 24 V. Keep moving.";}
  $("hsMove").addEventListener("click",function(){if(hp<2)hp++;hs();}); $("hsReset").addEventListener("click",function(){hp=0;hs();}); hs();
  function fa(){var a=v("faA"),f=v("faF"),s=v("faS"),p=a/f*100,l=f*s; $("faP").textContent=isFinite(p)?fmt(p,0)+"%":"–"; $("faL").textContent=isFinite(l)?fmt(l,1)+" A":"–";
    var band=!isFinite(p)?null:a>l?"band-r":p>100?"band-y":p<70?"band-y":"band-g"; EW.setBand($("faRo"),band);
    $("faMsg").textContent=!band?"":a>l?"Over the service-factor limit: look for a dragging motor, bad capacitor, or low voltage.":p>100?"Over FLA but within service factor. Worth watching; check filter and capacitor.":p<70?"Low: possibly unloaded or a slipping drive.":"Normal range.";}
  ["faA","faF","faS"].forEach(function(id){$(id).addEventListener("input",fa);}); fa();

  /* Action */
  var aw=S("w-action","Practice log","");
  EW.checklist(aw,["Meter checked on a 9 V battery (known source)","Said live-dead-live out loud on a real job while Zach measured","Did it again on another reading"],"a18ldl");
  var x=document.createElement("div");
  x.innerHTML=EW.area("a18plan","My half-splitting test plan (outdoor unit won't start)","1. Measure Y–C at the outdoor unit: 24 V = good, 0 V = problem upstream…")+EW.chk("a18rev","Have Zach review my plan")+
    '<div class="grid2">'+EW.sel("a18fuse","Spare fuse continuity",[["","–"],["beep","Beep (good)"],["open","No beep / OL (blown)"]])+EW.sel("a18wire","Spare wire continuity",[["","–"],["beep","Beep (good)"],["open","No beep / OL (broken)"]])+'</div>';
  aw.appendChild(x); EW.keep(["a18plan","a18rev","a18fuse","a18wire"]);
})();
