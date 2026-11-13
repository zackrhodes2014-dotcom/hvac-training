/* Module 21 widgets: Chiller Fundamentals */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: follow the cold */
  S("w-hook","The hospital that got warm",
    '<div class="svgbox"><svg id="hkSvg" viewBox="0 0 320 170" role="img" aria-label="Building cutaway"></svg></div><button type="button" id="hkGo">❄️ Follow the cold</button><p class="status" id="hkOut" aria-live="polite"></p>');
  var cooled=0, py=-1;
  function hk(){var g='<rect x="60" y="10" width="200" height="150" fill="#1a2430" stroke="#59616c"/>';
    for(var f=0;f<4;f++){var y=15+f*28, c=cooled>(3-f); g+='<rect x="64" y="'+y+'" width="192" height="24" fill="'+(c?"rgba(90,180,255,.35)":"rgba(255,90,70,.35)")+'"/><rect x="200" y="'+(y+6)+'" width="40" height="12" rx="2" fill="#262b33" stroke="#9AA0A6"/><text x="220" y="'+(y+16)+'" fill="#EDEAE4" font-size="8" text-anchor="middle">AHU</text>';}
    g+='<rect x="70" y="128" width="70" height="26" rx="4" fill="#173a38" stroke="#2EC4B6"/><text x="105" y="145" fill="#EDEAE4" font-size="10" text-anchor="middle">CHILLER</text><line x1="150" y1="140" x2="170" y2="140" stroke="#5ab4ff" stroke-width="4"/><line x1="170" y1="140" x2="170" y2="20" stroke="#5ab4ff" stroke-width="4"/>';
    if(py>=0) g+='<circle cx="170" cy="'+py+'" r="7" fill="#5ab4ff"/>';
    $("hkSvg").innerHTML=g;}
  $("hkGo").addEventListener("click",function(){cooled=0;py=140;var t=setInterval(function(){py-=3; cooled=Math.floor((140-py)/28); hk(); if(py<=18){clearInterval(t);cooled=4;py=-1;hk();$("hkOut").textContent="One machine in the basement cools every floor. When it goes down, everyone feels it.";}},30);});
  hk();

  /* S1: tonnage calculator */
  S("w-s1","Tonnage calculator (Btu/h = 500 × GPM × ΔT)",
    '<div class="grid3">'+EW.fld("tnG","GPM",400)+EW.fld("tnE","Entering water °F",54)+EW.fld("tnL","Leaving water °F",44)+'</div>'+EW.fld("tnR","Chiller rated tons",200)+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">ΔT</span><span class="v" id="tnD">–</span></div><div class="ro"><span class="k">Btu/h</span><span class="v" id="tnB">–</span></div><div class="ro"><span class="k">Tons</span><span class="v" id="tnT">–</span></div><div class="ro"><span class="k">GPM per ton</span><span class="v" id="tnGpt">–</span></div></div>'+
    '<div class="svgbox"><svg id="tnSvg" viewBox="0 0 240 130" role="img" aria-label="Percent load gauge"></svg></div>'+
    '<label class="toggle"><input type="checkbox" id="tnShow"> Show the math</label><div class="math" id="tnMath"></div>');
  function tn(){var G=v("tnG"),E=v("tnE"),L=v("tnL"),R=v("tnR"),d=E-L,b=500*G*d,t=b/12000,p=t/R*100;
    $("tnD").textContent=isFinite(d)?fmt(d,1)+"°F":"–"; $("tnB").textContent=isFinite(b)?fmt(b,0):"–"; $("tnT").textContent=isFinite(t)?fmt(t,1):"–"; $("tnGpt").textContent=t>0?fmt(G/t,2):"–";
    $("tnMath").textContent="ΔT = "+E+" − "+L+" = "+fmt(d,1)+"°F\nBtu/h = 500 × "+G+" × "+fmt(d,1)+" = "+fmt(b,0)+"\nTons = "+fmt(b,0)+" ÷ 12,000 = "+fmt(t,1)+"\nLoad = "+fmt(t,1)+" ÷ "+R+" = "+fmt(p,0)+"%";
    $("tnMath").classList.toggle("show",$("tnShow").checked);
    var pc=Math.max(0,Math.min(120,isFinite(p)?p:0)), a=Math.PI*(1-pc/120), x=120+90*Math.cos(a), y=115-90*Math.sin(a);
    $("tnSvg").innerHTML='<path d="M30 115 A90 90 0 0 1 210 115" fill="none" stroke="#1e2b38" stroke-width="16"/><path d="M30 115 A90 90 0 0 1 '+(120+90*Math.cos(Math.PI/6))+' '+(115-90*Math.sin(Math.PI/6))+'" fill="none" stroke="#2EC4B6" stroke-width="4"/><line x1="120" y1="115" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="#ff9f43" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="115" r="6" fill="#EDEAE4"/><text x="120" y="95" fill="#EDEAE4" font-size="14" text-anchor="middle" font-weight="800">'+(isFinite(p)?fmt(p,0)+"%":"–")+' of rated</text><text x="30" y="128" fill="#9AA0A6" font-size="9">0</text><text x="200" y="128" fill="#9AA0A6" font-size="9">120%</text>';}
  ["tnG","tnE","tnL","tnR","tnShow"].forEach(function(id){$(id).addEventListener("input",tn);$(id).addEventListener("change",tn);}); tn();

  /* S2: split vs chiller */
  S("w-s2","Where does the refrigerant go?",
    '<div class="svgbox"><svg id="svSvg" viewBox="0 0 320 140" role="img" aria-label="Split system and chiller system side by side"></svg></div><button type="button" id="svSwap">🔁 Swap view: highlight refrigerant vs. water</button><p class="status" id="svOut" aria-live="polite"></p>');
  var hl=0, tt=0;
  function sv(){tt++; var g='<text x="75" y="14" fill="#9AA0A6" font-size="10" text-anchor="middle">Split system (DX)</text><text x="240" y="14" fill="#9AA0A6" font-size="10" text-anchor="middle">Chiller system</text>';
    var ref=hl!==2, wat=hl!==1;
    g+='<polygon points="20,70 75,30 130,70" fill="none" stroke="#59616c"/><rect x="25" y="70" width="100" height="60" fill="#1a2430" stroke="#59616c"/><rect x="40" y="90" width="30" height="20" fill="#262b33" stroke="#9AA0A6"/><text x="55" y="122" fill="#9AA0A6" font-size="8" text-anchor="middle">DX coil</text><rect x="135" y="100" width="22" height="26" fill="#262b33" stroke="#9AA0A6"/>';
    g+='<path d="M70 95 H146 V100" stroke="'+(ref?"#ff6b5b":"#3a2020")+'" stroke-width="3" fill="none" stroke-dasharray="6 4" stroke-dashoffset="'+(-tt%10)+'"/><path d="M70 105 H140 V100" stroke="'+(ref?"#5ab4ff":"#1c2a3a")+'" stroke-width="3" fill="none"/>';
    g+='<rect x="180" y="25" width="120" height="105" fill="#1a2430" stroke="#59616c"/><rect x="190" y="100" width="44" height="24" rx="3" fill="#173a38" stroke="'+(ref?"#ff6b5b":"#2EC4B6")+'" stroke-width="'+(ref?3:1)+'"/><text x="212" y="116" fill="#EDEAE4" font-size="8" text-anchor="middle">chiller</text>';
    for(var f=0;f<3;f++){g+='<rect x="262" y="'+(35+f*22)+'" width="26" height="14" fill="#262b33" stroke="#9AA0A6"/>';}
    g+='<path d="M234 110 H250 V40 H262 M250 62 H262 M250 84 H262" stroke="'+(wat?"#5ab4ff":"#1c2a3a")+'" stroke-width="3" fill="none" stroke-dasharray="6 4" stroke-dashoffset="'+(-tt%10)+'"/>';
    $("svSvg").innerHTML=g;}
  $("svSwap").addEventListener("click",function(){hl=(hl+1)%3; $("svOut").textContent=["Both shown.","Refrigerant only: it runs through the whole house in a split, but stays inside the chiller.","Water only: in a chiller plant, water (or glycol) carries the cooling to every coil."][hl];});
  setInterval(sv,80);

  /* S3: loop tracer */
  var COMP=[["Chiller",["chw","cw","ref"]],["Chilled water pump",["chw"]],["AHU coil",["chw"]],["Expansion tank",["chw"]],["Air separator",["chw"]],["Condenser water pump",["cw"]],["Cooling tower",["cw"]],["Compressor",["ref"]],["Expansion valve (EXV)",["ref"]]];
  var LOOPN={chw:"chilled water (blue)",cw:"condenser water (green)",ref:"refrigerant (orange)"};
  var s3=S("w-s3","Chiller plant loop tracer",
    '<div class="svgbox"><svg id="ltSvg" viewBox="0 0 320 150" role="img" aria-label="Plant loops"></svg></div><div class="chips" id="ltC">'+COMP.map(function(c,k){return '<button data-v="'+k+'">'+c[0]+'</button>';}).join("")+'</div><p class="status" id="ltOut" aria-live="polite"></p><p class="lbl" style="margin-top:12px"><b>Quiz mode</b></p>');
  var on={};
  function lt(){var g='';
    g+='<path d="M120 75 H60 V20 H20 M60 20 V130 H120" fill="none" stroke="'+(on.chw?"#5ab4ff":"#26323f")+'" stroke-width="5"/><text x="20" y="145" fill="#5ab4ff" font-size="9">to building coils</text>';
    g+='<path d="M200 75 H260 V20 H300 V130 H260 V75" fill="none" stroke="'+(on.cw?"#4caf50":"#26323f")+'" stroke-width="5"/><text x="300" y="145" fill="#4caf50" font-size="9" text-anchor="end">to cooling tower</text>';
    g+='<rect x="120" y="45" width="80" height="60" rx="8" fill="#1a2430" stroke="#9AA0A6"/><path d="M135 60 H185 V90 H135 Z" fill="none" stroke="'+(on.ref?"#ff9f43":"#3a3020")+'" stroke-width="4"/><text x="160" y="80" fill="#EDEAE4" font-size="9" text-anchor="middle">chiller</text>';
    $("ltSvg").innerHTML=g;}
  H.chipGroup($("ltC"),function(k){var c=COMP[+k]; on={}; c[1].forEach(function(l){on[l]=1;}); lt(); $("ltOut").textContent=c[0]+": on the "+c[1].map(function(l){return LOOPN[l];}).join(", ")+" loop"+(c[1].length>1?"s":"")+".";});
  lt();
  EW.chooser(s3,[{prompt:"Which loop is the expansion tank on?",options:["Chilled water","Condenser water","Refrigerant"],answer:0,why:"It absorbs the closed chilled water loop's expansion and shrinking."},
    {prompt:"Which loop goes to the cooling tower?",options:["Chilled water","Condenser water","Refrigerant"],answer:1,why:"Condenser water carries heat from the chiller's condenser to the tower."},
    {prompt:"Which loop never leaves the chiller?",options:["Chilled water","Condenser water","Refrigerant"],answer:2,why:"Refrigerant stays sealed inside the machine."}],{label:"Question"});

  /* S4: decoupler flow simulator */
  S("w-s4","Decoupler flow simulator",
    '<div class="chips" id="dcLay"><button data-v="coupled">Coupled (primary-only)</button><button data-v="decoupled">Decoupled (primary-secondary)</button><button data-v="vpf">Variable primary</button></div>'+
    '<div class="svgbox"><svg id="dcSvg" viewBox="0 0 320 170" role="img" aria-label="Primary and secondary loops with common pipe"></svg></div>'+
    '<label class="lbl" for="dcP" id="dcPl">Primary GPM: <b id="dcPv">800</b></label><input type="range" id="dcP" min="200" max="1600" step="50" value="800">'+
    '<label class="lbl" for="dcS">Secondary (building) GPM: <b id="dcSv">1000</b></label><input type="range" id="dcS" min="100" max="1600" step="50" value="1000">'+
    '<div class="grid2">'+EW.fld("dcTl","Chiller leaving °F (setpoint)",44)+EW.fld("dcTr","Building return °F",56)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k" id="dcFk">Decoupler flow</span><span class="v" id="dcF">–</span></div><div class="ro"><span class="k">Direction</span><span class="v" id="dcDir" style="font-size:1rem">–</span></div><div class="ro" id="dcSupRo"><span class="k">Building supply temp</span><span class="v" id="dcSup">–</span></div><div class="ro"><span class="k">Return to chiller</span><span class="v" id="dcRet">–</span></div><div class="ro"><span class="k">Chiller tons</span><span class="v" id="dcTons">–</span></div></div>'+
    '<p class="status" id="dcMsg" aria-live="polite"></p><p class="wnote">Mixing math: supply temp = (primary GPM × leaving temp + decoupler GPM × return temp) ÷ secondary GPM. Variable primary uses a 400 GPM minimum chiller flow.</p>');
  var lay="decoupled", dOff=0;
  function dc(){var P=+$("dcP").value,Sg=+$("dcS").value,Tl=v("dcTl"),Tr=v("dcTr"),MIN=400;
    $("dcSv").textContent=Sg;
    var dec, sup, ret, chFlow, dir, msg, band;
    if(lay==="coupled"){ P=Sg; $("dcP").value=P; $("dcP").disabled=true; $("dcPl").firstChild.textContent="Primary GPM (same water as building): ";
      dec=0; chFlow=P; sup=Tl; ret=Tr; dir="No common pipe"; $("dcFk").textContent="Decoupler flow";
      msg="Coupled: one pump set, one loop. Chiller flow = building flow. 3-way valves keep total flow steady, so pumps run full speed all day."; }
    else if(lay==="vpf"){ $("dcP").disabled=true; chFlow=Math.max(Sg,MIN); P=chFlow; $("dcP").value=P; $("dcPl").firstChild.textContent="Chiller flow (variable pumps): ";
      dec=chFlow-Sg; sup=Tl; ret=(Sg*Tr+dec*Tl)/chFlow; $("dcFk").textContent="Min-flow bypass";
      dir=dec>0?"Bypass OPEN":"Bypass closed"; msg=dec>0?"Light load: the minimum flow bypass opens so the chiller keeps at least "+MIN+" GPM and the evaporator can't freeze.":"Variable pumps send the same water through the chiller and building. No secondary pumps."; }
    else { $("dcP").disabled=false; $("dcPl").firstChild.textContent="Primary GPM: "; $("dcFk").textContent="Decoupler flow";
      chFlow=P; dec=P-Sg;
      if(dec>=0){ sup=Tl; ret=(Sg*Tr+dec*Tl)/P; dir="Supply → return"; msg="Excess flow (normal, healthy): extra cold water slips through the decoupler back to the chillers. The building gets the chiller's leaving temp."; }
      else { sup=(P*Tl+(-dec)*Tr)/Sg; ret=Tr; dir="Return → supply"; msg="Deficit flow: warm return water flows backward through the decoupler and mixes into the supply. Time to stage on another chiller and primary pump, or look for a low building ΔT."; } }
    $("dcPv").textContent=P;
    var tons=500*chFlow*(ret-Tl)/12000;
    $("dcF").textContent=fmt(Math.abs(dec),0)+" GPM"; $("dcDir").textContent=dir; $("dcSup").textContent=fmt(sup,1)+"°F"; $("dcRet").textContent=fmt(ret,1)+"°F"; $("dcTons").textContent=isFinite(tons)?fmt(tons,0):"–";
    EW.setBand($("dcSupRo"),sup>Tl+0.5?"band-y":"band-g"); $("dcMsg").textContent=msg;
    var deficit=lay==="decoupled"&&dec<0, col=lay==="coupled"?"#59616c":deficit?"#ff9f43":"#5ab4ff";
    var g='<rect x="10" y="60" width="60" height="50" rx="6" fill="#173a38" stroke="#2EC4B6"/><text x="40" y="89" fill="#EDEAE4" font-size="10" text-anchor="middle">Chiller</text>';
    g+='<path d="M70 70 H250" stroke="#5ab4ff" stroke-width="6"/><path d="M70 100 H250" stroke="#ff9f43" stroke-width="6"/><rect x="250" y="55" width="60" height="60" rx="6" fill="#1a2430" stroke="#9AA0A6"/><text x="280" y="89" fill="#EDEAE4" font-size="10" text-anchor="middle">Building</text>';
    g+='<text x="110" y="62" fill="#5ab4ff" font-size="9">supply '+fmt(lay==="decoupled"&&dec<0?Tl:Tl,1)+'°F</text><text x="200" y="62" fill="'+(sup>Tl+0.5?"#ffd166":"#5ab4ff")+'" font-size="9">'+fmt(sup,1)+'°F</text><text x="110" y="118" fill="#ff9f43" font-size="9">return</text>';
    if(lay!=="coupled"){ g+='<line x1="160" y1="70" x2="160" y2="100" stroke="'+col+'" stroke-width="8"/><text x="160" y="140" fill="#9AA0A6" font-size="9" text-anchor="middle">'+(lay==="vpf"?"min-flow bypass":"common pipe (decoupler)")+'</text>';
      if(Math.abs(dec)>0){ var down=dec>0; dOff=(dOff+1)%12; var ay=down?(74+dOff*2):(96-dOff*2);
        g+='<polygon points="'+(down?"152,"+ay+" 168,"+ay+" 160,"+(ay+8):"152,"+ay+" 168,"+ay+" 160,"+(ay-8))+'" fill="'+col+'"/><text x="176" y="90" fill="'+col+'" font-size="10">'+(down?"↓ excess":"↑ deficit")+' '+fmt(Math.abs(dec),0)+'</text>'; } }
    if(lay==="decoupled"){g+='<circle cx="100" cy="70" r="8" fill="#262b33" stroke="#9AA0A6"/><text x="100" y="40" fill="#9AA0A6" font-size="8" text-anchor="middle">primary pump</text><circle cx="225" cy="70" r="8" fill="#262b33" stroke="#9AA0A6"/><text x="225" y="40" fill="#9AA0A6" font-size="8" text-anchor="middle">secondary (VFD)</text>';}
    else{g+='<circle cx="100" cy="70" r="8" fill="#262b33" stroke="#9AA0A6"/><text x="100" y="40" fill="#9AA0A6" font-size="8" text-anchor="middle">'+(lay==="vpf"?"variable primary pump":"constant pump")+'</text>';}
    $("dcSvg").innerHTML=g;}
  H.chipGroup($("dcLay"),function(k){lay=k;dc();}).pick("decoupled");
  ["dcP","dcS","dcTl","dcTr"].forEach(function(id){$(id).addEventListener("input",dc);});
  setInterval(dc,120);

  /* S5: compressor picker */
  S("w-s5","Compressor type picker",
    '<div class="grid2">'+EW.fld("cpTons","Tons",400)+EW.sel("cpHeat","Driven by",[["elec","Electric motor"],["heat","Steam / hot water / burner"]])+EW.sel("cpLoc","Location",[["in","Indoor, water-cooled"],["out","Outdoor, air-cooled"]])+EW.sel("cpOil","Oil-free wanted?",[["no","No"],["yes","Yes"]])+'</div>'+
    '<div class="svgbox"><svg viewBox="0 0 320 100" role="img" aria-label="Compressor animation"><g transform="translate(60 50)"><g id="cpRot" class="spin"><circle r="32" fill="none" stroke="#2EC4B6" stroke-width="3"/><path id="cpShape" d="" fill="none" stroke="#2EC4B6" stroke-width="3"/></g></g><text id="cpName" x="110" y="45" fill="#EDEAE4" font-size="16" font-weight="800"></text><text id="cpDesc" x="110" y="66" fill="#9AA0A6" font-size="10"></text></svg></div><p class="status" id="cpWhy"></p>');
  var SH={centrifugal:"M0 0 L20 -24 M0 0 L28 10 M0 0 L-10 28 M0 0 L-28 -6 M0 0 L-6 -30",screw:"M-26 -8 Q0 -20 26 -8 M-26 8 Q0 -4 26 8",scroll:"M0 0 m-4 0 a4 4 0 1 1 8 0 a10 10 0 1 1 -20 0 a16 16 0 1 1 32 0 a22 22 0 1 1 -44 0",recip:"M-10 -24 V24 M10 -24 V24 M-20 0 H20",absorption:"M-20 -10 H20 M-20 10 H20"};
  function cpk(){var t=v("cpTons"),h=$("cpHeat").value,l=$("cpLoc").value,o=$("cpOil").value,k,why;
    if(h==="heat"){k="absorption";why="No mechanical compressor: heat drives a water / lithium bromide cycle.";}
    else if(o==="yes"&&t>=150){k="centrifugal";why="Magnetic-bearing centrifugal: the shaft floats with no oil at all.";}
    else if(t>=500&&l==="in"){k="centrifugal";why="Large water-cooled machines are usually centrifugal.";}
    else if(t>=120){k="screw";why="Mid-size to large, air- or water-cooled: screw (two meshing rotors).";}
    else if(t>=20){k="scroll";why="Smaller chillers often stage several scroll compressors.";}
    else {k="recip";why="Small and older machines may use reciprocating (piston) compressors.";}
    $("cpShape").setAttribute("d",SH[k]); $("cpName").textContent={centrifugal:"Centrifugal",screw:"Screw",scroll:"Scroll",recip:"Reciprocating",absorption:"Absorption"}[k];
    $("cpDesc").textContent={centrifugal:"spinning impeller flings vapor outward",screw:"two meshing rotors squeeze vapor",scroll:"orbiting spiral squeezes vapor",recip:"pistons in cylinders",absorption:"heat-driven, LiBr + water"}[k]; $("cpWhy").textContent=why+" (Typical pattern, not a hard rule.)";}
  ["cpTons","cpHeat","cpLoc","cpOil"].forEach(function(id){$(id).addEventListener("input",cpk);$(id).addEventListener("change",cpk);}); cpk();

  /* S6: approach diagnostic */
  S("w-s6","Approach temperature diagnostic",
    '<div class="grid2">'+EW.fld("apLchw","Leaving chilled water °F",44)+EW.fld("apSe","Saturated evaporator °F",42)+EW.fld("apLcw","Leaving condenser water °F",95)+EW.fld("apSc","Saturated condensing °F",97)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro" id="apERo"><span class="k">Evaporator approach</span><span class="v" id="apE">–</span></div><div class="ro" id="apCRo"><span class="k">Condenser approach</span><span class="v" id="apC">–</span></div></div><p class="status" id="apHint" aria-live="polite"></p>'+
    '<p class="wnote">Teaching bands: green up to 3°F, yellow over 3–5°F, red over 5°F. Real targets come from the manufacturer\'s data. Saturated temps come from the refrigerant\'s PT chart (Module 5).</p>');
  function band(x){return !isFinite(x)?null:x>5?"band-r":x>3?"band-y":"band-g";}
  function ap(){var e=v("apLchw")-v("apSe"), c=v("apSc")-v("apLcw");
    $("apE").textContent=isFinite(e)?fmt(e,1)+"°F":"–"; $("apC").textContent=isFinite(c)?fmt(c,1)+"°F":"–"; EW.setBand($("apERo"),band(e)); EW.setBand($("apCRo"),band(c));
    var h=[]; if(c>5)h.push("High condenser approach: think fouled tubes (or non-condensables)."); else if(c>3)h.push("Condenser approach creeping up: watch it, plan a tube cleaning.");
    if(e>5)h.push("High evaporator approach: think low charge, oil logging, or fouled evaporator tubes."); else if(e>3)h.push("Evaporator approach a bit high: trend it.");
    if(e<0||c<0)h.push("Negative approach: check the sensor or the saturated-temp conversion.");
    $("apHint").textContent=h.join(" ")||"Both approaches look healthy.";}
  ["apLchw","apSe","apLcw","apSc"].forEach(function(id){$(id).addEventListener("input",ap);}); ap();

  /* S7: safeties trip simulator */
  var s7=S("w-s7","Safeties trip simulator",
    '<label class="lbl" for="sfF">Chilled water flow: <b id="sfFv">100</b>% of design</label><input type="range" id="sfF" min="0" max="110" value="100">'+
    '<label class="lbl" for="sfC">Entering condenser water: <b id="sfCv">85</b>°F</label><input type="range" id="sfC" min="65" max="105" value="85">'+
    '<label class="lbl" for="sfR">Refrigerant charge: <b id="sfRv">100</b>%</label><input type="range" id="sfR" min="50" max="100" value="100">'+
    '<div class="tree-node" id="sfPanel" style="font-family:ui-monospace,monospace" aria-live="polite"></div><div id="sfQ"></div>');
  var lastAlarm="";
  function sf(){var f=+$("sfF").value,c=+$("sfC").value,r=+$("sfR").value; $("sfFv").textContent=f; $("sfCv").textContent=c; $("sfRv").textContent=r;
    var a=null;
    if(f<50) a=["EVAP FLOW LOSS (proof of flow)",["Clogged strainer or pump problem","Fouled condenser tubes","Low oil pressure"],0,"No proven chilled water flow: the chiller won't run, or the evaporator could freeze."];
    else if(r<80) a=["LOW EVAP PRESSURE / FREEZE PROTECT",["Low refrigerant charge","Cooling tower fans off","High building load"],0,"Low charge drops evaporator pressure and saturated temp toward freezing."];
    else if(c>95) a=["HIGH CONDENSER PRESSURE",["Cooling tower problem (fans off, high entering water)","Low refrigerant charge","Chilled water setpoint too high"],0,"Hot condenser water raises head pressure until the high-pressure safety trips."];
    else if(f<70) a=null;
    $("sfPanel").innerHTML=a?'<span class="no blink">⚠ ALARM: '+a[0]+'</span>':'<span class="ok">RUNNING · LCHW 44.0°F · no alarms</span>'+(f<70?' <span class="warn-t">(flow getting low)</span>':'');
    if(a&&a[0]!==lastAlarm){ $("sfQ").innerHTML='<p class="lbl">Pick the likely cause:</p><div class="chips">'+a[1].map(function(o,k){return '<button type="button" data-k="'+k+'">'+o+'</button>';}).join("")+'</div><div class="ch-fb" id="sfFb"></div>';
      each($("sfQ").querySelectorAll("button"),function(b){b.addEventListener("click",function(){var ok=+b.getAttribute("data-k")===a[2]; b.classList.add(ok?"right":"wrong"); var fb=$("sfFb"); fb.className="ch-fb show "+(ok?"good":"bad"); fb.textContent=(ok?"✓ ":"✗ Not the best fit. ")+a[3];});}); }
    if(!a) $("sfQ").innerHTML=""; lastAlarm=a?a[0]:"";}
  ["sfF","sfC","sfR"].forEach(function(id){$(id).addEventListener("input",sf);}); sf();

  /* S8: trend spotter */
  var DAYS=[]; for(var d=1;d<=30;d++){DAYS.push(d<12?2+((d*7)%5)/10:2+(d-11)*0.22+((d*7)%5)/10);}
  S("w-s8","Log sheet trend spotter",
    '<p class="lbl">30 days of condenser approach (°F). Tap the day the trend starts.</p><div class="svgbox"><svg id="trSvg" viewBox="0 0 320 140" role="img" aria-label="Condenser approach trend chart"></svg></div><p class="status" id="trOut" aria-live="polite"></p><div id="trQ"></div>');
  var pick=-1;
  function tr(){var g='<line x1="20" y1="120" x2="310" y2="120" stroke="#343b45"/>';
    DAYS.forEach(function(val,k){var x=22+k*9.6, h=val*15; g+='<rect data-d="'+(k+1)+'" x="'+x+'" y="'+(120-h)+'" width="7.5" height="'+h+'" fill="'+(pick===k+1?"#ff9f43":k+1>=12?"#5a8f8a":"#2EC4B6")+'" style="cursor:pointer"/>';});
    g+='<text x="20" y="135" fill="#9AA0A6" font-size="9">day 1</text><text x="310" y="135" fill="#9AA0A6" font-size="9" text-anchor="end">day 30</text>';
    $("trSvg").innerHTML=g;
    each($("trSvg").querySelectorAll("rect[data-d]"),function(r){r.addEventListener("click",function(){pick=+r.getAttribute("data-d"); tr();
      if(Math.abs(pick-12)<=2){ $("trOut").innerHTML='<span class="ok">✓ Day '+pick+': that\'s where the approach starts creeping up (about day 12).</span>';
        var q=$("trQ"); q.innerHTML=""; EW.chooser(q,[{prompt:"Condenser approach creeping up week after week. What does it point to?",options:["Fouled condenser tubes","Low chilled water flow","Bad leaving-water sensor"],answer:0,why:"Scale and slime insulate the tubes, so refrigerant condenses hotter: high head pressure, more power. Plan a tube brushing and check water treatment."}],{label:"Question"}); }
      else $("trOut").innerHTML='<span class="no">Day '+pick+' isn\'t where it starts. Look for where the bars begin to climb.</span>';});});}
  tr();

  /* S9: case cards */
  var s9=S("w-s9","What's wrong? Case cards","");
  EW.chooser(s9,[
    {prompt:"Log: CHW 54→44°F, cond water 85→95°F, sat. condensing 103°F, sat. evap 42°F, amps 92% RLA, head pressure high.",options:["Fouled condenser tubes","Low refrigerant charge","Low chilled water flow","Bad sensor"],answer:0,why:"Condenser approach = 103 − 95 = 8°F (high) with normal ΔTs: heat isn't crossing the condenser tubes."},
    {prompt:"Log: CHW 58→44°F (ΔT 14°F, design 10), evap pressure low, chiller near freeze trip, condenser normal.",options:["Fouled condenser tubes","Low chilled water flow","Cooling tower fans off","Light building load"],answer:1,why:"High ΔT means low flow through the evaporator. Check strainer, pump, and valves."},
    {prompt:"Log: CHW 47→44°F (ΔT 3°F) at normal flow, chiller at 30% load, starting and stopping often.",options:["Light load / water bypassing coils","Low charge","Fouled condenser","High head pressure"],answer:0,why:"Low ΔT with normal flow points to light load or water bypassing coils (open 3-way valves), which also causes short cycling."},
    {prompt:"Log: sat. evap 36°F, LCHW 44°F (evap approach 8°F), condenser approach 2°F, ΔT normal, sight glass shows bubbles.",options:["Low refrigerant charge","Fouled condenser tubes","High condenser water temp","Bad flow switch"],answer:0,why:"High evaporator approach with a clean condenser and bubbles: low charge (or oil logging). Only a certified tech checks and charges."}],{label:"Case"});

  /* Action: chiller log sheet */
  S("w-action","Digital chiller log sheet",
    '<div class="grid2">'+EW.fld("a7ecw","Entering CHW °F","")+EW.fld("a7lcw","Leaving CHW °F","")+EW.fld("a7gpm","CHW GPM (if known)","")+EW.fld("a7sp","Leaving setpoint °F","")+EW.fld("a7se","Sat. evaporator °F","")+EW.fld("a7cwin","Entering cond. water °F","")+EW.fld("a7cwout","Leaving cond. water °F","")+EW.fld("a7sc","Sat. condensing °F","")+EW.fld("a7amps","% load or amps","")+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">CHW ΔT</span><span class="v" id="a7dt">–</span></div><div class="ro" id="a7eRo"><span class="k">Evap approach</span><span class="v" id="a7ea">–</span></div><div class="ro" id="a7cRo"><span class="k">Cond approach</span><span class="v" id="a7ca">–</span></div><div class="ro"><span class="k">Est. tons</span><span class="v" id="a7t">–</span></div></div>'+
    '<p class="lbl" style="margin-top:12px">Parts found:</p><div id="a7parts"></div>'+EW.chk("a7zach","Zach checked this (do the approaches look normal?)"));
  EW.checklist($("a7parts"),["Chilled water pump","Condenser water pump","Strainer","Air separator","AHU coil control valve"],"a7p");
  EW.keep(["a7ecw","a7lcw","a7gpm","a7sp","a7se","a7cwin","a7cwout","a7sc","a7amps","a7zach"],function(){
    var dt=v("a7ecw")-v("a7lcw"), ea=v("a7lcw")-v("a7se"), ca=v("a7sc")-v("a7cwout"), t=500*v("a7gpm")*dt/12000;
    $("a7dt").textContent=isFinite(dt)?fmt(dt,1)+"°F":"–"; $("a7ea").textContent=isFinite(ea)?fmt(ea,1)+"°F":"–"; $("a7ca").textContent=isFinite(ca)?fmt(ca,1)+"°F":"–"; $("a7t").textContent=isFinite(t)?fmt(t,0):"–";
    EW.setBand($("a7eRo"),band(ea)); EW.setBand($("a7cRo"),band(ca));});
})();
