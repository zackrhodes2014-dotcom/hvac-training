/* Module 17 widgets: Electrical Control Systems */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: follow the call */
  S("w-hook","Who told it to turn on?",
    '<div class="svgbox"><svg viewBox="0 0 320 110" role="img" aria-label="Control path from thermostat to condenser">'+
    '<path id="hkPath" d="M30 55 H290" stroke="#59616c" stroke-width="4"/>'+
    '<rect x="10" y="35" width="44" height="40" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="32" y="59" fill="#EDEAE4" font-size="10" text-anchor="middle">T-stat</text>'+
    '<rect id="hkHps" x="100" y="35" width="48" height="40" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="124" y="59" fill="#EDEAE4" font-size="10" text-anchor="middle">HPS</text>'+
    '<rect x="180" y="35" width="52" height="40" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="206" y="59" fill="#EDEAE4" font-size="10" text-anchor="middle">Contactor</text>'+
    '<rect id="hkCond" x="256" y="30" width="56" height="50" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="284" y="59" fill="#EDEAE4" font-size="10" text-anchor="middle">Condenser</text>'+
    '<circle id="hkPulse" cx="32" cy="55" r="7" fill="#2EC4B6" opacity="0"/></svg></div>'+
    '<div class="row"><button type="button" id="hkGo">▶ Send the cooling call</button><button type="button" class="secondary" id="hkFix">🧹 Clean the coil (HPS resets)</button></div><p class="status" id="hkOut" aria-live="polite"></p>');
  var hpsOpen=true, anim=null;
  $("hkGo").addEventListener("click",function(){var x=32, stop=hpsOpen?100:256; $("hkPulse").setAttribute("opacity","1"); $("hkHps").classList.remove("amber-flash"); $("hkCond").classList.remove("lit");
    clearInterval(anim); anim=setInterval(function(){x+=3; $("hkPulse").setAttribute("cx",x); if(x>=stop){clearInterval(anim);
      if(hpsOpen){$("hkHps").classList.add("amber-flash"); $("hkOut").textContent="24 V stops at the open high-pressure switch. The coil is packed with cottonwood fluff.";}
      else{$("hkCond").classList.add("lit"); $("hkOut").textContent="Switch closed: 24 V reaches the contactor coil and the condenser runs.";}}},16);});
  $("hkFix").addEventListener("click",function(){hpsOpen=false; $("hkHps").classList.remove("amber-flash"); $("hkOut").textContent="Coil cleaned, pressure normal, HPS closed. Send the call again.";});

  /* S1: device gallery */
  S("w-s1","Device gallery",
    '<div class="chips" id="dgDev"><button data-v="relay">Fan relay</button><button data-v="cont">Contactor</button></div>'+
    '<div class="chips" id="dgNo" style="margin-top:8px"><button data-v="NO">NO contacts</button><button data-v="NC">NC contacts</button></div>'+
    '<div class="svgbox"><svg id="dgSvg" viewBox="0 0 320 130" role="img" aria-label="Coil and contacts"></svg></div>'+
    '<label class="toggle"><input type="checkbox" id="dgCoil"> Energize the 24 V coil</label><p class="status" id="dgOut" aria-live="polite"></p>');
  var dev="relay", typ="NO";
  function dg(){var on=$("dgCoil").checked, closed=(typ==="NO")===on, big=dev==="cont", g='';
    g+='<rect x="30" y="40" width="70" height="50" rx="6" fill="'+(on?"#173a38":"#1e2b38")+'" stroke="'+(on?"#2EC4B6":"#9AA0A6")+'" stroke-width="2"/><text x="65" y="69" fill="#EDEAE4" font-size="11" text-anchor="middle">24 V coil</text>';
    for(var k=0;k<(big?2:1);k++){var y=35+k*50;
      g+='<line x1="150" y1="'+y+'" x2="190" y2="'+y+'" stroke="#9AA0A6" stroke-width="'+(big?6:3)+'"/><line x1="250" y1="'+y+'" x2="290" y2="'+y+'" stroke="#9AA0A6" stroke-width="'+(big?6:3)+'"/>';
      g+='<line x1="190" y1="'+y+'" x2="250" y2="'+(closed?y:y-22)+'" stroke="'+(closed?"#2EC4B6":"#ff9f43")+'" stroke-width="'+(big?6:3)+'" stroke-linecap="round"/>';}
    g+='<line x1="100" y1="65" x2="150" y2="65" stroke="#59616c" stroke-dasharray="4 4"/><text x="220" y="125" fill="#9AA0A6" font-size="10" text-anchor="middle">'+(big?"heavy 240 V contacts (compressor)":"light contacts (fan motor)")+'</text>';
    $("dgSvg").innerHTML=g;
    $("dgOut").textContent=(typ)+" contacts are "+(closed?"CLOSED":"OPEN")+(on?" (coil energized).":" (coil unpowered = the \u201cnormal\u201d resting position).");}
  H.chipGroup($("dgDev"),function(k){dev=k;dg();}).pick("relay"); H.chipGroup($("dgNo"),function(k){typ=k;dg();}).pick("NO");
  $("dgCoil").addEventListener("change",dg);

  /* S2: ladder tracer + VA */
  S("w-s2","Ladder-diagram tracer",
    '<div class="svgbox"><svg id="ldSvg" viewBox="0 0 320 200" role="img" aria-label="Ladder diagram"></svg></div><p class="wnote">Tap a switch to open/close it. 24 V rung on top (R to C), line-voltage rungs below (L1 to L2).</p><p class="status" id="ldOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:14px"><b>Transformer load check</b> (typical VA values; check the actual parts)</p><div class="grid2">'+EW.fld("vaT","Transformer VA",40)+EW.fld("vaC","Contactor coil VA",7)+EW.fld("vaR","Fan relay VA",5)+EW.fld("vaG","Gas valve VA",10)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Total load</span><span class="v" id="vaTot">–</span></div><div class="ro" id="vaRo"><span class="k">% of capacity</span><span class="v" id="vaPct">–</span></div></div>');
  var SW={Y:false,HPS:true,LPS:true};
  function ld(){var coil=SW.Y&&SW.HPS&&SW.LPS, g='';
    g+='<line x1="20" y1="10" x2="20" y2="190" stroke="#9AA0A6" stroke-width="3"/><line x1="300" y1="10" x2="300" y2="190" stroke="#9AA0A6" stroke-width="3"/>';
    g+='<text x="8" y="20" fill="#9AA0A6" font-size="10">R</text><text x="304" y="20" fill="#9AA0A6" font-size="10">C</text><text x="2" y="125" fill="#9AA0A6" font-size="9">L1</text><text x="304" y="125" fill="#9AA0A6" font-size="9">L2</text>';
    var xs=[[40,"Y","T-stat Y"],[110,"HPS","HPS"],[180,"LPS","LPS"]], powered=true;
    var prev=20;
    xs.forEach(function(s){var c=powered?"#2EC4B6":"#59616c"; g+='<line x1="'+prev+'" y1="45" x2="'+s[0]+'" y2="45" stroke="'+c+'" stroke-width="4"/>';
      var cl=SW[s[1]]; g+='<g data-sw="'+s[1]+'" style="cursor:pointer"><rect x="'+(s[0]-4)+'" y="20" width="58" height="40" fill="transparent"/><line x1="'+s[0]+'" y1="45" x2="'+(s[0]+50)+'" y2="'+(cl?45:28)+'" stroke="'+(cl?(powered?"#2EC4B6":"#9AA0A6"):"#ff9f43")+'" stroke-width="4" stroke-linecap="round"/><text x="'+(s[0]+25)+'" y="70" fill="#EDEAE4" font-size="10" text-anchor="middle">'+s[2]+(cl?" (closed)":" (open)")+'</text></g>';
      powered=powered&&cl; prev=s[0]+50;});
    g+='<line x1="'+prev+'" y1="45" x2="250" y2="45" stroke="'+(coil?"#2EC4B6":"#59616c")+'" stroke-width="4"/><circle cx="265" cy="45" r="15" fill="'+(coil?"#173a38":"#1e2b38")+'" stroke="'+(coil?"#2EC4B6":"#9AA0A6")+'" stroke-width="2"/><text x="265" y="49" fill="#EDEAE4" font-size="10" text-anchor="middle">C1</text><line x1="280" y1="45" x2="300" y2="45" stroke="'+(coil?"#2EC4B6":"#59616c")+'" stroke-width="4"/>';
    [[120,"Compressor"],[170,"Fan motor"]].forEach(function(r){var c=coil?"#2EC4B6":"#59616c";
      g+='<line x1="20" y1="'+r[0]+'" x2="90" y2="'+r[0]+'" stroke="#2EC4B6" stroke-width="4"/><line x1="90" y1="'+r[0]+'" x2="90" y2="'+(r[0]-12)+'" stroke="#9AA0A6" stroke-width="3"/><line x1="'+(coil?100:100)+'" y1="'+(r[0]-12)+'" x2="100" y2="'+r[0]+'" stroke="#9AA0A6" stroke-width="3"/>'+
        (coil?'<line x1="90" y1="'+r[0]+'" x2="100" y2="'+r[0]+'" stroke="#2EC4B6" stroke-width="4"/>':'')+'<text x="95" y="'+(r[0]+16)+'" fill="#9AA0A6" font-size="9" text-anchor="middle">C1 '+(coil?"closed":"open")+'</text>'+
        '<line x1="100" y1="'+r[0]+'" x2="200" y2="'+r[0]+'" stroke="'+c+'" stroke-width="4"/><circle cx="220" cy="'+r[0]+'" r="16" fill="'+(coil?"#173a38":"#1e2b38")+'" stroke="'+c+'" stroke-width="2"/><text x="220" y="'+(r[0]+4)+'" fill="#EDEAE4" font-size="9" text-anchor="middle">M</text><text x="260" y="'+(r[0]-8)+'" fill="#EDEAE4" font-size="10">'+r[1]+'</text><line x1="236" y1="'+r[0]+'" x2="300" y2="'+r[0]+'" stroke="'+c+'" stroke-width="4"/>';});
    g+='<line x1="20" y1="95" x2="300" y2="95" stroke="#343b45" stroke-dasharray="3 5"/>';
    $("ldSvg").innerHTML=g;
    each($("ldSvg").querySelectorAll("[data-sw]"),function(e){e.addEventListener("click",function(){var k=e.getAttribute("data-sw");SW[k]=!SW[k];ld();});});
    $("ldOut").textContent=coil?"Every switch on the rung is closed: C1 coil energizes, so C1 contacts close and the compressor and fan run.":"An open switch on the rung stops current. C1 stays off, so the motor rungs stay dead.";}
  ld();
  function va(){var t=v("vaC")+v("vaR")+v("vaG"), p=t/v("vaT")*100; $("vaTot").textContent=isFinite(t)?fmt(t,0)+" VA":"–"; $("vaPct").textContent=isFinite(p)?fmt(p,0)+"%":"–";
    EW.setBand($("vaRo"),!isFinite(p)?null:p>100?"band-r":p>80?"band-y":"band-g");}
  ["vaT","vaC","vaR","vaG"].forEach(function(id){$(id).addEventListener("input",va);}); va();

  /* S3: thermostat sim */
  S("w-s3","Thermostat simulator",
    '<div class="grid2">'+EW.sel("tsMode","Mode",[["cool","Cool"],["heat","Heat"],["off","Off"]])+EW.sel("tsFan","Fan",[["auto","Auto"],["on","On"]])+'</div>'+
    '<label class="lbl" for="tsSet">Setpoint: <b id="tsSetV">72</b>°F</label><input type="range" id="tsSet" min="60" max="85" value="72">'+
    '<label class="lbl" for="tsRoom">Room temperature: <b id="tsRoomV">78</b>°F</label><input type="range" id="tsRoom" min="55" max="90" step="0.5" value="78">'+
    '<div style="margin-top:8px"><span class="tpill" id="tR">R</span><span class="tpill" id="tY">Y</span><span class="tpill" id="tG">G</span><span class="tpill" id="tW">W</span><span class="tpill" id="tO">O</span><span class="tpill" id="tC">C</span></div>'+
    '<p class="status" id="tsOut" aria-live="polite"></p><p class="wnote">Differential set to 1°F: a call starts 0.5°F past setpoint and ends 0.5°F the other side, so it doesn\'t short-cycle. O shown for a heat pump that energizes O in cooling.</p>');
  var calling=false;
  function ts(){var m=$("tsMode").value, sp=+$("tsSet").value, rt=+$("tsRoom").value; $("tsSetV").textContent=sp; $("tsRoomV").textContent=rt;
    if(m==="cool"){ if(rt>=sp+0.5) calling=true; else if(rt<=sp-0.5) calling=false; }
    else if(m==="heat"){ if(rt<=sp-0.5) calling=true; else if(rt>=sp+0.5) calling=false; }
    else calling=false;
    var Y=m==="cool"&&calling, W=m==="heat"&&calling, G=Y||$("tsFan").value==="on", O=m==="cool";
    $("tR").classList.add("on"); $("tC").classList.add("on"); $("tY").classList.toggle("on",Y); $("tW").classList.toggle("on",W); $("tG").classList.toggle("on",G); $("tO").classList.toggle("on",O);
    var n=[]; if(Y)n.push("R→Y: compressor contactor pulls in"); if(G)n.push("R→G: indoor fan runs"); if(W)n.push("R→W: furnace/heat starts its sequence");
    $("tsOut").textContent=n.length?n.join(" · "):"No call. Satisfied.";}
  ["tsMode","tsFan","tsSet","tsRoom"].forEach(function(id){$(id).addEventListener("input",ts);$(id).addEventListener("change",ts);}); ts();

  /* S4: start timeline */
  S("w-s4","Compressor start timeline",
    '<div class="svgbox"><svg id="tlSvg" viewBox="0 0 320 120" role="img" aria-label="Start timeline"></svg></div>'+
    '<label class="toggle"><input type="checkbox" id="tlFault"> Fault: start relay stuck closed</label><div class="row"><button type="button" id="tlGo">▶ Start the compressor</button></div><p class="status" id="tlOut" aria-live="polite"></p>');
  var tt=0, tli=null;
  function tl(){var f=$("tlFault").checked, inStart=tt<1||f, g='';
    g+='<line x1="20" y1="100" x2="300" y2="100" stroke="#59616c"/>'; for(var s=0;s<=3;s++){g+='<text x="'+(20+s*93)+'" y="115" fill="#9AA0A6" font-size="10" text-anchor="middle">'+s+' s</text>';}
    g+='<line x1="'+(20+tt*93)+'" y1="10" x2="'+(20+tt*93)+'" y2="100" stroke="#ff9f43" stroke-width="2"/>';
    [["Run winding",20,true],["Start winding + start cap",50,inStart&&tt>0],["Start relay contacts",80,inStart&&tt>0]].forEach(function(r){
      g+='<rect x="120" y="'+(r[1]-12)+'" width="180" height="20" rx="5" fill="'+(r[2]&&tt>0?(f&&r[1]>20&&tt>1.2?"#5a2320":"#173a38"):"#1e2b38")+'" stroke="'+(r[2]&&tt>0?(f&&r[1]>20&&tt>1.2?"#ff6b5b":"#2EC4B6"):"#59616c")+'"/><text x="210" y="'+(r[1]+2)+'" fill="#EDEAE4" font-size="10" text-anchor="middle">'+r[0]+(r[1]===80?(inStart&&tt>0?": closed":": open"):"")+'</text>';});
    $("tlSvg").innerHTML=g;
    $("tlOut").textContent=tt===0?"Ready.":(tt<1?"0–1 s: start capacitor and start winding boost torque.":f?"Relay stuck: the start capacitor stays in circuit, overheats, and fails. The motor may trip on overload.":"About 1 s: relay opens, start capacitor drops out. Running on the run winding (and run cap).");}
  $("tlGo").addEventListener("click",function(){tt=0; clearInterval(tli); tli=setInterval(function(){tt=Math.min(3,tt+0.05); tl(); if(tt>=3)clearInterval(tli);},50);});
  $("tlFault").addEventListener("change",tl); tl();

  /* S5: motor heat meter */
  S("w-s5","Motor heat meter (sped-up sim)",
    '<label class="lbl" for="hmL">Load: <b id="hmLv">100</b>%</label><input type="range" id="hmL" min="50" max="160" step="5" value="100">'+
    '<label class="toggle"><input type="checkbox" id="hmBlock"> Block the cooling fan / dirty coil</label>'+
    '<div class="meter-fill" style="height:22px"><div id="hmFill"></div></div><div class="readouts" aria-live="polite"><div class="ro"><span class="k">Winding temp</span><span class="v" id="hmT">–</span></div><div class="ro" id="hmRo"><span class="k">Overload</span><span class="v" id="hmS">Closed</span></div></div>'+
    '<p class="wnote">Simulation: overload opens at 260°F winding temp and resets once it cools below 150°F. Time is sped up (1 s here ≈ 4 real minutes), so a 1-hour internal-overload cool-down takes about 15 s.</p>');
  var T=100, open=false;
  setInterval(function(){var L=+$("hmL").value/100, blk=$("hmBlock").checked; $("hmLv").textContent=Math.round(L*100);
    var target=open?80:(80+130*L*L*(blk?1.5:1));
    T+=(target-T)*(open?0.012:0.03);
    if(!open&&T>=260){open=true;} if(open&&T<=150){open=false;}
    $("hmT").textContent=fmt(T,0)+"°F"; $("hmFill").style.width=Math.min(100,(T-80)/(260-80)*100)+"%";
    $("hmS").textContent=open?"OPEN – cooling":"Closed"; EW.setBand($("hmRo"),open?"band-r":T>220?"band-y":"band-g");},250);

  /* S6: BAS */
  var s6=S("w-s6","Mini BAS screen","");
  EW.sorter(s6,["AI","DI","AO","DO"],[
    {label:"Space temp sensor",bin:0,why:"A varying signal: analog input."},{label:"Filter switch",bin:1,why:"On/off (dirty or clean): digital input."},
    {label:"Chilled water valve 0–10 V",bin:2,why:"A varying command: analog output."},{label:"Supply fan start",bin:3,why:"On/off command: digital output."},
    {label:"Duct humidity sensor",bin:0,why:"Varying signal: analog input."},{label:"Freezestat",bin:1,why:"Tripped or not: digital input."}]);
  var bas=document.createElement("div");
  bas.innerHTML='<p class="lbl" style="margin-top:14px"><b>Valve loop</b>: the controller opens the cooling valve as the space gets warmer than setpoint.</p>'+
    '<label class="lbl" for="basSp">Setpoint: <b id="basSpV">72</b>°F</label><input type="range" id="basSp" min="65" max="78" value="72">'+
    '<label class="lbl" for="basT">Space temp (AI): <b id="basTV">74</b>°F</label><input type="range" id="basT" min="60" max="85" step="0.5" value="74">'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Valve (AO)</span><span class="v" id="basV">–</span></div><div class="ro"><span class="k">Signal</span><span class="v" id="basVolt">–</span></div></div><p class="wnote">Simple proportional loop: 20% open per °F above setpoint (0–10 V).</p>';
  s6.appendChild(bas);
  function bs(){var sp=+$("basSp").value,t=+$("basT").value,p=Math.max(0,Math.min(100,(t-sp)*20)); $("basSpV").textContent=sp; $("basTV").textContent=t; $("basV").textContent=fmt(p,0)+"% open"; $("basVolt").textContent=fmt(p/10,1)+" V";}
  ["basSp","basT"].forEach(function(id){$(id).addEventListener("input",bs);}); bs();

  /* Action */
  var aw=S("w-action","Trace-it worksheet","");
  EW.photoSlots(aw,["My ladder drawing"]);
  EW.checklist(aw,["Transformer","Contactor","Capacitor (look only)","Pressure switch"],"a17parts");
  var x=document.createElement("div");
  x.innerHTML='<div class="grid2">'+EW.fld("a17t","Transformer VA","")+EW.fld("a17l1","Load 1 VA","")+EW.fld("a17l2","Load 2 VA","")+EW.fld("a17l3","Load 3 VA","")+'</div><p class="result-big" id="a17out" aria-live="polite"></p>';
  aw.appendChild(x);
  EW.keep(["a17t","a17l1","a17l2","a17l3"],function(){var t=0,any=false;["a17l1","a17l2","a17l3"].forEach(function(id){var n=v(id);if(isFinite(n)){t+=n;any=true;}});
    var T2=v("a17t"); $("a17out").textContent=!any?"Enter the load VAs from the labels.":"Total = "+fmt(t,0)+" VA"+(T2>0?" = "+fmt(t/T2*100,0)+"% of the "+T2+" VA transformer":"");});
})();
