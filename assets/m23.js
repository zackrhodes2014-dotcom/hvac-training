/* Module 23 widgets: Fisher Pneumatic Valves */
(function(){
  "use strict";
  var $=EW.$, fmt=EW.fmt, S=EW.slot, each=EW.each;
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  function card(id,def){return '<div class="infocard" id="'+id+'" aria-live="polite">'+(def||"Tap one.")+'</div>';}
  function chips(id,list){return '<div class="chips" id="'+id+'">'+list.map(function(t,i){return '<button data-v="'+i+'">'+t+'</button>';}).join("")+'</div>';}
  function seg(id,list){return '<div class="seg" id="'+id+'" role="group">'+list.map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>';}).join("")+'</div>';}
  function chipInfo(boxId,outId,list){
    H.chipGroup($(boxId),function(i){var t=list[+i]; $(outId).innerHTML="<b>"+t[0]+":</b> "+t[1];});
  }

  /* ---------- Hook: follow the signal ---------- */
  var CH=[["🌬️","Air supply","Read the supply gauge at the filter-regulator. Low, wet, or dirty air starves everything downstream.","#s7","Section 7: Instrument air supply"],
          ["⚡","I/P","Compare the mA to the output gauge: does 12 mA give about 9 psi on a 3-15 range?","#s6","Section 6: I/P transducers"],
          ["🎯","Positioner","Does its output move when its input moves? Is the feedback linkage tight and the zero right?","#s5","Section 5: Positioners"],
          ["🎈","Actuator","Does the stem move when the air changes, and hold? Which side of the diaphragm does the tubing feed?","#s3","Section 3: Pneumatic actuators"],
          ["🔩","Valve body","Does the stem actually move the plug? Look at packing, the stem connector, and a stuck plug.","#s4","Section 4: Setup and the stem connector"]];
  S("w-hook","Follow the signal",
    '<div class="chain" id="chn">'+CH.map(function(c,i){return '<button type="button" data-i="'+i+'"><b>'+c[0]+'</b>'+c[1]+'</button>';}).join("")+'</div>'+
    '<p class="chain-arrow">air in → I/P → positioner → actuator → plug</p>'+
    '<div class="row" style="margin-top:8px"><button type="button" id="chnGo">▶ Follow the signal</button></div>'+
    card("chnOut","The level keeps swinging. Where does Zach look first?"));
  var chI=-1;
  function chShow(i){chI=i; each($("chn").querySelectorAll("button"),function(b,k){b.classList.toggle("lit",k===i);});
    var c=CH[i]; $("chnOut").innerHTML="<b>"+c[1]+":</b> "+c[2]+' <a href="'+c[3]+'">'+c[4]+' →</a>';}
  each($("chn").querySelectorAll("button"),function(b){b.addEventListener("click",function(){chShow(+b.getAttribute("data-i"));});});
  $("chnGo").addEventListener("click",function(){chShow((chI+1)%CH.length);});

  /* ---------- S1: anatomy ---------- */
  var PT=[["Air filter-regulator","Cleans the supply air and sets its pressure before it reaches the I/P and positioner.",8,14,58,36,"#4ea8ff"],
          ["I/P transducer","Turns the 4-20 mA signal into a 3-15 psi (or 6-30 psi) air signal.",8,62,58,36,"#b07cff"],
          ["Positioner","Compares the signal with the stem position and adds or vents air until they match.",236,60,58,40,"#ffd23f"],
          ["Diaphragm casings","The upper and lower halves of the actuator housing. Air pressure acts on the diaphragm between them.",84,8,132,62,"#2EC4B6"],
          ["Yoke","The frame that holds the actuator up on the valve body and encloses the stem and stem connector.",96,70,108,52,"#9aa5b1"],
          ["Stem and packing","The stem passes through packing at the bonnet. Packing seals the process but adds friction.",136,122,28,30,"#ff9a3c"],
          ["Valve body","The pressure-holding part the water or steam flows through.",56,152,188,72,"#d2a679"],
          ["Plug and seat","The plug moves toward or away from the seat ring. Trim (plug, seat, cage) sets flow and shutoff.",122,176,56,34,"#ff5a5f"]];
  S("w-s1","Control valve anatomy: tap a part",
    '<div class="svgbox"><svg id="anSvg" viewBox="0 0 300 232" role="img" aria-label="Control valve assembly with actuator, positioner, I/P, filter-regulator and globe body"></svg></div>'+
    chips("anC",PT.map(function(p){return p[0];}))+card("anO","Tap a part to see what it does."));
  var anSel=-1;
  function anDraw(){var g='';
    PT.forEach(function(p,k){var on=k===anSel;
      g+='<rect x="'+p[2]+'" y="'+p[3]+'" width="'+p[4]+'" height="'+p[5]+'" rx="6" fill="'+p[6]+'" fill-opacity="'+(on?0.55:0.18)+'" stroke="'+(on?"#fff":p[6])+'" stroke-width="'+(on?2.5:1.2)+'"/>';});
    g+='<text x="37" y="30" fill="#cfd8e3" font-size="8" text-anchor="middle">air set</text><text x="37" y="78" fill="#cfd8e3" font-size="8" text-anchor="middle">I/P</text><text x="265" y="78" fill="#cfd8e3" font-size="8" text-anchor="middle">positioner</text>'+
       '<text x="150" y="42" fill="#cfd8e3" font-size="9" text-anchor="middle">actuator</text><text x="150" y="100" fill="#cfd8e3" font-size="8" text-anchor="middle">yoke</text><text x="100" y="196" fill="#cfd8e3" font-size="9" text-anchor="middle">body</text>'+
       '<path d="M66 32 H84 M66 80 H90 M236 80 H216" stroke="#7d8995" stroke-width="1.5" fill="none" stroke-dasharray="3 2"/>'+
       '<line x1="150" y1="40" x2="150" y2="182" stroke="#e5e8eb" stroke-width="4"/><path d="M122 210 H178" stroke="#e8c07d" stroke-width="6"/>'+
       '<text x="150" y="236" fill="#9AA0A6" font-size="8" text-anchor="middle"></text>';
    $("anSvg").innerHTML=g;}
  H.chipGroup($("anC"),function(i){anSel=+i; $("anO").innerHTML="<b>"+PT[anSel][0]+":</b> "+PT[anSel][1]; anDraw();});
  anDraw();

  var SB=["Valve body","Actuator","Positioner / I/P / air set"];
  var s12=$("w-s1-2");
  S("w-s1-2","Sort the Fisher names","");
  EW.sorter(s12,SB,[
    {label:"easy-e ES globe",bin:0,why:"A sliding-stem globe valve body."},
    {label:"Vee-Ball",bin:0,why:"A V-notch segmented ball rotary valve body."},
    {label:"Control-Disk",bin:0,why:"An eccentric-disk rotary valve body."},
    {label:"667",bin:1,why:"A reverse-acting spring-and-diaphragm actuator. It is not a valve."},
    {label:"657",bin:1,why:"A direct-acting spring-and-diaphragm actuator."},
    {label:"1061",bin:1,why:"A piston rotary actuator."},
    {label:"3582",bin:2,why:"A pneumatic positioner for sliding-stem valves."},
    {label:"DVC6200",bin:2,why:"A digital valve controller (digital positioner)."},
    {label:"i2P-100",bin:2,why:"An I/P: 4-20 mA in, 3-15 or 6-30 psi out."},
    {label:"67CFR",bin:2,why:"A filter-regulator for the instrument air supply."}]);

  var TERMS=[["Trim","The parts inside the body that touch the flow: plug, seat ring, and often a cage."],
    ["Cv","A flow capacity number: gallons per minute of water that pass at 1 psi pressure drop. Bigger Cv, more flow."],
    ["Travel","How far the stem moves from closed to open."],["Stroke","To move the valve through its travel, for example by changing the air."],
    ["Bench set","The air pressure range at which the actuator spring starts and finishes moving the stem, with the actuator on a bench. It is on the nameplate."],
    ["Positioner","An instrument that makes the stem go where the signal says."],["I/P","Current-to-pressure transducer: 4-20 mA in, air pressure out."],
    ["psig","Pounds per square inch gauge: pressure above the atmosphere."],
    ["Fail position","Where the valve goes when the air signal is lost: open, closed, or last position."],
    ["Direct acting","For an actuator, more air pushes the stem down (the 657). For a body, push-down-to-close."],
    ["Reverse acting","For an actuator, more air lifts the stem (the 667). For a body, push-down-to-open."]];
  S("w-s1-3","Term chips: tap for a definition",chips("trC",TERMS.map(function(t){return t[0];}))+card("trO","Tap a term."));
  chipInfo("trC","trO",TERMS);

  /* ---------- S2: types ---------- */
  var TY=[["Globe (sliding stem)","Stem moves straight up and down; the plug moves toward or away from the seat.","Best throttling of the three.","Very good seat shutoff (depends on class).","Fine control of steam, feedwater, condensate. Fisher example: easy-e ES / EZ."],
          ["Butterfly / eccentric disk (rotary)","A disk turns on a shaft, about a quarter turn from closed to open.","Good for moderate throttling; high-performance eccentric-disk designs do better.","Good with a seated eccentric disk; depends on the design.","Large lines, low cost per size. Fisher examples: Control-Disk, 8580."],
          ["Ball / V-notch ball (rotary)","A ball with a V-shaped notch turns in the seat, about a quarter turn.","Characterized, smooth flow change as it turns.","Tight shutoff.","Slurries and fluids where tight shutoff and good control are both needed. Fisher example: Vee-Ball."]];
  S("w-s2","Valve type picker",chips("tyC",TY.map(function(t){return t[0].split(" (")[0];}))+'<div class="infocard" id="tyO" aria-live="polite">Tap a type.</div>');
  H.chipGroup($("tyC"),function(i){var t=TY[+i]; $("tyO").innerHTML="<b>"+t[0]+"</b><br><b>Motion:</b> "+t[1]+"<br><b>Throttling:</b> "+t[2]+"<br><b>Shutoff:</b> "+t[3]+"<br><b>Where:</b> "+t[4];});

  var CV=[["Linear",function(x){return x;},"Flow changes in step with travel."],
          ["Equal percentage",function(x){return Math.pow(50,x-1);},"Slow near closed, fast near open. Each equal step of travel changes flow by the same percent of the flow it already has."],
          ["Quick opening",function(x){return 1-Math.pow(1-x,2);},"Most of the flow arrives in the first part of travel. Often on-off service."]];
  S("w-s2-2","Flow characteristic explorer (idealized)",
    chips("cvC",CV.map(function(c){return c[0];}))+
    '<label class="lbl" for="cvT" style="margin-top:8px">Travel: <b id="cvTv">50</b>%</label><input type="range" id="cvT" min="0" max="100" value="50">'+
    '<div class="svgbox"><svg id="cvSvg" viewBox="0 0 300 170" role="img" aria-label="Flow versus travel curve"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Travel</span><span class="v" id="cvX">50%</span></div><div class="ro"><span class="k">Flow</span><span class="v" id="cvF">–</span></div></div>'+
    card("cvO","Pick a curve.")+'<p class="wnote">Idealized shapes at constant pressure drop. A real valve depends on its trim; check the manufacturer data.</p>');
  var cvI=1;
  function cvDraw(){var f=CV[cvI][1], x=+$("cvT").value/100, g='<rect x="30" y="10" width="250" height="130" fill="#0d0f12" stroke="#59616c"/>';
    [0.25,0.5,0.75].forEach(function(q){g+='<line x1="'+(30+250*q)+'" y1="10" x2="'+(30+250*q)+'" y2="140" stroke="#222a33"/><line x1="30" y1="'+(140-130*q)+'" x2="280" y2="'+(140-130*q)+'" stroke="#222a33"/>';});
    CV.forEach(function(c,k){var d=""; for(var i=0;i<=40;i++){var xx=i/40; d+=(i?"L":"M")+(30+250*xx).toFixed(1)+" "+(140-130*c[1](xx)).toFixed(1);}
      g+='<path d="'+d+'" fill="none" stroke="'+(k===cvI?"#2EC4B6":"#4a525d")+'" stroke-width="'+(k===cvI?3:1.5)+'"/>';});
    g+='<circle cx="'+(30+250*x)+'" cy="'+(140-130*f(x))+'" r="6" fill="#ffd23f" stroke="#fff"/>'+
       '<text x="155" y="162" fill="#9AA0A6" font-size="9" text-anchor="middle">travel →</text><text x="10" y="80" fill="#9AA0A6" font-size="9" text-anchor="middle" transform="rotate(-90 10 80)">flow →</text>';
    $("cvSvg").innerHTML=g; $("cvTv").textContent=Math.round(x*100); $("cvX").textContent=Math.round(x*100)+"%"; $("cvF").textContent=Math.round(f(x)*100)+"%";}
  H.chipGroup($("cvC"),function(i){cvI=+i; $("cvO").innerHTML="<b>"+CV[cvI][0]+":</b> "+CV[cvI][2]; cvDraw();});
  $("cvT").addEventListener("input",cvDraw); cvDraw(); $("cvC").querySelectorAll("button")[1].setAttribute("aria-pressed","true");

  /* ---------- S3: cutaway ---------- */
  var cut={act:"667",body:"pdtc",p:3}, L=22, playT=null;
  S("w-s3","Actuator cutaway: air in, stem moves",
    '<div class="cut"><div class="svgbox"><svg id="cutSvg" viewBox="0 0 300 312" role="img" aria-label="Cutaway of an actuator on a globe valve"></svg></div></div>'+
    '<p class="lbl" style="margin:10px 0 0">Actuator tubing:</p>'+seg("cutAct",[["657","657 (air on top)"],["667","667 (air underneath)"]])+
    '<p class="lbl" style="margin:10px 0 0">Valve body:</p>'+seg("cutBody",[["pdtc","Push-down-to-close"],["pdto","Push-down-to-open"]])+
    '<label class="lbl" for="cutP" style="margin-top:10px">Signal: <b id="cutPv">3</b> psi (3-15 psi range)</label><input type="range" id="cutP" min="0" max="18" step="0.5" value="3" aria-label="Signal pressure in psi">'+
    '<div class="row" style="margin-top:6px"><button type="button" id="cutPlay">▶ Play 3 to 15 psi</button><button type="button" class="secondary" id="cutLose">Lose the air (0 psi)</button></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Stem</span><span class="v" id="cutDir" style="font-size:1rem">–</span></div><div class="ro"><span class="k">Travel</span><span class="v" id="cutTr">–</span></div><div class="ro"><span class="k">Valve</span><span class="v" id="cutOpen" style="font-size:1rem">–</span></div></div>'+
    card("cutWhy","")+
    '<div class="callout field-note tubing"><b class="t">🔧 Check where the tubing goes</b><p style="margin:0">A 667 has one loading port, and it feeds the <b>underside</b> of the diaphragm. A 657 is fed on <b>top</b>. Read the nameplate, see which side the tubing goes to, know the body action, and check the controller or positioner action. At Tyson RVAF most 667-looking actuators are tubed to the bottom, but the LPCR outlet one is tubed to the top. Per Fisher&#39;s documents that is how a direct-acting 657-style actuator is fed, so which is it? Check the nameplate.</p></div>'+
    '<p class="wnote">Teaching drawing. The real bench set range, spring and travel are on the nameplate.</p>');
  function cutDraw(){
    var p=cut.p, t=clamp((p-3)/12,0,1), air657=cut.act==="657";
    var down=air657?t:1-t;                /* stem down fraction */
    var yd=68+L*down, open=cut.body==="pdtc"?1-down:down;
    var g='';
    /* casing */
    g+='<rect x="60" y="24" width="180" height="100" rx="14" fill="#18202b" stroke="#6b7a8c" stroke-width="2"/>';
    /* air chamber */
    var a=0.12+0.5*clamp(p/15,0,1);
    if(air657) g+='<rect x="62" y="26" width="176" height="'+(yd-26)+'" fill="#2EC4B6" fill-opacity="'+a+'"/>';
    else g+='<rect x="62" y="'+yd+'" width="176" height="'+(122-yd)+'" fill="#2EC4B6" fill-opacity="'+a+'"/>';
    /* spring */
    var y0,y1; if(air657){y0=yd+4;y1=118;}else{y0=30;y1=yd-4;}
    var sp='M150 '+y0, n=8; for(var i=1;i<=n;i++){sp+=' L'+(i%2?126:174)+' '+(y0+(y1-y0)*(i-0.5)/n).toFixed(1);} sp+=' L150 '+y1;
    g+='<path d="'+sp+'" fill="none" stroke="#b9c4d0" stroke-width="3" stroke-linejoin="round"/>';
    /* diaphragm and plate */
    g+='<line x1="62" y1="'+yd+'" x2="238" y2="'+yd+'" stroke="#e8c07d" stroke-width="3"/><rect x="106" y="'+(yd-4)+'" width="88" height="8" rx="2" fill="#8d97a3"/>';
    /* port and vent */
    var py=air657?42:110, vy=air657?110:42;
    g+='<path d="M14 '+py+' H60" stroke="#2EC4B6" stroke-width="5"/><path d="M50 '+(py-6)+' L60 '+py+' L50 '+(py+6)+'" fill="#2EC4B6"/>'+
       '<text x="12" y="'+(py-8)+'" fill="#2EC4B6" font-size="9" font-weight="700">'+fmt(p,1)+' psi in</text>'+
       '<path d="M240 '+vy+' H262" stroke="#7d8995" stroke-width="3" stroke-dasharray="3 2"/><text x="244" y="'+(vy-6)+'" fill="#9AA0A6" font-size="8">vent</text>';
    g+='<text x="150" y="'+(air657?20:140)+'" fill="#cfd8e3" font-size="9" text-anchor="middle">'+(air657?"upper casing (loaded)":"lower casing (loaded)")+'</text>';
    g+='<text x="150" y="'+(air657?140:20)+'" fill="#7d8995" font-size="8" text-anchor="middle">'+(air657?"lower casing (vented), spring":"upper casing (vented), spring")+'</text>';
    /* yoke */
    g+='<path d="M96 124 V196 M204 124 V196" stroke="#6b7a8c" stroke-width="5"/>';
    /* stem + plug */
    var seated=(cut.body==="pdtc"), plugTop=seated?236-L*(1-down):254+L*down;
    g+='<line id="cutStem" x1="150" y1="'+(yd+4)+'" x2="150" y2="'+plugTop+'" stroke="#e5e8eb" stroke-width="6"/>';
    g+='<rect x="136" y="'+(150+L*down)+'" width="28" height="14" rx="2" fill="#ff9a3c"/><text x="172" y="'+(161+L*down)+'" fill="#ff9a3c" font-size="8">stem connector</text>'+
       '<path d="M208 '+(157+L*down)+' l10 -5 v10 z" fill="#ffd23f"/><text x="220" y="'+(160+L*down)+'" fill="#ffd23f" font-size="8"></text>';
    /* body */
    g+='<rect x="124" y="196" width="52" height="14" fill="#2a3340" stroke="#6b7a8c"/>'+
       '<rect x="60" y="210" width="180" height="92" rx="8" fill="#1c2430" stroke="#9a7b5a" stroke-width="2"/>'+
       '<rect x="62" y="248" width="72" height="6" fill="#d2a679"/><rect x="166" y="248" width="72" height="6" fill="#d2a679"/>'+
       '<text x="66" y="282" fill="#9AA0A6" font-size="8">in</text><text x="224" y="226" fill="#9AA0A6" font-size="8">out</text>';
    var pl=seated?'<path d="M130 '+plugTop+' h40 l-4 12 h-32 z" fill="#ff5a5f" stroke="#fff" stroke-width="1"/>':'<path d="M134 '+plugTop+' h32 l4 12 h-40 z" fill="#ff5a5f" stroke="#fff" stroke-width="1"/>';
    if(!seated) pl='<path d="M130 '+(plugTop)+' h40 v12 h-40 z" fill="#ff5a5f" stroke="#fff" stroke-width="1"/>';
    g+=pl;
    if(open>0.03){ g+='<path d="M150 296 V262" stroke="#4ea8ff" stroke-width="'+(2+6*open)+'" opacity="'+(0.35+0.6*open)+'"/><path d="M150 262 V228 H232" stroke="#4ea8ff" stroke-width="'+(2+6*open)+'" fill="none" opacity="'+(0.35+0.6*open)+'"/>'; }
    g+='<text x="150" y="309" fill="#9AA0A6" font-size="8" text-anchor="middle">plug '+(open<0.03?"on the seat":"off the seat")+'</text>';
    var svg=$("cutSvg"); svg.innerHTML=g; svg.setAttribute("data-down",down.toFixed(3)); svg.setAttribute("data-open",open.toFixed(3));
    $("cutPv").textContent=fmt(p,1);
    var dirTxt=p<=0?"Resting (spring)":(t<=0&&!air657&&false?"":(air657?(t>0?"Moving DOWN":"Up (spring)"):(t>0?"Moving UP":"Down (spring)")));
    $("cutDir").textContent=dirTxt;
    $("cutTr").textContent=Math.round(t*100)+"%";
    $("cutOpen").textContent=Math.round(open*100)+"% open";
    var failStem=air657?"up":"down", failOpen=(failStem==="down")===(cut.body==="pdto");
    $("cutWhy").innerHTML=(air657?"<b>657-style:</b> air in the <b>upper</b> casing pushes the diaphragm and stem <b>down</b> against the spring. "
      :"<b>667-style:</b> air in the <b>lower</b> casing lifts the diaphragm and stem <b>up</b> against the spring. ")+
      (cut.body==="pdtc"?"On this push-down-to-close body, stem down seats the plug, so ":"On this push-down-to-open body, stem down opens the valve, so ")+
      "more air "+((air657===(cut.body==="pdto"))?"<b>opens</b>":"<b>closes</b>")+" it. On loss of air the spring drives the stem "+failStem+" and the valve <b>fails "+(failOpen?"open":"closed")+"</b>.";
    $("cutP").value=p;
  }
  H.chipGroup($("cutAct"),function(v){cut.act=v;cutDraw();}).pick("667");
  H.chipGroup($("cutBody"),function(v){cut.body=v;cutDraw();}).pick("pdtc");
  $("cutP").addEventListener("input",function(){cut.p=+$("cutP").value; cutDraw();});
  $("cutLose").addEventListener("click",function(){stopPlay(); cut.p=0; cutDraw();});
  function stopPlay(){if(playT){clearInterval(playT);playT=null;} $("cutPlay").textContent="▶ Play 3 to 15 psi";}
  $("cutPlay").addEventListener("click",function(){
    if(playT){stopPlay();return;}
    var dir=1, step=H.reduceMotion?6:0.5, ms=H.reduceMotion?700:90; cut.p=3; cutDraw(); $("cutPlay").textContent="⏸ Pause";
    playT=setInterval(function(){cut.p=clamp(cut.p+dir*step,3,15); if(cut.p>=15)dir=-1; if(cut.p<=3)dir=1; cutDraw();},ms);
  });
  cutDraw();

  /* S3-2: lose the air */
  var LT=[["Spring-and-diaphragm (667 on push-down-to-close)","The spring pushes the stem fully down: the valve <b>fails closed</b>.",0],
          ["Double-acting piston (no spring)","Air is what moves it each way. With no air and no spring it tends to stay <b>in its last position</b>, unless the design adds a volume tank or other fail-safe.",50],
          ["Piston with spring return","The spring drives the piston to its spring end, so the valve <b>fails to the spring position</b> (open or closed depending on how it is built).",0]];
  S("w-s3-2","What happens when the air is lost?",chips("laC",LT.map(function(t){return t[0];}))+
    '<div class="row" style="margin-top:8px"><button type="button" id="laBtn">Lose the air supply</button><button type="button" class="secondary" id="laRe">↺ Restore</button></div>'+
    '<div class="bar"><i id="laBar" style="width:50%;transition:width .6s"></i></div><p class="mini">Valve position (illustrative)</p>'+card("laO","Pick an actuator, then lose the air."));
  var laI=0; H.chipGroup($("laC"),function(i){laI=+i; $("laBar").style.width="50%"; $("laO").textContent="Air is on. Position about 50%.";});
  $("laBtn").addEventListener("click",function(){$("laBar").style.width=LT[laI][2]+"%"; $("laO").innerHTML=LT[laI][1];});
  $("laRe").addEventListener("click",function(){$("laBar").style.width="50%"; $("laO").textContent="Air restored. Position about 50%.";});

  /* S3-3: parts tour */
  var PA=[["Upper diaphragm casing","Top half of the housing. On a 667 it is vented and holds the spring."],["Lower diaphragm casing","Bottom half. On a 667 the signal air goes here, to the underside of the diaphragm."],
    ["Diaphragm","The flexible membrane air pressure pushes on."],["Diaphragm plate","Carries the diaphragm force to the stem and supports the diaphragm."],
    ["Actuator spring","Opposes the air and returns the stem when the air is lost."],["Spring seat","What the spring sits against."],["Spring adjustor","Sets the spring compression, and so the bench set."],
    ["Actuator stem","The rod from the diaphragm plate down toward the valve."],["Stem connector (split block)","Clamps the actuator stem to the valve stem."],["Yoke","The frame that holds the actuator on the valve body."],
    ["Travel indicator disk and scale","Shows where the stem is in its travel."]];
  S("w-s3-3","Inside the 667 actuator: parts tour",chips("paC",PA.map(function(p){return p[0];}))+card("paO","Tap a part."));
  chipInfo("paC","paO",PA);

  /* ---------- S4 ---------- */
  var s4=$("w-s4"); S("w-s4","More air: opens or closes?","");
  EW.chooser(s4,[
    {prompt:"Nameplate says 667. Tubing goes to the <b>bottom</b>. The body is <b>push-down-to-close</b>. What does more air do?",options:["Opens the valve","Closes the valve"],answer:0,why:"Air underneath lifts the stem. On a push-down-to-close body, stem up means the plug lifts off the seat, so more air opens it."},
    {prompt:"A 657-style actuator, tubing to the <b>top</b>, on a <b>push-down-to-close</b> body. More air?",options:["Opens the valve","Closes the valve"],answer:1,why:"Air on top pushes the stem down, and on this body down means closed."},
    {prompt:"A 667 on a <b>push-down-to-open</b> body. More air?",options:["Opens the valve","Closes the valve"],answer:1,why:"Air lifts the stem, and on a push-down-to-open body stem up closes the valve."},
    {prompt:"Top-tubed, 657-style, on a <b>push-down-to-open</b> body. More air?",options:["Opens the valve","Closes the valve"],answer:0,why:"Air pushes the stem down, and on this body down opens the valve."}],{label:"Round"});
  S("w-s4-2","Bench set and stem connector order (push-down-to-close)","");
  var BS=["Bench set the actuator before it is connected to the valve.","Apply about 5 psi over the upper bench set pressure.","Slowly reduce to the upper bench set pressure.","Adjust the spring adjustor until the stem first moves at that pressure.","Mark the stem at the lower bench set, then check the travel at the upper pressure against the nameplate.","With the plug on the seat and the lower bench set held, engage at least one stem diameter of thread and tighten the connector halves evenly.","Stroke with an air regulator (not the positioner) and align the travel scale.","For torque values and every detail, follow the Fisher manual for your actuator."];
  var BT=["Published values assume no packing friction, so do it off the valve.","Overshoot first, then come down, so you approach the bench set from the same side each time.","The pressure marked on the nameplate, not a number from memory.","Stem first moves at that pressure. For push-down-to-open, first movement is at the lower bench set instead.","The travel must match the nameplate.","Never rotate the plug while it is seated. For push-down-to-open, hold the upper bench set instead.","Stroking from a regulator keeps the positioner out of the test.","No torque numbers in this module on purpose."];
  EW.orderPuzzle($("w-s4-2"),BS,BT);

  /* ---------- S5 ---------- */
  S("w-s5","Positioner off vs. on: friction dead zone",
    seg("poM",[["off","Positioner OFF"],["on","Positioner ON"]])+
    '<label class="lbl" for="poS" style="margin-top:8px">Signal: <b id="poSv">0</b>%</label><input type="range" id="poS" min="0" max="100" value="0">'+
    '<p class="lbl" style="margin:6px 0 0">Signal</p><div class="bar"><i id="poBs" style="width:0"></i></div><p class="lbl" style="margin:6px 0 0">Stem position</p><div class="bar alt"><i id="poBp" style="width:0;transition:width .2s"></i></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Error</span><span class="v" id="poE">0%</span></div></div>'+card("poO","Drag the signal slowly up and down with the positioner off, then on.")+
    '<p class="wnote">Illustrative: packing friction makes the stem stick until the signal moves about 8 percent past it.</p>');
  var poMode="off", poPos=0;
  function poUpd(){var s=+$("poS").value;
    if(poMode==="on") poPos=s; else { if(Math.abs(s-poPos)>8) poPos=s>poPos?s-8:s+8; }
    $("poSv").textContent=s; $("poBs").style.width=s+"%"; $("poBp").style.width=poPos+"%"; $("poE").textContent=Math.round(Math.abs(s-poPos))+"%";
    $("poO").textContent=poMode==="on"?"Positioner on: it adds or vents air until the stem matches the signal, whatever the friction.":"Positioner off: the stem sticks and then jumps. The error is the dead zone.";}
  H.chipGroup($("poM"),function(v){poMode=v;poUpd();}).pick("off");
  $("poS").addEventListener("input",poUpd); poUpd();

  S("w-s5-2","Zero and span trainer",
    '<label class="lbl" for="zsZ">Zero error: <b id="zsZv">4</b>%</label><input type="range" id="zsZ" min="-10" max="10" value="4">'+
    '<label class="lbl" for="zsS">Span error: <b id="zsSv">-8</b>%</label><input type="range" id="zsS" min="-15" max="15" value="-8">'+
    '<div class="readouts" aria-live="polite"><div class="ro" id="zsR0"><span class="k">Stem at 0% signal</span><span class="v" id="zs0">–</span></div><div class="ro" id="zsR1"><span class="k">Stem at 100% signal</span><span class="v" id="zs100">–</span></div></div>'+
    '<div class="row" style="margin-top:8px"><button type="button" id="zsCal">Calibrate</button></div>'+card("zsO","")+'<p class="wnote">Zero shifts both ends together; span changes how far the top end goes.</p>');
  function zsUpd(){var z=+$("zsZ").value, sp=+$("zsS").value; $("zsZv").textContent=z; $("zsSv").textContent=sp;
    var a=z, b=z+100+sp; $("zs0").textContent=Math.round(a)+"%"; $("zs100").textContent=Math.round(b)+"%";
    EW.setBand($("zsR0"),Math.abs(a)<1?"band-g":"band-r"); EW.setBand($("zsR1"),Math.abs(b-100)<1?"band-g":"band-r");
    $("zsO").textContent=(Math.abs(a)<1&&Math.abs(b-100)<1)?"Calibrated: 0% signal gives 0%, 100% signal gives 100%.":"Fix zero first (it moves both ends), then span.";}
  $("zsZ").addEventListener("input",zsUpd); $("zsS").addEventListener("input",zsUpd);
  $("zsCal").addEventListener("click",function(){$("zsZ").value=0;$("zsS").value=0;zsUpd();}); zsUpd();

  /* ---------- S6 ---------- */
  var ip={rng:"3-15",act:"ato"};
  S("w-s6","4-20 mA in, psi out, travel",
    '<label class="lbl" for="ipI">Current: <b id="ipIv">12</b> mA</label><input type="range" id="ipI" min="4" max="20" step="0.5" value="12">'+
    '<p class="lbl" style="margin:8px 0 0">Output range:</p>'+seg("ipR",[["3-15","3-15 psi"],["6-30","6-30 psi"]])+
    '<p class="lbl" style="margin:8px 0 0">Valve:</p>'+seg("ipA",[["ato","Air-to-open"],["atc","Air-to-close"]])+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Signal</span><span class="v" id="ipP">–</span></div><div class="ro"><span class="k">Output</span><span class="v" id="ipO">–</span></div><div class="ro"><span class="k">Valve open</span><span class="v" id="ipV">–</span></div></div>');
  function ipUpd(){var i=+$("ipI").value, pct=(i-4)/16, lo=ip.rng==="3-15"?3:6, hi=ip.rng==="3-15"?15:30, psi=lo+pct*(hi-lo);
    $("ipIv").textContent=fmt(i,1); $("ipP").textContent=Math.round(pct*100)+"%"; $("ipO").textContent=fmt(psi,1)+" psi"; $("ipV").textContent=Math.round((ip.act==="ato"?pct:1-pct)*100)+"%";}
  $("ipI").addEventListener("input",ipUpd);
  H.chipGroup($("ipR"),function(v){ip.rng=v;ipUpd();}).pick("3-15"); H.chipGroup($("ipA"),function(v){ip.act=v;ipUpd();}).pick("ato");
  S("w-s6-2","I/P diagnosis","");
  EW.chooser($("w-s6-2"),[
    {prompt:"Reading <b>12 mA</b>, supply gauge <b>30 psi</b>, I/P output gauge <b>0 psi</b>, tubing intact. Most likely?",options:["Valve packing is tight","The I/P is bad or its nozzle is plugged","The actuator spring is broken"],answer:1,why:"Good current and good supply but no output points at the I/P itself, often a plugged nozzle from dirty air."},
    {prompt:"<b>12 mA</b>, supply gauge <b>0 psi</b>, output <b>0 psi</b>. What first?",options:["Replace the I/P","Find out why the air supply is gone","Recalibrate the positioner"],answer:1,why:"No supply means no output. Check the compressor, dryer, filter-regulator, and valves upstream first."},
    {prompt:"<b>12 mA</b>, supply <b>30 psi</b>, I/P output <b>9 psi</b>, but the stem has barely moved. Where next?",options:["The I/P: it is fine","Downstream: positioner, tubing, actuator, or valve body","The 4-20 mA wiring"],answer:1,why:"The I/P did its job, so look downstream: a leak, a stuck stem or packing, a slipped connector, or an actuator problem."},
    {prompt:"At <b>4 mA</b> the output reads <b>6 psi</b> on a 3-15 range. What is that?",options:["Normal","Zero is shifted: needs calibration","The supply is too high"],answer:1,why:"4 mA should give 3 psi. A bad zero shifts the whole range."}],{label:"Case"});

  /* ---------- S7 ---------- */
  S("w-s7","Good air or problem?","");
  EW.sorter($("w-s7"),["Good instrument air","Problem"],[
    {label:"Dew point well below the coldest day",bin:0,why:"Dry air does not condense or freeze in the lines."},
    {label:"Filter bowl bone dry",bin:0,why:"Nothing is getting past the dryer."},
    {label:"Oil mist from a worn compressor",bin:1,why:"Oil fouls diaphragms and plugs nozzles."},
    {label:"Water at the filter drain",bin:1,why:"Moisture corrodes and freezes. Find out why the dryer or drain is not working."},
    {label:"Rust flakes in the bowl",bin:1,why:"Dirt plugs the small ports in I/Ps and positioners."},
    {label:"Regulator at the nameplate pressure",bin:0,why:"The supply matches what the equipment calls for."}]);
  var SY=[["Slow or incomplete stroke","Low supply pressure or a leak. Check the supply gauge and listen for hissing."],["Valve stuck","Water or dirt in the positioner or I/P, or friction at the packing. Check the air quality first."],
    ["Water in the bowl","The dryer or drain is not working. Drain it and report it."],["Hissing","A leak at a fitting, a split tube, or a bad diaphragm. Find it by sound or soapy water."],["Frozen regulator","Moisture in the air iced up on a cold day. Trace the wet air back to the dryer."]];
  S("w-s7-2","Symptom explorer",chips("syC",SY.map(function(s){return s[0];}))+card("syO","Tap a symptom."));
  chipInfo("syC","syO",SY);

  /* ---------- S8 ---------- */
  S("w-s8","Fail-position calculator",
    EW.sel("flA","Actuator",[["657","657 (air on top, direct-acting)"],["667","667 (air underneath, reverse-acting)"],["piston","Double-acting piston (no spring)"]])+
    EW.sel("flB","Valve body",[["pdtc","Push-down-to-close"],["pdto","Push-down-to-open"]])+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">More air</span><span class="v" id="flM" style="font-size:1rem">–</span></div><div class="ro"><span class="k">Air-to</span><span class="v" id="flT" style="font-size:1rem">–</span></div><div class="ro" id="flR"><span class="k">On loss of air</span><span class="v" id="flF" style="font-size:1rem">–</span></div></div>'+card("flO",""));
  function flUpd(){var a=$("flA").value, b=$("flB").value;
    if(a==="piston"){$("flM").textContent="Depends on which side gets air"; $("flT").textContent="n/a"; $("flF").textContent="Last position"; EW.setBand($("flR"),"band-y");
      $("flO").textContent="A double-acting piston has no spring. Air moves it each way, so on loss of air it tends to stay where it was unless the design adds a fail-safe.";return;}
    var airDown=a==="657", opens=airDown===(b==="pdto"), failDown=a==="667", failOpen=failDown===(b==="pdto");
    $("flM").textContent=opens?"Opens":"Closes"; $("flT").textContent=opens?"Air-to-open":"Air-to-close"; $("flF").textContent=failOpen?"Fails open":"Fails closed"; EW.setBand($("flR"),failOpen?"band-g":"band-r");
    $("flO").innerHTML="Air pushes the stem <b>"+(airDown?"down":"up")+"</b>; the spring drives it <b>"+(failDown?"down":"up")+"</b> when air is lost. On a "+(b==="pdtc"?"push-down-to-close":"push-down-to-open")+" body, stem "+(failDown?"down":"up")+" is "+(failOpen?"open":"closed")+".";}
  $("flA").addEventListener("change",flUpd); $("flB").addEventListener("change",flUpd); flUpd();
  S("w-s8-2","Pick the fail position","");
  EW.chooser($("w-s8-2"),[
    {prompt:"Fuel gas valve to a burner. If the air is lost, it should…",options:["Fail open","Fail closed","It depends on the design"],answer:1,why:"No air should never mean more fuel. A fuel valve fails closed."},
    {prompt:"Cooling water to equipment that can overheat. If the air is lost…",options:["Fail open","Fail closed","It depends on the design"],answer:0,why:"Keeping the cooling water flowing is the safer failure."},
    {prompt:"Steam to a process heat exchanger. If control is lost…",options:["Fail open","Fail closed","It depends on the design"],answer:1,why:"Usually fail closed so a lost signal does not overheat the process. Check the actual process."},
    {prompt:"Boiler feedwater valve. Which fail position?",options:["Fail open","Fail closed","It depends on the design"],answer:2,why:"It depends on the boiler and the system design (for example other feed protection). That is an engineering and site decision, not a rule of thumb."}],{label:"Service"});

  /* ---------- S9 ---------- */
  var lp="out";
  S("w-s9","Level loop: water out or water in?",
    seg("lpM",[["out","Receiver outlet valve (water out)"],["in","Boiler feed valve (water in)"]])+
    '<label class="lbl" for="lpL" style="margin-top:8px">Level: <b id="lpLv">50</b>%</label><input type="range" id="lpL" min="0" max="100" value="50">'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Controller signal</span><span class="v" id="lpS">–</span></div><div class="ro"><span class="k">Valve open</span><span class="v" id="lpV">–</span></div></div>'+
    '<div class="bar"><i id="lpB" style="width:50%;transition:width .2s"></i></div>'+card("lpO","")+
    '<p class="wnote">Teaching numbers, not site settings. Controller action is field-reversible, so always check the real action.</p>');
  function lpUpd(){var l=+$("lpL").value/100, sig=3+12*l; $("lpLv").textContent=Math.round(l*100);
    var open=lp==="out"?l:1-l; $("lpS").textContent=fmt(sig,1)+" psi"; $("lpV").textContent=Math.round(open*100)+"%"; $("lpB").style.width=Math.round(open*100)+"%";
    $("lpO").innerHTML=lp==="out"?"Level up → signal up → the <b>air-to-open</b> outlet valve opens → more water leaves, so the level comes back down.":"Level up → signal up → the <b>air-to-close</b> feed valve closes → less water enters, so the level stops rising.";}
  H.chipGroup($("lpM"),function(v){lp=v;lpUpd();}).pick("out"); $("lpL").addEventListener("input",lpUpd);
  var AP=[["Boiler feedwater level","A level controller strokes the feed valve to put water in as fast as it leaves as steam. Check the level, the controller signal, and the feed valve position."],
    ["Condensate receiver level","The same idea on a condensate tank. The valve may control water going out, so level up means open more."],
    ["Steam pressure reducing","Some PRVs are self-operated or pilot-operated and use no air; others are pneumatic control valves. Find out which before you look for tubing."],
    ["Back-pressure","Holds pressure upstream of the valve. Higher upstream pressure opens it."],
    ["Deaerator level and pressure","Water in and steam in are both controlled to keep the DA working. Read the gauges and trace each valve's controller."],
    ["Heat exchanger temperature","A valve on the steam or water line responds to a temperature signal. Compare the temperature, the signal, and the stem."]];
  S("w-s9-2","Application explorer",chips("apC",AP.map(function(a){return a[0];}))+card("apO","Tap an application."));
  chipInfo("apC","apO",AP);
  S("w-s9-3","Walkdown order","");
  EW.orderPuzzle($("w-s9-3"),["Read the supply gauge.","Read the signal gauge.","Trace the tubing.","Listen for hissing leaks.","Watch the stem and travel indicator.","Compare the stem position to the process."],
    ["Right pressure? Dry and clean?","Does it make sense for the level, pressure, or temperature?","Which side of the diaphragm? Any kinks or loose fittings?","Fittings, tubes, the actuator casing.","Does it move when the signal moves?","Does the valve position make sense for what the process is doing?"]);

  /* ---------- Action ---------- */
  S("w-action","Pneumatic valve log",
    EW.txt("lgV","Valve / service","e.g. receiver outlet")+
    '<div class="grid2">'+EW.sel("lgB","Body type",[["","?"],["globe","Globe"],["butterfly","Butterfly / eccentric disk"],["ball","Ball / V-notch ball"]])+
    EW.sel("lgA","Actuator type",[["","?"],["657","657-style (air on top)"],["667","667-style (air underneath)"],["piston","Piston"],["other","Other / not sure"]])+'</div>'+
    EW.txt("lgN","Actuator model on the nameplate","as written")+EW.txt("lgP","Positioner / I/P model","as written")+
    '<div class="grid2">'+EW.fld("lgS","Supply psi","")+EW.fld("lgG","Signal psi","")+'</div>'+
    '<div class="grid2">'+EW.sel("lgT","Tubing goes to",[["","not checked"],["top","Top of diaphragm"],["bottom","Bottom of diaphragm"]])+
    EW.sel("lgY","Body action",[["","?"],["pdtc","Push-down-to-close"],["pdto","Push-down-to-open"]])+'</div>'+
    EW.sel("lgF","Fail position (from nameplate and action)",[["","?"],["open","Fail open"],["closed","Fail closed"],["last","Fail last"]])+
    '<p class="hint" id="lgH" aria-live="polite"></p>'+EW.area("lgNt","Notes","")+EW.chk("lgZ","Zach checked this"));
  EW.keep(["lgV","lgB","lgA","lgN","lgP","lgS","lgG","lgT","lgY","lgF","lgNt","lgZ"],function(){
    var a=$("lgA").value,b=$("lgY").value,t=$("lgT").value,f=$("lgF").value,h="";
    if(a==="657"||a==="667"){
      if((a==="667"&&t==="top")||(a==="657"&&t==="bottom")) h="The tubing side does not match the actuator you picked. Re-check the nameplate. ";
      if(b){var failDown=a==="667", fo=failDown===(b==="pdto"), exp=fo?"open":"closed";
        h+="From the actuator and body, expect fail "+exp+(f&&f!==exp?". You entered "+f+": check it against the nameplate.":".");}
      else h+="Pick the body action to see the expected fail position.";
    } else if(a==="piston") h="A double-acting piston has no spring, so check for a fail-safe design before you say fail last.";
    else h="Pick the actuator type to get a hint.";
    $("lgH").textContent=h;});

  /* ---------- S10: inside a level controller (2500 style) ---------- */
  var LC={r:0,tr:0,level:0,prevOut:3,flipT:null,playT:null,flipping:false};
  S("w-s10","Inside a 2500-style level controller",
    '<div class="svgbox"><svg id="lcSvg" viewBox="0 0 300 320" role="img" aria-label="Cutaway of a level controller: displacer, torque tube shaft, flapper and nozzle, relay, output gauge"></svg></div>'+
    '<p class="lbl" style="margin:10px 0 0">Action (flip the flapper base to change it):</p>'+
    '<div class="row"><button type="button" id="lcFlip">↻ Flip flapper base</button></div>'+
    '<div class="infocard" id="lcMode" style="min-height:0"></div>'+
    '<label class="lbl" for="lcLvl" style="margin-top:10px">Level: <b id="lcLvlv">0</b>% across the proportional band</label><input type="range" id="lcLvl" min="0" max="100" value="0" aria-label="Level">'+
    '<div class="row"><button type="button" class="secondary" id="lcLow">Low</button><button type="button" class="secondary" id="lcMid">Rising (50%)</button><button type="button" class="secondary" id="lcHigh">High</button><button type="button" id="lcPlay">▶ Play</button></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Supply</span><span class="v">20 psig</span></div><div class="ro"><span class="k">Nozzle pressure (illustrative)</span><span class="v" id="lcNp" style="font-size:1rem">–</span></div><div class="ro"><span class="k">Output</span><span class="v" id="lcOut">–</span></div></div>'+
    '<div class="infocard" id="lcCap" aria-live="polite"></div>'+
    '<div class="infocard" style="border-left-color:#ffd23f"><b>Direct vs reverse.</b> On a 2500 you don&#39;t need a different controller to reverse action; flip the flapper base over (manual section 7.6). Re-check calibration after changing action. The manual&#39;s procedure also repositions the Bourdon tube, which carries the nozzle (its Figure 15), and it does not describe flipping the flapper base on its own, so follow all of 7.6 for your unit. The animation simplifies this: the flapper base inverts and the nozzle side changes with it.</div>'+
    '<p class="wnote">Teaching drawing of a Fisher 2500 with a 249 displacer sensor. RVAF nameplates are unconfirmed. The nozzle pressure scale is illustrative: the manual does not give one.</p>');
  function lcState(){var rv=LC.tr===1; return rv;}
  function lcDraw(){
    var t=LC.level/100, r=LC.r, rv=r>0.5, np=rv?1-t:t, out=3+12*np, gapC=1;
    var restY=76+14*r, tipY=58+36*r, dir=1-2*r, flY=restY-14*t, gap=Math.abs(tipY-flY);
    var inlet=clamp((np-0.5)*2,0,1), exh=clamp((0.5-np)*2,0,1), falling=out<LC.prevOut-0.04, dy=196+8*(2*np-1);
    var g='';
    /* vessel and displacer */
    g+='<rect x="6" y="20" width="46" height="170" rx="6" fill="#10242e" stroke="#5ab4ff" stroke-width="2"/>';
    var ly=170-120*(0.15+0.7*t); g+='<rect x="8" y="'+ly+'" width="42" height="'+(188-ly)+'" fill="rgba(90,180,255,.35)"/><line x1="8" y1="'+ly+'" x2="50" y2="'+ly+'" stroke="#7fd6ff" stroke-width="1.5"/>';
    g+='<rect x="20" y="52" width="18" height="96" rx="4" fill="#9aa5b1" stroke="#fff" stroke-width="1"/><line x1="29" y1="30" x2="29" y2="52" stroke="#cfd8e3" stroke-width="2"/>';
    g+='<text x="29" y="200" fill="#9AA0A6" font-size="7" text-anchor="middle">displacer</text><text x="29" y="210" fill="#9AA0A6" font-size="7" text-anchor="middle">in the level</text>';
    /* case */
    g+='<rect x="66" y="6" width="230" height="308" rx="10" fill="#141b24" stroke="#59616c" stroke-width="2"/>';
    /* shaft and flapper */
    g+='<path d="M38 104 H92 V'+(restY+9)+'" stroke="#cfd8e3" stroke-width="5" fill="none"/>';
    var rot=(t*28)-14; g+='<circle cx="92" cy="'+(restY-0)+'" r="9" fill="#2a3340" stroke="#cfd8e3" stroke-width="2"/><path d="M86 '+restY+' h12" stroke="#ffd23f" stroke-width="2" transform="rotate('+rot.toFixed(0)+' 92 '+restY+')"/>';
    g+='<text x="72" y="24" fill="#9AA0A6" font-size="6.5">torque tube shaft</text><line x1="92" y1="27" x2="92" y2="'+(restY-9)+'" stroke="#9AA0A6" stroke-width=".7" stroke-dasharray="2 2"/>';
    g+='<path d="M92 '+restY+' L164 '+flY.toFixed(1)+'" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>';
    g+='<text x="128" y="'+(r>0.5?Math.min(restY,flY)-8:Math.max(restY,flY)+14).toFixed(0)+'" fill="#ffd23f" font-size="7" text-anchor="middle">flapper'+(r>0.5?" (base flipped)":"")+'</text>';
    /* nozzle */
    var bodyEnd=tipY-16*dir; g+='<path d="M160 '+tipY+' L168 '+tipY+' L166 '+bodyEnd+' L162 '+bodyEnd+' Z" fill="#2EC4B6" stroke="#fff" stroke-width="1"/><text x="'+(r>0.5?138:138)+'" y="'+(bodyEnd+(dir>0?-3:9))+'" fill="#2EC4B6" font-size="7" text-anchor="middle">nozzle</text>';
    var nb=Math.round(1+4*(gap/18)); for(var k=0;k<nb;k++){g+='<path d="M'+(163+k*1.2)+' '+(tipY+(flY-tipY)*0.5)+' l'+(10+k*2)+' '+(-6*dir*(k%2?1:-1)*0.5)+'" stroke="#cfd8e3" stroke-width="1" opacity=".7"/>';}
    g+='<text x="206" y="80" fill="#cfd8e3" font-size="6.5">bleed</text>';
    /* supply, restriction, nozzle pressure line */
    g+='<path d="M284 16 V262" stroke="#ffb020" stroke-width="3" fill="none"/><text x="280" y="12" fill="#ffb020" font-size="7" text-anchor="end">SUPPLY 20 psig</text>';
    g+='<path d="M284 40 H258 l-4 -5 l-8 10 l-8 -10 l-4 5 H200" stroke="#ffb020" stroke-width="2" fill="none"/><text x="236" y="30" fill="#ffb020" font-size="6.5" text-anchor="middle">fixed restriction</text>';
    g+='<path d="M200 40 V178 H214" stroke="#2EC4B6" stroke-width="2.5" fill="none"/><path d="M200 '+(tipY-8*dir).toFixed(0)+' H166" stroke="#2EC4B6" stroke-width="2" fill="none"/>';
    g+='<text x="205" y="132" fill="#2EC4B6" font-size="6.5">nozzle pressure</text>';
    /* relay */
    g+='<rect x="214" y="164" width="68" height="110" rx="6" fill="#18222e" stroke="#9aa5b1" stroke-width="1.5"/><text x="248" y="160" fill="#cfd8e3" font-size="7.5" text-anchor="middle">relay</text>';
    g+='<line x1="218" y1="'+dy.toFixed(1)+'" x2="278" y2="'+dy.toFixed(1)+'" stroke="#e8c07d" stroke-width="4"/><text x="220" y="'+(dy-5).toFixed(0)+'" fill="#e8c07d" font-size="6">large diaphragm</text>';
    g+='<line x1="236" y1="'+(dy+44).toFixed(1)+'" x2="260" y2="'+(dy+44).toFixed(1)+'" stroke="#e8c07d" stroke-width="3"/><text x="248" y="'+(dy+56).toFixed(0)+'" fill="#e8c07d" font-size="6" text-anchor="middle">small (1:3)</text><line x1="248" y1="'+dy.toFixed(1)+'" x2="248" y2="'+(dy+44).toFixed(1)+'" stroke="#cfd8e3" stroke-width="2"/>';
    g+='<rect x="268" y="236" width="14" height="12" fill="#ffb020" fill-opacity="'+(0.18+0.82*inlet).toFixed(2)+'" stroke="#ffb020"/><text x="280" y="266" fill="#ffb020" font-size="6.5" text-anchor="end">INLET '+Math.round(inlet*100)+'%</text>';
    g+='<rect x="216" y="204" width="14" height="12" fill="#9aa5b1" fill-opacity="'+(0.18+0.82*exh).toFixed(2)+'" stroke="#9aa5b1"/><text x="232" y="214" fill="#cfd8e3" font-size="6.5">EXHAUST '+Math.round(exh*100)+'%</text>';
    if(exh>0.15&&falling){for(var q=0;q<4;q++){g+='<circle cx="'+(208-q*7)+'" cy="'+(204-q*4)+'" r="'+(2+q*0.8)+'" fill="#9aa5b1" opacity="'+(0.7-q*0.15)+'"/>';} g+='<text x="190" y="190" fill="#9aa5b1" font-size="6.5" text-anchor="end">hiss: the &quot;vent&quot;</text>';}
    /* gauges */
    function gauge(cx,cy,rad,frac,col,lab,sub){var a=-135+270*clamp(frac,0,1), x2=cx+(rad-6)*Math.sin(a*Math.PI/180), y2=cy-(rad-6)*Math.cos(a*Math.PI/180);
      return '<circle cx="'+cx+'" cy="'+cy+'" r="'+rad+'" fill="#0d0f12" stroke="#59616c" stroke-width="2"/><line x1="'+cx+'" y1="'+cy+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="2.5"/><circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="#fff"/><text x="'+cx+'" y="'+(cy+rad+9)+'" fill="'+col+'" font-size="7" text-anchor="middle">'+lab+'</text>'+(sub?'<text x="'+cx+'" y="'+(cy+rad+17)+'" fill="#9AA0A6" font-size="6" text-anchor="middle">'+sub+'</text>':'');}
    g+=gauge(112,262,30,out/20,"#3ecf6a","OUTPUT "+fmt(out,1)+" psig","3-15 psig range");
    g+=gauge(112,178,20,np,"#2EC4B6","NOZZLE PRESSURE","illustrative");
    $("lcSvg").innerHTML=g;
    LC.prevOut=out;
    $("lcLvlv").textContent=Math.round(LC.level);
    $("lcNp").textContent=(rv?"falls as level rises":"rises as level rises")+" · "+Math.round(np*100)+"%";
    $("lcOut").textContent=fmt(out,1)+" psig";
    var zone=t<0.15?"LOW":t>0.85?"HIGH":"RISING";
    var cap;
    if(LC.flipping) cap="Flipping the flapper base over (manual 7.6): the flapper assembly inverts and the nozzle side changes with it. Re-check calibration afterwards.";
    else if(!rv) cap=zone==="LOW"?"Low level: air escapes freely at the nozzle, nozzle pressure is low, the relay exhausts, output is 3 psig."
        :zone==="HIGH"?"High level: the nozzle is choked, nozzle pressure is high, the relay passes supply, output is 15 psig."
        :"Rising level: the gap closes, back-pressure builds, the relay inlet opens and its exhaust closes, so output climbs.";
    else cap=zone==="LOW"?"Low level, reverse: the flapper is close to the nozzle, nozzle pressure is high, the relay passes supply, output is 15 psig."
        :zone==="HIGH"?"High level, reverse: the flapper is far from the nozzle, nozzle pressure is low, the relay exhausts the output, down to 3 psig."
        :"Rising level, reverse: the gap opens, nozzle pressure falls, the relay inlet closes and its exhaust opens (the output vents), so output falls.";
    $("lcCap").innerHTML="<b>"+(rv?"Reverse (flipped)":"Direct (flapper base one way)")+" · "+zone+":</b> "+cap;
    $("lcMode").innerHTML="<b>"+(LC.tr===1?"Reverse (flipped)":"Direct (flapper base one way)")+"</b>"+(LC.tr===1?" · flapper moves AWAY from the nozzle on rising level":" · flapper moves TOWARD the nozzle on rising level");
    var svg=$("lcSvg"); svg.setAttribute("data-r",r.toFixed(2)); svg.setAttribute("data-gap",gap.toFixed(1)); svg.setAttribute("data-out",out.toFixed(2));
  }
  $("lcLvl").addEventListener("input",function(){LC.level=+$("lcLvl").value;lcDraw();});
  function lcSet(v){LC.level=v;$("lcLvl").value=v;lcDraw();}
  $("lcLow").addEventListener("click",function(){lcSet(0);}); $("lcMid").addEventListener("click",function(){lcSet(50);}); $("lcHigh").addEventListener("click",function(){lcSet(100);});
  $("lcFlip").addEventListener("click",function(){
    LC.tr=LC.tr?0:1; if(LC.flipT){clearInterval(LC.flipT);LC.flipT=null;}
    if(H.reduceMotion){LC.r=LC.tr;LC.flipping=false;lcDraw();return;}
    LC.flipping=true; LC.flipT=setInterval(function(){LC.r+=(LC.tr-LC.r>0?1:-1)*0.1; if((LC.tr&&LC.r>=1)||(!LC.tr&&LC.r<=0)){LC.r=LC.tr;LC.flipping=false;clearInterval(LC.flipT);LC.flipT=null;} lcDraw();},40);});
  $("lcPlay").addEventListener("click",function(){
    if(LC.playT){clearInterval(LC.playT);LC.playT=null;$("lcPlay").textContent="▶ Play";return;}
    var d=1; $("lcPlay").textContent="⏸ Pause"; LC.playT=setInterval(function(){var v=clamp(LC.level+d*(H.reduceMotion?50:2),0,100); if(v>=100)d=-1; if(v<=0)d=1; lcSet(v);},H.reduceMotion?800:60);});
  lcDraw();

  var ZS=[["Float","The displacer. A Fisher 2500 doesn't use a float: a weighted cylinder hangs in the liquid on a displacer rod and its buoyant force changes with level."],
          ["Wiper","Most likely the flapper, the part that moves across the nozzle. This is inferred: the Fisher documents don't use the word wiper. Confirm with Zach."],
          ["Vent","The relay exhaust, where air escapes when the output drops (the controller case also has a vent at the bottom). Which one Zach means is unconfirmed."]];
  var LT2=[["Displacer","A weighted cylinder hung in the level on a displacer rod. Its buoyancy changes with level."],["Torque tube","Twists as buoyancy changes and turns the rotary shaft in the controller."],
    ["Flapper","Rides on the torque tube shaft. Its distance from the nozzle is the level signal."],["Nozzle","Air escapes between the nozzle and the flapper. On a 2500 it is mounted on the Bourdon tube."],
    ["Nozzle pressure","The back-pressure ahead of the nozzle, after the fixed restriction. It goes to the relay's large diaphragm."],["Relay","A pressure-balanced relay with a large and a small diaphragm (3 to 1 area ratio) and a valve with an inlet end and an exhaust end."],
    ["Exhaust","The relay's exhaust end. It opens to let the output pressure out."],["Vent","See the Zach says card: most likely the relay exhaust."],
    ["Bleed","Air bleeds in through the fixed restriction and escapes between the nozzle and the flapper. In steady state the bleed in equals the bleed out."],
    ["Direct / reverse","Direct: rising level raises the output. Reverse: rising level lowers the output. Reverse units carry the letter R in the type number."],
    ["Proportional band","Sets how much level change gives a full output change. The 2500's PROPORTIONAL BAND dial reads 0 to 10."]];
  S("w-s10-2","Zach says … and the Fisher word",
    chips("zsC",ZS.map(function(z){return z[0];}))+card("zsO","Tap one of Zach's words.")+
    '<p class="lbl" style="margin:12px 0 4px"><b>Term chips</b></p>'+chips("ltC",LT2.map(function(z){return z[0];}))+card("ltO","Tap a term."));
  chipInfo("zsC","zsO",ZS); chipInfo("ltC","ltO",LT2);
  var TIE=[["Boiler feedwater","Result needed: <b>level up, feed down</b>. Either a <b>reverse-acting controller with an air-to-open valve</b> (rising level, output down, valve closes) or a <b>direct-acting controller with an air-to-close valve</b> (rising level, output up, valve closes). Which one RVAF uses is unconfirmed: check the nameplate (an R in the type number means reverse) and the valve action."],
           ["LPCR outlet","Result needed: <b>level up, outlet opens</b>. Either a <b>direct-acting controller with an air-to-open valve</b> or a <b>reverse-acting controller with an air-to-close valve</b>. Which one RVAF uses is unconfirmed. Zach has seen the LPCR outlet actuator tubed to the top, so read its nameplate too."]];
  S("w-s10-3","What the controller has to deliver",chips("tiC",TIE.map(function(z){return z[0];}))+card("tiO","Tap a valve. What matters is the result: the controller action and the valve action are chosen together.")+'<p class="wnote">RVAF nameplates and valve actions are unconfirmed.</p>');
  chipInfo("tiC","tiO",TIE);

  /* ---------- S11: calibrate a level controller (12 steps) ---------- */
  var X={step:1,rev:false,flipped:false,supply:17,loosened:false,pb:5,ts:-0.1,R:2,fl:2.4,L:40,mode:"wet",loops:0,tested:{},pred:"",upset:false,cycles:false,done:false,fb:"",ok:false,skip:false,span:false};
  function exEff(){return X.rev!==X.flipped;}
  function exRid(){return X.rev?1.35:4.15;}
  function exL0(){return 40+X.fl+(X.R-exRid())+3*(X.ts+0.1)+0.5*(X.pb-1);}
  function exBand(){return Math.max(1,X.pb*10/(1+X.ts));}
  function exOutAt(L){var d=12*(L-exL0())/exBand(), o=exEff()?15-d:3+d; return clamp(o,0,20);}
  function exOut(){return exOutAt(X.L);}
  S("w-s11","Calibrate a level controller: 12 steps (teaching model)",
    '<div class="seg" id="exScen" role="group"><button data-v="d">Practice: direct (no R)</button><button data-v="r">Practice: reverse (R suffix)</button></div>'+
    '<div class="svgbox" style="margin-top:8px"><svg id="exSvg" viewBox="0 0 300 190" role="img" aria-label="Vessel with displacer and level window, SUPPLY gauge and OUTPUT gauge"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">RAISE LEVEL dial</span><span class="v" id="exRd">–</span></div><div class="ro"><span class="k">PROPORTIONAL BAND dial</span><span class="v" id="exPd">–</span></div><div class="ro"><span class="k">Action</span><span class="v" id="exAc" style="font-size:1rem">–</span></div></div>'+
    '<label class="lbl" for="exL" style="margin-top:8px">Vessel level: <b id="exLv">40</b>% of the displacer length</label><input type="range" id="exL" min="0" max="100" step="0.5" value="40">'+
    '<div class="row"><button type="button" class="secondary" id="exMin">Window min (40%)</button><button type="button" class="secondary" id="exMid">Window mid (45%)</button><button type="button" class="secondary" id="exMax">Window max (50%)</button></div>'+
    '<div class="infocard" id="exPanel"></div>'+
    '<p class="wnote">Teaching model: 3 and 15 psig are the documented end points; other output values and the RAISE LEVEL ranges between Table 5\'s printed rows are approximate examples. The span window is an example 40% to 50% of the displacer.</p>');
  var EXS=[
   ["Read the nameplate","Find the type, the action, and the output range. (Example nameplate; reverse-acting units carry the suffix R in the type number.)",
    function(){return '<p class="mini">Nameplate (EXAMPLE): Fisher '+(X.rev?"2500R":"2500")+' · 249 sensor · 3-15 psig</p>'+EW.sel("exT","Type",[["","?"],["2500","2500"],["2502","2502"],["2500S","2500S"]])+EW.sel("exA","Action",[["","?"],["direct","Direct"],["reverse","Reverse (R)"]])+EW.sel("exR","Output range",[["","?"],["3-15","3-15 psig"],["6-30","6-30 psig"]]);},
    function(){var t=$("exT").value,a=$("exA").value,r=$("exR").value; if(!t||!a||!r)return [false,"Pick all three."]; if(t!=="2500")return [false,"The nameplate here says 2500. A 2502 has reset; a 2500S snaps."]; if(a!==(X.rev?"reverse":"direct"))return [false,"Check the type number: reverse-acting units carry the suffix R (manual 3.4)."]; if(r!=="3-15")return [false,"The nameplate says 3-15 psig."]; return [true,"Right: a 2500, "+(X.rev?"reverse":"direct")+", 3-15 psig."];}],
   ["Set the supply pressure","The SUPPLY gauge must read 20 psig for a 3-15 psig output (35 psig for 6-30). Loosen the locknut on the 67CFR filter-regulator, turn the adjusting screw (clockwise increases), then retighten the locknut.",
    function(){return '<div class="row"><button type="button" id="exLoose">'+(X.loosened?"Retighten locknut":"Loosen locknut")+'</button><button type="button" class="secondary" id="exSm">↺ Screw counter-clockwise (−0.5)</button><button type="button" class="secondary" id="exSp">↻ Screw clockwise (+0.5)</button></div><p class="mini">SUPPLY: <b id="exSv">'+fmt(X.supply,1)+'</b> psig · locknut '+(X.loosened?"LOOSE":"tight")+'</p>';},
    function(){if(X.loosened)return [false,"Retighten the locknut when you are done."]; if(Math.abs(X.supply-20)>0.5)return [false,"SUPPLY reads "+fmt(X.supply,1)+" psig; it needs 20 (±0.5) for a 3-15 psig output."]; return [true,"Supply is 20 psig and the locknut is tight."];}],
   ["Make it open-loop","Calibrate open-loop so the valve doesn't move and you can read the pressure: either no flow through the final control element, or disconnect the output line and plug the output connection with a test pressure gauge.",
    function(){return '<div class="seg" id="exOL"><button data-v="a">Block the valve so there is no flow</button><button data-v="b">Disconnect the output line, plug it with a test gauge</button><button data-v="c">Leave the valve in the loop</button></div>';},
    function(){var v=X.ol; if(!v)return [false,"Pick one."]; if(v==="c")return [false,"With the valve in the loop, the process moves while you calibrate."]; return [true,"Open-loop. The output gauge now shows what the controller sends."];}],
   ["Simulate a known level","Pick how you'll hold a known level. Wet: use water, compensating for specific gravity (process SG 0.7, water SG 1.0: to simulate 50% of the span, what water level in %?). Dry: hang a weight, Ws = Wd − 0.0361 × V × SG, with V the submerged volume in cubic inches (EXAMPLE: 3-inch diameter displacer, 7 inches submerged, SG 0.7, Wd = 5.0 lb).",
    function(){return '<div class="seg" id="exMd"><button data-v="wet">Wet (water)</button><button data-v="dry">Dry (weight)</button></div><div id="exMdBody"></div>';},
    function(){if(X.mode==="wet"){var v=parseFloat($("exW")&&$("exW").value); if(!isFinite(v))return [false,"Enter the water level in %."]; if(Math.abs(v-35)>1)return [false,"Scale by the SG ratio: 0.7 ÷ 1.0 × 50% = 35%."]; return [true,"35%: 0.7 ÷ 1.0 × 50%."];}
      var w=parseFloat($("exW")&&$("exW").value); if(!isFinite(w))return [false,"Enter the weight in lb."]; var V=Math.PI/4*9*7, ws=5-0.0361*V*0.7; if(Math.abs(w-ws)>0.1)return [false,"V = π/4 × 3² × 7 = "+fmt(V,1)+" in³, so Ws = 5.0 − 0.0361 × "+fmt(V,1)+" × 0.7 = "+fmt(ws,2)+" lb."]; return [true,"Ws ≈ "+fmt(ws,2)+" lb. (It must never be less than 0.5 lb.)"];}],
   ["Span: set PROPORTIONAL BAND to 1","Span, in plain terms: how far the level must move for the full 3-15 psig swing. Narrow span: a small level change gives the full swing. Wide span: the level must move a lot. West Mechanical standard: always sets it at one. Set the PROPORTIONAL BAND dial to 1.",
    function(){return '<div class="callout field-note tubing"><b class="t">🔧 West Mechanical standard: always sets it at one</b><p style="margin:0">&ldquo;Make sure that the span is almost always at one for West Mechanical&#39;s applications.&rdquo; On the PROPORTIONAL BAND dial, 1 is about 10% of the displacer length for the full swing.</p></div><label class="lbl" for="exPB">PROPORTIONAL BAND dial: <b id="exPBv">'+fmt(X.pb,1)+'</b></label><input type="range" id="exPB" min="0" max="10" step="0.1" value="'+X.pb+'">';},
    function(){if(X.pb>=0.9&&X.pb<=1.1)return [true,"West Mechanical standard ✓. Narrow span: about 10% of the displacer ("+fmt(X.pb*10,0)+"% band) gives the full swing. If it ever cycles in service, the manual says to broaden (increase) the band."]; if(X.pb>=9)return [false,"That is a wide span: the level has to move the whole displacer for the full swing."]; return [false,"The standard is 1 (accepted 0.9 to 1.1). The dial reads "+fmt(X.pb,1)+". Don't confuse it with RAISE LEVEL."];}],
   ["Set zero: RAISE LEVEL and flapper","Set RAISE LEVEL per Table 5 (direct, PB near 1: about 3.9 to 4.4; reverse: about 1.1 to 1.6; interpolated, approximate), put the level at the bottom of your window, then adjust the flapper until the output is "+"3 psig (15 for reverse): coarse with the hex nut, fine with the FLAPPER ALIGNMENT SCREW. The RAISE LEVEL dial does not show the actual level.",
    function(){return '<label class="lbl" for="exRL">RAISE LEVEL dial: <b id="exRLv">'+fmt(X.R,2)+'</b></label><input type="range" id="exRL" min="0" max="10" step="0.05" value="'+X.R+'"><div class="row" style="margin-top:6px"><button type="button" class="secondary" id="exCm">Flapper coarse − (hex nut)</button><button type="button" class="secondary" id="exCp">Flapper coarse +</button><button type="button" class="secondary" id="exFm">Fine − (alignment screw)</button><button type="button" class="secondary" id="exFp">Fine +</button></div><p class="mini">OUTPUT now: <b id="exO6">–</b> psig</p>';},
    function(){var lo=X.rev?1.1:3.9,hi=X.rev?1.6:4.4; if(X.R<lo||X.R>hi)return [false,"RAISE LEVEL should be about "+lo+" to "+hi+" for this action at a band near 1 (Table 5, interpolated: approximate)."]; if(Math.abs(X.L-40)>0.5)return [false,"Put the vessel level at the bottom of the span window (40%)."]; var t=X.rev?15:3, o=exOut(); if(Math.abs(o-t)>0.2)return [false,"OUTPUT reads "+fmt(o,1)+" psig; it should be "+t+" (±0.2). Adjust the flapper: coarse first, then the alignment screw."]; return [true,"Zero set: "+fmt(o,1)+" psig at the bottom of the window."];}],
   ["Check full output at the top","Raise the vessel level to the top of the span window and read the OUTPUT gauge. Is it in tolerance?",
    function(){return '<div class="seg" id="exCh"><button data-v="ok">In tolerance (at the end point ±0.2)</button><button data-v="lo">Short of the end point</button><button data-v="hi">Past the end point</button></div><p class="mini">Set the level to the window max (50%) and read OUTPUT: <b id="exO7">–</b> psig</p>';},
    function(){if(Math.abs(X.L-50)>0.5)return [false,"Set the level to the top of the window (50%) first."]; var t=X.rev?3:15,o=exOut(),cls=Math.abs(o-t)<=0.2?"ok":((X.rev?o>t:o<t)?"lo":"hi"); if(!X.ch7)return [false,"Pick one."]; if(X.ch7!==cls)return [false,"Look again: OUTPUT reads "+fmt(o,1)+" psig and the end point is "+t+"."]; X.skip=(cls==="ok"); return [true,cls==="ok"?"In tolerance, so skip the span trim.":"Not at the end point, so the span needs trimming. The flexure strip base does that."];}],
   ["Trim span with the flexure strip base","Loosen the two level set mounting screws and slide the flexure strip base: away from the torque tube shaft increases the output span, toward it decreases. Sliding it also moves the zero, so go back and re-zero with the flapper, and repeat until both end points hold.",
    function(){return '<div class="row"><button type="button" class="secondary" id="exSa">Slide AWAY from shaft (more span)</button><button type="button" class="secondary" id="exSt">Slide TOWARD shaft (less span)</button><button type="button" class="secondary" id="exFm8">Flapper fine −</button><button type="button" class="secondary" id="exFp8">Flapper fine +</button></div><div class="readouts"><div class="ro"><span class="k">OUTPUT at window min</span><span class="v" id="exMn8">–</span></div><div class="ro"><span class="k">OUTPUT at window max</span><span class="v" id="exMx8">–</span></div><div class="ro"><span class="k">Pass</span><span class="v" id="exLp8">'+X.loops+'</span></div></div>';},
    function(){X.loops++; var a=exOutAt(40),b=exOutAt(50),ta=X.rev?15:3,tb=X.rev?3:15,za=Math.abs(a-ta)<=0.2,zb=Math.abs(b-tb)<=0.2; $("exLp8")&&($("exLp8").textContent=X.loops); if(za&&zb)return [true,"Both end points hold ("+fmt(a,1)+" and "+fmt(b,1)+" psig) after "+X.loops+" pass"+(X.loops>1?"es":"")+"."]; if(!za)return [false,"The zero has moved ("+fmt(a,1)+" psig at the window min): sliding the strip moves zero too. Re-zero with the flapper, then check the top again."]; var lowSpan=X.rev?b>tb:b<tb; return [false,"At the top the output is "+fmt(b,1)+" psig, "+(lowSpan?"short of the end point: the span is too small, so slide the strip AWAY from the shaft.":"past the end point: the span is too large, so slide the strip TOWARD the shaft.")];}],
   ["Set the control level","Move the vessel to the level you want the controller to hold: the middle of the window (45%). The output should sit about mid-range (about 9 psig, a straight-line example, not a manual number). Leave the PROPORTIONAL BAND alone: changing it shifts the zero.",
    function(){return '<p class="mini">OUTPUT now: <b id="exO9">–</b> psig</p>';},
    function(){if(Math.abs(X.L-45)>0.5)return [false,"Set the level to 45% (use the Window mid button)."]; var o=exOut(); if(o<8||o>10)return [false,"OUTPUT reads "+fmt(o,1)+" psig; at the middle of the window it should be about 9."]; return [true,"Output "+fmt(o,1)+" psig at the control level."];}],
   ["Check direct or reverse","Predict first: when the level rises, will the output rise or fall? Then test low, middle, and high. (Optional: flip the flapper base over to see action reverse. The manual's step 3 after changing action is to perform the calibration procedure.)",
    function(){return EW.sel("exP","When the level rises, the output will…",[["","?"],["rise","Rise"],["fall","Fall"]])+'<div class="row"><button type="button" class="secondary" id="exT1">Test low</button><button type="button" class="secondary" id="exT2">Test middle</button><button type="button" class="secondary" id="exT3">Test high</button><button type="button" class="secondary" id="exFlip">↻ Flip flapper base</button></div><p class="mini">OUTPUT now: <b id="exO10">–</b> psig · flapper base: <b id="exFs">'+(X.flipped?"flipped":"as shipped")+'</b></p>';},
    function(){var p=$("exP").value; if(!p)return [false,"Make a prediction first."]; if(!(X.tested.low&&X.tested.mid&&X.tested.high))return [false,"Test low, middle, and high."]; if(X.flipped)return [false,"You flipped the base, so the action changed and the calibration is no longer right: the manual says to perform the calibration procedure after changing action (7.6 step 3). Flip it back, or return to step 6."]; var want=X.rev?"fall":"rise"; if(p!==want)return [false,(X.rev?"Reverse":"Direct")+" action: rising level makes the output "+want+". Don't mix this up with valve action."]; return [true,(X.rev?"Reverse":"Direct")+" confirmed: level up, output "+want+"."];}],
   ["Verification sweep","Set the level to 0%, 50%, and 100% of the span window (40%, 45%, 50% of the displacer) and enter the OUTPUT you read each time. End points are 3 and 15 psig (reversed for reverse); the midpoint of about 9 is a straight-line example.",
    function(){return '<div class="grid3">'+EW.fld("exS0","Window 0% (psig)","")+EW.fld("exS5","50% (psig)","")+EW.fld("exS1","100% (psig)","")+'</div><p class="mini">Use the Window min / mid / max buttons above, then read the OUTPUT gauge.</p>';},
    function(){var v=["exS0","exS5","exS1"].map(function(i){return parseFloat($(i).value);}), t=[exOutAt(40),exOutAt(45),exOutAt(50)]; if(v.some(function(x){return !isFinite(x);}))return [false,"Enter all three readings."]; for(var k=0;k<3;k++){if(Math.abs(v[k]-t[k])>0.2)return [false,"Reading "+(k+1)+" is off: the gauge shows about "+fmt(t[k],1)+" psig there."];} return [true,"Sweep confirmed: "+fmt(t[0],1)+" / "+fmt(t[1],1)+" / "+fmt(t[2],1)+" psig. 0 and 100% are the documented end points; the midpoint confirms the linearity (approximate)."];}],
   ["Startup and stability","Open the valves and close the bypass, then apply a load upset (a jump in level) and watch for cycling. The narrowest band that does not cycle gives the best control; if it cycles, broaden (increase) the band slightly. (Practice option: this vessel cycles at the standard setting.)",
    function(){return EW.chk("exV","Opened the upstream and downstream valves, closed the bypass")+EW.chk("exCy","Practice: this vessel cycles at a band of 1")+'<div class="row" style="margin-top:6px"><button type="button" id="exUp">Apply load upset</button></div><label class="lbl" for="exPB2">PROPORTIONAL BAND dial: <b id="exPB2v">'+fmt(X.pb,1)+'</b></label><input type="range" id="exPB2" min="0" max="10" step="0.1" value="'+X.pb+'"><p class="mini" id="exUr">No upset applied yet.</p>';},
    function(){if(!$("exV").checked)return [false,"Open the valves and close the bypass first."]; if(!X.upset)return [false,"Apply a load upset to test stability."]; var cy=X.cycles&&X.pb<1.5; if(cy)return [false,"It is cycling. The manual says to broaden (increase) the band slightly. West Mechanical's standard is 1, so tell Zach if a loop won't hold at 1."]; return [true,"Stable, no cycling. Calibration complete."];}]
  ];
  function exDraw(){
    var g='';
    var L=X.L, lv=170-130*(L/100);
    g+='<rect x="8" y="20" width="60" height="160" rx="6" fill="#10242e" stroke="#5ab4ff" stroke-width="2"/><rect x="10" y="'+lv.toFixed(1)+'" width="56" height="'+(178-lv).toFixed(1)+'" fill="rgba(90,180,255,.33)"/><line x1="10" y1="'+lv.toFixed(1)+'" x2="66" y2="'+lv.toFixed(1)+'" stroke="#7fd6ff" stroke-width="2"/>';
    var wTop=170-130*0.5, wBot=170-130*0.4; g+='<rect x="8" y="'+wTop+'" width="60" height="'+(wBot-wTop)+'" fill="#ffd23f" fill-opacity=".22" stroke="#ffd23f" stroke-dasharray="3 2"/><text x="72" y="'+(wTop+8)+'" fill="#ffd23f" font-size="7">span window</text><text x="72" y="'+(wTop+17)+'" fill="#ffd23f" font-size="7">(example)</text>';
    g+='<rect x="26" y="46" width="24" height="100" rx="4" fill="#9aa5b1" stroke="#fff"/><text x="38" y="186" fill="#9AA0A6" font-size="7" text-anchor="middle">displacer</text>';
    function gauge(cx,cy,rad,val,max,col,lab){var a=-135+270*clamp(val/max,0,1);var x2=cx+(rad-6)*Math.sin(a*Math.PI/180),y2=cy-(rad-6)*Math.cos(a*Math.PI/180);return '<circle cx="'+cx+'" cy="'+cy+'" r="'+rad+'" fill="#0d0f12" stroke="#59616c" stroke-width="2"/><line x1="'+cx+'" y1="'+cy+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="2.5"/><circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="#fff"/><text x="'+cx+'" y="'+(cy+rad+10)+'" fill="'+col+'" font-size="7.5" text-anchor="middle">'+lab+'</text>';}
    var o=exOut(), tg=(X.ol==="b");
    g+=gauge(150,70,34,X.supply,40,"#ffb020","SUPPLY "+fmt(X.supply,1)+" psig");
    g+=gauge(240,70,34,o,20,"#3ecf6a","OUTPUT "+fmt(o,1)+" psig");
    g+='<text x="195" y="150" fill="#9AA0A6" font-size="7.5" text-anchor="middle">'+(X.ol?(tg?"open loop: test gauge on the output":"open loop: valve blocked"):"valve in the loop")+'</text>';
    g+='<text x="195" y="164" fill="#9AA0A6" font-size="7" text-anchor="middle">flexure strip: '+(X.ts>=0?"+":"")+fmt(X.ts,2)+' · flapper: '+(X.fl>=0?"+":"")+fmt(X.fl,1)+'</text>';
    $("exSvg").innerHTML=g;
    $("exLv").textContent=fmt(L,1); $("exRd").textContent=fmt(X.R,2); $("exPd").textContent=fmt(X.pb,1); $("exAc").textContent=(exEff()?"Reverse (R)":"Direct")+(X.flipped?" · flipped":"");
    each(["exO6","exO7","exO9","exO10"],function(id){var e=$(id); if(e)e.textContent=fmt(o,1);});
    var a=$("exMn8"),b=$("exMx8"); if(a){a.textContent=fmt(exOutAt(40),1)+" psig";b.textContent=fmt(exOutAt(50),1)+" psig";}
    if($("exSv"))$("exSv").textContent=fmt(X.supply,1);
    if($("exPBv"))$("exPBv").textContent=fmt(X.pb,1); if($("exPB2v"))$("exPB2v").textContent=fmt(X.pb,1); if($("exRLv"))$("exRLv").textContent=fmt(X.R,2);
  }
  function exPanel(){
    var n=X.step, d=EXS[n-1]; var dots=''; for(var k=1;k<=12;k++){dots+='<span style="display:inline-block;width:18px;height:6px;margin-right:2px;border-radius:3px;background:'+(k<n?"#3ecf6a":k===n?"#2EC4B6":"#3a424c")+'"></span>';}
    if(X.done){$("exPanel").innerHTML='<div>'+dots+'</div><p class="result-big">✓ Calibration practice complete</p><p>You worked the whole order: nameplate, supply, open loop, known level, span at one, zero, end point check, span trim, control level, direct or reverse, sweep, and stability. On a real controller, follow the Fisher manual for your unit.</p><div class="row"><button type="button" class="secondary" id="exAgain">↺ Practice again</button></div>'; $("exAgain").addEventListener("click",function(){exReset();}); return;}
    $("exPanel").innerHTML='<div>'+dots+'</div><p style="margin:8px 0 2px"><b id="exTitle">Step '+n+' of 12: '+d[0]+'</b></p><p style="margin:0 0 8px">'+d[1]+'</p><div id="exUi">'+d[2]()+'</div><div class="row" style="margin-top:8px"><button type="button" id="exChk">Check</button><button type="button" class="secondary" id="exNext" disabled>Next step →</button></div><p class="ch-fb" id="exFb" aria-live="polite" style="margin:8px 0 0"></p>';
    X.ok=false; X.skip=false; exBind(n); exDraw();
    $("exChk").addEventListener("click",function(){var r=d[3](); $("exFb").className="ch-fb show "+(r[0]?"good":"bad"); $("exFb").innerHTML=(r[0]?"✓ ":"✗ ")+r[1]; X.ok=r[0]; $("exNext").disabled=!r[0]; exDraw();});
    $("exNext").addEventListener("click",function(){ if(!X.ok)return; if(n===12){X.done=true;} else {X.step=n===7&&X.skip?9:n+1;} exPanel();});
  }
  function exBind(n){
    function on(id,ev,fn){var e=$(id); if(e)e.addEventListener(ev,fn);}
    if(n===3) H.chipGroup($("exOL"),function(v){X.ol=v;exDraw();});
    if(n===2){on("exLoose","click",function(){X.loosened=!X.loosened;exPanel();}); on("exSm","click",function(){if(X.loosened){X.supply=Math.max(0,X.supply-0.5);exDraw();}}); on("exSp","click",function(){if(X.loosened){X.supply=Math.min(45,X.supply+0.5);exDraw();}});}
    if(n===4){var pr=H.chipGroup($("exMd"),function(v){X.mode=v; $("exMdBody").innerHTML=v==="wet"?'<p class="mini">Process SG 0.7, water SG 1.0, simulate 50% of the span: water level?</p>'+EW.fld("exW","Water level (%)",""):'<p class="mini">EXAMPLE: Wd = 5.0 lb, 3-inch diameter, 7 inches submerged, SG 0.7.</p>'+EW.fld("exW","Weight Ws (lb)","");}); pr.pick(X.mode);}
    if(n===5) on("exPB","input",function(){X.pb=+$("exPB").value;exDraw();});
    if(n===6){on("exRL","input",function(){X.R=+$("exRL").value;exDraw();}); on("exCm","click",function(){X.fl=Math.round((X.fl-1)*10)/10;exDraw();}); on("exCp","click",function(){X.fl=Math.round((X.fl+1)*10)/10;exDraw();}); on("exFm","click",function(){X.fl=Math.round((X.fl-0.1)*10)/10;exDraw();}); on("exFp","click",function(){X.fl=Math.round((X.fl+0.1)*10)/10;exDraw();});}
    if(n===7) H.chipGroup($("exCh"),function(v){X.ch7=v;});
    if(n===8){on("exSa","click",function(){X.ts=Math.round((X.ts+0.05)*100)/100;exDraw();}); on("exSt","click",function(){X.ts=Math.round((X.ts-0.05)*100)/100;exDraw();}); on("exFm8","click",function(){X.fl=Math.round((X.fl-0.1)*10)/10;exDraw();}); on("exFp8","click",function(){X.fl=Math.round((X.fl+0.1)*10)/10;exDraw();});}
    if(n===10){on("exT1","click",function(){X.tested.low=1;exSetL(40);}); on("exT2","click",function(){X.tested.mid=1;exSetL(45);}); on("exT3","click",function(){X.tested.high=1;exSetL(50);}); on("exFlip","click",function(){X.flipped=!X.flipped; $("exFs").textContent=X.flipped?"flipped":"as shipped"; exDraw();});}
    if(n===12){on("exCy","change",function(){X.cycles=$("exCy").checked;}); on("exUp","click",function(){X.upset=true; var cy=$("exCy").checked&&X.pb<1.5; X.cycles=$("exCy").checked; $("exUr").innerHTML=cy?"<b>Cycling:</b> the output hunts up and down after the upset. Broaden the band slightly.":"<b>Stable:</b> the output settles after the upset.";}); on("exPB2","input",function(){X.pb=+$("exPB2").value; X.upset=false; $("exUr").textContent="Band changed: apply the upset again."; exDraw();});}
  }
  function exSetL(v){X.L=v;$("exL").value=v;exDraw();}
  function exReset(){var rev=X.rev; X.step=1;X.flipped=false;X.supply=17;X.loosened=false;X.pb=5;X.ts=-0.1;X.R=2;X.fl=2.4;X.L=40;X.mode="wet";X.loops=0;X.tested={};X.pred="";X.upset=false;X.cycles=false;X.done=false;X.ol=null;X.ch7=null;X.rev=rev; $("exL").value=40; exPanel();}
  H.chipGroup($("exScen"),function(v){X.rev=(v==="r"); exReset();}).pick("d");
  $("exL").addEventListener("input",function(){X.L=+$("exL").value;exDraw();});
  $("exMin").addEventListener("click",function(){exSetL(40);}); $("exMid").addEventListener("click",function(){exSetL(45);}); $("exMax").addEventListener("click",function(){exSetL(50);});

  var VAR=[["2502 (proportional-plus-reset)","No 0 to 10 dial: set RESET to 0.01 minutes per repeat, PROPORTIONAL BAND to zero and RAISE LEVEL to zero. At minimum level, adjust the nozzle until the output is 3 psig or less. At maximum level, turn RAISE LEVEL until the output reads 15 psig: it is in calibration if the knob is between 9.0 and 10.0. Otherwise slide the calibration adjuster: away from the pivot to increase span, toward it to decrease. For startup: PROPORTIONAL BAND to 200 percent, RESET to 0.05, then narrow the band until it cycles and broaden it slightly. The 2502's band knob is in percent, so a setting of 1 would not mean the same thing as on a 2500."],
           ["2500S (snap-acting)","Output switches between 0 and full supply with a differential gap, instead of throttling. Set RAISE LEVEL to 1.0 to 1.5 (direct) or 3.5 to 4.0 (reverse). At minimum level, move the flapper until the output switches, then back until it switches off. Raise the level until it switches again: that should be at the maximum. If not, slide the flexure strip base: away from the torque tube to decrease the differential gap, toward it to increase it. A slight PROPORTIONAL BAND change is the last resort. Follow the 2500 manual for the full procedure."]];
  S("w-s11-2","Variants: 2502 and 2500S",chips("vaC",VAR.map(function(v){return v[0];}))+card("vaO","Tap a variant."));
  chipInfo("vaC","vaO",VAR);
})();
