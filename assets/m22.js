/* Module 22 widgets: West Mechanical Field Notes (Tyson RVAF steam and condensate loop).
   Every label and number here comes from the Module 22 markdown; anything illustrative is marked as such. */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each, store=EW.store;
  var RM=H.reduceMotion&&H.reduceMotion();
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  /* Subsection ids: s1-s5 = Part A (A1-A5); s6-s13 = Tyson RVAF 1-8 */
  var RV={map:"s6",fill:"s7",boilers:"s8",loads:"s9",cooker:"s10",lpcr:"s11",pumps:"s12",walk:"s13"};

  /* ---------- Customer tabs (Part B) ---------- */
  var tabs=document.querySelectorAll(".ctabs [data-tab]");
  function showTab(t,focus){
    each(tabs,function(b){var on=b.getAttribute("data-tab")===t; b.setAttribute("aria-selected",String(on)); b.tabIndex=on?0:-1; if(on&&focus)b.focus();});
    each(document.querySelectorAll(".cpanel"),function(p){p.hidden=p.id!=="cust-"+t;});
    store.set("ui:tab",t);
  }
  each(tabs,function(b,i){
    b.addEventListener("click",function(){showTab(b.getAttribute("data-tab"));});
    b.addEventListener("keydown",function(e){var k=e.key, n=tabs.length, j=-1; var idx=Array.prototype.indexOf.call(tabs,b);
      if(k==="ArrowRight")j=(idx+1)%n; else if(k==="ArrowLeft")j=(idx-1+n)%n; if(j>=0){e.preventDefault();showTab(tabs[j].getAttribute("data-tab"),true);}});
  });
  showTab(store.get("ui:tab")||"rvaf");
  /* Make in-page links (contents, hook stops, resume) work even when the target sits in a hidden tab */
  function reveal(id){var el=document.getElementById(id); if(!el) return false; var p=el.closest&&el.closest(".cpanel");
    if(p&&p.hidden){showTab(p.id.replace("cust-",""));} return true;}
  window.M8reveal=reveal;
  document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute("href").slice(1); if(id&&reveal(id)){var el=document.getElementById(id); if(el){e.preventDefault(); el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"}); history.replaceState(null,"","#"+id);}}},true);
  if(location.hash) reveal(location.hash.slice(1));
  window.addEventListener("hashchange",function(){reveal(location.hash.slice(1));});
  var rb=$("resumeBtn"); if(rb) rb.addEventListener("click",function(){var P=HVAC.progress(CFG.mid); if(P&&P.last) reveal(P.last);},true);

  /* ---------- Hook: follow the pipe over a plan view of the real Tyson RVAF layout ----------
     Positions follow Zach's marked-up aerial (white = building, red = cookers, yellow = cooker HPCR stations,
     purple = LPCR, blue = DA, green = boilers, orange = boiler-room HPCR). Pipe routes are schematic. */
  var HC={hydro:"#d2a679",soft:"#d7f6ff",softRim:"#22a6b3",red:"#ff5a5f",yellow:"#ffd23f",purple:"#b07cff",blue:"#4ea8ff",green:"#3ecf6a",orange:"#ff9a3c",white:"#e6edf3"};
  /* water softeners (3): small upright cylinders inside the boiler room, top-left by the wall: [cx,cy] */
  var SOFT=[[195,-2],[218,-2],[186,18]];
  /* equipment: key -> [x,y,w,h,color,label,info,link] */
  var EQ={
    da:[200,12,13,28,HC.blue,"DA","<b>Deaerator (DA) tank</b>, a horizontal tank (laid on its side) with its long axis perpendicular to the boiler row, just above the LPCR. Heats makeup and return water with steam so dissolved oxygen and CO₂ vent off. The water line coming in from the softeners has a <b>4150-style pneumatic level controller</b>, and a <b>pneumatic controller on the DA's steam inlet</b> controls steam into the DA.",RV.fill],
    lpcr:[183,48,36,18,HC.purple,"LPCR","<b>LPCR</b>, low pressure condensate return: a horizontal tank (laid on its side) with its long axis parallel to the boiler row, at the left end of the boiler room. Holds about <b>40 psi</b>; a back-pressure PRV opens above that and vents to the roof. The LPCR has one <b>4150-style pneumatic level controller</b>, and it controls water going <i>out</i> of the tank. Its outlet valve's actuator looks like a 667-series one (model TBD, 3-15 psi) but is tubed to the <b>top</b> of the diaphragm: top-tubed is how a direct-acting 657-style actuator is fed, so check the nameplate.",RV.lpcr],
    b1:[232,30,16,40,HC.green,"B1","<b>Boiler 1</b> of four, in a row across the boiler room. Each boiler has its own <b>4150-style pneumatic level controller</b> controlling the water going <i>into</i> that boiler.",RV.boilers],
    b2:[256,30,16,40,HC.green,"B2","<b>Boiler 2</b> of four, with its own 4150-style pneumatic level controller on the water going into it.",RV.boilers],
    b3:[280,30,16,40,HC.green,"B3","<b>Boiler 3</b> of four, with its own 4150-style pneumatic level controller on the water going into it.",RV.boilers],
    b4:[304,30,16,40,HC.green,"B4","<b>Boiler 4</b> of four, with its own 4150-style pneumatic level controller on the water going into it.",RV.boilers],
    hpcr:[324,36,24,30,HC.orange,"HPCR","<b>Boiler-room HPCR</b>, high pressure condensate return tank, at the far right end of the boiler room. Takes HP condensate from the cookers and LPCR pump discharge, and feeds the boilers.",RV.fill],
    c1:[72,118,38,40,HC.red,"Cooker 1","<b>Tyson cooker 1</b>, the middle cooker of the three in the row along the top wall of the main building.",RV.loads],
    c2:[130,118,38,40,HC.red,"Cooker 2","<b>Tyson cooker 2</b>, the right-hand cooker of the three.",RV.loads],
    c3:[28,118,38,40,HC.red,"Cooker 3","<b>Tyson cooker 3</b>, the left-hand cooker of the three.",RV.loads],
    y1:[112,127,14,22,HC.yellow,"1","<b>Cooker 1 HPCR + 3-way + back-pressure regulator</b>, directly beside cooker 1 (the middle cooker, on its right): that cooker's own HPCR tank (with a 4150-style pneumatic level controller), its three-way valve (actuator tubed to the top, series unconfirmed, may differ from 667-style, 3-15 psi), and its back-pressure steam regulator.",RV.cooker],
    y2:[170,127,14,22,HC.yellow,"2","<b>Cooker 2 HPCR + 3-way + back-pressure regulator</b>, directly beside cooker 2 (the right-hand cooker, just right of it). Its HPCR tank has a 4150-style pneumatic level controller; its three-way valve actuator is tubed to the top (series unconfirmed, may differ from 667-style, 3-15 psi).",RV.cooker],
    hydro:[94,228,52,28,HC.hydro,"Hydrolyzer","<b>Hydrolyzer</b>, a steam load in the main building, lower-middle area (south side, well below the cooker row), where Zach marked it. Steam comes off the steam header to it. Its condensate return isn't confirmed yet: Zach isn't sure whether it goes back as high or low pressure condensate.",RV.loads],
    y3:[12,127,14,22,HC.yellow,"3","<b>Cooker 3 HPCR + 3-way + back-pressure regulator</b>, directly beside cooker 3 (the left-hand cooker, just left of it, by the wall). Its HPCR tank has a 4150-style pneumatic level controller; its three-way valve actuator is tubed to the top (series unconfirmed, may differ from 667-style, 3-15 psi).",RV.cooker]
  };
  /* pipe routes (schematic): key -> [path for drawing, path for moving dots, color, dashed] */
  var PIPE={
    /* makeup water through the boiler-room wall to the three softeners, then a softened-water header into the top of the DA */
    makeup:["M152 -16 H218 M195 -16 V-7 M218 -16 V-7 M186 -16 V13",["M152 -16 H195 V-7","M152 -16 H218 V-7","M152 -16 H186 V13"],"#9ad1ff"],
    soft:["M191 18 H193 V6 H218 M195 3 V6 M218 3 V6 M206.5 6 V12",["M195 3 V6 H206.5 V12","M218 3 V6 H206.5 V12","M191 18 H193 V6 H206.5 V12"],"#d7f6ff"],
    da2hp:["M213 26 H220 V10 H336 V36","M213 26 H220 V10 H336 V36","#9ad1ff"],
    /* boiler feedwater: out of the boiler-room HPCR, along the BOTTOM side of the boiler row, then up into the LEFT side of each boiler */
    feed:["M324 60 H322 V78 H228 M228 78 V50 H232 M252 78 V50 H256 M276 78 V50 H280 M300 78 V50 H304",["M324 60 H322 V78 H228 V50 H232","M324 60 H322 V78 H252 V50 H256","M324 60 H322 V78 H276 V50 H280","M324 60 H322 V78 H300 V50 H304"],"#9ad1ff"],
    steam:["M312 30 V26 H225 V111 H47 V118 M91 111 V118 M149 111 V118","M312 26 H225 V111 H47 V118","#c3ccd6"],
    hydro:["M69 111 V214 H120 V228","M69 111 V214 H120 V228","#c3ccd6"],
    recirc:["M14 127 a5 5 0 1 1 10 0 M114 127 a5 5 0 1 1 10 0 M172 127 a5 5 0 1 1 10 0","M114 127 a5 5 0 1 1 10 0","#2EC4B6"],
    hpret:["M19 149 V170 H344 V66 M119 149 V170 M177 149 V170","M19 170 H344 V66","#2EC4B6"],
    lp:["M47 158 V190 H222 V57 H219 M91 158 V190 M149 158 V190","M47 190 H222 V57 H219","#c9a7ff"],
    vent:["M188 50 l-4 -6","M188 50 l-4 -6","#c9d1d9",1],
    lp2pump:["M201 66 V78","M201 66 V78","#c9a7ff"],
    pumprec:["M189 84 H187 V66","M189 84 H187 V66","#c9a7ff",1],
    pump2hp:["M209 90 V94 H332 V66","M209 90 V94 H332 V66","#c9a7ff"]
  };
  var HK=[
    {t:"Makeup → 3 softeners → DA (blue)",lit:["s1","s2","s3","da"],p:["makeup","soft"],a:RV.fill,i:"Makeup water comes in through the boiler-room wall to the <b>three water softeners</b> in the top-left corner of the boiler room. A softened-water header then carries it into the top of the <b>deaerator</b> (blue)."},
    {t:"DA → boiler-room HPCR (orange)",lit:["da","hpcr"],p:["da2hp"],a:RV.fill,i:"From the DA, water heads to the <b>boiler-room HPCR</b> (orange) at the far right end of the boiler room."},
    {t:"HPCR → boilers B1–B4 (green)",lit:["hpcr","b1","b2","b3","b4"],p:["feed"],a:RV.boilers,i:"The HPCR feeds the <b>four boilers</b> (green): the feedwater line runs along the <b>bottom side</b> of the boiler row, then branches up into the <b>left side of each boiler</b>. Each boiler has its own 4150-style pneumatic level controller and actuated feed valve, controlling water into that boiler."},
    {t:"Steam out to the cookers (red) + hydrolyzer (tan)",lit:["b1","b2","b3","b4","c1","c2","c3","hydro","hyret"],p:["steam","hydro"],a:RV.loads,i:"Steam leaves the boilers on the steam header for the <b>three Tyson cookers</b> (red) and the <b>hydrolyzer</b> (tan) in the lower-middle of the main building. The hydrolyzer's condensate return (dashed) is <b>not confirmed</b>: high or low pressure is still a question for Zach."},
    {t:"Cooker HP condensate → cooker HPCR + 3-way + back-pressure regulator (yellow)",lit:["c1","c2","c3","y1","y2","y3"],p:[],a:RV.cooker,i:"High pressure condensate leaving a cooker goes to <b>that cooker's own HPCR station</b> (yellow): the HPCR tank, the three-way valve, and a <b>back-pressure steam regulator</b>."},
    {t:"3-way: recirculate, or send HP condensate to the boiler-room HPCR (orange)",lit:["y1","y2","y3","hpcr"],p:["recirc","hpret"],a:RV.cooker,i:"Each three-way valve either <b>recirculates</b> to that cooker's HPCR tank or <b>sends</b> the condensate back to the <b>boiler-room HPCR</b> (orange)."},
    {t:"Cooker LP condensate → LPCR (purple, ~40 psi, vents to roof)",lit:["c1","c2","c3","lpcr"],p:["lp","vent"],a:RV.lpcr,i:"Low pressure condensate from the cookers goes to the <b>LPCR</b> (purple). It holds about <b>40 psi</b>; above that the back-pressure PRV opens and vents to the roof."},
    {t:"LPCR pumps → recirculate, or to the HPCR (orange)",lit:["lpcr","pumps","hpcr"],p:["lp2pump","pumprec","pump2hp"],a:RV.pumps,i:"The LPCR's actuated outlet valve feeds <b>two pumps</b> (one always running). They <b>recirculate</b> or send condensate to the <b>boiler-room HPCR</b> (orange)."}
  ];
  S("w-hook","Follow the pipe: Tyson RVAF plan view",
    '<div class="svgbox hk-map"><svg id="hkSvg" viewBox="6 -28 348 334" role="img" aria-label="Plan view of the Tyson RVAF plant: main building with three cookers along the top wall, boiler room block at the top right with LPCR, deaerator, four boilers and the boiler-room HPCR"></svg></div>'+
    '<p class="hk-cap">Simplified plan view based on Zach\'s marked-up aerial; pipe routes are schematic.</p>'+
    '<div class="hk-legend" id="hkLegend"></div>'+
    '<div class="row"><button type="button" id="hkGo">🔦 Follow the pipe</button><button type="button" class="secondary" id="hkClear">Clear</button></div>'+
    '<ol class="hk-stops" id="hkStops"></ol><div class="infocard" id="hkOut" aria-live="polite">Tap <b>Follow the pipe</b>, a numbered step, or any piece of equipment.</div>');
  $("hkLegend").innerHTML=[["white","Building outline",1],["soft","Softeners (3)"],["red","Tyson cookers (3)"],["yellow","Cooker HPCR + 3-way + back-pressure regulator (1 per cooker)"],["purple","LPCR (~40 psi)"],["blue","DA (deaerator)"],["green","Boilers B1–B4"],["orange","Boiler-room HPCR"],["hydro","Hydrolyzer"]].map(function(l){return '<span><i style="'+(l[2]?'border:2px solid '+HC.white+';background:transparent':l[0]==="soft"?'background:'+HC.soft+';border:2px solid '+HC.softRim+';border-radius:50%':'background:'+HC[l[0]])+'"></i>'+l[1]+'</span>';}).join("")+'<span><i class="dash"></i>Unconfirmed (dashed)</span>'+[["#c3ccd6","Steam"],["#9ad1ff","Makeup / feed water"],["#2EC4B6","HP condensate"],["#c9a7ff","LP condensate"]].map(function(l){return '<span><i class="pipe" style="background:'+l[0]+'"></i>'+l[1]+'</span>';}).join("");
  var hkN=-1, hkOne=-1, hkSel=null, hkTimer=null;
  function hkActive(){ var s={lit:{},p:{},cur:{}}; HK.forEach(function(st,i){ var on=hkOne>=0?i===hkOne:i<=hkN; if(!on) return; st.lit.forEach(function(k){s.lit[k]=1;}); st.p.forEach(function(k){s.p[k]=1; if(i===(hkOne>=0?hkOne:hkN)) s.cur[k]=1;}); }); return s; }
  function hkDraw(){
    var A=hkActive(), g='<defs><radialGradient id="hkShadeR" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><linearGradient id="hkShadeV" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient><linearGradient id="hkShadeH" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient></defs>';
    g+='<rect x="10" y="104" width="340" height="196" fill="#121a22" stroke="'+HC.white+'" stroke-width="2"/>';
    g+='<rect x="180" y="-24" width="170" height="128" fill="#16202b" stroke="'+HC.white+'" stroke-width="2"/>';
    g+='<text x="20" y="292" fill="#9AA0A6" font-size="9">MAIN BUILDING</text><text x="300" y="101" fill="#9AA0A6" font-size="8" text-anchor="middle">BOILER ROOM</text>';
    g+='<text x="150" y="-19" fill="#c9d1d9" font-size="7.5" text-anchor="end">makeup in →</text>';
    g+='<text x="342" y="292" fill="#9AA0A6" font-size="9" text-anchor="end">W</text>';
    Object.keys(PIPE).forEach(function(k){ var p=PIPE[k], on=A.p[k];
      g+='<path class="hk-pipe" data-p="'+k+'" d="'+p[0]+'" fill="none" stroke="'+(on?p[2]:"#2f3b48")+'" stroke-width="'+(on?3.2:2)+'"'+(p[3]?' stroke-dasharray="4 3"':'')+' stroke-linecap="round" stroke-linejoin="round"/>';
      if(on&&A.cur[k]&&!RM) [].concat(p[1]).forEach(function(dp,j,all){ for(var d=0;d<(all.length>1?2:3);d++) g+='<circle r="2.8" fill="'+p[2]+'" class="hk-dot"><animateMotion dur="2.4s" begin="'+(d*(all.length>1?1.2:0.8)+j*0.3)+'s" repeatCount="indefinite" path="'+dp+'"/></circle>'; });
    });
    Object.keys(EQ).forEach(function(k){ var e=EQ[k], on=A.lit[k], sel=hkSel===k, cyl=(k==="da"||k==="lpcr"), vert=e[3]>e[2];
      var x=e[0],y=e[1],w=e[2],h=e[3],cxx=x+w/2,cyy=y+h/2, rx=cyl?(vert?w/2:h/2):3;
      g+='<g class="hk-eq'+(cyl?' hk-cyl':'')+'" data-k="'+k+'" tabindex="0" role="button" aria-label="'+e[6].replace(/<[^>]+>/g,"")+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+e[4]+'" fill-opacity="'+(on||sel?0.95:0.38)+'" stroke="'+(sel?"#ffffff":e[4])+'" stroke-width="'+(sel?2.5:on?2:1)+'"/>';
      if(cyl){ /* horizontal cylinder (tank laid on its side) in plan view: round shading across the short axis + end-cap heads */
        g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="url(#'+(vert?'hkShadeV':'hkShadeH')+')" pointer-events="none"/>';
        g+=vert?'<ellipse cx="'+cxx+'" cy="'+(y+w/2)+'" rx="'+(w/2-1.5)+'" ry="2.6" fill="none" stroke="#0b1015" stroke-opacity=".55" pointer-events="none"/><ellipse cx="'+cxx+'" cy="'+(y+h-w/2)+'" rx="'+(w/2-1.5)+'" ry="2.6" fill="none" stroke="#0b1015" stroke-opacity=".55" pointer-events="none"/>'
               :'<ellipse cx="'+(x+h/2)+'" cy="'+cyy+'" rx="2.4" ry="'+(h/2-1.5)+'" fill="none" stroke="#0b1015" stroke-opacity=".55" pointer-events="none"/><ellipse cx="'+(x+w-h/2)+'" cy="'+cyy+'" rx="2.4" ry="'+(h/2-1.5)+'" fill="none" stroke="#0b1015" stroke-opacity=".55" pointer-events="none"/>';
      }
      if(e[5]) g+='<text x="'+cxx+'" y="'+(cyy+(vert&&cyl?2.5:3))+'" fill="#0b1015" font-size="'+(cyl?7:(w<20?7:8))+'" font-weight="700" text-anchor="middle" pointer-events="none"'+(vert&&cyl?' transform="rotate(-90 '+cxx+' '+cyy+')"':'')+'>'+e[5]+'</text>';
      g+='</g>';
    });
    SOFT.forEach(function(sf,i){ var k="s"+(i+1), on=A.lit[k]||hkSel===k, sel=hkSel===k;
      g+='<g class="hk-eq hk-soft" data-k="'+k+'" tabindex="0" role="button" aria-label="Water softener '+(i+1)+' of 3"><circle cx="'+sf[0]+'" cy="'+sf[1]+'" r="5" fill="'+HC.soft+'" fill-opacity="'+(on?0.95:0.4)+'" stroke="'+(sel?"#ffffff":HC.softRim)+'" stroke-width="'+(sel?2.2:1.6)+'"/><circle cx="'+sf[0]+'" cy="'+sf[1]+'" r="5" fill="url(#hkShadeR)" pointer-events="none"/><circle cx="'+sf[0]+'" cy="'+sf[1]+'" r="2.4" fill="none" stroke="'+HC.softRim+'" stroke-width=".8" pointer-events="none"/></g>'; });
    var ron=A.lit.hyret||hkSel==="hyret";
    g+='<g class="hk-eq hk-hyret" data-k="hyret" tabindex="0" role="button" aria-label="Hydrolyzer condensate return: unconfirmed, high or low pressure to be determined"><rect x="146" y="234" width="122" height="18" fill="transparent"/><path d="M146 242 H172" fill="none" stroke="'+HC.hydro+'" stroke-opacity="'+(ron?1:0.55)+'" stroke-width="2.4" stroke-dasharray="3 3"/><text x="175" y="245" fill="'+(ron?"#f0dcc4":"#b9a58f")+'" font-size="7.5" font-weight="700">? return (HP or LP, TBD)</text></g>';
    var pon=A.lit.pumps||hkSel==="pumps";
    g+='<g class="hk-eq" data-k="pumps" tabindex="0" role="button" aria-label="LPCR pumps"><circle cx="195" cy="84" r="6" fill="'+HC.purple+'" fill-opacity="'+(pon?0.95:0.38)+'" stroke="'+HC.purple+'"/><circle cx="209" cy="84" r="6" fill="'+HC.purple+'" fill-opacity="'+(pon?0.95:0.38)+'" stroke="'+HC.purple+'"/><text x="202" y="87" fill="#0b1015" font-size="6" font-weight="700" text-anchor="middle" pointer-events="none">P P</text></g>';
    g+='<circle cx="188" cy="50" r="1.8" fill="none" stroke="#e6edf3"/>';
    $("hkSvg").innerHTML=g;
    $("hkStops").innerHTML=HK.map(function(s,i){ var done=hkOne>=0?i===hkOne:i<=hkN;
      return '<li class="'+(done?"ok":"")+'"><button type="button" class="hk-step" data-i="'+i+'" aria-pressed="'+(hkOne===i)+'"><b>'+(i+1)+'</b> '+s.t+'</button> <a href="#'+s.a+'" class="hk-jump">open ›</a></li>';}).join("");
    each($("hkStops").querySelectorAll(".hk-step"),function(b){b.addEventListener("click",function(){ if(hkTimer){clearInterval(hkTimer);hkTimer=null;} var i=+b.getAttribute("data-i"); hkOne=i; hkN=-1; hkSel=null; hkDraw(); $("hkOut").innerHTML="<b>Step "+(i+1)+".</b> "+HK[i].i+' <a href="#'+HK[i].a+'">Go to that subsection ›</a>';});});
    each($("hkSvg").querySelectorAll(".hk-eq"),function(el){ function pick(){ var k=el.getAttribute("data-k"); hkSel=k; hkDraw();
        if(k==="hyret") $("hkOut").innerHTML='<b>Hydrolyzer condensate return: unconfirmed.</b> Zach isn\'t sure yet whether the hydrolyzer\'s condensate comes back as <b>high pressure</b> (toward an HPCR) or <b>low pressure</b> (toward the LPCR), so this stub isn\'t connected to either. Walk it with Zach before you assume. <a href="#'+RV.loads+'">Go to that subsection ›</a>';
        else if(/^s[123]$/.test(k)) $("hkOut").innerHTML='<b>Water softener '+k.slice(1)+' of 3</b>, inside the boiler room in the top-left corner by the wall. Makeup water comes through the wall to the softeners; softened water heads to the top of the deaerator. <a href="#'+RV.fill+'">Go to that subsection ›</a>';
        else if(k==="pumps") $("hkOut").innerHTML='<b>LPCR pumps</b> (two, one always running). Spot drawn next to the LPCR is schematic. <a href="#'+RV.pumps+'">Go to that subsection ›</a>';
        else $("hkOut").innerHTML=EQ[k][6]+' <a href="#'+EQ[k][7]+'">Go to that subsection ›</a>'; }
      el.addEventListener("click",pick); el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pick();}}); });
  }
  $("hkGo").addEventListener("click",function(){ if(hkTimer) clearInterval(hkTimer); hkOne=-1; hkSel=null; hkN=-1;
    function step(){ hkN++; hkDraw(); $("hkOut").innerHTML="<b>Step "+(hkN+1)+".</b> "+HK[hkN].i; if(hkN>=HK.length-1){clearInterval(hkTimer);hkTimer=null; $("hkOut").innerHTML+=' <span class="ok">✓ Loop traced. Tap any step to replay it.</span>';} }
    step(); if(hkN<HK.length-1) hkTimer=setInterval(step,RM?400:1800); });
  $("hkClear").addEventListener("click",function(){ if(hkTimer){clearInterval(hkTimer);hkTimer=null;} hkN=-1; hkOne=-1; hkSel=null; hkDraw(); $("hkOut").innerHTML="Tap <b>Follow the pipe</b>, a numbered step, or any piece of equipment."; });
  hkDraw();

  /* ---------- Term chips (Part A) ---------- */
  var TERMS=[["HPCR","High pressure condensate return: the path (and usually the tank) that collects condensate still at higher pressure and sends it back toward the boiler-feed side."],
    ["LPCR","Low pressure condensate return: the path (and usually the tank) that collects lower-pressure condensate."],
    ["Condensate","Steam that has given up its heat in a process load and turned back into water."],
    ["Deaerator","Heats water with steam, close to boiling, so dissolved oxygen and carbon dioxide come out a vent."],
    ["Softener","Ion exchange: resin beads take the hardness (calcium, magnesium) and give off sodium, which doesn't form scale."],
    ["Pressure reducing valve","Controls pressure downstream: drops a higher supply pressure to a lower one the equipment can use."],
    ["Back-pressure valve","Controls pressure upstream: holds pressure in the tank and piping behind it, opening to relieve if pressure climbs above set point."],
    ["Three-way valve","At each Tyson RVAF cooker: recirculate back to that cooker's HPCR tank, or send to the boiler-room HPCR."],
    ["Fisher level controller","Watches the level in a boiler or tank and tells a valve to open or close."],
    ["4150-style level controller","Zach's field name for the pneumatic level controllers at Tyson RVAF (confirm the nameplate): one on each boiler (water in), one on each cooker HPCR, one on the LPCR (water out), and one on the water line from the softeners into the DA. Fisher's own 4150K/4160K are pressure controllers; Fisher's displacer-type level controllers are the 2500/249 Level-Trol, L3 and L2 families. Either way the controller sends a 3-15 psig signal to the valve actuator."],
    ["Actuated valve","A valve with an actuator, the air-powered motor on top that strokes it open or closed. The muscle."],
    ["Pneumatic","Works on instrument air, not an electrical signal."],
    ["Flash","Hot condensate dropping to a lower pressure partly boils into steam. Wastes heat and can cause water hammer."],
    ["Hydrolyzer","A steam load at Tyson RVAF. Its return path isn't described yet: walk it with Zach."]];
  S("w-terms","Term chips: tap for a definition",'<div class="chips" id="trChips">'+TERMS.map(function(t,i){return '<button data-v="'+i+'">'+t[0]+'</button>';}).join("")+'</div><div class="infocard" id="trOut" aria-live="polite">Tap a term.</div>');
  H.chipGroup($("trChips"),function(i){var t=TERMS[+i]; $("trOut").innerHTML="<b>"+t[0]+":</b> "+t[1];});

  /* ---------- Path explorer (A1 and RVAF 2) ---------- */
  function pathExplorer(id,stops,caption){
    var box=S(id,"Four-stop path explorer",'<p class="lbl">Tap the stops in order.</p><div class="stops" id="'+id+'St">'+stops.map(function(s,i){return '<button type="button" data-i="'+i+'">'+(i+1)+'. '+s[0]+'</button>';}).join("")+'</div><div class="infocard" id="'+id+'Out" aria-live="polite">Start with stop 1.</div>'+(caption?'<p class="wnote">'+caption+'</p>':'')+'<button type="button" class="secondary" id="'+id+'Re">↺ Start over</button>');
    var at=0;
    each(box.querySelectorAll(".stops button"),function(b){b.addEventListener("click",function(){var i=+b.getAttribute("data-i");
      if(i<at){ $(id+"Out").innerHTML="<b>"+stops[i][0]+":</b> "+stops[i][1]+"<br><i>Why:</i> "+stops[i][2]; return; }
      if(i!==at){b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); $(id+"Out").innerHTML='<span class="no">Not yet. Next stop is '+(at+1)+'. '+stops[at][0]+'. Don\'t skip a stop in your head.</span>'; return;}
      b.classList.add("done"); at++; $(id+"Out").innerHTML="<b>"+stops[i][0]+":</b> "+stops[i][1]+"<br><i>Why this stop exists:</i> "+stops[i][2]+(at===stops.length?'<br><span class="ok">✓ Path complete.</span>':'');});});
    $(id+"Re").addEventListener("click",function(){at=0; each(box.querySelectorAll(".stops button"),function(b){b.classList.remove("done");}); $(id+"Out").textContent="Start with stop 1.";});
  }
  pathExplorer("w-s1",[["Softeners","Removes hardness (calcium and magnesium).","So minerals don't bake onto the tubes as scale."],
    ["Deaerator","Removes dissolved gases (oxygen and carbon dioxide) out a vent.","Oxygen pits steel; CO₂ forms carbonic acid in condensate lines."],
    ["HPCR / feed tank","Adds returned hot condensate to the deaerated feedwater.","Returned condensate is already hot, softened, and treated: it saves fuel, water, salt, and chemicals."],
    ["Boilers","Steam leaves the boilers for the process loads.","This is where the water finally does its job."]],"The exact tank names (HPCR, feed tank, or something else) are confirmed in each customer section.");
  pathExplorer("w-s7",[["Softeners","Removes hardness.","On rounds: is it actually making soft water, not just full of salt?"],
    ["Deaerator","Removes dissolved gases.","Read the DA gauge and thermometer on site; don't assume a textbook number."],
    ["Boiler-room HPCR","Deaerated water meets high pressure condensate coming home from the cookers.","Where cooker HP condensate rejoins the boiler-feed path."],
    ["The four boilers","Fed from the boiler-room HPCR; steam leaves for the hydrolyzer and three cookers.","Each holds its own water line with its own 4150-style pneumatic level controller (water into that boiler)."]],"Tyson RVAF order: softeners → deaerator → boiler-room HPCR → the four boilers.");

  /* ---------- A2: HPCR vs LPCR ---------- */
  S("w-s2","Two return tanks",
    '<div class="svgbox"><svg id="tkSvg" viewBox="0 0 320 150" role="img" aria-label="HPCR and LPCR returning toward a boiler-feed tank"></svg></div>'+
    '<div class="chips" id="tkC"><button data-v="hp">HPCR</button><button data-v="lp">LPCR</button><button data-v="one">Why not one tank?</button></div><div class="infocard" id="tkOut" aria-live="polite">Tap HPCR or LPCR.</div>');
  function tk(mode){
    var g='<rect x="230" y="50" width="80" height="50" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="270" y="72" fill="#EDEAE4" font-size="9" text-anchor="middle">Boiler-feed</text><text x="270" y="84" fill="#EDEAE4" font-size="9" text-anchor="middle">tank</text>';
    var hp=mode==="hp"||mode==="one", lp=mode==="lp"||mode==="one";
    g+='<rect x="20" y="15" width="70" height="40" rx="6" fill="#173a38" stroke="#2EC4B6"/><text x="55" y="39" fill="#EDEAE4" font-size="11" text-anchor="middle">HPCR</text>';
    g+='<rect x="20" y="95" width="70" height="40" rx="6" fill="#16283a" stroke="#5ab4ff"/><text x="55" y="119" fill="#EDEAE4" font-size="11" text-anchor="middle">LPCR</text>';
    if(mode==="one"){
      g+='<path d="M90 35 H160 V75" stroke="#2EC4B6" stroke-width="5" fill="none"/><path d="M90 115 H160 V75" stroke="#5ab4ff" stroke-width="5" fill="none"/><circle cx="160" cy="75" r="10" fill="#ff6b5b"/><text x="160" y="79" fill="#fff" font-size="11" text-anchor="middle" font-weight="800">!</text><path d="M170 75 H230" stroke="#59616c" stroke-width="3" stroke-dasharray="4 3"/>';
    } else {
      g+='<path d="M90 35 H190 V65 H230" stroke="'+(hp?"#2EC4B6":"#26323f")+'" stroke-width="5" fill="none"/><polygon points="222,59 232,65 222,71" fill="'+(hp?"#2EC4B6":"#26323f")+'"/>';
      g+='<path d="M90 115 H190 V85 H230" stroke="'+(lp?"#5ab4ff":"#26323f")+'" stroke-width="5" fill="none"/><polygon points="222,79 232,85 222,91" fill="'+(lp?"#5ab4ff":"#26323f")+'"/>';
    }
    $("tkSvg").innerHTML=g;
    $("tkOut").innerHTML={hp:"<b>HPCR:</b> collects condensate still at higher pressure and sends it back toward the boiler-feed side (teal).",lp:"<b>LPCR:</b> collects lower-pressure condensate (blue), so it has a place to go without fighting the higher-pressure system.",one:'<span class="no"><b>Teed together with no plan:</b> the two returns are not at the same pressure, so the higher-pressure line fights the lower one at the tee.</span> That is why there are two return systems. Not every site splits returns this way: it\'s a walkdown question for each plant.'}[mode]||"Tap HPCR or LPCR.";
  }
  H.chipGroup($("tkC"),tk); tk("");

  /* ---------- A3: Fisher pneumatic level controller trainer ---------- */
  S("w-s3","Level controller + actuated valve trainer",
    '<div class="chips" id="lcMode"><button data-v="feed">Boiler / feed (opens on falling level)</button><button data-v="out">Condensate tank outlet (opens on rising level)</button></div>'+
    '<div class="svgbox"><svg id="lcSvg" viewBox="0 0 320 170" role="img" aria-label="Gauge glass, pneumatic controller and actuated valve"></svg></div>'+
    '<label class="lbl" for="lcL">Drag the level: <b id="lcLv">50</b>%</label><input type="range" id="lcL" min="0" max="100" value="50">'+
    '<div id="lcFeedBox"><div class="grid2">'+EW.fld("lcBp","Boiler steam pressure (psi)",115)+'</div><label class="lbl" for="lcFp">Feed pressure: <b id="lcFpv">125</b> psi</label><input type="range" id="lcFp" min="80" max="150" value="125"></div>'+
    '<div class="gauge-row"><div class="ro"><span class="k">Air signal</span><span class="v" id="lcAir">–</span></div><div class="ro"><span class="k">Valve</span><span class="v" id="lcV">–</span></div></div>'+
    '<p class="status" id="lcOut" aria-live="polite"></p><p class="wnote">~115 psi is only a typical West Mechanical example. The air-signal bar is a picture of "more air / less air", not a real calibration.</p>');
  var lcMode="feed", lcL=50, SP=50;
  function lcTick(){
    var bp=v("lcBp"), fp=+$("lcFp").value; $("lcFpv").textContent=fp;
    var open=lcMode==="feed"?clamp((SP-lcL)/25,0,1):clamp((lcL-SP)/25,0,1);
    if(lcMode==="feed"){ var flow=open>0&&fp>bp?open*1.2:0; lcL=clamp(lcL-0.3+flow,0,100); }
    else { lcL=clamp(lcL+0.3-open*1.2,0,100); }
    $("lcL").value=Math.round(lcL); $("lcLv").textContent=Math.round(lcL);
    $("lcAir").textContent=Math.round(open*100)+"%"; $("lcV").textContent=open<0.02?"Closed":open>0.98?"Open":"Open "+Math.round(open*100)+"%";
    var msg;
    if(lcMode==="feed"){ if(open>0.02&&fp<=bp) msg='<span class="no">⚠️ No flow into boiler: the valve is open but feed pressure ('+fp+' psi) is not above boiler pressure ('+bp+' psi). The level keeps falling.</span>';
      else msg=open>0.02?'<span class="ok">Level low: the controller sends air, the feed valve opens, water goes in.</span>':'Level in band: the feed valve is closed. Steam leaving slowly pulls the level down.'; }
    else msg=open>0.02?'<span class="ok">Level high: the outlet valve opens and condensate leaves.</span>':'Level in band: the outlet valve stays closed while condensate comes in.';
    $("lcOut").innerHTML=msg;
    var y=150-lcL*1.3, vy=40+(1-open)*0;
    var g='<rect x="30" y="15" width="34" height="140" rx="6" fill="#0f1114" stroke="#9AA0A6" stroke-width="2"/><rect x="32" y="'+y+'" width="30" height="'+(153-y)+'" fill="#5ab4ff" opacity=".55"/><line x1="24" y1="'+(150-SP*1.3)+'" x2="70" y2="'+(150-SP*1.3)+'" stroke="#2EC4B6" stroke-dasharray="4 3"/><text x="47" y="166" fill="#9AA0A6" font-size="9" text-anchor="middle">gauge glass</text>';
    g+='<rect x="100" y="20" width="70" height="44" rx="6" fill="#262b33" stroke="#9AA0A6"/><text x="135" y="36" fill="#EDEAE4" font-size="9" text-anchor="middle">Fisher</text><text x="135" y="48" fill="#EDEAE4" font-size="9" text-anchor="middle">controller</text>';
    g+='<rect x="104" y="54" width="62" height="5" fill="#1e2b38"/><rect x="104" y="54" width="'+(62*open)+'" height="5" fill="#2EC4B6"/>';
    g+='<path d="M170 42 H230 V80" stroke="#cfe8ff" stroke-width="2" stroke-dasharray="3 3" fill="none"/><text x="200" y="36" fill="#9AA0A6" font-size="8" text-anchor="middle">air signal</text>';
    g+='<path d="M210 80 H250 L245 95 H215 Z" fill="#262b33" stroke="#9AA0A6"/><line x1="230" y1="95" x2="230" y2="'+(110+open*12)+'" stroke="#EDEAE4" stroke-width="3"/>';
    g+='<path d="M180 128 H210 L230 '+(118+open*0)+' L250 128 H290" stroke="'+(open>0.02?"#5ab4ff":"#26323f")+'" stroke-width="6" fill="none"/><text x="240" y="150" fill="#9AA0A6" font-size="9" text-anchor="middle">'+(lcMode==="feed"?"feed in → boiler":"condensate out →")+'</text>';
    g+='<path d="M64 128 H180" stroke="#26323f" stroke-width="4"/>';
    $("lcSvg").innerHTML=g;
  }
  H.chipGroup($("lcMode"),function(m){lcMode=m; $("lcFeedBox").hidden=m!=="feed"; lcL=m==="feed"?40:62;}).pick("feed");
  $("lcL").addEventListener("input",function(){lcL=+this.value;});
  setInterval(lcTick,200); lcTick();

  /* ---------- A4: reducing valve vs back-pressure valve ---------- */
  S("w-s4","Reducing valve vs. back-pressure valve",
    '<div class="grid2"><div><p class="lbl"><b>Pressure reducing valve</b></p><div class="svgbox"><svg id="rvSvg" viewBox="0 0 160 120" role="img" aria-label="Pressure reducing valve"></svg></div>'+
    '<label class="lbl" for="rvUp">Supply (upstream): <b id="rvUpv">100</b> psi</label><input type="range" id="rvUp" min="0" max="150" value="100">'+
    '<label class="lbl" for="rvSp">Set point (example): <b id="rvSpv">15</b> psi</label><input type="range" id="rvSp" min="5" max="60" value="15"></div>'+
    '<div><p class="lbl"><b>Back-pressure valve</b></p><div class="svgbox"><svg id="bpSvg" viewBox="0 0 160 120" role="img" aria-label="Back-pressure valve"></svg></div>'+
    '<label class="lbl" for="bpT">Tank pressure: <b id="bpTv">30</b> psi</label><input type="range" id="bpT" min="0" max="70" value="30">'+
    '<label class="lbl" for="bpSp">Set point (example): <b id="bpSpv">40</b> psi</label><input type="range" id="bpSp" min="10" max="60" value="40"></div></div>'+
    '<div class="row"><button type="button" class="secondary" id="vfBtn">🔄 Flip the labels</button></div><p class="status" id="vfOut" aria-live="polite"></p>');
  var vflip=false;
  function valves(){
    var up=+$("rvUp").value, sp=+$("rvSp").value, t=+$("bpT").value, bsp=+$("bpSp").value;
    $("rvUpv").textContent=up; $("rvSpv").textContent=sp; $("bpTv").textContent=t; $("bpSpv").textContent=bsp;
    var down=Math.min(up,sp), relieving=t>bsp;
    $("rvSvg").innerHTML='<path d="M5 60 H65" stroke="#ff9f43" stroke-width="6"/><path d="M95 60 H155" stroke="#cfe8ff" stroke-width="6"/><path d="M65 45 L95 75 M65 75 L95 45" stroke="#9AA0A6" stroke-width="3"/><circle cx="80" cy="60" r="16" fill="none" stroke="#9AA0A6" stroke-width="2"/>'+
      '<text x="35" y="40" fill="#ff9f43" font-size="11" text-anchor="middle">'+up+' psi</text><text x="125" y="40" fill="#cfe8ff" font-size="11" text-anchor="middle" font-weight="800">'+down+' psi</text>'+
      '<text x="80" y="108" fill="#2EC4B6" font-size="10" text-anchor="middle">'+(vflip?"controls DOWNSTREAM":"tap Flip the labels")+'</text>';
    $("bpSvg").innerHTML='<rect x="5" y="35" width="55" height="55" rx="8" fill="#16283a" stroke="#5ab4ff"/><text x="32" y="66" fill="#EDEAE4" font-size="11" text-anchor="middle">'+t+'</text><text x="32" y="80" fill="#9AA0A6" font-size="8" text-anchor="middle">psi tank</text>'+
      '<path d="M60 60 H80" stroke="#5ab4ff" stroke-width="5"/><circle cx="92" cy="60" r="12" fill="none" stroke="'+(relieving?"#F4A261":"#9AA0A6")+'" stroke-width="2"/><path d="M104 60 H125 V10" stroke="'+(relieving?"#F4A261":"#26323f")+'" stroke-width="5" fill="none"'+(relieving&&!RM?' class="blink"':'')+'/>'+
      '<text x="140" y="20" fill="'+(relieving?"#F4A261":"#59616c")+'" font-size="9" text-anchor="middle">relief</text>'+
      '<text x="80" y="108" fill="#2EC4B6" font-size="10" text-anchor="middle">'+(vflip?"holds UPSTREAM":"tap Flip the labels")+'</text>';
    $("vfOut").innerHTML=(relieving?'<span class="warn-t">Back-pressure valve: tank is above its set point, so it opens and relieves.</span>':'Back-pressure valve: at or under set point, so it stays closed (or only cracks) and the relief path is quiet.')+' Reducing valve: downstream holds '+down+' psi'+(up<sp?' (supply is below set point, so it can\'t make more)':'')+'.';
  }
  ["rvUp","rvSp","bpT","bpSp"].forEach(function(id){$(id).addEventListener("input",valves);});
  $("vfBtn").addEventListener("click",function(){vflip=!vflip; valves();}); valves();

  /* ---------- Two-pump trainer (A5) and LPCR pumping trainer (RVAF 7) ---------- */
  function pumpTrainer(id,opts){
    var p=id;
    S(id,opts.title,
      (opts.level?'<label class="lbl" for="'+p+'L">Drag the LPCR tank level: <b id="'+p+'Lv">50</b>%</label><input type="range" id="'+p+'L" min="0" max="100" value="50">':'')+
      '<div class="svgbox"><svg id="'+p+'Svg" viewBox="0 0 320 170" role="img" aria-label="Two pumps, running and standby"></svg></div>'+
      '<div class="chips" id="'+p+'Dis"><button data-v="recirc">Recirculate</button><button data-v="send">'+opts.sendLabel+'</button></div>'+
      '<div class="row"><button type="button" class="secondary" id="'+p+'Swap">⇄ Swap running / standby</button><button type="button" class="secondary danger" id="'+p+'Stop">⛔ Running pump stops</button></div>'+
      '<p class="status" id="'+p+'Out" aria-live="polite"></p>'+(opts.note?'<p class="wnote">'+opts.note+'</p>':''));
    var run=0, stopped=false, dis="send", L=50, t=0;
    function draw(){ t++;
      var open=opts.level?clamp((L-40)/30,0,1):1, moving=!stopped&&open>0.02;
      if(opts.level){ L=clamp(L+0.35-(moving?open*0.9:0),0,100); $(p+"L").value=Math.round(L); $(p+"Lv").textContent=Math.round(L); }
      var g='<rect x="10" y="30" width="60" height="100" rx="8" fill="#16283a" stroke="#5ab4ff"/><rect x="12" y="'+(128-(opts.level?L:60)*0.96)+'" width="56" height="'+((opts.level?L:60)*0.96)+'" fill="#5ab4ff" opacity=".4"/><text x="40" y="148" fill="#EDEAE4" font-size="10" text-anchor="middle">'+(opts.level?"LPCR":"Tank")+'</text>';
      if(opts.level){ g+='<rect x="76" y="10" width="54" height="26" rx="4" fill="#262b33" stroke="#9AA0A6"/><text x="103" y="21" fill="#EDEAE4" font-size="7" text-anchor="middle">4150-style pneum.</text><text x="103" y="31" fill="#2EC4B6" font-size="8" text-anchor="middle">air '+Math.round(open*100)+'%</text>'+
        '<path d="M98 80 H118 L114 90 H102 Z" fill="#262b33" stroke="#9AA0A6"/><line x1="108" y1="36" x2="108" y2="80" stroke="#cfe8ff" stroke-dasharray="3 3"/><text x="108" y="104" fill="#9AA0A6" font-size="7" text-anchor="middle">outlet '+(open<0.02?"closed":Math.round(open*100)+"%")+'</text>'; }
      var fc=moving?"#5ab4ff":"#26323f", dash='stroke-dasharray="8 5" stroke-dashoffset="'+(RM?0:-(t*2)%13)+'"';
      g+='<path d="M70 115 H150 M150 115 V75 H170 M150 115 V140 H170" stroke="'+(moving?"#5ab4ff":"#26323f")+'" stroke-width="5" fill="none"/>';
      [0,1].forEach(function(k){var y=k?140:75, isRun=run===k, col=isRun?(stopped?"#ff6b5b":"#2EC4B6"):"#59616c";
        g+='<circle cx="185" cy="'+y+'" r="14" fill="#1e2b38" stroke="'+col+'" stroke-width="3"/>'+(isRun&&!stopped&&!RM?'<g transform="translate(185 '+y+') rotate('+((t*20)%360)+')"><line x1="-8" y1="0" x2="8" y2="0" stroke="#2EC4B6" stroke-width="2"/><line x1="0" y1="-8" x2="0" y2="8" stroke="#2EC4B6" stroke-width="2"/></g>':'')+
          '<text x="185" y="'+(y-19)+'" fill="'+col+'" font-size="8" text-anchor="middle">Pump '+(k?"B":"A")+': '+(isRun?(stopped?"STOPPED":"running"):"standby")+'</text>';});
      var py=run?140:75;
      if(dis==="send") g+='<path d="M199 '+py+' H260 V30 H310" stroke="'+fc+'" stroke-width="5" fill="none" '+dash+'/><text x="285" y="22" fill="'+(moving?"#cfe8ff":"#59616c")+'" font-size="9" text-anchor="middle">'+opts.sendShort+' →</text>';
      else g+='<path d="M199 '+py+' H240 V8 H40 V30" stroke="'+fc+'" stroke-width="5" fill="none" '+dash+'/><text x="150" y="20" fill="'+(moving?"#cfe8ff":"#59616c")+'" font-size="9" text-anchor="middle">recirculate back to the tank</text>';
      $(p+"Svg").innerHTML=g;
      var msg;
      if(stopped) msg='<span class="no">The running pump stopped. Nothing is moving the water, so the tank fills and condensate has nowhere useful to go.</span> That is why the second pump exists. No automatic start sequence has been described here, so: get Zach. The swap button shows the standby pump taking over, as Zach directs.';
      else if(opts.level&&open<0.02) msg="Level below the band: the 4150-style controller keeps the outlet valve closed. One pump still runs, so the path is already alive.";
      else msg='<span class="ok">Pump '+(run?"B":"A")+' running, Pump '+(run?"A":"B")+' on standby. Discharge: '+(dis==="send"?opts.sendLabel:"Recirculate")+'.</span>';
      $(p+"Out").innerHTML=msg;
    }
    H.chipGroup($(p+"Dis"),function(d){dis=d;}).pick("send");
    $(p+"Swap").addEventListener("click",function(){run=1-run; stopped=false;});
    $(p+"Stop").addEventListener("click",function(){stopped=true;});
    if(opts.level) $(p+"L").addEventListener("input",function(){L=+this.value;});
    setInterval(draw,150); draw();
  }
  pumpTrainer("w-s5",{title:"Two-pump trainer",sendLabel:"Send onward",sendShort:"onward",note:"A general idea. How lead/lag and the discharge are chosen are site details: don't assume an automatic changeover until Zach shows you one."});
  pumpTrainer("w-s12",{title:"LPCR pumping trainer",level:true,sendLabel:"Send to HPCR",sendShort:"boiler-room HPCR",note:"Tyson RVAF: the LPCR's one 4150-style pneumatic level controller (water out) opens the actuated outlet valve as the LPCR fills; the valve feeds two pumps; one pump is always running; the pumps recirculate or send to the HPCR. Level numbers here are illustrative."});

  /* ---------- RVAF 1: plant flow diagram, rendered from the Mermaid source in the markdown ---------- */
  var src=($("mermaidSrc")||{}).textContent||"";
  var NODES={}, EDGES=[];
  src.split("\n").forEach(function(line){
    var re=/(\w+)(?:\[([^\]]+)\])?/g, l=line.trim(); if(!l||/^flowchart/.test(l)) return;
    var m=l.match(/^(\w+)(?:\[([^\]]+)\])?\s*-->\s*(?:\|"?([^|"]+)"?\|\s*)?(\w+)(?:\[([^\]]+)\])?$/); if(!m) return;
    if(m[2]||!NODES[m[1]]) NODES[m[1]]=m[2]||NODES[m[1]]||m[1];
    if(m[5]||!NODES[m[4]]) NODES[m[4]]=m[5]||NODES[m[4]]||m[4];
    EDGES.push({a:m[1],b:m[4],label:m[3]||""});
  });
  var POS={Fill:[180,18,120],Softeners:[180,64,120],DA:[180,110,120],BRHPCR:[180,156,130],Boilers:[180,202,120],Steam:[180,248,140],
    Hydro:[56,312,76],C1:[140,312,76],C2:[224,312,76],C3:[308,312,76],C1HP:[140,372,76],C2HP:[224,372,76],C3HP:[308,372,76],LPCR:[110,452,120],Roof:[290,452,90]};
  var NH=28;
  var KIND={fill:["Fill>Softeners","Softeners>DA","DA>BRHPCR","BRHPCR>Boilers"],steam:["Boilers>Steam","Steam>Hydro","Steam>C1","Steam>C2","Steam>C3"],
    hp:["C1>C1HP","C2>C2HP","C3>C3HP","C1HP>BRHPCR","C2HP>BRHPCR","C3HP>BRHPCR"],lp:["C1>LPCR","C2>LPCR","C3>LPCR","LPCR>BRHPCR"],vent:["LPCR>Roof"]};
  var COL={fill:"#cfe8ff",steam:"#ff9f43",hp:"#2EC4B6",lp:"#5ab4ff",vent:"#F4A261"};
  function kindOf(k){for(var c in KIND) if(KIND[c].indexOf(k)>=0) return c; return "fill";}
  function bot(n){var p=POS[n];return [p[0],p[1]+NH/2];} function topp(n){var p=POS[n];return [p[0],p[1]-NH/2];}
  function route(a,b){var k=a+">"+b, A=POS[a], B=POS[b];
    if(/^C\dHP>BRHPCR$/.test(k)) return "M"+A[0]+" "+(A[1]+NH/2)+" V398 H352 V"+B[1]+" H"+(B[0]+B[2]/2);
    if(/^C\d>LPCR$/.test(k)) return "M"+(A[0]-A[2]/2)+" "+A[1]+" H"+(A[0]-A[2]/2-5)+" V424 H"+B[0]+" V"+(B[1]-NH/2);
    if(k==="LPCR>BRHPCR") return "M"+(B[0]-0)+" "+0+"";
    if(k==="LPCR>Roof") return "M"+(A[0]+A[2]/2)+" "+A[1]+" H"+(B[0]-B[2]/2);
    if(/^Steam>/.test(k)) return "M"+A[0]+" "+(A[1]+NH/2)+" V280 H"+B[0]+" V"+(B[1]-NH/2);
    return "M"+A[0]+" "+(A[1]+NH/2)+" V"+(B[1]-NH/2);
  }
  function route2(a,b){var k=a+">"+b; if(k==="LPCR>BRHPCR"){var A=POS.LPCR,B=POS.BRHPCR; return "M"+(A[0]-A[2]/2)+" "+A[1]+" H8 V"+B[1]+" H"+(B[0]-B[2]/2);} return route(a,b);}
  var INFO={Fill:["Fill / makeup water comes in and goes to the softeners first.",RV.fill],Softeners:["Ion exchange takes out hardness so it doesn't bake onto the tubes as scale.",RV.fill],
    DA:["Heats the water with steam so dissolved oxygen and CO₂ come out a vent. The water line from the softeners has a 4150-style pneumatic level controller, and a pneumatic controller on the DA's steam inlet controls steam into the DA. Read the gauge on site.",RV.fill],BRHPCR:["Feeds the four boilers. Deaerated water and high pressure condensate from the cookers meet here.",RV.fill],
    Boilers:["Four boilers, each with its own 4150-style pneumatic level controller and actuated fill valve (water into that boiler). Typical set point around 115 psi: read the gauge.",RV.boilers],Steam:["Steam goes out to the hydrolyzer and the three Tyson cookers.",RV.loads],
    Hydro:["The hydrolyzer is a steam load. Its return path hasn't been described: walk this one with Zach.",RV.loads],
    LPCR:["Cooker LP condensate comes home here. Held near 40 psi by a back-pressure PRV; the LPCR's one 4150-style pneumatic level controller (water out) and two pumps move it out.",RV.lpcr],
    Roof:["The back-pressure PRV vents to the roof to hold the LPCR near 40 psi. Burn hazard: stay clear of vent outlets.",RV.lpcr],
    TW:["Three-way valve at each cooker: Recirculate back to that cooker's HPCR, or Send to the boiler-room HPCR. Its actuator is tubed to the top (3-15 psi); series unconfirmed, may differ from 667-style.",RV.cooker],
    PUMPS:["Fisher outlet valve (667-like actuator, model TBD, tubed to the top, 3-15 psi) and two LPCR pumps: one is always running; they recirculate or send condensate to the HPCR.",RV.pumps]};
  [1,2,3].forEach(function(n){INFO["C"+n]=["Tyson cooker "+n+": high pressure condensate goes to its own HPCR tank; LP condensate returns to the boiler-room LPCR.",RV.loads];
    INFO["C"+n+"HP"]=["Cooker "+n+" HPCR tank: 4150-style pneumatic level controller + actuated valve; the three-way valve recirculates or sends to the boiler-room HPCR. The three-way valve's actuator is tubed to the top; actuator series unconfirmed (may differ from 667-style).",RV.cooker];});
  if($("w-flow")){
    S("w-flow","Tyson RVAF plant map (tap any block)",
      '<div class="svgbox flow"><svg id="flSvg" viewBox="0 0 360 492" role="img" aria-label="Tyson RVAF flow: fill water, steam to loads, condensate returns"></svg></div>'+
      '<div class="legend"><span><i style="background:#cfe8ff"></i>fill water</span><span><i style="background:#ff9f43"></i>steam</span><span><i style="background:#2EC4B6"></i>HP condensate</span><span><i style="background:#5ab4ff"></i>LP condensate</span><span><i style="background:#F4A261"></i>vent</span></div>'+
      '<div class="infocard" id="flInfo" aria-live="polite">Tap a block to see what it is.</div>'+
      '<p class="lbl" style="margin-top:10px">Cooker three-way valves:</p><div class="chips" id="flTW"><button data-v="send">Send to boiler room</button><button data-v="recirc">Recirculate</button></div>'+
      '<p class="lbl">LPCR pumps:</p><div class="chips" id="flLP"><button data-v="send">Send to HPCR</button><button data-v="recirc">Recirculate</button></div>'+
      '<button type="button" id="flTrace">▶ Trace the loop</button>');
    var sel=null, tw="send", lp="send", lit=null;
    function flDraw(){
      var g='<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#9AA0A6"/></marker></defs>';
      EDGES.forEach(function(e){var k=e.a+">"+e.b, c=kindOf(k), d=route2(e.a,e.b);
        var off=(/^C\dHP>BRHPCR$/.test(k)&&tw==="recirc")||(k==="LPCR>BRHPCR"&&lp==="recirc");
        var on=lit===null||lit.indexOf(k)>=0;
        g+='<path d="'+d+'" fill="none" stroke="'+(off?"#26323f":COL[c])+'" stroke-width="'+(on&&!off?3.5:2)+'" opacity="'+(on?1:.25)+'" marker-end="url(#ah)"'+(off?' stroke-dasharray="4 4"':'')+'/>';});
      if(tw==="recirc") [1,2,3].forEach(function(n){var p=POS["C"+n+"HP"]; g+='<path d="M'+(p[0]+p[2]/2)+' '+(p[1]-6)+' a10 10 0 1 1 0 12" fill="none" stroke="#2EC4B6" stroke-width="2.5" marker-end="url(#ah)"/>';});
      if(lp==="recirc"){var q=POS.LPCR; g+='<path d="M'+(q[0]+20)+' '+(q[1]+NH/2)+' a12 9 0 1 0 -40 0" fill="none" stroke="#5ab4ff" stroke-width="2.5" marker-end="url(#ah)"/>';}
      EDGES.forEach(function(e){if(!e.label) return; var k=e.a+">"+e.b;
        if(k==="C1HP>BRHPCR") g+='<text x="346" y="250" fill="#2EC4B6" font-size="8" text-anchor="end" transform="rotate(-90 346 250)">Three-way: recirculate or send</text>';
        if(k==="LPCR>Roof"){var lx=(POS.LPCR[0]+60+POS.Roof[0]-45)/2, parts=e.label.split(", "); g+='<text x="'+lx+'" y="'+(POS.Roof[1]+24)+'" fill="#F4A261" font-size="8" text-anchor="middle">'+parts[0]+(parts[1]?',':'')+'</text>'+(parts[1]?'<text x="'+lx+'" y="'+(POS.Roof[1]+34)+'" fill="#F4A261" font-size="8" text-anchor="middle">'+parts[1]+'</text>':'');}
        if(k==="LPCR>BRHPCR") g+='<text x="16" y="250" fill="#5ab4ff" font-size="8" transform="rotate(-90 16 250)" text-anchor="middle">'+e.label+'</text>';});
      Object.keys(NODES).forEach(function(n){var p=POS[n]; if(!p) return; var lab=NODES[n], w=p[2];
        var words=lab.split(" "), l1=lab, l2=""; if(lab.length>(w/5.4)){var h=Math.ceil(words.length/2); l1=words.slice(0,h).join(" "); l2=words.slice(h).join(" ");}
        g+='<g class="node'+(sel===n?" sel":"")+'" data-n="'+n+'" tabindex="0" role="button" aria-label="'+lab+'"><rect x="'+(p[0]-w/2)+'" y="'+(p[1]-NH/2)+'" width="'+w+'" height="'+NH+'" rx="6" fill="#1e2b38" stroke="#59616c"/>'+
          '<text x="'+p[0]+'" y="'+(p[1]+(l2?-2:3))+'" fill="#EDEAE4" font-size="8.5" text-anchor="middle">'+l1+'</text>'+(l2?'<text x="'+p[0]+'" y="'+(p[1]+8)+'" fill="#EDEAE4" font-size="8.5" text-anchor="middle">'+l2+'</text>':'')+'</g>';});
      g+='<g class="node'+(sel==="TW"?" sel":"")+'" data-n="TW" tabindex="0" role="button" aria-label="Three-way valve"><rect x="338" y="160" width="20" height="26" rx="4" fill="#173a38" stroke="#2EC4B6"/><text x="348" y="177" fill="#EDEAE4" font-size="9" text-anchor="middle">3W</text></g>';
      g+='<g class="node'+(sel==="PUMPS"?" sel":"")+'" data-n="PUMPS" tabindex="0" role="button" aria-label="Two LPCR pumps"><circle cx="8" cy="400" r="8" fill="#16283a" stroke="#5ab4ff"/><circle cx="8" cy="380" r="8" fill="#16283a" stroke="#5ab4ff"/></g>';
      $("flSvg").innerHTML=g;
      each($("flSvg").querySelectorAll(".node"),function(nd){function go(){sel=nd.getAttribute("data-n"); var i=INFO[sel]; $("flInfo").innerHTML="<b>"+(NODES[sel]||(sel==="TW"?"Three-way valve":"Two LPCR pumps"))+":</b> "+i[0]+' <a href="#'+i[1]+'">Go to subsection →</a>'; flDraw();}
        nd.addEventListener("click",go); nd.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});});
    }
    H.chipGroup($("flTW"),function(x){tw=x;flDraw();}).pick("send");
    H.chipGroup($("flLP"),function(x){lp=x;flDraw();}).pick("send");
    $("flTrace").addEventListener("click",function(){
      var seq=KIND.fill.concat(KIND.steam,["C1>C1HP","C2>C2HP","C3>C3HP"],tw==="send"?["C1HP>BRHPCR","C2HP>BRHPCR","C3HP>BRHPCR"]:[],["C1>LPCR","C2>LPCR","C3>LPCR","LPCR>Roof"],lp==="send"?["LPCR>BRHPCR"]:[]);
      if(RM){lit=null;flDraw();return;} lit=[]; var i=0; var t=setInterval(function(){lit.push(seq[i++]); flDraw(); if(i>=seq.length){clearInterval(t); setTimeout(function(){lit=null;flDraw();},1200);}},280);});
    window.M22FLOW={nodes:NODES,edges:EDGES};
  }

  /* ---------- RVAF 3: four boilers ---------- */
  S("w-s8","Four-boiler level trainer",
    '<div class="chips" id="fbPick"><button data-v="0">Boiler 1</button><button data-v="1">Boiler 2</button><button data-v="2">Boiler 3</button><button data-v="3">Boiler 4</button><button data-v="all">Look at all four</button></div>'+
    '<div class="svgbox"><svg id="fbSvg" viewBox="0 0 320 160" role="img" aria-label="Boiler gauge glass and Fisher feed valve"></svg></div>'+
    '<label class="lbl" for="fbL">Drag the water level: <b id="fbLv">50</b>%</label><input type="range" id="fbL" min="0" max="100" value="50">'+
    '<div class="grid2">'+EW.fld("fbBp","Steam pressure (psi)",115)+'</div><label class="lbl" for="fbFp">Feed pressure: <b id="fbFpv">125</b> psi</label><input type="range" id="fbFp" min="80" max="150" value="125">'+
    '<p class="status" id="fbOut" aria-live="polite"></p><p class="wnote">~115 psi is a typical West Mechanical set point. Always read the gauge on the boiler in front of you.</p>');
  var BL=[55,50,48,52], fbSel=0;
  function fbTick(){var bp=v("fbBp"), fp=+$("fbFp").value; $("fbFpv").textContent=fp; var opens=[];
    for(var i=0;i<4;i++){var o=clamp((50-BL[i])/20,0,1); opens.push(o); BL[i]=clamp(BL[i]-0.25+(o>0&&fp>bp?o*1.1:0),0,100);}
    var g='';
    if(fbSel==="all"){ for(i=0;i<4;i++){var x=15+i*78; g+='<rect x="'+x+'" y="15" width="64" height="120" rx="8" fill="#1a2430" stroke="#59616c"/><text x="'+(x+32)+'" y="30" fill="#EDEAE4" font-size="10" text-anchor="middle">Boiler '+(i+1)+'</text><rect x="'+(x+24)+'" y="40" width="16" height="70" fill="#0f1114" stroke="#9AA0A6"/><rect x="'+(x+25)+'" y="'+(110-BL[i]*0.7)+'" width="14" height="'+(BL[i]*0.7)+'" fill="#5ab4ff" opacity=".6"/><text x="'+(x+32)+'" y="126" fill="'+(opens[i]>0.02?"#2EC4B6":"#9AA0A6")+'" font-size="9" text-anchor="middle">valve '+(opens[i]<0.02?"closed":Math.round(opens[i]*100)+"%")+'</text>';}
      $("fbOut").innerHTML="Each boiler's own 4150-style controller holds its own water line. Valve positions should make sense for the level you see.";
    } else { var L=BL[fbSel], o2=opens[fbSel]; $("fbL").value=Math.round(L); $("fbLv").textContent=Math.round(L);
      g+='<rect x="30" y="10" width="34" height="140" rx="6" fill="#0f1114" stroke="#9AA0A6" stroke-width="2"/><rect x="32" y="'+(148-L*1.36)+'" width="30" height="'+(L*1.36)+'" fill="#5ab4ff" opacity=".55"/><line x1="24" y1="80" x2="70" y2="80" stroke="#2EC4B6" stroke-dasharray="4 3"/>';
      g+='<rect x="100" y="20" width="80" height="34" rx="6" fill="#262b33" stroke="#9AA0A6"/><text x="140" y="35" fill="#EDEAE4" font-size="9" text-anchor="middle">4150-style ctrl</text><text x="140" y="47" fill="#2EC4B6" font-size="9" text-anchor="middle">Boiler '+(fbSel+1)+'</text>';
      g+='<circle cx="250" cy="45" r="26" fill="#0f1114" stroke="#9AA0A6"/><text x="250" y="44" fill="#ff9f43" font-size="12" text-anchor="middle" font-weight="800">'+bp+'</text><text x="250" y="57" fill="#9AA0A6" font-size="8" text-anchor="middle">steam psi</text>';
      g+='<circle cx="250" cy="115" r="26" fill="#0f1114" stroke="'+(fp>bp?"#2EC4B6":"#ff6b5b")+'"/><text x="250" y="114" fill="#cfe8ff" font-size="12" text-anchor="middle" font-weight="800">'+fp+'</text><text x="250" y="127" fill="#9AA0A6" font-size="8" text-anchor="middle">feed psi</text>';
      g+='<path d="M224 115 H150 L140 105 L130 115 H64" stroke="'+(o2>0.02&&fp>bp?"#5ab4ff":"#26323f")+'" stroke-width="5" fill="none"/><text x="140" y="140" fill="#9AA0A6" font-size="9" text-anchor="middle">actuated fill valve '+(o2<0.02?"closed":Math.round(o2*100)+"% open")+'</text>';
      $("fbOut").innerHTML=o2>0.02&&fp<=bp?'<span class="no">⚠️ No flow into boiler: the valve is open but feed pressure is not above boiler pressure. The level keeps falling.</span>':o2>0.02?'<span class="ok">Level low: the 4150-style controller opens the fill valve and the level recovers.</span>':"Level in band: fill valve closed; steam leaving pulls the level down slowly.";
    }
    $("fbL").disabled=fbSel==="all"; $("fbSvg").innerHTML=g;}
  H.chipGroup($("fbPick"),function(x){fbSel=x==="all"?"all":+x;}).pick("0");
  $("fbL").addEventListener("input",function(){if(fbSel!=="all") BL[fbSel]=+this.value;});
  setInterval(fbTick,200); fbTick();

  /* ---------- RVAF 4: loads map ---------- */
  S("w-s9","Process floor loads map",
    '<div class="svgbox"><svg id="ldSvg" viewBox="0 0 320 170" role="img" aria-label="Steam header feeding hydrolyzer and three cookers"></svg></div><div class="chips" id="ldC"><button data-v="H">Hydrolyzer</button><button data-v="1">Cooker 1</button><button data-v="2">Cooker 2</button><button data-v="3">Cooker 3</button></div><div class="infocard" id="ldOut" aria-live="polite">Tap a load.</div>');
  var ld="";
  function ldDraw(){var g='<path d="M10 20 H310" stroke="#ff9f43" stroke-width="6"/><text x="12" y="14" fill="#ff9f43" font-size="9">steam header (from the four boilers)</text>';
    var xs=[45,125,205,285];
    ["H","1","2","3"].forEach(function(k,i){var x=xs[i], on=ld===k;
      g+='<line x1="'+x+'" y1="20" x2="'+x+'" y2="45" stroke="#ff9f43" stroke-width="3"/><rect x="'+(x-34)+'" y="45" width="68" height="34" rx="6" fill="'+(on?"#173a38":"#1e2b38")+'" stroke="'+(on?"#2EC4B6":"#59616c")+'"/><text x="'+x+'" y="66" fill="#EDEAE4" font-size="9" text-anchor="middle">'+(k==="H"?"Hydrolyzer":"Cooker "+k)+'</text>';
      if(on&&k!=="H"){ g+='<path d="M'+(x+10)+' 79 V112" stroke="#2EC4B6" stroke-width="4" marker-end="url(#ldA)"/><rect x="'+(x-4)+'" y="114" width="48" height="22" rx="4" fill="#173a38" stroke="#2EC4B6"/><text x="'+(x+20)+'" y="128" fill="#EDEAE4" font-size="8" text-anchor="middle">C'+k+' HPCR</text>';
        g+='<path d="M'+(x-10)+' 79 V150 H40" stroke="#5ab4ff" stroke-width="4" fill="none"/><text x="44" y="164" fill="#5ab4ff" font-size="9">→ boiler-room LPCR</text>'; }
      if(on&&k==="H") g+='<text x="'+x+'" y="100" fill="#F4A261" font-size="9" text-anchor="middle">return path: ask Zach</text>';});
    $("ldSvg").innerHTML='<defs><marker id="ldA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#2EC4B6"/></marker></defs>'+g;}
  H.chipGroup($("ldC"),function(k){ld=k; ldDraw(); $("ldOut").innerHTML=k==="H"?'<b>Walk this one with Zach.</b> The hydrolyzer is a steam load, but its job, steam pressure, and condensate return path aren\'t described yet, so no piping story is made up here. See the <a href="#'+RV.loads+'">Zach\'s notes</a> in this subsection.':'<b>Cooker '+k+':</b> teal arrow = high pressure condensate into its own HPCR tank. Blue arrow = low pressure condensate back to the boiler-room LPCR.';});
  ldDraw();

  /* ---------- RVAF 5: cooker HPCR + three-way valve ---------- */
  S("w-s10","Cooker three-way valve trainer",
    '<div class="chips" id="ckView"><button data-v="one">One cooker</button><button data-v="all">Show all three cookers</button></div>'+
    '<div class="svgbox"><svg id="ckSvg" viewBox="0 0 320 170" role="img" aria-label="Cooker HPCR tank, three-way valve, and boiler-room HPCR"></svg></div>'+
    '<div class="cookers" id="ckBtns"></div><p class="status" id="ckOut" aria-live="polite"></p><p class="wnote">Levels here are illustrative. On the floor: look, name the two positions, and only change a valve if Zach is directing you.</p>');
  var CK=[{tw:"send",L:55},{tw:"send",L:50},{tw:"recirc",L:45}], ckView="one", BR=50, tt=0;
  function ckBtns(){var n=ckView==="all"?3:1, h='';
    for(var i=0;i<n;i++) h+='<div class="ck"><b>Cooker '+(i+1)+'</b><button type="button" class="secondary" data-i="'+i+'">'+(CK[i].tw==="send"?"Send to boiler room":"Recirculate")+'</button></div>';
    $("ckBtns").innerHTML=h; $("ckBtns").style.gridTemplateColumns=n===1?"1fr":"";
    each($("ckBtns").querySelectorAll("button"),function(b){b.addEventListener("click",function(){var c=CK[+b.getAttribute("data-i")]; c.tw=c.tw==="send"?"recirc":"send"; ckBtns();});});}
  function ckTick(){tt++; var n=ckView==="all"?3:1, sending=0, g='';
    g+='<rect x="235" y="60" width="75" height="80" rx="8" fill="#1a2430" stroke="#2EC4B6"/><rect x="237" y="'+(138-BR*0.76)+'" width="71" height="'+(BR*0.76)+'" fill="#2EC4B6" opacity=".35"/><text x="272" y="56" fill="#EDEAE4" font-size="9" text-anchor="middle">Boiler-room HPCR</text><text x="272" y="104" fill="#EDEAE4" font-size="11" text-anchor="middle">'+Math.round(BR)+'%</text>';
    for(var i=0;i<n;i++){var c=CK[i], y=n===1?70:15+i*52, open=clamp((c.L-45)/25,0,1);
      c.L=clamp(c.L+0.5-(c.tw==="send"?open*1.0:0),0,100); if(c.tw==="send") sending+=open;
      var hy=n===1?40:y, hh=n===1?90:40;
      g+='<rect x="10" y="'+hy+'" width="50" height="'+hh+'" rx="6" fill="#173a38" stroke="#2EC4B6"/><rect x="12" y="'+(hy+hh-2-c.L/100*(hh-4))+'" width="46" height="'+(c.L/100*(hh-4))+'" fill="#2EC4B6" opacity=".4"/><text x="35" y="'+(hy-3)+'" fill="#EDEAE4" font-size="8" text-anchor="middle">C'+(i+1)+' HPCR '+Math.round(c.L)+'%</text>';
      var vy=hy+hh/2; g+='<text x="80" y="'+(vy-8)+'" fill="#9AA0A6" font-size="7" text-anchor="middle">Fisher '+(open<0.02?"closed":Math.round(open*100)+"%")+'</text><path d="M60 '+vy+' H110" stroke="'+(open>0.02?"#2EC4B6":"#26323f")+'" stroke-width="4"/>';
      g+='<polygon points="110,'+(vy-7)+' 124,'+(vy-7)+' 117,'+vy+'" fill="#9AA0A6"/><polygon points="110,'+(vy+7)+' 124,'+(vy+7)+' 117,'+vy+'" fill="#9AA0A6"/>';
      var dash=' stroke-dasharray="8 5" stroke-dashoffset="'+(RM?0:-(tt*2)%13)+'"', live=open>0.02;
      if(c.tw==="send") g+='<path d="M124 '+vy+' H200 V100 H235" stroke="'+(live?"#2EC4B6":"#26323f")+'" stroke-width="4" fill="none"'+dash+'/><text x="160" y="'+(vy-5)+'" fill="#2EC4B6" font-size="8" text-anchor="middle">send →</text>';
      else g+='<path d="M117 '+(vy+7)+' V'+(hy+hh+6)+' H35 V'+(hy+hh)+'" stroke="'+(live?"#2EC4B6":"#26323f")+'" stroke-width="3" fill="none"'+dash+'/><text x="80" y="'+(hy+hh+16)+'" fill="#2EC4B6" font-size="8" text-anchor="middle">recirculate</text>';
    }
    BR=clamp(BR+sending*0.35-0.25,0,100);
    $("ckSvg").innerHTML=g;
    var c0=CK[0]; $("ckOut").innerHTML=ckView==="one"?(c0.tw==="send"?"<b>Send to the boiler room:</b> condensate goes down the corridor into the boiler-room HPCR, and that tank level ticks up.":"<b>Recirculate:</b> condensate loops back to that cooker's own HPCR tank. Nothing goes to the boiler room."):"Set each cooker's three-way valve on its own. The boiler-room HPCR only gains from cookers set to Send.";}
  H.chipGroup($("ckView"),function(x){ckView=x; ckBtns();}).pick("one");
  setInterval(ckTick,200); ckTick();

  /* ---------- RVAF 6: LPCR pressure + back-pressure PRV ---------- */
  S("w-s11","LPCR pressure trainer",
    '<div class="svgbox"><svg id="lpSvg" viewBox="0 0 320 170" role="img" aria-label="LPCR tank, back-pressure PRV and roof vent"></svg></div>'+
    '<label class="lbl" for="lpIn">Incoming LP condensate: <b id="lpInv">medium</b></label><input type="range" id="lpIn" min="0" max="4" value="2">'+
    '<div class="readouts"><div class="ro" id="lpRo"><span class="k">LPCR pressure</span><span class="v" id="lpP">–</span></div><div class="ro"><span class="k">Back-pressure PRV</span><span class="v" id="lpV" style="font-size:1rem">–</span></div></div>'+
    '<div class="row"><button type="button" class="secondary" id="lpFlip">🔄 Reducing vs. back-pressure valve</button></div><div class="infocard" id="lpCard" hidden></div>'+
    '<p class="wnote">Set point near 40 psi is from Zach\'s notes. How fast pressure moves here is illustrative only.</p>');
  var LP=36, lpT=0;
  function lpTick(){lpT++; var inn=+$("lpIn").value; $("lpInv").textContent=["none","low","medium","high","very high"][inn];
    LP+=inn*0.35-0.5; var vent=LP>40; if(vent) LP=40+(LP-40)*0.6; LP=clamp(LP,0,60);
    $("lpP").textContent=fmt(LP,1)+" psi"; $("lpV").textContent=vent?"OPEN: venting to roof":"Closed (quiet)"; EW.setBand($("lpRo"),Math.abs(LP-40)<1.5?"band-g":LP<40?null:"band-y");
    var g='<rect x="20" y="60" width="90" height="90" rx="10" fill="#16283a" stroke="#5ab4ff"/><text x="65" y="100" fill="#EDEAE4" font-size="12" text-anchor="middle">LPCR</text><text x="65" y="118" fill="#5ab4ff" font-size="13" text-anchor="middle" font-weight="800">'+fmt(LP,1)+' psi</text>';
    g+='<path d="M0 80 H20" stroke="#5ab4ff" stroke-width="'+(1+inn*1.5)+'"/><text x="4" y="74" fill="#9AA0A6" font-size="7">LP in</text>';
    g+='<path d="M110 75 H170" stroke="#5ab4ff" stroke-width="4"/><circle cx="185" cy="75" r="15" fill="none" stroke="'+(vent?"#F4A261":"#9AA0A6")+'" stroke-width="3"/><text x="185" y="104" fill="#9AA0A6" font-size="8" text-anchor="middle">back-pressure PRV</text><text x="185" y="114" fill="#9AA0A6" font-size="8" text-anchor="middle">(~40 psi)</text>';
    g+='<path d="M200 75 H260 V12" stroke="'+(vent?"#F4A261":"#26323f")+'" stroke-width="5" fill="none"/><rect x="230" y="2" width="80" height="8" fill="#59616c"/><text x="300" y="24" fill="#9AA0A6" font-size="8" text-anchor="end">ROOF</text>';
    if(vent&&!RM) for(var k=0;k<3;k++){var yy=12-((lpT*3+k*9)%24); g+='<circle cx="'+(260+(k-1)*6)+'" cy="'+yy+'" r="4" fill="#cfe8ff" opacity=".5"/>';}
    $("lpSvg").innerHTML=g;}
  $("lpFlip").addEventListener("click",function(){var c=$("lpCard"); c.hidden=!c.hidden; c.innerHTML='<b>Pressure reducing valve:</b> controls <u>downstream</u>. Drops a higher supply to a lower pressure (Module 20 PRV station).<br><b>Back-pressure valve:</b> holds <u>upstream</u>. Keeps the LPCR near 40 psi; opens and relieves (to the roof here) when pressure tries to climb above set point.';});
  setInterval(lpTick,200); lpTick();

  /* ---------- RVAF 8 + Action: walkdown checklist ---------- */
  var STOPS=[["sof","Softeners","In service? Salt bridged? Hardness (if Zach has you test)"],["da","Deaerator","Pressure and temperature; softener water-line level controller; steam-inlet controller"],["hp","Boiler-room HPCR","Level; incoming lines from cookers and LPCR pumps"],
    ["b1","Boiler 1","Water level / steam psi; its level controller + fill valve"],["b2","Boiler 2","Water level / steam psi; its level controller + fill valve"],["b3","Boiler 3","Water level / steam psi; its level controller + fill valve"],["b4","Boiler 4","Water level / steam psi; its level controller + fill valve"],
    ["c1","Cooker 1","HPCR level + level controller; three-way position; its actuator tubing (top?)",1],["c2","Cooker 2","HPCR level + level controller; three-way position; its actuator tubing (top?)",1],["c3","Cooker 3","HPCR level + level controller; three-way position; its actuator tubing (top?)",1],
    ["hy","Hydrolyzer","Pointed out with Zach",2],["lpp","LPCR pressure","Near 40 psi? Roof vent path unusual?"],["lpu","LPCR pumps","LPCR level controller (water out); outlet valve actuator tubed to top; which pump is running? Discharge?",3]];
  function walkdown(id,p,doneTarget){
    var h='<div class="mapthumb" aria-hidden="true"><svg id="'+p+'Map" viewBox="0 0 340 40"></svg></div>';
    STOPS.forEach(function(s){h+='<div class="wd-row" id="'+p+'-row-'+s[0]+'"><span class="wd-l">'+s[1]+'</span>';
      if(s[3]===2) h+=EW.chk(p+s[0],s[2]);
      else { h+='<input type="text" id="'+p+s[0]+'" placeholder="'+s[2]+'" aria-label="'+s[1]+' reading">';
        if(s[3]===1) h+='<div class="chips" data-chip="'+p+s[0]+'tw"><button data-v="recirc">Recirculate</button><button data-v="send">Send</button></div>';
        if(s[3]===3) h+='<div class="chips" data-chip="'+p+s[0]+'run"><button data-v="A">Pump A running</button><button data-v="B">Pump B running</button></div><div class="chips" data-chip="'+p+s[0]+'dis"><button data-v="recirc">Recirculate</button><button data-v="send">Send to HPCR</button></div>'; }
      h+='</div>';});
    h+=EW.chk(p+"zach","Zach checked this")+'<label class="check-row"><input type="checkbox" id="'+p+'done"> Mark complete</label>';
    var box=S(id,"Walkdown checklist",h);
    var ids=STOPS.map(function(s){return p+s[0];}).concat([p+"zach"]);
    each(box.querySelectorAll("[data-chip]"),function(c){var key=c.getAttribute("data-chip"), g=H.chipGroup(c,function(val){store.set("f:"+key,val); paint();}); var sv=store.get("f:"+key); if(sv) g.pick(sv);});
    function filled(s){var e=$(p+s[0]); if(s[3]===2) return e.checked; var ok=!!(e.value||"").trim(); if(s[3]===1) ok=ok||!!store.get("f:"+p+s[0]+"tw"); if(s[3]===3) ok=ok||!!store.get("f:"+p+s[0]+"run"); return ok;}
    function paint(){var next=-1; STOPS.forEach(function(s,i){var r=$(p+"-row-"+s[0]); var f=filled(s); r.classList.toggle("next",false); if(!f&&next<0) next=i;});
      if(next>=0) $(p+"-row-"+STOPS[next][0]).classList.add("next");
      var g=''; STOPS.forEach(function(s,i){var x=10+i*25.5, f=filled(s); g+='<circle cx="'+x+'" cy="16" r="'+(i===next?8:6)+'" fill="'+(f?"#2EC4B6":i===next?"#F4A261":"#26323f")+'"/>'+(i<STOPS.length-1?'<line x1="'+(x+7)+'" y1="16" x2="'+(x+18)+'" y2="16" stroke="#3a4552"/>':'');});
      g+='<text x="170" y="36" fill="#9AA0A6" font-size="8" text-anchor="middle">'+(next>=0?"Next stop: "+STOPS[next][1]:"All stops logged ✓")+'</text>';
      $(p+"Map").innerHTML=g;}
    EW.keep(ids,paint);
    var dn=$(p+"done"), target=doneTarget();
    function syncFrom(){var t=doneTarget(); if(!t) return; dn.checked=t.tagName==="INPUT"?t.checked:t.getAttribute("aria-pressed")==="true";}
    dn.addEventListener("change",function(){var t=doneTarget(); if(!t) return; var cur=t.tagName==="INPUT"?t.checked:t.getAttribute("aria-pressed")==="true"; if(cur!==dn.checked) t.click(); setTimeout(syncFrom,50);});
    setTimeout(syncFrom,0); if(target) target.addEventListener("click",function(){setTimeout(syncFrom,50);}); if(target&&target.tagName==="INPUT") target.addEventListener("change",syncFrom);
  }
  walkdown("w-s13","wd",function(){return document.querySelector('.mark-done[data-sec="'+RV.walk+'"]');});
  walkdown("w-action","aw",function(){return $("actionDone");});
})();

