/* Module 15 widgets: Basic Electronics */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot;
  var CODES=[["1 flash","Ignition lockout (no flame after tries)"],["2 flashes","Pressure switch stuck closed"],["3 flashes","Pressure switch didn't close (vent, inducer, hose)"],["4 flashes","High limit open"],["5 flashes","Flame sensed with no call for heat"],["Steady on","Normal operation"]];

  /* Hook: blinking LED */
  S("w-hook","The blinking light",
    '<div class="svgbox"><svg viewBox="0 0 320 130" role="img" aria-label="Furnace control board with a blinking LED"><rect x="40" y="15" width="240" height="100" rx="8" fill="#1d4d3a" stroke="#2EC4B6" stroke-width="2"/>'+
    '<rect x="60" y="30" width="40" height="28" fill="#111" /><rect x="180" y="30" width="34" height="22" fill="#333" stroke="#777"/><rect x="225" y="30" width="34" height="22" fill="#333" stroke="#777"/>'+
    '<rect x="60" y="85" width="120" height="18" fill="#e8e0c8"/><text x="120" y="98" font-size="10" text-anchor="middle" fill="#111">R C W Y G</text>'+
    '<circle id="h15led" cx="240" cy="90" r="9" fill="#3a1010" stroke="#ff6b5b"/><text x="240" y="125" fill="#9AA0A6" font-size="10" text-anchor="middle">status LED</text></svg></div>'+
    '<button type="button" id="h15btn">🔎 Decode it</button><div id="h15chart" hidden><div class="table-wrap"><table style="min-width:0"><thead><tr><th>Flashes</th><th>Meaning (sample chart)</th></tr></thead><tbody>'+
    CODES.map(function(c,k){return '<tr'+(k===2?' style="background:#173a38;outline:2px solid #2EC4B6"':'')+'><td>'+c[0]+'</td><td>'+c[1]+'</td></tr>';}).join("")+'</tbody></table></div>'+
    '<p class="wnote">Sample chart for learning only. Every brand uses its own codes, so always read the chart on the door.</p></div>');
  var seq=[1,0,1,0,1,0,0,0,0,0], si=0;
  setInterval(function(){ $("h15led").setAttribute("fill",seq[si]?"#ff3b30":"#3a1010"); si=(si+1)%seq.length; },300);
  $("h15btn").addEventListener("click",function(){$("h15chart").hidden=!$("h15chart").hidden;});

  /* S1: diode + rectifier */
  S("w-s1","One-way valve: the diode",
    '<div class="chips" id="dView"><button data-v="diode">Diode + battery</button><button data-v="rect">Rectifier (AC → DC)</button></div>'+
    '<div id="dDiode"><div class="svgbox"><svg viewBox="0 0 320 120" role="img" aria-label="Battery, diode and bulb circuit"><path d="M40 30 H280 V95 H40 Z" fill="none" stroke="#59616c" stroke-width="4"/>'+
    '<rect x="25" y="45" width="30" height="36" fill="#262b33" stroke="#9AA0A6"/><text id="dPol" x="40" y="68" fill="#EDEAE4" font-size="13" text-anchor="middle">+ −</text>'+
    '<polygon points="140,18 140,42 165,30" fill="#2EC4B6"/><line x1="166" y1="16" x2="166" y2="44" stroke="#2EC4B6" stroke-width="4"/>'+
    '<circle id="dBulb" cx="270" cy="62" r="14" fill="#1e2b38" stroke="#9AA0A6" stroke-width="2"/><g id="dDots" class="flowdots"></g></svg></div>'+
    '<button type="button" id="dFlip">🔄 Flip the battery</button><p class="status" id="dOut" aria-live="polite"></p></div>'+
    '<div id="dRect" hidden><div class="chips" id="rMode"><button data-v="half">Half-wave (1 diode)</button><button data-v="full">Full-wave (bridge)</button></div><div class="svgbox"><svg id="rSvg" viewBox="0 0 320 150" role="img" aria-label="Input and output waveforms"></svg></div><p class="wnote">Top: AC in. Bottom: what comes out. Every bump goes one direction, so it’s DC (bumpy until a capacitor smooths it).</p></div>');
  var fwd=true, dt=0;
  function diode(){ $("dPol").textContent=fwd?"+ −":"− +"; $("dBulb").setAttribute("fill",fwd?"#ffd166":"#1e2b38");
    $("dOut").textContent=fwd?"Forward biased: positive to the P side. Current flows (after about 0.7 V is lost) and the bulb lights.":"Reverse biased: the diode blocks. The dots pile up and nothing flows."; }
  $("dFlip").addEventListener("click",function(){fwd=!fwd;diode();}); diode();
  (function anim(){ dt+=1; var g=""; for(var k=0;k<8;k++){ var p=fwd?((k*60+dt*2)%600):(k*8);
      var x,y; if(fwd){ if(p<240){x=40+p;y=30;} else if(p<305){x=280;y=30+(p-240);} else if(p<545){x=280-(p-305);y=95;} else {x=40;y=95-(p-545);} } else {x=100+k*4;y=30;}
      g+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="4"/>'; }
    $("dDots").innerHTML=g; requestAnimationFrame(anim); })();
  function rect(mode){ var g='<line x1="10" y1="40" x2="310" y2="40" stroke="#343b45"/><line x1="10" y1="115" x2="310" y2="115" stroke="#343b45"/>', a="", b="";
    for(var x=0;x<=300;x+=2){var s=Math.sin(x/300*2*Math.PI*3); a+=(x?" L":"M")+(10+x)+" "+(40-28*s).toFixed(1);
      var o=mode==="full"?Math.abs(s):Math.max(0,s); b+=(x?" L":"M")+(10+x)+" "+(115-28*o).toFixed(1);}
    g+='<path d="'+a+'" fill="none" stroke="#5ab4ff" stroke-width="2.5"/><path d="'+b+'" fill="none" stroke="#2EC4B6" stroke-width="2.5"/><text x="12" y="12" fill="#5ab4ff" font-size="11">AC in</text><text x="12" y="146" fill="#2EC4B6" font-size="11">DC out</text>';
    $("rSvg").innerHTML=g; }
  H.chipGroup($("rMode"),rect).pick("full");
  H.chipGroup($("dView"),function(k){$("dDiode").hidden=k!=="diode";$("dRect").hidden=k!=="rect";}).pick("diode");

  /* S2: thermistor + transistor + LED resistor */
  S("w-s2","Thermistor simulator (NTC 10k)",
    '<div class="svgbox"><svg id="thSvg" viewBox="0 0 320 160" role="img" aria-label="Resistance versus temperature curve"></svg></div>'+
    '<label class="lbl" for="thT">Temperature: <b id="thTv">77</b>°F</label><input type="range" id="thT" min="0" max="120" value="77">'+
    '<div class="readouts"><div class="ro"><span class="k">Resistance</span><span class="v" id="thR">–</span></div></div>'+
    '<p class="wnote">Typical 10 kΩ NTC sensor (β ≈ 3950): 10,000 Ω at 77°F. Real sensors have their own chart. Warmer → lower ohms.</p>'+
    '<p class="lbl" style="margin-top:14px"><b>Transistor as a switch</b></p><div class="svgbox"><svg viewBox="0 0 320 90" role="img" aria-label="Transistor switching a relay coil"><text x="10" y="50" fill="#9AA0A6" font-size="11">base</text><line id="tBase" x1="45" y1="45" x2="120" y2="45" stroke="#59616c" stroke-width="2"/><circle cx="140" cy="45" r="20" fill="none" stroke="#9AA0A6" stroke-width="2"/><line id="tCol" x1="150" y1="30" x2="250" y2="20" stroke="#59616c" stroke-width="6"/><rect id="tCoil" x="250" y="8" width="50" height="26" rx="4" fill="#1e2b38" stroke="#9AA0A6"/><text x="275" y="25" fill="#EDEAE4" font-size="10" text-anchor="middle">relay</text><text x="200" y="70" fill="#9AA0A6" font-size="10" id="tLbl">big current: off</text></svg></div>'+
    '<label class="toggle"><input type="checkbox" id="tOn"> Send a tiny base current</label>'+
    '<p class="lbl" style="margin-top:14px"><b>LED resistor calculator</b></p><div class="grid3">'+EW.fld("ledVs","Supply V",5)+EW.fld("ledVf","LED V",2)+EW.fld("ledI","LED current (A)",0.02)+'</div><p class="result-big" id="ledOut" aria-live="polite"></p>');
  function Rntc(F){var T=(F-32)*5/9+273.15; return 10000*Math.exp(3950*(1/T-1/298.15));}
  function th(){var F=+$("thT").value; $("thTv").textContent=F; $("thR").textContent=fmt(Rntc(F),0)+" Ω";
    var g='<line x1="30" y1="140" x2="310" y2="140" stroke="#343b45"/><line x1="30" y1="10" x2="30" y2="140" stroke="#343b45"/>', d="", max=Rntc(0);
    for(var f=0;f<=120;f+=2){d+=(f?" L":"M")+(30+f/120*280).toFixed(1)+" "+(140-Rntc(f)/max*125).toFixed(1);}
    g+='<path d="'+d+'" fill="none" stroke="#2EC4B6" stroke-width="2.5"/><circle cx="'+(30+F/120*280).toFixed(1)+'" cy="'+(140-Rntc(F)/max*125).toFixed(1)+'" r="6" fill="#ff9f43"/>'+
      '<text x="34" y="20" fill="#9AA0A6" font-size="10">ohms</text><text x="280" y="155" fill="#9AA0A6" font-size="10">°F →</text>';
    $("thSvg").innerHTML=g;}
  $("thT").addEventListener("input",th); th();
  $("tOn").addEventListener("change",function(){var on=this.checked; $("tBase").setAttribute("stroke",on?"#2EC4B6":"#59616c"); $("tCol").setAttribute("stroke",on?"#2EC4B6":"#59616c");
    $("tCoil").setAttribute("fill",on?"#173a38":"#1e2b38"); $("tLbl").textContent=on?"big current: ON (relay pulled in)":"big current: off";});
  function led(){var R=(v("ledVs")-v("ledVf"))/v("ledI"), P=(v("ledVs")-v("ledVf"))*v("ledI");
    $("ledOut").textContent=isFinite(R)&&R>0?"R = ("+v("ledVs")+" − "+v("ledVf")+") ÷ "+v("ledI")+" = "+fmt(R,0)+" Ω, resistor power "+fmt(P,3)+" W":"Supply must be higher than the LED voltage.";}
  ["ledVs","ledVf","ledI"].forEach(function(id){$(id).addEventListener("input",led);}); led();

  /* S3: sequence stepper */
  var steps=[["Thermostat call","24 V on W reaches the board.","tstat"],["Inducer + pressure switch","Inducer starts; board waits for the pressure switch to close.","ind"],["Igniter, then gas valve","Igniter heats, then the gas valve opens.","ign"],["Flame proven","Flame sensor carries a few microamps of DC through the flame (flame rectification).","flame"],["Blower on","After a delay, the blower starts.","blower"]];
  var faults=["No call: check thermostat, R/W wiring, 3 A fuse.","3 flashes: pressure switch didn't close.","1 flash: ignition lockout (no flame).","1 flash: lockout. Flame not proven (dirty sensor, bad ground).","Blower fault: check blower motor, capacitor, or ECM."];
  S("w-s3","Furnace sequence stepper",
    '<div class="svgbox"><svg id="sqSvg" viewBox="0 0 320 120" role="img" aria-label="Board diagram"></svg></div>'+
    '<div class="tree-node" id="sqTxt" aria-live="polite"></div><div class="row"><button type="button" class="secondary" id="sqPrev">‹ Back</button><button type="button" id="sqNext">Next ›</button><button type="button" class="secondary danger" id="sqBreak">💥 Break it</button></div>');
  var st=0, broken=-1;
  function sq(){var g=""; steps.forEach(function(s,k){var x=10+k*62, on=k<=st&&(broken<0||k<broken), bad=k===broken&&st>=k;
      g+='<rect x="'+x+'" y="30" width="54" height="50" rx="6" fill="'+(bad?"#5a2320":on?"#173a38":"#1e2b38")+'" stroke="'+(bad?"#ff6b5b":on?"#2EC4B6":"#59616c")+'" stroke-width="2"/><text x="'+(x+27)+'" y="60" fill="#EDEAE4" font-size="9" text-anchor="middle">'+s[2]+'</text><text x="'+(x+27)+'" y="22" fill="#9AA0A6" font-size="10" text-anchor="middle">'+(k+1)+'</text>';});
    $("sqSvg").innerHTML=g;
    var s=steps[st]; $("sqTxt").innerHTML=(broken>=0&&st>=broken)?'<b class="no">Step '+(broken+1)+' failed.</b> Board shuts down. Sample fault: '+faults[broken]:'<b>Step '+(st+1)+': '+s[0]+'</b><br>'+s[1];}
  $("sqNext").addEventListener("click",function(){if(st<4&&!(broken>=0&&st>=broken))st++;sq();});
  $("sqPrev").addEventListener("click",function(){if(st>0)st--;sq();});
  $("sqBreak").addEventListener("click",function(){if(broken>=0){broken=-1;this.textContent="💥 Break it";}else{broken=Math.floor(Math.random()*5);this.textContent="🔧 Fix it";} st=0;sq();});
  sq();

  /* S4: before you blame the board */
  var s4=S("w-s4","Before you blame the board",'<div class="meter-fill"><div id="bbFill"></div></div><p class="status" id="bbOut" aria-live="polite"></p>');
  EW.checklist(s4,["24 V present at R and C on the board?","Low-voltage fuse (3 or 5 A) good?","Inputs correct (thermostat call, pressure switch, limits)?","Fault code read and checked against the door chart?","Sensors and wiring checked (flame sensor clean, no loose plugs)?"],"bb",function(c,n){
    $("bbFill").style.width=(c/n*100)+"%";
    $("bbOut").innerHTML=c===n?'<span class="ok">All checks green. Board <em>may</em> be bad. Confirm with the manufacturer\'s procedure before ordering one.</span>':'<span class="warn-t">'+(n-c)+' check(s) left. Most "bad boards" are a sensor, a loose wire, or a fuse.</span>';});

  /* Action */
  var aw=S("w-action","Board walkthrough checklist","");
  EW.photoSlots(aw,["Status LED","Low-voltage fuse","Terminal strip R C W Y G","Relays"]);
  var x=document.createElement("div");
  x.innerHTML=EW.area("a15codes","Fault-code notes (two codes and what you'd check first)","3 flashes: check the inducer hose…")+'<div class="grid2">'+EW.fld("a15r1","Thermistor at room temp (Ω)","")+EW.fld("a15r2","After holding it 1 min (Ω)","")+'</div><p class="result-big" id="a15out" aria-live="polite"></p>';
  aw.appendChild(x);
  EW.keep(["a15codes","a15r1","a15r2"],function(){var a=v("a15r1"),b=v("a15r2"),e=$("a15out");
    e.innerHTML=!(isFinite(a)&&isFinite(b))?"Enter both readings.":b<a?'<span class="ok">Went down ✓ ('+fmt(a-b,0)+' Ω less). That\'s NTC behavior.</span>':b>a?'<span class="no">Went up. That\'s not NTC behavior; show Zach.</span>':"No change. Hold it longer.";});
})();
