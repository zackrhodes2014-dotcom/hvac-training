/* Module 19 widgets: Servicing Electric Motors and Controls */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: hum... click (WebAudio, generated on device) */
  S("w-hook","Hum, click, silence",
    '<div class="svgbox"><svg viewBox="0 0 320 130" role="img" aria-label="Compressor and capacitor"><rect x="40" y="25" width="90" height="95" rx="40" fill="#2a3038" stroke="#59616c" stroke-width="3"/><text x="85" y="78" fill="#9AA0A6" font-size="11" text-anchor="middle">compressor</text>'+
    '<rect x="190" y="35" width="50" height="75" rx="10" fill="#4a525d" stroke="#9AA0A6" stroke-width="2"/><text x="215" y="60" fill="#EDEAE4" font-size="10" text-anchor="middle">45 µF</text><text x="215" y="73" fill="#EDEAE4" font-size="9" text-anchor="middle">±6%</text>'+
    '<g id="h19reading" opacity="0"><text x="215" y="100" fill="#ff6b5b" font-size="13" font-weight="800" text-anchor="middle">28 µF</text><text x="280" y="70" fill="#ff6b5b" font-size="11" text-anchor="middle">−17 µF</text><text x="280" y="84" fill="#ff6b5b" font-size="10" text-anchor="middle">(38% low)</text></g></svg></div>'+
    '<div class="row"><button type="button" class="secondary" id="h19snd">🔊 Hum… click</button><button type="button" id="h19dx">🩺 Diagnose</button></div><p class="status" id="h19out" aria-live="polite"></p>');
  $("h19dx").addEventListener("click",function(){$("h19reading").setAttribute("opacity","1"); $("h19out").textContent="Label 45 µF ±6% means 42.3–47.7 µF is OK. It reads 28 µF: weak capacitor. It can't start the compressor.";});
  $("h19snd").addEventListener("click",function(){try{var C=window.AudioContext||window.webkitAudioContext; var ac=new C(), o=ac.createOscillator(), g=ac.createGain();
    o.type="sawtooth"; o.frequency.value=120; g.gain.value=0.06; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+2);
    var c=ac.createOscillator(), cg=ac.createGain(); c.type="square"; c.frequency.value=900; cg.gain.setValueAtTime(0,ac.currentTime); cg.gain.setValueAtTime(0.2,ac.currentTime+2.05); cg.gain.setValueAtTime(0,ac.currentTime+2.09);
    c.connect(cg); cg.connect(ac.destination); c.start(); c.stop(ac.currentTime+2.2);}catch(e){$("h19out").textContent="Sound isn't available here.";}});

  /* S1: symptom picker */
  var SY={"Won't run, no sound":[["No power reaching it","Voltage at the motor leads during a call (Zach)"],["Open overload","Let it cool; ohms across overload with power locked out"],["Open winding","Ohms on each winding: OL = open"],["Control not calling","Check the call: 24 V at the contactor coil"]],
    "Hums but won't start":[["Bad capacitor","Discharge (Zach), read µF vs label"],["Seized bearing","Power locked out, spin shaft by hand"],["Low voltage","Voltage at the unit during start (Zach)"],["Open start winding","Ohms C–S"]],
    "Runs hot / trips overload":[["Low voltage","Voltage under load (Zach)"],["Weak capacitor","µF reading vs tolerance"],["Dirty coil","Look and clean"],["Tight bearings","Spin by hand, listen"]],
    "Noisy":[["Worn bearings","Spin by hand, feel for roughness or wobble"],["Loose blade","Check setscrew and blade"],["Rubbing housing","Look for contact marks"]]};
  S("w-s1","Symptom picker",'<div class="chips" id="syChips">'+Object.keys(SY).map(function(k){return '<button data-v="'+k+'">'+k+'</button>';}).join("")+'</div><div id="syOut" aria-live="polite"></div>');
  H.chipGroup($("syChips"),function(k){$("syOut").innerHTML='<ol>'+SY[k].map(function(c){return '<li><b>'+c[0]+'</b><br><small>Test: '+c[1]+'</small></li>';}).join("")+'</ol>';}).pick("Hums but won't start");

  /* S2: compressor terminals */
  S("w-s2","Compressor terminal simulator",
    '<div class="chips" id="ctMode"><button data-v="learn">Learn mode</button><button data-v="mystery">Mystery mode</button><button data-v="fault">Fault mode</button></div>'+
    '<div class="svgbox"><svg id="ctSvg" viewBox="0 0 320 150" role="img" aria-label="Compressor terminals"></svg></div><p class="result-big" id="ctRead" aria-live="polite">Tap two terminals (or a terminal and the shell).</p>'+
    '<div id="ctAns"></div><p class="status" id="ctOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:14px"><b>Winding sum checker</b>: C–R + C–S should equal R–S</p><div class="grid3">'+EW.fld("wsCR","C–R (Ω)",0.8)+EW.fld("wsCS","C–S (Ω)",2.4)+EW.fld("wsRS","R–S (Ω)",3.2)+'</div><p class="result-big" id="wsOut" aria-live="polite"></p>');
  var mode="learn", sel=[], labels=["C","S","R"], R={}, gnd=-1, faultKind="";
  function setup(){ sel=[]; gnd=-1; faultKind="";
    var cr=+(0.5+Math.random()*1.5).toFixed(1), cs=+(cr*(2+Math.random()*2)).toFixed(1);
    if(mode==="learn"){cr=0.8;cs=2.4;}
    var perm=[0,1,2]; if(mode!=="learn"){for(var k=2;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=perm[k];perm[k]=perm[j];perm[j]=t;}}
    labels=perm.map(function(p){return ["C","S","R"][p];});
    R={"C-R":cr,"C-S":cs,"R-S":+(cr+cs).toFixed(1)};
    if(mode==="fault"){ if(Math.random()<0.5){faultKind="overload";} else {faultKind="ground"; gnd=Math.floor(Math.random()*3);} }
    draw(); $("ctRead").textContent="Tap two points."; $("ctOut").textContent="";
    $("ctAns").innerHTML=mode==="mystery"?'<p class="lbl">Name each terminal:</p><div class="grid3">'+[0,1,2].map(function(k){return EW.sel("ctA"+k,"Terminal "+(k+1),[["","?"],["C","C"],["S","S"],["R","R"]]);}).join("")+'</div><button type="button" id="ctCheck">Check</button>':
      mode==="fault"?'<div class="chips" id="ctF"><button data-v="ok">Windings OK</button><button data-v="overload">Open internal overload</button><button data-v="ground">Grounded winding</button></div>':'';
    if(mode==="mystery") $("ctCheck").addEventListener("click",function(){var ok=[0,1,2].every(function(k){return $("ctA"+k).value===labels[k];});
      $("ctOut").innerHTML=ok?'<span class="ok">✓ Correct! The highest pair is S–R, so the third terminal is C. Lowest from C is R.</span>':'<span class="no">Not quite. Find the highest reading: that pair is S–R; the other terminal is C. From C, the lower reading goes to R.</span>';});
    if(mode==="fault") each($("ctF").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){var ok=b.getAttribute("data-v")===faultKind;
      $("ctOut").innerHTML=ok?'<span class="ok">✓ Right. '+(faultKind==="overload"?"C–R and C–S open but R–S reads the sum: the overload in the common lead is open. Let it cool an hour+ and recheck.":"A terminal reads low ohms to the shell: grounded winding. Dangerous; the compressor needs replacing.")+'</span>':'<span class="no">Look again: test each pair AND each terminal to the shell.</span>';});});
  }
  function reading(a,b){ if(a===3||b===3){var t=a===3?b:a; return t===gnd?"0.4 Ω to shell ⚠":"OL (open to shell ✓)";}
    var p=[labels[a],labels[b]].sort().join("-"); var key={"C-R":"C-R","C-S":"C-S","R-S":"R-S"}[p];
    if(faultKind==="overload"&&key!=="R-S") return "OL";
    return R[key]+" Ω"; }
  function draw(){var pos=[[110,50],[210,50],[160,105]], g='<circle cx="160" cy="75" r="68" fill="#2a3038" stroke="#59616c" stroke-width="3"/>';
    pos.forEach(function(p,k){var on=sel.indexOf(k)>=0; g+='<g data-k="'+k+'" style="cursor:pointer"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="18" fill="'+(on?"#2EC4B6":"#9AA0A6")+'"/><text x="'+p[0]+'" y="'+(p[1]+5)+'" font-size="14" font-weight="800" fill="#05211e" text-anchor="middle">'+(mode==="learn"?labels[k]:(k+1))+'</text></g>';});
    g+='<g data-k="3" style="cursor:pointer"><rect x="250" y="110" width="62" height="30" rx="6" fill="'+(sel.indexOf(3)>=0?"#2EC4B6":"#4a525d")+'"/><text x="281" y="130" font-size="11" fill="#EDEAE4" text-anchor="middle">shell</text></g>';
    $("ctSvg").innerHTML=g;
    each($("ctSvg").querySelectorAll("g[data-k]"),function(e){e.addEventListener("click",function(){var k=+e.getAttribute("data-k"); if(sel.indexOf(k)>=0) return; sel.push(k); if(sel.length>2) sel=[k];
      if(sel.length===2){var nm=function(i){return i===3?"shell":(mode==="learn"?labels[i]:"T"+(i+1));}; $("ctRead").textContent=nm(sel[0])+" to "+nm(sel[1])+": "+reading(sel[0],sel[1]);}
      draw();});});}
  H.chipGroup($("ctMode"),function(m){mode=m;setup();}).pick("learn");
  function ws(){var a=v("wsCR"),b=v("wsCS"),c=v("wsRS"),s=a+b,d=Math.abs(s-c)/s*100;
    $("wsOut").innerHTML=!(isFinite(d))?"Enter all three.":d<=10?'<span class="ok">✓ '+fmt(a,2)+" + "+fmt(b,2)+" = "+fmt(s,2)+" Ω ≈ R–S "+fmt(c,2)+" Ω. Windings check out.</span>":'<span class="no">✗ Sum '+fmt(s,2)+" Ω doesn't match R–S "+fmt(c,2)+" Ω ("+fmt(d,0)+"% off). Recheck, then show Zach.</span>";}
  ["wsCR","wsCS","wsRS"].forEach(function(id){$(id).addEventListener("input",ws);}); ws();

  /* S3: capacitor tester + wiring matcher */
  var CAPS=[[7.5,6,7.2],[45,6,28],[5,5,5.4],[35,6,36.1],[10,6,9.2]];
  S("w-s3","Capacitor tester",
    '<div class="grid3">'+EW.fld("cpR","Label µF",7.5)+EW.fld("cpT","Tolerance ±%",6)+EW.fld("cpM","Measured µF",7.2)+'</div>'+
    '<div class="svgbox"><svg id="cpSvg" viewBox="0 0 320 60" role="img" aria-label="Tolerance band"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Acceptable range</span><span class="v" id="cpRange">–</span></div><div class="ro" id="cpRo"><span class="k">Verdict</span><span class="v" id="cpV">–</span></div></div>'+
    '<div class="row"><button type="button" class="secondary" id="cpNext">🎲 New practice capacitor</button></div><div class="chips" id="cpGuess"><button data-v="good">Good</button><button data-v="bad">Replace</button></div><p class="status" id="cpOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:14px"><b>Dual capacitor wiring</b>: tap a wire, then a terminal.</p><div class="chips" id="dcWires"><button data-v="HERM">Compressor wire</button><button data-v="FAN">Fan motor wire</button><button data-v="C">Contactor (common) wire</button></div><div class="chips" id="dcTerms" style="margin-top:8px"><button data-v="C">C</button><button data-v="HERM">HERM</button><button data-v="FAN">FAN</button></div><p class="status" id="dcOut" aria-live="polite"></p>');
  var hide=false;
  function cp(){var r=v("cpR"),t=v("cpT"),m=v("cpM"),lo=r*(1-t/100),hi=r*(1+t/100),ok=m>=lo&&m<=hi;
    $("cpRange").textContent=isFinite(lo)?fmt(lo,2)+"–"+fmt(hi,2)+" µF":"–";
    $("cpV").textContent=hide?"?":isFinite(m)?(ok?"Good":"Replace"):"–"; EW.setBand($("cpRo"),hide||!isFinite(m)?null:ok?"band-g":"band-r");
    var mn=r*0.5,mx=r*1.3,X=function(x){return 10+Math.max(0,Math.min(1,(x-mn)/(mx-mn)))*300;};
    $("cpSvg").innerHTML='<rect x="10" y="20" width="300" height="16" rx="8" fill="#1e2b38"/><rect x="'+X(lo)+'" y="20" width="'+(X(hi)-X(lo))+'" height="16" fill="#2EC4B6" opacity=".6"/><line x1="'+X(m)+'" y1="10" x2="'+X(m)+'" y2="46" stroke="#ff9f43" stroke-width="3"/><text x="'+X(m)+'" y="58" fill="#ff9f43" font-size="10" text-anchor="middle">'+(isFinite(m)?m:"")+'</text>';
    return ok;}
  ["cpR","cpT","cpM"].forEach(function(id){$(id).addEventListener("input",function(){hide=false;cp();});}); cp();
  $("cpNext").addEventListener("click",function(){var c=CAPS[Math.floor(Math.random()*CAPS.length)]; $("cpR").value=c[0];$("cpT").value=c[1];$("cpM").value=c[2]; hide=true; cp(); $("cpOut").textContent="Good or Replace? Decide, then tap.";});
  each($("cpGuess").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){var ok=cp(), g=b.getAttribute("data-v")==="good"; hide=false; cp();
    $("cpOut").innerHTML=(g===ok)?'<span class="ok">✓ Right.</span>':'<span class="no">✗ Check the green band.</span>';});});
  var wire=null, done={};
  each($("dcWires").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){wire=b.getAttribute("data-v"); each($("dcWires").querySelectorAll("button"),function(o){o.setAttribute("aria-pressed",String(o===b));});});});
  each($("dcTerms").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){if(!wire){$("dcOut").textContent="Pick a wire first.";return;}
    var t=b.getAttribute("data-v"); if(t===wire){done[t]=1; $("dcOut").innerHTML='<span class="ok">✓ Correct'+(Object.keys(done).length===3?". All three wired!":".")+'</span>';}
    else $("dcOut").innerHTML='<span class="no">✗ That wire goes to '+wire+'.</span>';});});

  /* S4: belt drive */
  S("w-s4","Belt-drive setup",
    '<div class="svgbox"><svg id="bdSvg" viewBox="0 0 320 140" role="img" aria-label="Belt drive"></svg></div>'+
    '<div class="grid2">'+EW.fld("bdSpan","Belt span (inches)",32)+'</div>'+
    '<label class="lbl" for="bdPos">Slide motor base (tension): deflection <b id="bdDef">–</b> in</label><input type="range" id="bdPos" min="0" max="100" value="20">'+
    '<label class="lbl" for="bdAl">Motor pulley offset (alignment): <b id="bdAlv">0.25</b> in</label><input type="range" id="bdAl" min="-0.5" max="0.5" step="0.05" value="0.25">'+
    '<label class="toggle"><input type="checkbox" id="bdSwap"> Swap two of the three power leads (L1 ↔ L2)</label>'+
    '<div class="readouts" aria-live="polite"><div class="ro" id="bdTRo"><span class="k">Tension</span><span class="v" id="bdT">–</span></div><div class="ro" id="bdARo"><span class="k">Alignment</span><span class="v" id="bdA">–</span></div><div class="ro"><span class="k">Rotation</span><span class="v" id="bdR">–</span></div></div>'+
    '<p class="wnote">Rule of thumb: 1/64 inch of deflection per inch of span. Green within ±25% of target.</p>');
  function bd(){var span=v("bdSpan"),tgt=span/64,pos=+$("bdPos").value,def=tgt*(2.2-1.8*pos/100),al=+$("bdAl").value,sw=$("bdSwap").checked;
    $("bdDef").textContent=fmt(def,2); $("bdAlv").textContent=fmt(al,2);
    var tOk=Math.abs(def-tgt)<=tgt*0.25; $("bdT").textContent=tOk?"Good":(def>tgt?"Too loose":"Too tight"); EW.setBand($("bdTRo"),tOk?"band-g":"band-r");
    var aOk=Math.abs(al)<0.05; $("bdA").textContent=aOk?"Aligned":"Off by "+fmt(Math.abs(al),2)+" in"; EW.setBand($("bdARo"),aOk?"band-g":"band-r");
    $("bdR").textContent=sw?"Reversed ↺":"Normal ↻";
    var mx=60+pos*0.4, sag=def/tgt*8;
    $("bdSvg").innerHTML='<circle cx="'+mx+'" cy="'+(90+al*40)+'" r="22" fill="#1e2b38" stroke="#9AA0A6" stroke-width="3"/><text x="'+mx+'" y="'+(94+al*40)+'" fill="#9AA0A6" font-size="9" text-anchor="middle">motor</text><circle cx="250" cy="70" r="40" fill="#1e2b38" stroke="#9AA0A6" stroke-width="3"/><text x="250" y="74" fill="#9AA0A6" font-size="10" text-anchor="middle">blower</text>'+
      '<path d="M'+mx+' '+(68+al*40)+' Q'+((mx+250)/2)+' '+(50+sag)+' 250 30" fill="none" stroke="#ff9f43" stroke-width="4"/><path d="M'+mx+' '+(112+al*40)+' L250 110" fill="none" stroke="#ff9f43" stroke-width="4"/>'+
      '<line x1="'+(mx-30)+'" y1="20" x2="290" y2="20" stroke="'+(aOk?"#2EC4B6":"#ff6b5b")+'" stroke-width="2" stroke-dasharray="4 3"/><text x="250" y="135" fill="#2EC4B6" font-size="16" text-anchor="middle">'+(sw?"↺":"↻")+'</text>';}
  ["bdSpan","bdPos","bdAl","bdSwap"].forEach(function(id){$(id).addEventListener("input",bd);$(id).addEventListener("change",bd);}); bd();

  /* S5: contactor inspection */
  var s5=S("w-s5","Contactor inspection",'<div class="svgbox"><svg id="ciSvg" viewBox="0 0 320 90" role="img" aria-label="Contactor close-up"></svg></div>');
  var looks=['<rect x="110" y="30" width="40" height="20" rx="4" fill="#c0c6cc"/><rect x="170" y="30" width="40" height="20" rx="4" fill="#c0c6cc"/>',
    '<rect x="110" y="30" width="40" height="20" rx="4" fill="#5b4a3a"/><circle cx="122" cy="40" r="4" fill="#222"/><circle cx="138" cy="36" r="3" fill="#222"/><rect x="170" y="30" width="40" height="20" rx="4" fill="#5b4a3a"/><circle cx="190" cy="42" r="5" fill="#222"/>',
    '<rect x="110" y="30" width="100" height="20" rx="4" fill="#c0c6cc"/>'+[0,1,2,3,4,5,6].map(function(k){return '<ellipse cx="'+(115+k*14)+'" cy="'+(35+(k%2)*10)+'" rx="5" ry="3" fill="#3a1f0f"/>';}).join(""),
    '<rect x="110" y="30" width="40" height="20" rx="4" fill="#c0c6cc"/><path d="M60 40 Q90 30 112 40" stroke="#222" stroke-width="7" fill="none"/><path d="M80 35 Q95 50 110 38" stroke="#ff9f43" stroke-width="3" fill="none"/>'];
  var cw=EW.chooser(s5,[
    {prompt:"Close-up 1: bright, flat, clean silver contacts.",options:["OK","Replace"],answer:0,why:"Clean, flat contacts are fine."},
    {prompt:"Close-up 2: dark, pitted, burned contacts.",options:["OK","Replace"],answer:1,why:"Pitting adds resistance: heat, voltage drop, chatter. Replace the contactor (match coil voltage, amps, poles)."},
    {prompt:"Close-up 3: ants packed between the contacts.",options:["OK","Replace"],answer:1,why:"Ants jam contacts open and cause arcing. Clean them out and replace the contactor if the contacts are damaged."},
    {prompt:"Close-up 4: melted, discolored wire end on a terminal.",options:["OK","Replace"],answer:1,why:"Heat damage spreads. Replace the wire end (and the contactor if the terminal is damaged), then tighten properly."}],{label:"Close-up"});
  function ci(){var t=cw.querySelector(".ch-count"); var m=t?/(\d+) of/.exec(t.textContent):null; var k=m?+m[1]-1:0;
    $("ciSvg").innerHTML='<rect x="90" y="15" width="140" height="50" rx="6" fill="#262b33" stroke="#59616c"/>'+(looks[k]||looks[0]);}
  new MutationObserver(ci).observe(cw,{childList:true,subtree:false}); ci();

  /* Action */
  S("w-action","Job worksheet",
    '<p class="lbl">Capacitor</p><div class="grid3">'+EW.fld("a19uf","Label µF","")+EW.fld("a19tol","± %","")+EW.fld("a19meas","Zach\'s reading µF","")+'</div><p class="result-big" id="a19cap" aria-live="polite"></p>'+
    EW.sel("a19cont","Contactor contacts",[["","–"],["clean","Clean"],["pitted","Pitted"],["burned","Burned"],["ants","Ants / debris"]])+
    '<p class="lbl" style="margin-top:12px">Compressor terminals (Zach\'s readings)</p><div class="grid3">'+EW.fld("a19cr","C–R Ω","")+EW.fld("a19cs","C–S Ω","")+EW.fld("a19rs","R–S Ω","")+'</div><p class="result-big" id="a19w" aria-live="polite"></p>'+
    EW.chk("a19spin","Locked-out fan blade spins freely by hand")+EW.area("a19notes","Notes","")+EW.chk("a19zach","Zach checked this"));
  EW.keep(["a19uf","a19tol","a19meas","a19cont","a19cr","a19cs","a19rs","a19spin","a19notes","a19zach"],function(){
    var r=v("a19uf"),t=v("a19tol"),m=v("a19meas"),lo=r*(1-t/100),hi=r*(1+t/100);
    $("a19cap").innerHTML=!(isFinite(lo))?"Enter label µF and tolerance.":"Range "+fmt(lo,2)+"–"+fmt(hi,2)+" µF"+(isFinite(m)?(m>=lo&&m<=hi?' · <span class="ok">reading OK</span>':' · <span class="no">replace</span>'):"");
    var a=v("a19cr"),b=v("a19cs"),c=v("a19rs"),s=a+b;
    $("a19w").innerHTML=!(isFinite(a)&&isFinite(b)&&isFinite(c))?"Enter all three readings.":Math.abs(s-c)/s<=0.1?'<span class="ok">✓ '+fmt(a,2)+" + "+fmt(b,2)+" = "+fmt(s,2)+" ≈ "+fmt(c,2)+"</span>":'<span class="no">✗ '+fmt(s,2)+" ≠ "+fmt(c,2)+"</span>";});
})();
