/* Module 14 widgets: Electrical Power */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot;

  /* Hook: tripping breaker */
  S("w-hook","Click, hum, trip",
    '<div class="svgbox"><svg viewBox="0 0 320 150" role="img" aria-label="Breaker panel and disconnect lug">'+
    '<rect x="20" y="15" width="110" height="125" rx="6" fill="#262b33" stroke="#59616c" stroke-width="2"/>'+
    [0,1,2,3,4].map(function(k){return '<rect x="40" y="'+(25+k*22)+'" width="70" height="16" rx="3" fill="#1e2b38" stroke="#59616c"/><rect '+(k===2?'id="h14brk" class="blink" ':'')+'x="'+(k===2?40:90)+'" y="'+(27+k*22)+'" width="20" height="12" rx="2" fill="'+(k===2?"#ff6b5b":"#9AA0A6")+'"/>';}).join("")+
    '<g id="h14lug" opacity=".25"><rect x="190" y="40" width="100" height="80" rx="8" fill="#262b33" stroke="#59616c" stroke-width="2"/><rect x="220" y="65" width="40" height="22" rx="3" fill="#7a4a1a" stroke="#ff9f43" stroke-width="3"/><circle cx="240" cy="76" r="22" fill="none" stroke="#ff6b5b" stroke-width="2" class="blink"/><text x="240" y="112" fill="#ff9f43" font-size="11" text-anchor="middle">hot, discolored lug</text></g>'+
    '<text x="75" y="150" dy="-2" fill="#9AA0A6" font-size="10" text-anchor="middle">panel</text></svg></div>'+
    '<button type="button" id="h14btn">🔍 Find the cause</button><p class="status" id="h14out" aria-live="polite"></p>');
  $("h14btn").addEventListener("click",function(){$("h14lug").setAttribute("opacity","1");
    $("h14out").textContent="Loose lug at the disconnect → extra resistance → heat and voltage drop → motor pulls more amps → breaker trips.";});

  /* S1: power calculator */
  S("w-s1","Power calculator",
    '<div class="chips" id="pwTab"><button data-v="res">Resistive</button><button data-v="m1">Single-phase motor</button><button data-v="m3">Three-phase</button></div>'+
    '<div class="grid2">'+EW.fld("pwV","Volts",240)+EW.fld("pwA","Amps",10)+EW.fld("pwPF","Power factor (0–1)",1)+EW.fld("pwH","Run hours per day",5)+'</div>'+EW.fld("pwRate","Rate ($ per kWh)",0.15)+
    '<div class="svgbox"><svg viewBox="0 0 320 90" role="img" aria-label="Electric meter dial"><circle cx="160" cy="45" r="36" fill="#0f1114" stroke="#9AA0A6" stroke-width="3"/><g id="pwDial"><line x1="160" y1="45" x2="160" y2="15" stroke="#2EC4B6" stroke-width="4" stroke-linecap="round"/></g><circle cx="160" cy="45" r="4" fill="#EDEAE4"/><text x="210" y="50" fill="#9AA0A6" font-size="11">kWh meter</text></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Watts</span><span class="v" id="pwW">–</span></div><div class="ro"><span class="k">kW</span><span class="v" id="pwKW">–</span></div>'+
    '<div class="ro"><span class="k">kWh per day</span><span class="v" id="pwKWH">–</span></div><div class="ro"><span class="k">Cost per day</span><span class="v" id="pwCost">–</span></div></div>'+
    '<p class="wnote" id="pwF"></p>');
  var tab="res", dialA=0, speed=0;
  function pw(){
    var V=v("pwV"),A=v("pwA"),PF=tab==="res"?1:v("pwPF"),h=v("pwH"),r=v("pwRate");
    $("pwPF").disabled=tab==="res";
    var W=V*A*PF*(tab==="m3"?1.732:1);
    $("pwF").textContent=tab==="res"?"Watts = volts × amps":tab==="m1"?"Watts = volts × amps × PF":"Watts = volts × amps × 1.732 × PF";
    $("pwW").textContent=isFinite(W)?fmt(W,0)+" W":"–"; $("pwKW").textContent=isFinite(W)?fmt(W/1000,2):"–";
    $("pwKWH").textContent=isFinite(W*h)?fmt(W/1000*h,2):"–"; $("pwCost").textContent=isFinite(W*h*r)?"$"+fmt(W/1000*h*r,2):"–";
    speed=isFinite(W)?Math.min(W/1000,20):0;
  }
  H.chipGroup($("pwTab"),function(t){tab=t; if(t==="res")$("pwPF").value=1; else if(v("pwPF")===1)$("pwPF").value=0.85;
    if(t==="m3"){$("pwV").value=208;$("pwA").value=15;} pw();}).pick("res");
  ["pwV","pwA","pwPF","pwH","pwRate"].forEach(function(id){$(id).addEventListener("input",pw);}); pw();
  (function spin(){ if(!H.reduceMotion){dialA=(dialA+speed*1.5)%360; $("pwDial").setAttribute("transform","rotate("+dialA.toFixed(1)+" 160 45)");} requestAnimationFrame(spin);})();

  /* S2: follow the power + voltage drop */
  var stops=[["Utility pole / transformer","Steps distribution voltage down to the building's service.","120/240 V single-phase (homes) or 208/480 V three-phase"],
    ["Meter","Measures kilowatt-hours for the utility bill.","Same as the service"],
    ["Main panel","Splits power into branch circuits.","120 V hot-to-neutral, 240 V hot-to-hot"],
    ["Breaker","Opens on overcurrent to protect the wire. Must be at or below the unit's MOCP.","240 V across a 2-pole breaker"],
    ["Disconnect","Switch within sight of the unit. Locked out before work.","240 V (line side stays live even when switched off!)"],
    ["Condenser","The load: compressor and fan motor.","208/230 V, nameplate range 187–253 V"]];
  S("w-s2","Follow the power",
    '<div class="chips" id="fpChips">'+stops.map(function(s,k){return '<button data-v="'+k+'">'+(k+1)+'. '+s[0].split(" /")[0]+'</button>';}).join("")+'</div>'+
    '<div class="tree-node" id="fpOut" aria-live="polite">Tap a stop, starting at the pole.</div>'+
    '<p class="lbl" style="margin-top:16px"><b>Voltage drop calculator</b> (copper, out-and-back run)</p>'+
    '<label class="lbl" for="vdL">One-way length: <b id="vdLv">100</b> ft</label><input type="range" id="vdL" min="10" max="300" step="5" value="100">'+
    '<div class="grid3">'+EW.sel("vdAwg","Wire size",[["14","14 AWG"],["12","12 AWG"],["10","10 AWG"],["8","8 AWG"],["6","6 AWG"]])+EW.fld("vdA","Amps",16)+EW.fld("vdV","Supply volts",240)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Wire resistance</span><span class="v" id="vdR">–</span></div><div class="ro"><span class="k">Voltage drop</span><span class="v" id="vdD">–</span></div><div class="ro" id="vdPctRo"><span class="k">Drop %</span><span class="v" id="vdPct">–</span></div></div>'+
    '<p class="wnote">Uses typical copper resistance per 1,000 ft (14: 2.525 Ω, 12: 1.59 Ω, 10: 0.999 Ω, 8: 0.628 Ω, 6: 0.395 Ω). Green up to 3%, yellow above 3%, red above 5%.</p>');
  H.chipGroup($("fpChips"),function(k){var s=stops[+k]; $("fpOut").innerHTML="<b>"+s[0]+"</b><br>Job: "+s[1]+"<br>Typical voltage: "+s[2];});
  $("vdAwg").value="12";
  var OHM={"14":2.525,"12":1.59,"10":0.999,"8":0.628,"6":0.395};
  function vd(){var L=+$("vdL").value; $("vdLv").textContent=L; var R=2*L/1000*OHM[$("vdAwg").value], I=v("vdA"), V=v("vdV");
    var d=I*R, p=d/V*100; $("vdR").textContent=fmt(R,3)+" Ω"; $("vdD").textContent=isFinite(d)?fmt(d,1)+" V":"–"; $("vdPct").textContent=isFinite(p)?fmt(p,1)+"%":"–";
    EW.setBand($("vdPctRo"),!isFinite(p)?null:p>5?"band-r":p>3?"band-y":"band-g");}
  ["vdL","vdAwg","vdA","vdV"].forEach(function(id){$(id).addEventListener("input",vd);$(id).addEventListener("change",vd);}); vd();

  /* S3: problem lab + unbalance */
  var s3=S("w-s3","Problem lab","");
  EW.chooser(s3,[
    {prompt:"A wire lug at the disconnect is brown and the insulation is melted back.",options:["Loose connection","Ground fault","High voltage"],answer:0,why:"A loose connection adds resistance. Current through resistance makes heat, which discolors the lug and melts insulation."},
    {prompt:"The breaker trips the instant the compressor tries to start, and the wires smell burned.",options:["Short circuit","Low voltage","Open circuit"],answer:0,why:"A short lets current bypass the load. Current spikes and the breaker trips immediately."},
    {prompt:"A 208/230 V unit reads 181 V at the disconnect while running. The motor runs hot.",options:["Low voltage","Voltage unbalance","Ground fault"],answer:0,why:"181 V is below the 187 V bottom of the ±10% range. Low voltage makes motors draw more current and run hot."},
    {prompt:"Three-phase legs read 230, 236, and 224 V. The motor overheats.",options:["Voltage unbalance","Open circuit","High voltage"],answer:0,why:"That's about 2.6% unbalance. Many motor makers want it under 2%. Unbalance overheats windings fast."},
    {prompt:"An outdoor GFCI outlet keeps cutting power when the unit's service light is plugged in. The cord jacket is cut.",options:["Ground fault","Short circuit to neutral","Low voltage"],answer:0,why:"Current is leaking to ground through the damaged cord. GFCI devices detect that and cut power fast to protect people."}],{label:"Scenario"});
  var ub=document.createElement("div");
  ub.innerHTML='<p class="lbl" style="margin-top:16px"><b>Voltage unbalance calculator</b></p><div class="grid3">'+EW.fld("ubA","L1–L2",230)+EW.fld("ubB","L2–L3",236)+EW.fld("ubC","L1–L3",224)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Average</span><span class="v" id="ubAvg">–</span></div><div class="ro"><span class="k">Max deviation</span><span class="v" id="ubDev">–</span></div><div class="ro" id="ubRo"><span class="k">Unbalance</span><span class="v" id="ubPct">–</span></div></div>'+
    '<p class="status" id="ubMsg" aria-live="polite"></p><p class="wnote">Green under 1%, yellow 1–2%, red at 2% or more (many motor makers want under 2%).</p>';
  s3.appendChild(ub);
  function ubc(){var a=v("ubA"),b=v("ubB"),c=v("ubC"),avg=(a+b+c)/3,dev=Math.max(Math.abs(a-avg),Math.abs(b-avg),Math.abs(c-avg)),p=dev/avg*100;
    $("ubAvg").textContent=isFinite(avg)?fmt(avg,1)+" V":"–"; $("ubDev").textContent=isFinite(dev)?fmt(dev,1)+" V":"–"; $("ubPct").textContent=isFinite(p)?fmt(p,1)+"%":"–";
    var band=!isFinite(p)?null:p>=2?"band-r":p>=1?"band-y":"band-g"; EW.setBand($("ubRo"),band);
    $("ubMsg").textContent=!band?"":band==="band-r"?"Too high. Have the utility or wiring checked before running the motor.":band==="band-y"?"Acceptable, but keep an eye on it.":"Good balance.";}
  ["ubA","ubB","ubC"].forEach(function(id){$(id).addEventListener("input",ubc);}); ubc();

  /* Action worksheet */
  S("w-action","Nameplate worksheet",
    '<div class="grid2">'+EW.txt("a14vr","Voltage range","208/230")+EW.sel("a14ph","Phase",["1","3"])+EW.fld("a14mca","MCA (A)","")+EW.fld("a14mocp","MOCP (A)","")+EW.fld("a14rla","Compressor RLA","")+EW.fld("a14brk","Breaker size (A)","")+'</div>'+
    '<p class="result-big" id="a14chk" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:12px">30-minute cost of an appliance:</p><div class="grid3">'+EW.txt("a14app","Appliance","Hair dryer")+EW.fld("a14w","Watts","")+EW.fld("a14rate","$ per kWh","")+'</div>'+
    '<p class="result-big" id="a14cost" aria-live="polite"></p>');
  EW.keep(["a14vr","a14ph","a14mca","a14mocp","a14rla","a14brk","a14app","a14w","a14rate"],function(){
    var m=v("a14mocp"),b=v("a14brk"),e=$("a14chk");
    if(isFinite(m)&&isFinite(b)){ e.innerHTML=b<=m?'<span class="ok">✓ Breaker '+b+' A is at or below MOCP '+m+' A.</span>':'<span class="no">✗ Breaker '+b+' A is above MOCP '+m+' A. Show Zach.</span>'; } else e.textContent="Enter MOCP and breaker size to check.";
    var w=v("a14w"),r=v("a14rate"),c=w/1000*0.5*r;
    $("a14cost").textContent=isFinite(c)?"Cost = "+fmt(w/1000,2)+" kW × 0.5 h × $"+r+" = $"+fmt(c,3):"Enter watts and rate.";
  });
})();