/* ---------- A6: Level Master + SKD62UA (electronic boiler water level control) ----------
   Facts come from LM = Cleaver-Brooks 750-281 (06-09), TI = Siemens 155-717, VF = Siemens 155-159P25.
   Level numbers are the Sensitivity Table 1 example (LM Table 3-3 p.3-4), not a site setting. */
(function(){
  "use strict";
  var $=EW.$, fmt=EW.fmt, S=EW.slot, each=EW.each;
  var RM=H.reduceMotion&&H.reduceMotion();
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  function card(id,def){return '<div class="infocard" id="'+id+'" aria-live="polite">'+(def||"Tap one.")+'</div>';}
  function chips(id,list){return '<div class="chips" id="'+id+'">'+list.map(function(t,i){return '<button data-v="'+i+'">'+t+'</button>';}).join("")+'</div>';}
  function seg(id,list){return '<div class="seg" id="'+id+'" role="group">'+list.map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>';}).join("")+'</div>';}
  function chipInfo(boxId,outId,list){H.chipGroup($(boxId),function(i){var t=list[+i];$(outId).innerHTML="<b>"+t[0]+":</b> "+t[1];});}
  if(!$("w-s14")) return;

  /* ---- hook: what is the same, what is different ---- */
  var CMP=[["Sensor","<b>Fisher pneumatic (A3):</b> a pneumatic level controller with its sensing element in the liquid. <b>Level Master:</b> a 2 in stainless float with a magnet riding a probe in a water column (magnetostrictive), reporting inches above the low-water cut-off mark. [LM p.1-2; LMB p.2-3]"],
           ["Signal","<b>Fisher:</b> a 3-15 psig air signal in tubing. <b>Level Master:</b> a 4-20 mA signal on terminals 14 (+) and 15 (−), set with Display Format = Modulating. [LM Fig 2-5 p.2-7; p.4-5]"],
           ["Muscle","<b>Fisher:</b> an air-driven diaphragm actuator. <b>SKD62UA:</b> an electrohydraulic actuator on 24 Vac (a pump, a piston, a return spring). No air supply. [TI p.1, 2, 6]"],
           ["Fail position","<b>Both use a spring.</b> The SKD62UA return spring drives it to 0% stroke (stem retracted) in about 15 s on loss of power or signal. Whether that is open or closed depends on the valve body: normally closed closes, normally open opens. [TI p.7; VF p.8]"],
           ["Same logic","Rising level means less feedwater; low water means the valve opens more. At RVAF it is the pneumatic signal; here it is 20 mA at low water and 4 mA at higher water. [LM p.5-4, 6-2]"]];
  S("w-s14","What's the same as the Fisher setup?",chips("cmC",CMP.map(function(c){return c[0];}))+card("cmO","Tap a chip to compare the Fisher pneumatic setup with the Level Master + SKD62UA pairing.")+'<p class="wnote">Zach just installed a Level Master + Siemens SKD62UA; this is the current pairing.</p>');
  chipInfo("cmC","cmO",CMP);

  /* ---- shared level model: Sensitivity Table 1 example ---- */
  var T={hiAlm:5.5,hiWrn:4.5,pOff:1.5,pOn:0.75,loWrn:0.3,lwco:0};
  function pctOf(L){return L<=T.pOn?100:(L>=T.pOff?0:(T.pOff-L)/(T.pOff-T.pOn)*100);}
  function maOf(p){return 4+16*p/100;}
  function ly(L){return 160-clamp(L,0,6)/6*140;}
  function column(L,x,showInside){
    var y=ly(L), g='';
    g+='<rect x="'+x+'" y="20" width="40" height="150" rx="5" fill="#10242e" stroke="#5ab4ff" stroke-width="2"/>';
    g+='<rect x="'+(x+2)+'" y="'+y.toFixed(1)+'" width="36" height="'+(168-y).toFixed(1)+'" fill="rgba(90,180,255,.33)"/><line x1="'+(x+2)+'" y1="'+y.toFixed(1)+'" x2="'+(x+38)+'" y2="'+y.toFixed(1)+'" stroke="#7fd6ff" stroke-width="1.5"/>';
    g+='<line x1="'+(x+20)+'" y1="12" x2="'+(x+20)+'" y2="168" stroke="#9aa5b1" stroke-width="2"/><rect x="'+(x+6)+'" y="'+(y-7).toFixed(1)+'" width="28" height="14" rx="3" fill="#e5e8eb" stroke="#2EC4B6" stroke-width="2"/><text x="'+(x+20)+'" y="'+(y+3.5).toFixed(1)+'" fill="#0f1720" font-size="8" text-anchor="middle">float</text>';
    g+='<rect x="'+(x+8)+'" y="2" width="24" height="11" rx="2" fill="#2a3340" stroke="#cfd8e3"/><text x="'+(x+20)+'" y="10" fill="#cfd8e3" font-size="5.5" text-anchor="middle">sensor</text>';
    [[T.hiAlm,"HW alarm 5.5"],[T.hiWrn,"HW warn 4.5"],[T.pOff,"Pump Off 1.5"],[T.pOn,"Pump On 0.75"],[T.loWrn,"Low warn 0.3"],[T.lwco,"LWCO 0"]].forEach(function(m){var yy=ly(m[0]);
      g+='<line x1="'+(x+40)+'" y1="'+yy.toFixed(1)+'" x2="'+(x+46)+'" y2="'+yy.toFixed(1)+'" stroke="#ffd23f"/><text x="'+(x+48)+'" y="'+(yy+(m[0]===T.lwco?12:m[0]===T.loWrn?5:2)).toFixed(1)+'" fill="#ffd23f" font-size="5.8">'+m[1]+'</text>';});
    return g;
  }
  function alarmOf(L){return L<=T.lwco?"lwsd":L<T.loWrn?"lowwrn":L>T.hiAlm?"hialm":L>T.hiWrn?"hiwrn":"ok";}
  function bargraph(L,x,y0){ /* 8 LEDs, bottom to top: red, orange, 4 green, orange, red (illustrative) */
    var a=alarmOf(L), g='';
    var gc=a==="ok"?clamp(Math.ceil((L-T.loWrn)/((T.hiWrn-T.loWrn)/4)),1,4):0;
    var leds=[[a==="lwsd","#ff4d4d"],[a==="lwsd"||a==="lowwrn","#ff9f1c"],[gc>=1,"#3ecf6a"],[gc>=2,"#3ecf6a"],[gc>=3,"#3ecf6a"],[gc>=4,"#3ecf6a"],[a==="hiwrn"||a==="hialm","#ff9f1c"],[a==="hialm","#ff4d4d"]];
    leds.forEach(function(l,i){g+='<circle cx="'+x+'" cy="'+(y0-i*10)+'" r="3.6" fill="'+(l[0]?l[1]:"#26323f")+'" stroke="#59616c" stroke-width=".6"/>';});
    return g;
  }
  function gauge(cx,cy,rad,frac,col,lab,dim){var a=-135+270*clamp(frac,0,1),x2=cx+(rad-6)*Math.sin(a*Math.PI/180),y2=cy-(rad-6)*Math.cos(a*Math.PI/180);
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+rad+'" fill="#0d0f12" stroke="#59616c" stroke-width="2"/>'+(dim?'':'<line x1="'+cx+'" y1="'+cy+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="2.5"/>')+'<circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="#fff"/><text x="'+(cx-rad+3)+'" y="'+(cy+rad-5)+'" fill="#9AA0A6" font-size="6">4</text><text x="'+(cx+rad-9)+'" y="'+(cy+rad-5)+'" fill="#9AA0A6" font-size="6">20</text><text x="'+cx+'" y="'+(cy+rad+10)+'" fill="'+col+'" font-size="7.5" text-anchor="middle">'+lab+'</text>';}

  /* ---- A6.1 water column cutaway ---- */
  var WC={L:1.29,inside:false};
  S("w-s14-2","Water column cutaway: float, probe, display",
    '<div class="svgbox"><svg id="wcSvg" viewBox="0 0 300 180" role="img" aria-label="Water column with a magnetostrictive float on a probe, and the Level Master display"></svg></div>'+
    '<label class="lbl" for="wcL" style="margin-top:8px">Water level: <b id="wcLv">1.29</b> in above the LWCO mark (example)</label><input type="range" id="wcL" min="0" max="6" step="0.01" value="1.29" aria-label="Water level">'+
    '<div class="row"><button type="button" class="secondary" id="wcIn" aria-pressed="false">What\'s inside? (24 VDC and RS-485)</button><button type="button" class="secondary" id="wcPt">Probe type</button></div>'+
    card("wcO","Slide the level: the float rides the probe and the display shows inches above the low water cut-off (LWCO) mark.")+
    '<p class="wnote">Level numbers: Sensitivity Table 1 example, not a site setting. Display and bargraph are drawn after LM Fig 1-1 and Fig 4-10 (illustrative).</p>');
  function wcDraw(){
    var L=WC.L,a=alarmOf(L),g=column(L,6,false);
    g+='<rect x="108" y="14" width="124" height="108" rx="8" fill="#141b24" stroke="#59616c" stroke-width="2"/>';
    var l2=a==="lwsd"?"LW Shutdown":a==="lowwrn"?"Low Lvl Wrn":a==="hiwrn"?"High Lvl Wrn":a==="hialm"?"High Water Alarm":"Boiler Off";
    g+='<rect x="116" y="22" width="84" height="30" rx="3" fill="#0b2a1e" stroke="#2EC4B6"/><text x="120" y="35" fill="#9dffcf" font-size="8" font-family="monospace">'+L.toFixed(2)+'" &gt;LWCO</text><text x="120" y="47" fill="#9dffcf" font-size="7.5" font-family="monospace">'+l2+'</text>';
    g+=bargraph(L,216,106);
    g+='<circle cx="124" cy="68" r="4" fill="#3ecf6a"/><text x="132" y="71" fill="#9AA0A6" font-size="6">POWER ON / ERROR</text>';
    g+='<rect x="116" y="80" width="22" height="24" rx="2" fill="#2a3340" stroke="#59616c"/><text x="127" y="95" fill="#cfd8e3" font-size="7.5" text-anchor="middle">MODE</text><rect x="142" y="80" width="26" height="24" rx="2" fill="#2a3340" stroke="#59616c"/><text x="155" y="90" fill="#cfd8e3" font-size="7.5" text-anchor="middle">BLOW</text><text x="155" y="99" fill="#cfd8e3" font-size="7.5" text-anchor="middle">DOWN</text><rect x="172" y="80" width="28" height="24" rx="2" fill="#2a3340" stroke="#59616c"/><text x="186" y="90" fill="#cfd8e3" font-size="7.5" text-anchor="middle">MENU/</text><text x="186" y="99" fill="#cfd8e3" font-size="7.5" text-anchor="middle">RESET</text>';
    g+='<text x="170" y="116" fill="#cfd8e3" font-size="7" text-anchor="middle">Level Master controller</text>';
    var cy=a==="lwsd"?"#ff4d4d":a==="ok"?"#2EC4B6":"#ff9f1c";
    if(WC.inside){g+='<path d="M64 100 H108" stroke="#ffb020" stroke-width="2" stroke-dasharray="4 3" fill="none"/><text x="86" y="95" fill="#ffb020" font-size="6" text-anchor="middle">24 VDC</text><path d="M64 112 H108" stroke="#2EC4B6" stroke-width="2" fill="none"/><text x="86" y="124" fill="#2EC4B6" font-size="6" text-anchor="middle">RS-485</text><text x="170" y="136" fill="#cfd8e3" font-size="6" text-anchor="middle">120 VAC in; controller makes 24 VDC for the sensor</text>';}
    $("wcSvg").innerHTML=g; $("wcLv").textContent=L.toFixed(2);
    $("wcSvg").setAttribute("data-l",L.toFixed(2));
  }
  $("wcL").addEventListener("input",function(){WC.L=+$("wcL").value;wcDraw();});
  $("wcIn").addEventListener("click",function(){WC.inside=!WC.inside;$("wcIn").setAttribute("aria-pressed",String(WC.inside));wcDraw();$("wcO").innerHTML=WC.inside?"<b>Inside:</b> the controller takes 120 VAC and makes 24 VDC for the sensor; a five-conductor shielded RS-485 cable carries the sensor data back (run in separate conduit from ignition wiring). [LM p.1-2, 2-4, 2-6; LMB p.2]":"Cables hidden.";});
  $("wcPt").addEventListener("click",function(){$("wcO").innerHTML="<b>Probe type:</b> magnetostrictive float, not conductance and not capacitance. A 2 in stainless float with a magnet rides a probe; there are no levers or switches and the float is non-contact. [LMB p.2-3; LM p.1-2]";});
  wcDraw();

  /* ---- A6.2 condition explorer ---- */
  var CND=[["Power-up self-start","Cleaver-Brooks Copyright @YYYY → Waiting on Sensor","LEDs cycle; green POWER ON; the on-board alarm beeps.","LWCO contact stays de-energized during the self-start.","mA at 14/15: not documented.","LM p.2-10"],
    ["Low-water warning","Low Lvl Wrn Timer x Sec → x.xx\" >LWCO  Low Lvl Wrn","Lower orange LED; the alarm beeps.","General alarm relay (23, 24) energized.","mA: not documented (the animation assumes it holds at 20 mA).","LM p.2-10"],
    ["LWCO trip (LW Shutdown)","LWCO countdown, then LW Shutdown","Lower red LED, and the red LED above MENU/RESET.","LWCO relay (19-21) de-energized: the burner circuit opens; alarm relay on. Manual-reset models stay open until reset.","mA: not documented.","LM p.2-10, 2-11"],
    ["High-water warning","High Lvl Wrn (after the timer)","Upper orange LED.","General alarm relay energized.","mA: 4 expected (valve closed); not explicitly documented.","LM p.2-11; Table 3-3 p.3-4"],
    ["High-water alarm","High Water Alarm","Upper red LED. Stays on the LCD until MENU/RESET.","High water alarm relay (25, 26) and general alarm relay energized.","mA: 4 expected; not explicitly documented.","LM p.2-11"],
    ["Sensor wiring fault","Error message; Waiting on Sensor","POWER ON/ERROR flashes green and red alternately; sensor board LED red.","Alarm relay energized; LWCO relay de-energized.","mA: not documented.","LM p.2-11, 2-12"],
    ["Stuck float","Slow Float → Float Check Fail → Req Col Blowdown","Burner running: no float movement for half the test time, then the full time.","LWCO contacts open at Float Check Fail; a proper blowdown is required to restart. Not enabled for 2 hours after a cold start.","n/a","LM Fig 4-7 to 4-9 p.4-5"],
    ["Column blowdown test","Perform Blowdown screens → 90 s countdown → Blowdown Successful","Red low-water LED at the bottom as the float falls.","BLOWDOWN switch bypasses the LWCO while held; below LWCO for more than 30 s opens the contacts anyway.","n/a","LM p.4-9 to 4-11"],
    ["ALWCO check","Perform ALWCO screens","Operator present; level dropped below the auxiliary LWCO.","Boiler shut down by the auxiliary LWCO: LW Shutdown; reset after level is restored.","n/a","LM p.4-11, 4-12"]];
  S("w-s14-3","What the Level Master does: tap a condition",chips("cdC",CND.map(function(c){return c[0];}))+'<div class="infocard" id="cdO" aria-live="polite">Tap a condition to see the LCD text, LEDs, relays, and the manual page.</div><p class="wnote">Sensitivity Table 1 example levels (not a site setting): High Water Alarm 5.5 in, High Water Warning 4.5, Pump Off 1.5, Pump On 0.75, Low Water Warning 0.3, LWCO 0. Alarm/Warning Timer default 5 s.</p>');
  H.chipGroup($("cdC"),function(i){var c=CND[+i];$("cdO").innerHTML="<b>"+c[0]+"</b><pre class=\"lcd\">"+c[1]+"</pre><p><b>LEDs:</b> "+c[2]+"</p><p><b>Relays:</b> "+c[3]+"</p><p><b>"+c[4]+"</b></p><p class=\"mini\">"+c[5]+"</p>";});

  /* ---- A6.3 centerpiece: level to mA to valve ---- */
  var X={L:1.125,nc:true,dip1:"off",dip3:"on",fmt:"mod",burner:true,lost:false,pump:false,speed:10,cur:0.5,target:0.5,mismatch:false,note:""};
  function sig(){ /* returns {ma, tag} */
    var a=alarmOf(X.L),p=pctOf(X.L);
    if(!X.burner||X.fmt==="onoff") return {ma:null,tag:""};
    if(a==="lowwrn") return {ma:20,tag:"assumed hold; not documented"};
    if(a==="lwsd") return {ma:null,tag:"not documented"};
    if(a==="hiwrn"||a==="hialm") return {ma:4,tag:"4 mA expected; not explicitly documented"};
    return {ma:maOf(p),tag:""};
  }
  function compute(){
    var s=sig(); X.mismatch=false; X.note="";
    if(X.lost){X.target=0;X.note="Signal or 24 Vac lost: the return spring drives the stem to 0%.";return;}
    if(X.dip3==="off"&&s.ma!=null){X.mismatch=true;X.note="DIP 3 OFF = 0-10 Vdc: type mismatch against a mA signal (inferred effect; the manual only defines the selection). Actuator held.";return;}
    if(s.ma==null){X.note=!X.burner?"Boiler off: the display needs burner status (terminal 22); the 14/15 output is not documented in this state. Actuator held.":X.fmt==="onoff"?"On/Off mode: the pump contactor (terminals 27, 28) is used; 14/15 is not the feed signal here. Actuator not driven.":"mA at LWCO shutdown: not documented. Actuator held.";return;}
    var f=(s.ma-4)/16; X.target=X.dip1==="off"?f:1-f; if(s.tag)X.note="mA at this alarm: "+s.tag+".";
  }
  S("w-s14-4","See it run: level → mA → SKD62UA → valve (EXAMPLE numbers)",
    '<div class="svgbox"><svg id="lmSvg" viewBox="0 0 300 360" role="img" aria-label="Water column, Level Master display, mA gauge, SKD62UA actuator and valve"></svg></div>'+
    '<label class="lbl" for="lmL" style="margin-top:8px">Level: <b id="lmLv">1.13</b> in above LWCO (0 to 6)</label><input type="range" id="lmL" min="0" max="6" step="0.01" value="1.125" aria-label="Level">'+
    '<div class="row"><button type="button" class="secondary" id="lmC1">0.75 in (Pump On)</button><button type="button" class="secondary" id="lmC2">1.125 in (midpoint)</button><button type="button" class="secondary" id="lmC3">1.5 in (Pump Off)</button><button type="button" class="secondary" id="lmC4">Low 0.2</button><button type="button" class="secondary" id="lmC5">LWCO 0</button><button type="button" class="secondary" id="lmC6">High 5.0</button></div>'+
    '<p class="lbl" style="margin:8px 0 0">Valve body</p>'+seg("lmBody",[["nc","Normally closed (NC)"],["no","Normally open (NO)"]])+
    '<p class="lbl" style="margin:8px 0 0">SKD62UA DIP 1 (direction) and DIP 3 (signal)</p>'+seg("lmD1",[["off","DIP 1 OFF: direct"],["on","DIP 1 ON: reverse"]])+seg("lmD3",[["on","DIP 3 ON: 4-20 mA"],["off","DIP 3 OFF: 0-10 Vdc"]])+
    '<p class="lbl" style="margin:8px 0 0">Level Master Display Format and burner</p>'+seg("lmFm",[["mod","Modulating (4-20 mA)"],["onoff","On/Off (pump)"]])+seg("lmBu",[["on","Burner running"],["off","Burner off"]])+
    '<p class="lbl" style="margin:8px 0 0">Power and speed</p>'+seg("lmPw",[["ok","Power and signal OK"],["lost","Power / signal lost"]])+seg("lmSp",[["10","Animation ×10"],["1","Real time"]])+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Output</span><span class="v" id="lmPct">–</span></div><div class="ro"><span class="k">Signal 14(+)/15(−)</span><span class="v" id="lmMa">–</span></div><div class="ro"><span class="k">Stem</span><span class="v" id="lmStem">–</span></div><div class="ro"><span class="k">Valve</span><span class="v" id="lmOpen">–</span></div></div>'+
    '<div class="infocard" id="lmCap" aria-live="polite"></div>'+
    '<p class="wnote">Signal locked on 4-20 mA (West Mechanical standard); other ranges may be available; check the manual. Level numbers: Sensitivity Table 1 example, not a site setting. Pump, bypass and piston motion: illustrative (Siemens names the parts but gives no oil-flow narrative). Full-stroke times are 30 s opening and 15 s closing; the animation runs ×10 faster. mA at alarm conditions: not documented unless noted.</p>');
  function lmDraw(){
    compute();
    var L=X.L,a=alarmOf(L),p=pctOf(L),s=sig(),g=column(L,6,false);
    var open=X.nc?X.cur:1-X.cur;
    /* Level Master face */
    g+='<rect x="100" y="14" width="106" height="100" rx="8" fill="#141b24" stroke="#59616c" stroke-width="2"/>';
    var l2=a==="lwsd"?"LW Shutdown":a==="lowwrn"?"Low Lvl Wrn":a==="hiwrn"?"High Lvl Wrn":a==="hialm"?"High Water Alarm":(!X.burner?"Boiler Off":(X.fmt==="mod"?"Output "+p.toFixed(1)+"%":(X.pump?"Pump On":"Pump Off")));
    g+='<rect x="106" y="20" width="78" height="30" rx="3" fill="#0b2a1e" stroke="#2EC4B6"/><text x="110" y="33" fill="#9dffcf" font-size="7.6" font-family="monospace">'+L.toFixed(2)+'" &gt;LWCO</text><text x="110" y="45" fill="#9dffcf" font-size="7" font-family="monospace">'+l2+'</text>';
    g+=bargraph(L,194,100);
    g+='<text x="108" y="62" fill="#cfd8e3" font-size="6">LWCO relay (19-21): '+(a==="lwsd"?'<tspan fill="#ff4d4d">OPEN</tspan>':'closed')+'</text>';
    g+='<text x="108" y="72" fill="#cfd8e3" font-size="6">General alarm (23,24): '+(a==="ok"?'off':'<tspan fill="#ff9f1c">on</tspan>')+'</text>';
    g+='<text x="108" y="82" fill="#cfd8e3" font-size="6">HW alarm (25,26): '+(a==="hialm"?'<tspan fill="#ff4d4d">on</tspan>':'off')+'</text>';
    g+='<text x="108" y="94" fill="#ffb020" font-size="6.2">14(+) 15(−): '+(s.ma==null?'no feed signal':s.ma.toFixed(2)+' mA')+'</text>';
    g+='<text x="108" y="108" fill="#9AA0A6" font-size="5.6">Level Master</text>';
    /* mA gauge */
    g+=gauge(254,52,32,s.ma==null?0:(s.ma-4)/16,"#ffb020",s.ma==null?"no signal":s.ma.toFixed(2)+" mA",s.ma==null);
    g+='<text x="254" y="102" fill="#9AA0A6" font-size="6" text-anchor="middle">4-20 mA control out</text>';
    if(X.fmt==="onoff") g+='<text x="254" y="116" fill="#cfd8e3" font-size="6.5" text-anchor="middle">27, 28: pump '+(X.pump?"ON":"OFF")+'</text>';
    /* wire from LM to SKD */
    g+='<path d="M150 114 V176 H80 V190" stroke="'+(s.ma==null||X.lost?"#59616c":"#ffb020")+'" stroke-width="2" fill="none" stroke-dasharray="'+(X.lost?"3 3":"0")+'"/><text x="154" y="146" fill="#9AA0A6" font-size="6">Y / M</text>';
    if(X.lost) g+='<text x="86" y="186" fill="#ff4d4d" font-size="6.5">signal lost</text>';
    /* SKD62UA cutaway */
    var tr=24*X.cur;
    g+='<rect x="38" y="192" width="84" height="76" rx="5" fill="#18222e" stroke="#9aa5b1" stroke-width="1.5"/>';
    g+='<rect x="46" y="'+(200+tr).toFixed(1)+'" width="68" height="7" fill="#e8c07d" stroke="#fff" stroke-width=".6"/>';
    var sy0=207+tr, sy1=266, n=7, zig='M60 '+sy0.toFixed(1); for(var i=1;i<=n;i++){zig+=' L'+(i%2?66:54)+' '+(sy0+(sy1-sy0)*i/(n+1)).toFixed(1);} zig+=' L60 '+sy1; g+='<path d="'+zig+'" stroke="#9aa5b1" stroke-width="1.4" fill="none"/><text x="92" y="262" fill="#9AA0A6" font-size="6.5">spring</text>';
    g+='<rect x="12" y="206" width="12" height="20" rx="2" fill="#2a3340" stroke="#cfd8e3"/><text x="18" y="236" fill="#9AA0A6" font-size="6.5" text-anchor="middle">pump</text>';
    var byp=X.cur>X.target+0.002; g+='<rect x="124" y="226" width="10" height="12" rx="2" fill="'+(byp||X.lost?"#3ecf6a":"#2a3340")+'" stroke="#cfd8e3"/><text x="124" y="250" fill="#9AA0A6" font-size="6.5">bypass</text>';
    g+='<line x1="88" y1="'+(207+tr).toFixed(1)+'" x2="88" y2="'+(312+tr).toFixed(1)+'" stroke="#e5e8eb" stroke-width="4"/>';
    g+='<text x="93" y="'+(228+tr).toFixed(0)+'" fill="#9AA0A6" font-size="6.5">stem</text>';
    g+='<rect x="102" y="196" width="14" height="6" fill="#ff5a5f" fill-opacity="'+(X.cur>0.001?0.9:0.15)+'"/><text x="125" y="202" fill="#9AA0A6" font-size="5.5">pos. '+X.cur.toFixed(2)+'</text>';
    /* valve body */
    var seat=X.nc?312:342, ptop=X.nc?312+tr:312+tr; /* plug top follows the stem */
    g+='<rect x="38" y="296" width="84" height="58" rx="5" fill="#2b2118" stroke="#d2a679" stroke-width="1.5"/>';
    g+='<line x1="60" y1="'+seat+'" x2="116" y2="'+seat+'" stroke="#d2a679" stroke-width="3"/><text x="40" y="'+(seat+(X.nc?-3:12))+'" fill="#d2a679" font-size="5.5">seat</text>';
    g+='<rect x="76" y="'+ptop.toFixed(1)+'" width="24" height="6" rx="1" fill="#ff5a5f" stroke="#fff" stroke-width=".8"/>';
    g+='<path d="M16 326 H36" stroke="#2EC4B6" stroke-width="'+(1+open*5).toFixed(1)+'"/><path d="M124 326 H144" stroke="#2EC4B6" stroke-width="'+(1+open*5).toFixed(1)+'"/>';
    g+='<text x="80" y="279" fill="#cfd8e3" font-size="7" text-anchor="middle" stroke="#0f1720" stroke-width="2.5" paint-order="stroke">SKD62UA (illustrative)</text>';
    g+='<text x="80" y="292" fill="#cfd8e3" font-size="7" text-anchor="middle"'+' stroke="#0f1720" stroke-width="2.5" paint-order="stroke"'+'>'+(X.nc?"NC valve":"NO valve")+": "+Math.round(open*100)+'% open</text>';
    /* right column: DIP bank and notes */
    g+='<text x="214" y="200" fill="#cfd8e3" font-size="7">DIP switches</text>';
    var dips=[["1",X.dip1==="on"],["2",false],["3",X.dip3==="on"],["4",false]];
    dips.forEach(function(d,i){var x=160+i*30;g+='<rect x="'+x+'" y="206" width="22" height="32" rx="3" fill="#0d0f12" stroke="#59616c"/><rect x="'+(x+4)+'" y="'+(d[1]?210:224)+'" width="14" height="10" rx="2" fill="'+(d[1]?"#3ecf6a":"#59616c")+'"/><text x="'+(x+11)+'" y="248" fill="#9AA0A6" font-size="6" text-anchor="middle">'+d[0]+'</text>';});
    g+='<text x="160" y="262" fill="#9AA0A6" font-size="5.8">1: OFF direct / ON reverse</text><text x="160" y="272" fill="#9AA0A6" font-size="5.8">3: ON = 4-20 mA, OFF = 0-10 Vdc</text>';
    g+='<text x="160" y="290" fill="#cfd8e3" font-size="6.2">Stroke 0-20 mm: '+(X.cur*20).toFixed(1)+' mm</text><text x="160" y="302" fill="#cfd8e3" font-size="6.2">Open 30 s / close 15 s</text>';
    g+='<text x="160" y="316" fill="'+(X.lost?"#ff4d4d":X.mismatch?"#ffb020":"#9AA0A6")+'" font-size="6">'+(X.lost?"SPRING RETURN to 0%":X.mismatch?"TYPE MISMATCH (held)":(Math.abs(X.cur-X.target)>0.005?(X.cur<X.target?"opening…":"closing…"):"at position"))+'</text>';
    var svg=$("lmSvg"); svg.innerHTML=g;
    svg.setAttribute("data-pct",p.toFixed(1)); svg.setAttribute("data-ma",s.ma==null?"none":s.ma.toFixed(2)); svg.setAttribute("data-target",X.target.toFixed(3)); svg.setAttribute("data-stroke",X.cur.toFixed(3)); svg.setAttribute("data-open",open.toFixed(3)); svg.setAttribute("data-state",a); svg.setAttribute("data-lost",X.lost?"1":"0"); svg.setAttribute("data-mismatch",X.mismatch?"1":"0");
    $("lmLv").textContent=L.toFixed(2);
    $("lmPct").textContent=(a==="ok"&&X.burner&&X.fmt==="mod")?p.toFixed(1)+"%":(X.fmt==="onoff"?(X.pump?"Pump On":"Pump Off"):"–");
    $("lmMa").textContent=s.ma==null?"none":s.ma.toFixed(2)+" mA"; $("lmStem").textContent=(X.cur*20).toFixed(1)+" mm ("+Math.round(X.cur*100)+"%)"; $("lmOpen").textContent=Math.round(open*100)+"% open";
    var why;
    if(X.lost) why="<b>Power or signal lost.</b> The return spring drives the SKD62UA to 0% stroke (stem retracted) in about 15 s: "+(X.nc?"a normally closed valve closes.":"a normally open valve opens.")+" Compare low water: the Level Master sends 20 mA and the valve opens. [TI p.2, 7; VF p.8]";
    else if(a==="lwsd") why="<b>Below the LWCO point:</b> after the Alarm/Warning Timer (default 5 s) the LWCO relay de-energizes and the burner circuit opens. The LWCO relays, not the actuator, are the safety shutoff. [LM p.2-10, 2-11]";
    else if(a==="lowwrn") why="<b>Low water warning:</b> lower orange LED and the general alarm relay. mA here is not documented; the animation assumes the valve stays wide open.";
    else if(a==="hiwrn"||a==="hialm") why="<b>"+(a==="hialm"?"High water alarm":"High water warning")+":</b> upper "+(a==="hialm"?"red":"orange")+" LED; feed is shut off (4 mA expected, not explicitly documented). [LM p.2-11]";
    else if(!X.burner) why="<b>Boiler off:</b> the display shows <i>Boiler Off</i>. Modulating output needs the burner status input (terminal 22). [LM Fig 4-10 p.4-6; p.4-5]";
    else if(X.fmt==="onoff") why="<b>On/Off format:</b> the display shows Pump On / Pump Off and the contactor is on terminals 27, 28. This is the other documented mode, not the West Mechanical standard.";
    else if(X.mismatch) why="<b>DIP 3 is OFF:</b> the actuator expects 0-10 Vdc, but the Level Master sends mA. Move DIP 3 to ON for 4-20 mA. [TI Fig 13 p.9]";
    else if(L<=T.pOn){var feeding=(X.nc&&X.dip1==="off")||(!X.nc&&X.dip1==="on"); why="<b>Low water, normal band:</b> 20 mA at or below the Pump On level. "+(X.dip1==="off"?"With DIP 1 OFF, 20 mA = 100% stroke (stem extended). ":"With DIP 1 ON (reverse), 20 mA = 0% stroke. ")+"The "+(X.nc?"NC":"NO")+" valve is "+Math.round(open*100)+"% open"+(feeding?" (feed on).":": that is backwards for feedwater, so a NO valve needs DIP 1 ON. [TI p.10, 11]");}
    else if(L>=T.pOff) why="<b>Higher water, normal band:</b> 4 mA at or above the Pump Off level."+(X.dip1==="off"?" With DIP 1 OFF, 4 mA = 0% stroke (stem retracted).":" With DIP 1 ON, 4 mA = 100% stroke.")+" The valve is "+Math.round(open*100)+"% open.";
    else why="<b>Rising water:</b> between Pump On and Pump Off the output follows a straight line: mA = 4 + 16 × (percent ÷ 100) (derived from LM p.5-4; example). The stem and plug follow, at 15 s full-stroke closing time.";
    $("lmCap").innerHTML=why+(X.note&&!X.lost?'<div class="mini" style="margin-top:6px">'+X.note+'</div>':'');
  }
  function lmStep(dt){
    var d=X.target-X.cur; if(Math.abs(d)<0.0005){X.cur=X.target;return false;}
    var rate=(d>0?1/30:1/15)*X.speed*dt; if(RM)rate=1;
    X.cur=Math.abs(d)<=rate?X.target:X.cur+(d>0?rate:-rate); return true;
  }
  var lmTimer=null;
  function lmKick(){lmDraw(); if(lmTimer)return; lmTimer=setInterval(function(){var moved=lmStep(0.1); lmDraw(); if(!moved){clearInterval(lmTimer);lmTimer=null;}},100);}
  function lmSet(v){X.L=clamp(v,0,6); if(X.L<=T.pOn)X.pump=true; else if(X.L>=T.pOff)X.pump=false; $("lmL").value=X.L; lmKick();}
  $("lmL").addEventListener("input",function(){lmSet(+$("lmL").value);});
  [["lmC1",0.75],["lmC2",1.125],["lmC3",1.5],["lmC4",0.2],["lmC5",0],["lmC6",5]].forEach(function(c){$(c[0]).addEventListener("click",function(){lmSet(c[1]);});});
  H.chipGroup($("lmBody"),function(v){X.nc=v==="nc";lmKick();}).pick("nc");
  H.chipGroup($("lmD1"),function(v){X.dip1=v;lmKick();}).pick("off");
  H.chipGroup($("lmD3"),function(v){X.dip3=v;lmKick();}).pick("on");
  H.chipGroup($("lmFm"),function(v){X.fmt=v;lmKick();}).pick("mod");
  H.chipGroup($("lmBu"),function(v){X.burner=v==="on";lmKick();}).pick("on");
  H.chipGroup($("lmPw"),function(v){X.lost=v==="lost";lmKick();}).pick("ok");
  H.chipGroup($("lmSp"),function(v){X.speed=+v;lmKick();}).pick("10");
  X.cur=0.5; X.target=0.5; lmDraw();

  /* ---- A6.4 SKD62UA parts, DIP bank, manual override, calibration ---- */
  var SKP=[["1 Pressure cylinder","The cylinder the piston works in. (TI Fig 7 p.6)"],["2 Piston","Pushed out against the return spring; its stem is the valve stem. (TI Fig 7 p.6)"],["3 Oscillating pump","Drives the piston. Siemens gives the name but no oil-flow narrative, so the motion shown is illustrative. (TI Fig 7)"],["4 Return spring","On loss of signal or power it returns the actuator to 0% stroke, stem fully retracted, in about 15 s. It is under high compression: do not disassemble. (TI p.5, 7)"],["5 Bypass valve","Lets the spring push the piston back. Illustrative: inferred from the part names. (TI Fig 7)"],["6 Valve stem retainer","Holds the actuator stem to the valve stem. (TI Fig 7)"],["7 Manual override knob","Turn clockwise (red indicator shows): each 360° = 3/32 in (2.5 mm). The valve cannot be commanded to 0% in manual. Return fully counter-clockwise to go back to automatic. (TI p.11, 12)"],["8 Position indicator","Shows 0 to 1 (stroke 0 to 20 mm). (TI Fig 9 p.6)"]];
  var K={ma:12,d1:"off",d3:"on",turns:0,cal:null,cur:0.5};
  S("w-s14-5","The SKD62UA: parts, DIP switches, override, calibration",
    '<div class="svgbox"><svg id="skdSvg" viewBox="0 0 300 200" role="img" aria-label="SKD62UA cutaway with the official part numbers"></svg></div>'+
    chips("skdC",SKP.map(function(p){return p[0];}))+card("skdO","Tap a part for its official name. Move the signal knob to move the piston and stem.")+
    '<label class="lbl" for="skdMa" style="margin-top:10px">Signal knob: <b id="skdMav">12.0</b> mA</label><input type="range" id="skdMa" min="4" max="20" step="0.1" value="12" aria-label="Signal">'+
    '<div class="row"><button type="button" class="secondary" id="skdD1" aria-pressed="false">DIP 1: OFF (direct)</button><button type="button" class="secondary" id="skdD3" aria-pressed="true">DIP 3: ON (4-20 mA)</button></div>'+
    '<div class="row"><button type="button" class="secondary" id="skdTurn">Turn override knob one turn (clockwise)</button><button type="button" class="secondary" id="skdBack">Return knob (counter-clockwise)</button><button type="button" class="secondary" id="skdCal">Stroke calibration sweep</button></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Position indicator</span><span class="v" id="skdPos">–</span></div><div class="ro"><span class="k">Stem</span><span class="v" id="skdMm">–</span></div><div class="ro"><span class="k">LED</span><span class="v" id="skdLed" style="font-size:1rem">–</span></div></div>'+
    '<p class="wnote" id="skdNote" aria-live="polite"></p><p class="wnote">Geometry follows TI Fig 7 (illustrative). Override and DIP behaviour from TI p.9, 10, 11, 12.</p>');
  var skSel=-1;
  function skdStroke(){
    var f=(K.ma-4)/16; var sg=K.d1==="off"?f:1-f;
    if(K.d3==="off") return {s:K.cur,mis:true};
    var s=sg; if(K.turns>0) s=clamp(sg+K.turns*2.5/20,2.5/20,1);
    return {s:s,mis:false};
  }
  function skdDraw(){
    var r=K.cal!=null?{s:K.cal,mis:false}:skdStroke(); K.cur=r.s; var tr=r.s*30, g='';
    var parts=function(i,x,y,w,h,fill){var on=skSel===i;return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" fill="'+fill+'" fill-opacity="'+(on?.6:.2)+'" stroke="'+(on?"#fff":fill)+'" stroke-width="'+(on?2.5:1)+'"/>';};
    g+=parts(0,70,14,100,106,"#4ea8ff");
    g+=parts(1,76,(22+tr),88,10,"#e8c07d");
    g+=parts(2,28,30,28,34,"#b07cff");
    var sy0=32+tr+10,sy1=116,zig='M110 '+sy0; for(var i=1;i<=7;i++)zig+=' L'+(i%2?120:100)+' '+(sy0+(sy1-sy0)*i/8); zig+=' L110 '+sy1; g+='<path d="'+zig+'" stroke="'+(skSel===3?"#fff":"#9aa5b1")+'" stroke-width="'+(skSel===3?3:1.6)+'" fill="none"/>';
    g+=parts(4,176,50,30,24,"#3ecf6a");
    g+=parts(5,100,122,48,14,"#ff9a3c");
    g+=parts(6,176,18,36,20,r.mis?"#ffb020":(K.turns>0?"#ff5a5f":"#9aa5b1"));
    g+=parts(7,176,88,40,22,"#ff5a5f");
    g+='<line x1="124" y1="'+(32+tr+10)+'" x2="124" y2="186" stroke="#e5e8eb" stroke-width="5"/><rect x="108" y="'+(176)+'" width="32" height="8" fill="#ff5a5f" transform="translate(0,'+(tr*0.2).toFixed(1)+')"/>';
    var lab=[[120,"1"],[120,"2"],[42,"3"],[110,"4"],[191,"5"],[124,"6"],[194,"7"],[196,"8"]];
    g+='<text x="82" y="30" fill="#fff" font-size="8">1</text><text x="82" y="'+(40+tr).toFixed(0)+'" fill="#fff" font-size="8">2</text><text x="38" y="26" fill="#fff" font-size="8">3</text><text x="126" y="90" fill="#fff" font-size="8">4</text><text x="188" y="48" fill="#fff" font-size="8">5</text><text x="150" y="133" fill="#fff" font-size="8">6</text><text x="188" y="32" fill="#fff" font-size="8">7</text><text x="188" y="102" fill="#fff" font-size="8">8</text>';
    g+='<text x="150" y="196" fill="#9AA0A6" font-size="6.5" text-anchor="middle">position '+r.s.toFixed(2)+' (0 to 1)</text>';
    $("skdSvg").innerHTML=g; $("skdSvg").setAttribute("data-stroke",r.s.toFixed(3)); $("skdSvg").setAttribute("data-turns",K.turns);
    $("skdMav").textContent=K.ma.toFixed(1); $("skdPos").textContent=r.s.toFixed(2); $("skdMm").textContent=(r.s*20).toFixed(1)+" mm";
    $("skdLed").textContent=K.cal!=null?"Green flashing (calibrating)":(r.mis?"Green on (signal type mismatch, inferred)":"Green on (normal)");
    $("skdNote").innerHTML=r.mis?"DIP 3 OFF = 0-10 Vdc: a mA signal is the wrong type, so the actuator is shown held. Move DIP 3 ON for 4-20 mA. [TI Fig 13 p.9]":K.turns>0?"Manual override: red indicator showing; control is not accurate, and the valve cannot be commanded to 0% in manual. Return the knob fully counter-clockwise (red indicator gone) before relying on automatic. [TI p.11, 12]":(K.d1==="off"?"DIP 1 OFF = direct: 4 mA = stroke 0% (stem retracted), 20 mA = 100% (extended). [TI Fig 9, 14]":"DIP 1 ON = reverse: 4 mA = stroke 100%, 20 mA = 0%. [TI Fig 14 p.10]");
    $("skdD1").textContent="DIP 1: "+(K.d1==="off"?"OFF (direct)":"ON (reverse)"); $("skdD1").setAttribute("aria-pressed",String(K.d1==="on"));
    $("skdD3").textContent="DIP 3: "+(K.d3==="on"?"ON (4-20 mA)":"OFF (0-10 Vdc)"); $("skdD3").setAttribute("aria-pressed",String(K.d3==="on"));
  }
  H.chipGroup($("skdC"),function(i){skSel=+i;$("skdO").innerHTML="<b>"+SKP[skSel][0]+":</b> "+SKP[skSel][1];skdDraw();});
  $("skdMa").addEventListener("input",function(){K.ma=+$("skdMa").value;skdDraw();});
  $("skdD1").addEventListener("click",function(){K.d1=K.d1==="off"?"on":"off";skdDraw();});
  $("skdD3").addEventListener("click",function(){K.d3=K.d3==="on"?"off":"on";skdDraw();});
  $("skdTurn").addEventListener("click",function(){K.turns=Math.min(8,K.turns+1);skdDraw();});
  $("skdBack").addEventListener("click",function(){K.turns=0;skdDraw();});
  $("skdCal").addEventListener("click",function(){
    var seq=[0,1,skdStroke().s],i=0; $("skdNote").textContent="Calibrating: runs to 0%, then 100%, stores the values, then goes to the signal position (green steady). [TI p.8]";
    function nextS(){if(i>=seq.length){K.cal=null;skdDraw();return;} K.cal=seq[i++]; skdDraw(); setTimeout(nextS,RM?0:700);}
    nextS();});
  skdDraw();

  /* ---- A6.5 fail-position check ---- */
  var FQ=[["Normally closed valve, DIP 1 OFF (direct). Low water: the Level Master sends 20 mA. Where is the valve?","open","20 mA = 100% stroke (stem extended), and an NC valve is open at 100%. [LM p.5-4; TI Fig 9; VF p.8]"],
          ["Same NC valve. Water is high and the Level Master sends 4 mA. Where is the valve?","closed","4 mA = 0% stroke, and an NC valve is closed at 0%."],
          ["Same NC valve. The 24 Vac supply fails. Where does it end up?","closed","The return spring drives the stem to 0% (about 15 s): NC closes. [TI p.2, 7]"],
          ["A normally open valve with DIP 1 OFF. The signal is lost. Where does it end up?","open","0% stroke on an NO valve is open, so it opens on a failure. [TI p.10, 11; VF p.8]"],
          ["A normally open valve, DIP 1 ON (reverse). Low water, 20 mA. Where is the valve?","open","Reverse: 20 mA = 0% stroke, and an NO valve is open at 0%, so it feeds on low water."],
          ["A normally open valve left on DIP 1 OFF. Low water, 20 mA. Where is the valve?","closed","20 mA = 100% stroke closes an NO valve: it runs backwards. Set DIP 1 ON. [TI p.10, 11]"]];
  var fi=0,fs=0;
  S("w-s14-6","Fail-position check: where does the valve end up?",'<div id="fqBox"></div>');
  function fqDraw(){
    if(fi>=FQ.length){$("fqBox").innerHTML='<div class="infocard"><b>Score: '+fs+'/'+FQ.length+'.</b> Key point: a failed signal at 0 mA is not the same as low water. At low water the Level Master sends 20 mA and the valve opens; on a failure the SKD62UA goes to 0% and the valve body decides what that means.</div><div class="row"><button type="button" class="secondary" id="fqAgain">↺ Again</button></div>'; $("fqAgain").addEventListener("click",function(){fi=0;fs=0;fqDraw();}); return;}
    var q=FQ[fi]; $("fqBox").innerHTML='<p><b>Question '+(fi+1)+' of '+FQ.length+'.</b> '+q[0]+'</p><div class="seg" id="fqOpts"><button data-v="open">Open</button><button data-v="closed">Closed</button></div><p class="ch-fb" id="fqFb" aria-live="polite"></p><div class="row"><button type="button" class="secondary" id="fqNext" disabled>Next →</button></div>';
    var done=false; each($("fqOpts").querySelectorAll("button"),function(b){b.addEventListener("click",function(){if(done)return;done=true;var ok=b.getAttribute("data-v")===q[1];if(ok)fs++;b.classList.add(ok?"right":"wrong");$("fqFb").className="ch-fb show "+(ok?"good":"bad");$("fqFb").innerHTML=(ok?"✓ ":"✗ It is "+q[1]+". ")+q[2];$("fqNext").disabled=false;});});
    $("fqNext").addEventListener("click",function(){fi++;fqDraw();});
  }
  fqDraw();

  /* ---- A6.6 matcher ---- */
  S("w-s14-7","Wiring and settings matcher",'<div id="mtBox"></div><p class="lbl" style="margin:14px 0 0"><b>The valve is NO: what must change?</b></p>'+chips("noC",["DIP 1 → ON (reverse)","DIP 3 → OFF","Display Format → On/Off"])+card("noO","Pick one."));
  EW.sorter($("mtBox"),["Set on the Level Master","Set on the SKD62UA","Wiring between them"],[
    {label:"Display Format: Modulating",bin:0,why:"Display Format is a Level Master commissioning item: Modulating gives the 4-20 mA output. [LM p.4-5]"},
    {label:"Sensitivity Table",bin:0,why:"The Level Master's Sensitivity Table sets the alarm and pump levels. [LM p.3-2]"},
    {label:"DIP 3 ON = 4-20 mA",bin:1,why:"DIP 3 is on the SKD62UA: ON = 4-20 mA, OFF = 0-10 Vdc. The Level Master sends mA. [TI Fig 13 p.9]"},
    {label:"DIP 1 OFF = direct acting",bin:1,why:"DIP 1 is on the SKD62UA: OFF = direct (4 mA = 0%, 20 mA = 100%). [TI Fig 14 p.10]"},
    {label:"Stroke calibration",bin:1,why:"The SKD62UA runs its stroke calibration (calibration slot) at commissioning. [TI p.8]"},
    {label:"Terminals 14 (+) / 15 (−) to Y / M",bin:2,why:"The pairing is inferred: neither document shows this exact pair wired together. Zach to confirm. [LM p.2-9; TI Fig 19 p.13]"},
    {label:"24 Vac G / G0 from a Class 2 transformer",bin:2,why:"The SKD62UA's 24 Vac comes from a Class 2 isolating transformer, not an auto-transformer. [TI p.13]"},
    {label:"Shielded cable, ground one end",bin:2,why:"Level Master Fig 2-6 shows shielded analog cables grounded at one end. [LM p.2-8]"}]);
  H.chipGroup($("noC"),function(i){$("noO").innerHTML=+i===0?"<b>✓ DIP 1 → ON (reverse).</b> A normally open valve opens at 0% stroke; with DIP 1 ON, 20 mA = 0% so low water opens it. [TI p.10, 11]":+i===1?"<b>✗</b> DIP 3 OFF selects 0-10 Vdc; the Level Master sends mA, so that would be a type mismatch.":"<b>✗</b> On/Off is the pump-contactor mode on terminals 27, 28, not the 4-20 mA signal West Mechanical uses.";});

  /* ---- A6 walkdown ---- */
  S("w-s14-8","Walkdown checklist: Level Master + SKD62UA",
    EW.fld("lmwL","Display line 1: level (in above LWCO)","")+EW.fld("lmwO","Display Output (%)","")+
    '<div class="readouts"><div class="ro"><span class="k">Expected mA = 4 + 16 × %/100</span><span class="v" id="lmwE">–</span></div><div class="ro"><span class="k">Expected stem (0 to 1)</span><span class="v" id="lmwS">–</span></div></div>'+
    EW.fld("lmwM","Measured mA at terminals 14 / 15","")+EW.fld("lmwP","Position indicator (0 to 1)","")+
    '<div class="grid2">'+EW.sel("lmwV","Valve tag",[["","?"],["NC","Normally closed"],["NO","Normally open"]])+EW.sel("lmwD1","DIP 1",[["","?"],["off","OFF (direct)"],["on","ON (reverse)"]])+'</div>'+
    EW.sel("lmwD3","DIP 3",[["","?"],["on","ON (4-20 mA)"],["off","OFF (0-10 Vdc)"]])+EW.txt("lmwB","Last successful blowdown (date/time)","")+EW.txt("lmwW","Who checked it","Zach")+
    '<p class="hint" id="lmwH" aria-live="polite"></p>'+EW.chk("lmwZ","Zach checked this")+'<label class="check-row"><input type="checkbox" id="lmwDone"> Mark complete</label>');
  function lmwCalc(){
    var o=parseFloat($("lmwO").value),m=parseFloat($("lmwM").value),h="";
    if(isFinite(o)){var e=4+16*o/100;$("lmwE").textContent=e.toFixed(2)+" mA";$("lmwS").textContent=(o/100).toFixed(2);
      if(isFinite(m)) h=Math.abs(m-e)<=0.2?"✓ Measured mA matches the display within 0.2 mA.":"✗ Measured "+m.toFixed(2)+" mA vs expected "+e.toFixed(2)+": check the Display Format, wiring on 14/15, and that you are on the control pair (not the 12/13 level re-transmit).";}
    else {$("lmwE").textContent="–";$("lmwS").textContent="–";}
    if($("lmwV").value==="NO"&&$("lmwD1").value==="off") h+=" A normally open valve with DIP 1 OFF runs backwards: ask Zach.";
    if($("lmwD3").value==="off") h+=" DIP 3 should be ON for mA.";
    $("lmwH").textContent=h.trim();
  }
  EW.keep(["lmwL","lmwO","lmwM","lmwP","lmwV","lmwD1","lmwD3","lmwB","lmwW","lmwZ"],lmwCalc);
  (function(){var dn=$("lmwDone"),t=document.querySelector('.mark-done[data-sec="s14"]');if(!t)return;
    function sync(){dn.checked=t.getAttribute("aria-pressed")==="true";}
    dn.addEventListener("change",function(){var cur=t.getAttribute("aria-pressed")==="true";if(cur!==dn.checked)t.click();setTimeout(sync,0);});
    t.addEventListener("click",function(){setTimeout(sync,50);});setTimeout(sync,0);})();

  /* ---- terms ---- */
  var TM=[["Level Master","Cleaver-Brooks microprocessor-based primary safety water level control for steam boilers: controller, magnetostrictive level sensor, water column. [LM p.1-2]"],["LWCO","Low water cut-off. The Level Master's redundant LWCO relays (19-21) sit in series with the boiler limits and open the burner circuit on low water. [LM p.2-6, Fig 2-5]"],["ALWCO","Auxiliary LWCO: an external second low-water cut-off. The Level Master has an auxiliary LWCO check routine to test it. [LM p.1-2, 4-11]"],["SKD62UA","Siemens electrohydraulic spring-return linear actuator, 24 Vac, 3/4 in (20 mm) stroke, UL listed, Advanced Features. [TI p.1, 2, 3]"],["Electrohydraulic actuator","An actuator that uses an electric pump to pressurize oil and push a piston against a return spring. [TI Fig 7 p.6]"],["4-20 mA","A current-loop signal. On this pairing: 20 mA at the Pump On (low water) level = valve open, 4 mA at the Pump Off level = valve closed. [LM p.5-4, 6-2]"],["Spring return","On loss of signal or power the SKD62UA spring drives it to 0% stroke in about 15 s; the valve body decides if that is open or closed. [TI p.7]"],["Water column","The cast-iron chamber on the boiler that holds the level sensor, sight glass and blowdown connection, with a casting mark for the LWCO point. [LM p.1-2, 1-3]"],["Display Format","The Level Master commissioning item that selects On/Off (pump) or Modulating (4-20 mA). [LM p.4-5]"]];
  S("w-s14-9","Term chips: tap for a definition",chips("lmTC",TM.map(function(t){return t[0];}))+card("lmTO","Tap a term."));
  chipInfo("lmTC","lmTO",TM);
})();
