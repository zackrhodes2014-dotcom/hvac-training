/* Module 24 widgets: The MegaTron Blowdown Controller */
(function(){
  "use strict";
  var $=EW.$, fmt=EW.fmt, S=EW.slot, each=EW.each;
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  function card(id,def){return '<div class="infocard" id="'+id+'" aria-live="polite">'+(def||"Tap one.")+'</div>';}
  function chips(id,list){return '<div class="chips" id="'+id+'">'+list.map(function(t,i){return '<button data-v="'+i+'">'+t+'</button>';}).join("")+'</div>';}
  function seg(id,list){return '<div class="seg" id="'+id+'" role="group">'+list.map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>';}).join("")+'</div>';}
  function num(n){return Math.round(n).toLocaleString("en-US");}

  /* ---------- Hook: controller panel ---------- */
  var HP=[["Reading?","The number on the display, in µS/cm. (Shown here: 3,420, an EXAMPLE.) On timed and sample-and-hold systems it only updates at the end of each sample.","#s2","Section 2: how the MegaTron works"],
          ["Setpoint?","The reading at which the controller opens the blowdown valve. West Mechanical's recommended setpoint is 3,500 µS/cm (as read on the MegaTron; confirm units on the controller).","#s2","Section 2: set point and differential"],
          ["Valve?","Go and look at the blowdown valve on the skimmer line. Is it open or closed, and does that fit the reading versus the setpoint? A closed valve might just mean it isn't sample time yet.","#s3","Section 3: See It Run"]];
  S("w-hook","The controller panel",
    '<div class="svgbox"><svg id="hkPanel" viewBox="0 0 300 130" role="img" aria-label="Controller display with a conductivity reading, a setpoint and a valve icon"></svg></div>'+
    '<div class="chips" id="hkC">'+HP.map(function(h,i){return '<button data-v="'+i+'">'+h[0]+'</button>';}).join("")+'</div>'+card("hkO","Zach asks three questions. Tap each one."));
  var hkSel=-1;
  function hkDraw(){var g='<rect x="10" y="8" width="280" height="114" rx="10" fill="#101a22" stroke="#59616c" stroke-width="2"/>'+
    '<rect x="24" y="20" width="150" height="56" rx="6" fill="#06130f" stroke="'+(hkSel===0?"#fff":"#2EC4B6")+'" stroke-width="'+(hkSel===0?3:1.5)+'"/><text x="99" y="52" fill="#2EC4B6" font-size="24" font-weight="700" text-anchor="middle">3,420</text><text x="99" y="68" fill="#7fd6c6" font-size="8" text-anchor="middle">µS/cm  EXAMPLE</text>'+
    '<rect x="24" y="84" width="150" height="26" rx="6" fill="#1a1608" stroke="'+(hkSel===1?"#fff":"#ffd23f")+'" stroke-width="'+(hkSel===1?3:1.5)+'"/><text x="99" y="101" fill="#ffd23f" font-size="11" text-anchor="middle">Set point 3,500</text>'+
    '<circle cx="232" cy="52" r="24" fill="#ff5a5f" fill-opacity=".85" stroke="'+(hkSel===2?"#fff":"#ff5a5f")+'" stroke-width="'+(hkSel===2?4:2)+'"/><text x="232" y="56" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">CLOSED</text><text x="232" y="96" fill="#9AA0A6" font-size="8" text-anchor="middle">blowdown valve</text>';
    $("hkPanel").innerHTML=g;}
  H.chipGroup($("hkC"),function(i){hkSel=+i; var h=HP[hkSel]; $("hkO").innerHTML="<b>"+h[0]+"</b> "+h[1]+' <a href="'+h[2]+'">'+h[3]+' →</a>'; hkDraw();});
  hkDraw();

  /* ---------- S1 ---------- */
  S("w-s1","Quick recap",'<div class="row"><a class="chipLink" href="m20.html#s8" style="display:inline-block;padding:10px 16px;border-radius:999px;border:1.5px solid var(--accent);color:var(--accent);font-weight:700;text-decoration:none">↩ Back to Module 20, Section 8</a></div>'+
    '<div class="infocard"><b>1.</b> Steam leaves nearly pure, so dissolved solids stay behind and the boiler water gets saltier.<br><b>2.</b> Too salty: foaming, carryover, scale. Too much blowdown wastes heat, water and chemicals.<br><b>3.</b> Surface (skimmer) blowdown bleeds off a little salty water, and the MegaTron automates it.</div>');

  /* ---------- S2: terms ---------- */
  var TM=[["Conductivity","How well the water carries current. More dissolved salts means a higher reading."],["µS/cm","Microsiemens per centimeter: the unit the MegaTron shows conductivity in."],
    ["Set point","The reading at which the controller turns its relay on, and so opens the blowdown valve."],["Differential","How far the reading must change from the set point before the relay turns off and the valve closes."],
    ["High alarm","A reading above which the controller raises an alarm: the water is saltier than expected."],["Low alarm","A reading below which the controller raises an alarm: lower than expected. Ask Zach what it means at his sites."],
    ["Limit timer","An alarm for too much time spent bleeding continuously. On a conductivity control it does not lock the bleed out."],["Sample interval","How often a timed controller opens the valve to take a sample."],
    ["Sample duration","How long the valve stays open for each sample."],["Hold time","In sample and hold, how long the valve stays closed before the controller checks the reading."],
    ["Blowdown time","In sample and hold, the preset time the valve stays open when the check finds the reading above the set point."],["Skimmer line","The surface blowdown line that takes water from just under the water line."]];
  S("w-s2","Term chips: tap for a definition",chips("tmC",TM.map(function(t){return t[0];}))+card("tmO","Tap a term."));
  H.chipGroup($("tmC"),function(i){var t=TM[+i]; $("tmO").innerHTML="<b>"+t[0]+":</b> "+t[1];});

  /* ---------- Skimmer line schematic (shared) ---------- */
  var PARTS=[["Isolation valve (full port)","Lets you isolate the probe to remove and clean it.","Without it, you would have to shut the boiler down to service the probe.",56],
             ["Cross with electrode (BE-32)","Holds the boiler electrode in the skimmer line, in a cross made for it, so the probe is in the flowing water.","Without it, nothing measures the conductivity.",108],
             ["Flow-throttling device","Keeps back-pressure on the electrode so it sees water, not steam.","Without it, hot water can flash to steam in the chamber and give wrong readings.",162],
             ["Blowdown valve","Motorized or solenoid valve, driven by the controller's relay. It opens when the reading is above the set point.","Without it, the controller has nothing to open.",214],
             ["Drain / blowdown tank","Where the salty water goes after the valve.","Without it, hot boiler water has nowhere safe to go.",274],
             ["Flush line (quarter-turn ball valve)","Hangs off the bottom of the cross. Opened now and then to flush sediment out of the electrode chamber.","Without it, sediment can build up around the probe.",108],
             ["Controller","Reads the probe, holds the settings, switches the relays, and raises alarms.","Without it, there is no decision-maker.",308]];
  function skim(o){ /* o: valveOpen, flow(phase or null), sel(index), glow(0..1), ring(0..1 or null), fresh(0..1) */
    var open=!!o.valveOpen, g='';
    var wc=o.fresh==null?0.5:o.fresh;
    g+='<rect x="4" y="14" width="44" height="76" rx="14" fill="#10242e" stroke="#5ab4ff" stroke-width="2"/><rect x="6" y="40" width="40" height="48" rx="10" fill="rgba(90,180,255,'+(0.25+0.4*wc)+')"/><text x="26" y="104" fill="#9AA0A6" font-size="8" text-anchor="middle">boiler</text>';
    g+='<path d="M48 50 H300" stroke="#59616c" stroke-width="7" fill="none"/>';
    g+='<path d="M108 50 V86" stroke="#59616c" stroke-width="5" fill="none"/>';
    function hl(k){return o.sel===k?' stroke="#fff" stroke-width="3"':' stroke="#9aa5b1" stroke-width="1.2"';}
    g+='<path d="M48 42 l16 8 l-16 8 z M80 42 l-16 8 l16 8 z" fill="#4a525d"'+hl(0)+'/>';
    g+='<rect x="100" y="42" width="16" height="16" fill="#2a3340"'+hl(1)+'/><path d="M108 42 V24" stroke="#ffd23f" stroke-width="3"/><rect x="103" y="14" width="10" height="12" rx="2" fill="#ffd23f" fill-opacity="'+(0.35+0.6*(o.glow||0))+'"/><text x="108" y="10" fill="#ffd23f" font-size="7" text-anchor="middle">BE-32</text>';
    g+='<path d="M156 44 h12 l-4 6 l4 6 h-12 l4 -6 z" fill="#4a525d"'+hl(2)+'/>';
    g+='<circle cx="214" cy="50" r="12" fill="'+(open?"#3ecf6a":"#ff5a5f")+'" fill-opacity=".9"'+hl(3)+'/><text x="214" y="53" fill="#06130f" font-size="7" font-weight="700" text-anchor="middle">'+(open?"OPEN":"SHUT")+'</text>';
    if(o.ring!=null){g+='<circle cx="214" cy="50" r="17" fill="none" stroke="#ffd23f" stroke-width="3" stroke-dasharray="'+(107*o.ring).toFixed(1)+' 107" transform="rotate(-90 214 50)"/>';}
    g+='<path d="M268 44 h16 l-4 14 h-8 z" fill="#4a525d"'+hl(4)+'/><text x="276" y="72" fill="#9AA0A6" font-size="7" text-anchor="middle">drain</text>';
    g+='<rect x="100" y="74" width="16" height="10" rx="2" fill="#4a525d"'+hl(5)+'/><text x="108" y="97" fill="#9AA0A6" font-size="7" text-anchor="middle">flush</text>';
    g+='<rect x="236" y="80" width="62" height="26" rx="4" fill="#101a22"'+hl(6)+'/><text x="267" y="96" fill="#cfd8e3" font-size="8" text-anchor="middle">controller</text><path d="M214 62 V93 H236 M108 24 V4 H300 V80" stroke="#7d8995" stroke-width="1" fill="none" stroke-dasharray="2 2"/>';
    g+='<text x="64" y="72" fill="#9AA0A6" font-size="7" text-anchor="middle">isolation</text><text x="162" y="72" fill="#9AA0A6" font-size="7" text-anchor="middle">throttle</text><text x="214" y="30" fill="#9AA0A6" font-size="7" text-anchor="middle">blowdown valve</text>';
    if(o.flow!=null){for(var k=0;k<9;k++){var x=52+((o.flow*8+k*29)%248); if(x>212&&x<216)continue; g+='<circle cx="'+x.toFixed(1)+'" cy="50" r="2.6" fill="#7fd6ff"/>';}}
    return g;}
  /* ---------- S3: See It Run ---------- */
  var SK={mode:"timed",SP:3500,D:150,al:false,idx:0,playing:null,stopAt:null,tl:[],segs:[]};
  var CAP={SAMPLE:"Valve opens. Fresh boiler water reaches the probe, and the reading climbs to the real value.",HOLD:"Valve closed. The controller checks the reading against the set point.",BLOW:"Reading is above the set point, so the valve stays open and salty water leaves.",WAIT:"Valve closed. The controller waits for the next sample interval."};
  var NAME={SAMPLE:"1 · SAMPLE",HOLD:"2 · HOLD",BLOW:"3 · BLOW DOWN",WAIT:"4 · WAIT"};
  function buildTL(){
    var dt=0.1,A=3900,P=3100,tl=[],SP=SK.SP,D=SK.D,mode=SK.mode,nothing=false,chk=null;
    function tick(s,open,blow,extra){
      if(open){A-=(blow?110:25)*dt;P+=(A-P)*0.12;}else{A+=25*dt;}
      var e={s:s,v:open?1:0,P:P,A:A,blow:!!blow};
      if(extra) for(var k in extra) e[k]=extra[k];
      tl.push(e);}
    function run(s,secs,open,blow,extra){var n=Math.round(secs/dt);for(var k=0;k<n;k++)tick(s,open,blow,extra?extra(k,n):null);}
    function cycle(first){
      run("SAMPLE",4,true,false);
      if(mode==="timed"){
        if(P>=SP){var cap=0;while(P>SP-D&&cap<250){tick("BLOW",true,true,{ring:null});cap++;}}
        else{tl[tl.length-1].note="Nothing to do this time. That is normal.";}
      } else {
        var rep=0;
        for(;;){
          run("HOLD",3,false,false);
          var above=P>=SP; tl[tl.length-1].chk={P:P,above:above};
          if(!above){tl[tl.length-1].note="Nothing to do this time. That is normal."; if(rep>0)tl[tl.length-1].note="In range now. Back to the normal sample cycle."; break;}
          if(rep>=6)break; rep++;
          run("BLOW",4,true,true,function(k,n){return {ring:1-k/n};});
        }
      }
      run("WAIT",first?6:4,false,false);
    }
    cycle(true); if(true){ cycle(false); }
    SK.tl=tl;
    var segs=[],cur=null; tl.forEach(function(e,i){ if(!cur||cur.s!==e.s||(e.s==="SAMPLE"&&tl[i-1]&&tl[i-1].s!=="SAMPLE")){cur={s:e.s,start:i,end:i};segs.push(cur);} else cur.end=i;});
    SK.segs=segs;
  }
  S("w-s3","See It Run: one blowdown cycle (EXAMPLE numbers)",
    seg("skMode",[["timed","Timed sampling"],["sh","Sample and hold"]])+
    '<div class="svgbox" style="margin-top:8px"><svg id="skSch" viewBox="0 0 310 112" role="img" aria-label="Skimmer line from the boiler through the isolation valve, electrode cross, throttling device and blowdown valve to the drain"></svg></div>'+
    '<div class="infocard" id="skBan" aria-live="polite"><b id="skState">Ready</b><br><span id="skCap">Press Auto-play or a step button.</span><br><b id="skChk"></b></div>'+
    '<div class="svgbox" style="margin-top:8px"><svg id="skChart" viewBox="0 0 320 178" role="img" aria-label="Strip chart of conductivity with set point lines"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Controller shows (EXAMPLE)</span><span class="v" id="skRd">–</span></div><div class="ro"><span class="k">Blowdown valve</span><span class="v" id="skVl" style="font-size:1rem">–</span></div></div>'+
    '<div class="row" style="margin-top:10px"><button type="button" id="skB1">1 Sample</button><button type="button" id="skB2">2 Hold</button><button type="button" id="skB3">3 Blow down</button><button type="button" id="skB4">4 Wait</button></div>'+
    '<div class="row" style="margin-top:8px"><button type="button" id="skPlay">▶ Auto-play</button><button type="button" class="secondary" id="skPause">⏸ Pause</button><button type="button" class="secondary" id="skReset">↺ Reset</button></div>'+
    '<label class="lbl" for="skSpd" style="margin-top:8px">Speed: <b id="skSpdv">2</b>×</label><input type="range" id="skSpd" min="1" max="4" value="2">'+
    '<label class="lbl" for="skSP">Set point: <b id="skSPv">3,500</b> µS/cm (3,500 = West Mechanical recommended; other values EXAMPLE)</label><input type="range" id="skSP" min="2600" max="4300" step="50" value="3500">'+
    '<label class="lbl" for="skD">Differential: <b id="skDv">150</b> µS/cm (EXAMPLE)</label><input type="range" id="skD" min="50" max="500" step="50" value="150">'+
    '<label class="check-row"><input type="checkbox" id="skAl"> Show alarms (High alarm 4,000 and Low alarm 2,500, EXAMPLE)</label>'+
    '<p class="wnote">EXAMPLE ONLY. Not RVAF\'s settings. The 3,500 set point is West Mechanical\'s recommended number (as read on the MegaTron; confirm units on the controller); real limits come from Zach\'s water treatment vendor and the boiler maker. Time is compressed in this demo.</p>');
  var XL=34,XR=312,YT=18,YB=142,V0=2000,V1=4500;
  function yv(v){return YB-(YB-YT)*(clamp(v,V0,V1)-V0)/(V1-V0);}
  function skDraw(){
    var tl=SK.tl, i=clamp(SK.idx,0,tl.length-1), e=tl[i], n=tl.length-1;
    var phase=i; var open=e.v===1;
    var seg=null; SK.segs.forEach(function(s){if(i>=s.start&&i<=s.end)seg=s;});
    $("skSch").innerHTML=skim({valveOpen:open,flow:open?phase:null,glow:open?1:0.3,ring:(e.s==="BLOW"&&SK.mode==="sh"&&e.ring!=null)?e.ring:null,fresh:clamp(1-(e.A-3000)/1200,0,1)});
    var g='<rect x="'+XL+'" y="'+YT+'" width="'+(XR-XL)+'" height="'+(YB-YT)+'" fill="#0d0f12" stroke="#59616c"/>';
    function hline(v,col,lab,dash){var y=yv(v);return '<line x1="'+XL+'" y1="'+y+'" x2="'+XR+'" y2="'+y+'" stroke="'+col+'" stroke-width="1.6" stroke-dasharray="'+(dash||"5 3")+'"/><text x="'+(XL+3)+'" y="'+(y-3)+'" fill="'+col+'" font-size="7.5">'+lab+'</text>';}
    g+=hline(SK.SP,"#ffd23f","Set point "+num(SK.SP)+(SK.SP===3500?" (West Mechanical recommended)":" EXAMPLE"));
    g+=hline(SK.SP-SK.D,"#4ea8ff","Set point minus differential "+num(SK.SP-SK.D)+" EXAMPLE");
    if(SK.al){g+=hline(4000,"#ff5a5f","High alarm 4,000 EXAMPLE","2 3")+hline(2500,"#ff5a5f","Low alarm 2,500 EXAMPLE","2 3");}
    function xt(k){return XL+(XR-XL)*k/n;}
    var pa="",ga="";
    for(var k=0;k<=i;k++){pa+=(k?"L":"M")+xt(k).toFixed(1)+" "+yv(tl[k].P).toFixed(1); ga+=(k?"L":"M")+xt(k).toFixed(1)+" "+yv(tl[k].A).toFixed(1);}
    g+='<path d="'+ga+'" fill="none" stroke="#8a95a1" stroke-width="1.5" stroke-dasharray="1 3" opacity=".8"/><path d="'+pa+'" fill="none" stroke="#2EC4B6" stroke-width="2.6"/>';
    SK.segs.forEach(function(s){ if(s.start<=i){var col=s.s==="BLOW"?"rgba(62,207,106,.10)":s.s==="SAMPLE"?"rgba(78,168,255,.08)":"rgba(0,0,0,0)"; if(col!=="rgba(0,0,0,0)")g+='<rect x="'+xt(s.start).toFixed(1)+'" y="'+YT+'" width="'+Math.max(1,xt(Math.min(s.end,i))-xt(s.start)).toFixed(1)+'" height="'+(YB-YT)+'" fill="'+col+'"/>';}});
    for(var q=0;q<=i;q++){ if(tl[q].chk) g+='<text x="'+xt(q).toFixed(1)+'" y="'+(yv(tl[q].P)-6).toFixed(1)+'" fill="#3ecf6a" font-size="12" text-anchor="middle">✓</text>';}
    g+='<circle cx="'+xt(i).toFixed(1)+'" cy="'+yv(e.P).toFixed(1)+'" r="4.5" fill="#fff"/>';
    g+='<text x="'+XL+'" y="'+(YB+14)+'" fill="#9AA0A6" font-size="8">time → (compressed)</text><text x="'+XR+'" y="'+(YB+14)+'" fill="#ffd23f" font-size="8" text-anchor="end">EXAMPLE</text><text x="'+XL+'" y="'+(YB+26)+'" fill="#8a95a1" font-size="7.5">teal = reading shown · dotted gray = actual boiler water</text>';
    $("skChart").innerHTML=g;
    var st=e.s; $("skState").textContent=NAME[st]+(st==="BLOW"&&SK.mode==="sh"&&e.ring!=null?" ("+fmt(e.ring*4,1)+" s left)":"");
    $("skCap").textContent=(st==="BLOW"&&SK.mode==="sh"?"Reading is above the set point, so the valve opens for the preset blowdown time.":st==="SAMPLE"&&SK.mode==="timed"?CAP.SAMPLE:CAP[st]);
    var ck="",ce=null,ne=null; for(var z=i;z>=0;z--){var te=tl[z]; if(!ce&&te.chk)ce=te.chk; if(!ne&&te.note)ne=te.note; if(te.s==="SAMPLE")break;} if(ce) ck="Check: "+num(ce.P)+" vs set point "+num(SK.SP)+" → "+(ce.above?"above, so blow down":"in range, nothing to blow down"); if(ne) ck=(ck?ck+". ":"")+ne; $("skChk").textContent=ck;
    $("skRd").textContent=num(e.P)+" µS/cm"; $("skVl").textContent=open?"Open (green)":"Closed (red)";
    $("skB2").disabled=SK.mode==="timed"; $("skB2").setAttribute("aria-disabled",SK.mode==="timed");
  }
  function skStop(){if(SK.playing){clearInterval(SK.playing);SK.playing=null;} SK.stopAt=null;}
  function skRun(stopAt){
    skStop(); SK.stopAt=stopAt; var spd=+$("skSpd").value;
    if(H.reduceMotion){SK.idx=stopAt; skDraw(); return;}
    SK.playing=setInterval(function(){SK.idx=Math.min(SK.idx+spd,SK.stopAt); skDraw(); if(SK.idx>=SK.stopAt)skStop();},50);}
  function skRebuild(){skStop(); buildTL(); SK.idx=0; skDraw();}
  function skStep(type){
    var segs=SK.segs.filter(function(s){return s.s===type;});
    if(!segs.length){$("skState").textContent=NAME[type]; $("skCap").textContent=type==="HOLD"?"There is no hold step in timed sampling.":"No blowdown happens with these numbers: the reading is already in range at the check."; $("skChk").textContent=""; return;}
    var nxt=segs.filter(function(s){return s.start>SK.idx||(SK.idx>s.start&&SK.idx<s.end&&false);})[0]||segs[0];
    SK.idx=nxt.start; skDraw(); skRun(nxt.end);}
  H.chipGroup($("skMode"),function(v){SK.mode=v;skRebuild();}).pick("timed");
  $("skB1").addEventListener("click",function(){skStep("SAMPLE");}); $("skB2").addEventListener("click",function(){skStep("HOLD");});
  $("skB3").addEventListener("click",function(){skStep("BLOW");}); $("skB4").addEventListener("click",function(){skStep("WAIT");});
  $("skPlay").addEventListener("click",function(){ if(SK.idx>=SK.tl.length-1)SK.idx=0; if(H.reduceMotion){ /* step by segment */
      var next=SK.segs.filter(function(s){return s.start>SK.idx;})[0]; if(next){SK.idx=next.end; skDraw();} else {SK.idx=0; skDraw();} return; }
    skRun(SK.tl.length-1);});
  $("skPause").addEventListener("click",skStop);
  $("skReset").addEventListener("click",function(){skStop();SK.idx=0;skDraw();});
  $("skSpd").addEventListener("input",function(){$("skSpdv").textContent=$("skSpd").value; if(SK.playing)skRun(SK.stopAt);});
  $("skSP").addEventListener("input",function(){SK.SP=+$("skSP").value;$("skSPv").textContent=num(SK.SP);skRebuild();});
  $("skD").addEventListener("input",function(){SK.D=+$("skD").value;$("skDv").textContent=SK.D;skRebuild();});
  $("skAl").addEventListener("change",function(){SK.al=$("skAl").checked;skDraw();});
  skRebuild();

  S("w-s3-2","Learning check","");
  EW.chooser($("w-s3-2"),[{prompt:"The reading is above the set point at the check. What happens next?",options:["The valve stays closed until the next sample interval","The valve opens (or stays open) to blow down until the reading has come down","The controller shuts down and sounds the high alarm"],answer:1,why:"Above the set point means more blowdown. In timed sampling the valve stays open until the reading falls by the differential; in sample and hold it opens for the preset blowdown time, then holds and checks again. A valve that stays closed until the next interval is what happens when the reading is in range, and the high alarm is a separate setting."}],{label:"Question"});

  /* ---------- S4: parts diagram ---------- */
  S("w-s4","Skimmer line parts: tap for the job",
    '<div class="svgbox"><svg id="ptSvg" viewBox="0 0 310 112" role="img" aria-label="Skimmer line parts"></svg></div>'+chips("ptC",PARTS.map(function(p){return p[0].split(" (")[0].replace("Drain / blowdown tank","Drain");}))+card("ptO","Tap a part."));
  var ptSel=-1; function ptDraw(){$("ptSvg").innerHTML=skim({valveOpen:false,sel:ptSel,glow:0.4,fresh:0.5});}
  H.chipGroup($("ptC"),function(i){ptSel=+i; var p=PARTS[ptSel]; $("ptO").innerHTML="<b>"+p[0]+":</b> "+p[1]+"<br><b>If it's missing:</b> "+p[2]; ptDraw();}); ptDraw();

  /* ---------- S5 ---------- */
  var FAM=[["MegaTron MT","A flexible multi-system controller for blowdown, chemical feed, and monitoring."],["MegaTron XT","An advanced touchscreen controller with more communications and data features."],["MegaTron XK","A configurable controller with expandable inputs, outputs, and communications."],["Find the model label","Which one is at a plant is on its model label. Advantage's manuals show a keypad MegaTron, a single-system MegaTronXS, and a touchscreen MegaTronXT."]];
  S("w-s5","The MegaTron family",chips("fmC",FAM.map(function(f){return f[0];}))+card("fmO","Tap a model, then the label tip.")+'<p class="wnote">Wording follows Advantage Controls\' product page.</p>');
  H.chipGroup($("fmC"),function(i){var f=FAM[+i]; $("fmO").innerHTML="<b>"+f[0]+":</b> "+f[1];});

  /* ---------- S6 ---------- */
  S("w-s6","Symptom deck","");
  EW.chooser($("w-s6"),[
    {prompt:"<b>False reading:</b> the display doesn't match a handheld test.",options:["The electrode is dirty or the controller is out of calibration","The blowdown valve is too small","The set point is too high"],answer:0,why:"Check: clean the electrode, then recalibrate against a reliable reading with fresh hot water blown past the probe for at least 2 minutes."},
    {prompt:"<b>Won't calibrate:</b> the controller refuses a new calibration value.",options:["A dirty or faulty electrode, or faulty wiring","The valve is open","The sample interval is too long"],answer:0,why:"Check: clean the electrode first, then replace the electrode or wiring if needed. If it still refuses, call Advantage."},
    {prompt:"<b>Outputs not energized:</b> the valve gets no signal.",options:["No flow in the sample line, or a blown fuse","The reading is below the low alarm","The isolation valve is too big"],answer:0,why:"Check: look for clogged pipes or strainers in the sample line, and check the fuse."},
    {prompt:"<b>Unstable reading:</b> the number jumps around (from Advantage's analog boiler manual).",options:["Water is flashing to steam in the electrode chamber","The set point is too low","The flush line is too short"],answer:0,why:"Check: throttle the flow control down so the probe stays in water, not steam."},
    {prompt:"Timed system: the valve is <b>closed</b> and the reading hasn't changed in a while.",options:["The controller is certainly broken","Probably normal: it isn't sample time yet","The electrode has failed"],answer:1,why:"Timed and sample-and-hold readings only update at the end of each sample. Check when the last sample was before you decide anything is wrong."}],{label:"Symptom"});

  /* ---------- S7: Zach's notes form ---------- */
  S("w-s7","✏️ Zach's notes (to fill in)",
    EW.txt("zmN","MegaTron model (MT, XT, or XK)","")+EW.txt("zmS","Sampling mode","")+EW.txt("zmV","Set point, differential, and alarm values at RVAF","")+EW.txt("zmL","Where the probe and blowdown valve are","")+EW.txt("zmC","Does it run chemical feed?","")+
    '<p class="wnote">Left empty on purpose. These are placeholders for Zach to fill in.</p>');
  EW.keep(["zmN","zmS","zmV","zmL","zmC"]);

  /* ---------- Action: log ---------- */
  S("w-action","MegaTron log sheet",
    EW.txt("mlM","Model label","")+
    EW.sel("mlS","Sampling mode",[["","?"],["continuous","Continuous"],["timed","Timed sampling"],["sh","Sample and hold"],["pulse","Pulse sample"]])+
    '<div class="grid3">'+EW.fld("mlR","Reading µS/cm","")+EW.fld("mlP","Set point","")+EW.fld("mlD","Differential","")+'</div>'+
    EW.sel("mlV","Blowdown valve right now",[["","?"],["open","Open"],["closed","Closed"]])+EW.txt("mlL","Probe location","")+
    '<p class="hint" id="mlH" aria-live="polite"></p>'+EW.chk("mlZ","Zach checked this"));
  EW.keep(["mlM","mlS","mlR","mlP","mlD","mlV","mlL","mlZ"],function(){
    var r=EW.v("mlR"),sp=EW.v("mlP"),v=$("mlV").value,m=$("mlS").value,h="";
    if(isFinite(r)&&isFinite(sp)&&v){
      if(r>=sp&&v==="closed") h="Reading is at or above the set point but the valve is closed. "+(m==="timed"||m==="sh"?"On this mode it may just not be sample time: when was the last sample?":"Look into it with Zach.");
      else if(r<sp&&v==="open") h="Reading is below the set point but the valve is open. It may be in a sample, or finishing a blowdown down to the differential.";
      else h="The valve position fits the reading versus the set point.";
    } else h="Enter the reading, set point and valve position to see a hint.";
    $("mlH").textContent=h;});
})();
