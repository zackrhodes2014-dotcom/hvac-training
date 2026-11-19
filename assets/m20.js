/* Module 20 widgets: Boiler Room Fundamentals */
(function(){
  "use strict";
  var $=EW.$, v=EW.v, fmt=EW.fmt, S=EW.slot, each=EW.each;

  /* Hook: follow Zach */
  S("w-hook","The boiler that kept tripping",
    '<div class="svgbox"><svg viewBox="0 0 320 140" role="img" aria-label="Dark boiler room"><rect x="0" y="0" width="320" height="140" fill="#0a0f14"/>'+
    '<rect x="20" y="40" width="150" height="70" rx="30" fill="#2a3038" stroke="#59616c" stroke-width="2"/><rect x="40" y="55" width="26" height="18" rx="3" fill="#111"/><circle cx="53" cy="64" r="6" fill="#ff3b30" class="blink"/><text x="53" y="90" fill="#ff6b5b" font-size="9" text-anchor="middle">LOCKOUT</text>'+
    '<rect id="hz1" x="140" y="20" width="10" height="40" rx="3" fill="#1e2b38" stroke="#59616c"/><text x="145" y="15" fill="#9AA0A6" font-size="9" text-anchor="middle">glass</text>'+
    '<rect id="hz2" x="200" y="50" width="34" height="60" rx="8" fill="#1e2b38" stroke="#59616c"/><text x="217" y="124" fill="#9AA0A6" font-size="9" text-anchor="middle">softener</text><rect x="240" y="70" width="26" height="40" rx="4" fill="#1e2b38" stroke="#59616c"/><text x="253" y="124" fill="#9AA0A6" font-size="8" text-anchor="middle">brine</text>'+
    '<rect id="hz3" x="276" y="30" width="34" height="44" rx="2" fill="#1e2b38" stroke="#59616c"/><text x="293" y="88" fill="#9AA0A6" font-size="9" text-anchor="middle">log</text></svg></div>'+
    '<button type="button" id="hzBtn">👣 Follow Zach</button><div class="tree-node" id="hzOut" aria-live="polite">Lockout at 6 a.m. Where does Zach look first?</div>');
  var hzi=0, HZ=[["hz1","Gauge glass: the level is OK right now, so it's not a feed problem this minute.","#s1","Section 1: firetube basics"],["hz2","Softener hardness test: hard water is getting through. The brine tank is out of salt.","#s2","Section 2: water softeners"],["hz3","Last week's log sheet: stack temperature has been creeping up. Scale is insulating the tubes.","#s6","Section 6: safeties"]];
  $("hzBtn").addEventListener("click",function(){var h=HZ[hzi%3]; each(["hz1","hz2","hz3"],function(id){$(id).classList.remove("lit");}); $(h[0]).classList.add("lit");
    $("hzOut").innerHTML=h[1]+' <a href="'+h[2]+'" style="color:var(--accent)">'+h[3]+' →</a>'; hzi++;});

  /* S1: firetube explorer */
  var FT=[["Burner","Mixes fuel and air and fires into the furnace tube.",30,75],["Furnace (1st pass)","The big tube the flame fires into.",90,85],["2nd pass","Gases turn and come back through smaller tubes.",150,62],["3rd pass","Back again through another tube bank.",210,52],["4th pass / stack","Last pass, then out the stack.",270,40],["Steam space","Above the water line; steam collects here.",150,25],["Gauge glass","Shows the actual water level.",300,70],["Try cocks","Backup check: water or steam out?",300,95],["Pressure controls","Operating control, high limit (manual reset), relief valve.",240,15]];
  S("w-s1","Firetube cutaway explorer",
    '<div class="svgbox"><svg id="ftSvg" viewBox="0 0 320 130" role="img" aria-label="Firetube boiler cutaway"></svg></div>'+
    '<div class="chips" id="ftChips">'+FT.map(function(f,k){return '<button data-v="'+k+'">'+f[0]+'</button>';}).join("")+'</div><div class="tree-node" id="ftOut" aria-live="polite">Tap a part.</div><div class="row"><button type="button" id="ftFire">🔥 Fire it</button></div>');
  var fire=0, ftSel=-1, fti=null;
  function ft(){var g='<rect x="20" y="20" width="270" height="100" rx="40" fill="#1e2b38" stroke="#9AA0A6" stroke-width="2"/><rect x="22" y="'+(fire>4?42:40)+'" width="266" height="76" rx="34" fill="rgba(90,180,255,.25)"/>';
    g+='<line x1="30" y1="40" x2="290" y2="40" stroke="#5ab4ff" stroke-dasharray="5 4"/>';
    var passes=[[40,85,250,14],[60,62,220,8],[60,52,220,8],[60,72,220,8]];
    passes.forEach(function(p,k){var hot=fire>k; g+='<rect x="'+p[0]+'" y="'+(p[1]-p[3]/2)+'" width="'+p[2]+'" height="'+p[3]+'" rx="'+(p[3]/2)+'" fill="'+(hot?["#ff3b30","#ff6b3b","#ff9f43","#ffd166"][k]:"#2a3038")+'" stroke="#59616c"/>';});
    if(fire>4){for(var b=0;b<8;b++){g+='<circle cx="'+(50+b*30)+'" cy="'+(36-((Date.now()/80+b*7)%14))+'" r="3" fill="#cfe9ff" opacity=".8"/>';}}
    g+='<rect x="296" y="45" width="8" height="45" fill="#0f1114" stroke="#9AA0A6"/><rect x="297" y="62" width="6" height="27" fill="#5ab4ff"/>';
    FT.forEach(function(f,k){g+='<circle cx="'+f[2]+'" cy="'+f[3]+'" r="'+(k===ftSel?9:6)+'" fill="'+(k===ftSel?"#2EC4B6":"rgba(46,196,182,.4)")+'" stroke="#2EC4B6"/>';});
    $("ftSvg").innerHTML=g;}
  H.chipGroup($("ftChips"),function(k){ftSel=+k; $("ftOut").innerHTML="<b>"+FT[k][0]+"</b>: "+FT[k][1]; ft();});
  $("ftFire").addEventListener("click",function(){fire=0; clearInterval(fti); fti=setInterval(function(){fire++; $("ftOut").innerHTML=fire<=4?"Gases moving through pass "+fire+"…":"Water boiling; steam collects in the steam space. Keep the water line above the tubes!"; ft(); if(fire>30)clearInterval(fti);},500);});
  ft();

  /* S2: scale slider, regeneration stepper, capacity calculator */
  S("w-s2","Softener tools",
    '<p class="lbl"><b>Scale vs. fuel</b></p><label class="lbl" for="scS">Scale thickness: <b id="scSv">0</b>/32 in</label><input type="range" id="scS" min="0" max="8" value="1">'+
    '<div class="svgbox"><svg id="scSvg" viewBox="0 0 320 70" role="img" aria-label="Tube with scale"></svg></div><div class="readouts" aria-live="polite"><div class="ro" id="scRo"><span class="k">Extra fuel (rough)</span><span class="v" id="scF">–</span></div></div>'+
    '<p class="wnote">Rough teaching figure: about 2% more fuel per 1/32 inch of ordinary scale. Real losses depend on the scale type, and the tube metal runs hotter either way.</p>'+
    '<p class="lbl" style="margin-top:14px"><b>Regeneration step-through</b></p><div class="svgbox"><svg id="rgSvg" viewBox="0 0 320 110" role="img" aria-label="Resin beads"></svg></div><div class="tree-node" id="rgOut" aria-live="polite"></div><div class="row"><button type="button" class="secondary" id="rgPrev">‹</button><button type="button" id="rgNext">Next step ›</button></div>'+
    '<p class="lbl" style="margin-top:14px"><b>Capacity calculator</b></p><div class="grid3">'+EW.fld("cpG","Capacity (grains)",30000)+EW.fld("cpH","Hardness (gpg)",15)+EW.fld("cpD","Makeup gal/day",500)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Grains per day</span><span class="v" id="cpGD">–</span></div><div class="ro"><span class="k">Days between regens</span><span class="v" id="cpDays">–</span></div></div><p class="wnote">Typical estimate; real capacity depends on the salt setting.</p>');
  function sc(){var t=+$("scS").value; $("scSv").textContent=t; var f=2*t; $("scF").textContent="+"+f+"%"; EW.setBand($("scRo"),t===0?"band-g":t<=2?"band-y":"band-r");
    $("scSvg").innerHTML='<rect x="10" y="10" width="300" height="50" rx="25" fill="#9AA0A6"/><rect x="10" y="'+(14+t*1.5)+'" width="300" height="'+(42-t*3)+'" rx="20" fill="#e8dcc0"/><rect x="10" y="'+(18+t*1.5)+'" width="300" height="'+(34-t*3)+'" rx="16" fill="#5ab4ff" opacity=".5"/><text x="160" y="40" fill="#0f1720" font-size="11" text-anchor="middle">'+(t?"scale layer insulates the tube":"clean tube")+'</text>';}
  $("scS").addEventListener("input",sc); sc();
  var RG=[["Service","Hard water flows down; beads grab Ca/Mg and release sodium (Na).",0],["1. Backwash","Water flows UP to loosen packed resin and flush dirt.",1],["2. Brine draw / slow rinse","Strong brine pulled slowly through: sodium forces Ca/Mg off the beads and down the drain.",2],["3. Fast rinse","Quick downflow rinse washes out leftover brine and repacks the bed.",3],["4. Brine refill","Fresh water refills the brine tank so salt dissolves for next time.",4]], rgi=0;
  function rg(){var s=RG[rgi], g='<rect x="20" y="10" width="110" height="90" rx="12" fill="#1e2b38" stroke="#9AA0A6"/><rect x="200" y="30" width="90" height="70" rx="8" fill="#1e2b38" stroke="#9AA0A6"/><text x="245" y="25" fill="#9AA0A6" font-size="10" text-anchor="middle">brine tank</text>';
    for(var k=0;k<24;k++){var x=35+(k%6)*16, y=30+Math.floor(k/6)*18+(s[2]===1?Math.sin(k+Date.now()/300)*3:0), hard=s[2]===0?k<12:s[2]===2?k<6:s[2]===3||s[2]===4?false:k<12;
      g+='<circle cx="'+x+'" cy="'+y.toFixed(1)+'" r="6" fill="'+(hard?"#ff9f43":"#2EC4B6")+'"/>';}
    g+='<rect x="205" y="'+(s[2]===4?45:60)+'" width="80" height="'+(s[2]===4?50:35)+'" fill="#5ab4ff" opacity=".35"/><text x="75" y="108" fill="#9AA0A6" font-size="9" text-anchor="middle">orange = Ca/Mg · teal = Na</text>';
    g+='<text x="165" y="60" fill="#2EC4B6" font-size="18" text-anchor="middle">'+(s[2]===1?"⬆":s[2]===2?"⬅ brine":s[2]===4?"➡":"⬇")+'</text>';
    $("rgSvg").innerHTML=g; $("rgOut").innerHTML="<b>"+s[0]+"</b>: "+s[1];}
  $("rgNext").addEventListener("click",function(){rgi=(rgi+1)%RG.length;rg();}); $("rgPrev").addEventListener("click",function(){rgi=(rgi+RG.length-1)%RG.length;rg();}); rg();
  function cp(){var g=v("cpG"),h=v("cpH"),d=v("cpD"),gd=h*d,days=g/gd; $("cpGD").textContent=isFinite(gd)?fmt(gd,0):"–"; $("cpDays").textContent=isFinite(days)&&gd>0?fmt(days,1)+" days":"–";}
  ["cpG","cpH","cpD"].forEach(function(id){$(id).addEventListener("input",cp);}); cp();

  /* S3: DA chart + pressure slider */
  var SAT=[212,215.3,218.5,221.5,224.4,227.1,229.8,232.3,234.8,237.1,239.4];
  var DO=[[32,14.6],[50,11.3],[68,9.1],[86,7.6],[104,6.4],[140,4.7],[176,2.8],[194,1.7],[212,0.6],[230,0.05]];
  function doAt(t){for(var k=1;k<DO.length;k++){if(t<=DO[k][0]){var a=DO[k-1],b=DO[k];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}}return 0.05;}
  S("w-s3","Deaerator: temperature, pressure, oxygen",
    '<div class="svgbox"><svg id="daSvg" viewBox="0 0 320 150" role="img" aria-label="Dissolved oxygen versus temperature"></svg></div>'+
    '<label class="lbl" for="daT">Water temperature: <b id="daTv">180</b>°F</label><input type="range" id="daT" min="60" max="240" value="180">'+
    '<label class="lbl" for="daP">DA steam pressure: <b id="daPv">6</b> psig</label><input type="range" id="daP" min="0" max="10" step="1" value="6">'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Saturation temp at that pressure</span><span class="v" id="daSat">–</span></div><div class="ro" id="daORo"><span class="k">Dissolved O₂ (approx.)</span><span class="v" id="daO">–</span></div><div class="ro"><span class="k">Field check</span><span class="v" id="daChk" style="font-size:1rem">–</span></div></div>'+
    '<p class="wnote">Saturation temps from steam tables (0 psig 212°F, 3 ≈ 222°F, 5 ≈ 227°F, 6 ≈ 230°F, 10 ≈ 239°F). Oxygen values are rough, for open water near sea level, to show the trend. Water can\'t get hotter than saturation for its pressure.</p>'+
    '<div class="row"><button type="button" class="secondary" id="daMatch">Heat to saturation</button></div>');
  function da(){var p=+$("daP").value, sat=SAT[p], t=+$("daT").value; if(t>sat){t=Math.round(sat);$("daT").value=t;}
    $("daTv").textContent=t; $("daPv").textContent=p; $("daSat").textContent=fmt(sat,0)+"°F";
    var o=t>=sat-1?0.05:doAt(t); $("daO").textContent=fmt(o,2)+" ppm"; EW.setBand($("daORo"),o<0.5?"band-g":o<3?"band-y":"band-r");
    $("daChk").textContent=t>=sat-2?"✓ At saturation: gases leave":"✗ "+fmt(sat-t,0)+"°F below saturation: keeps its O₂";
    var X=function(T){return 30+(T-60)/180*280;}, Y=function(O){return 130-O/15*115;}, d="";
    for(var T=60;T<=240;T+=4){d+=(T>60?" L":"M")+X(T).toFixed(1)+" "+Y(T>=230?0.05:doAt(T)).toFixed(1);}
    var g='<line x1="30" y1="130" x2="310" y2="130" stroke="#343b45"/><line x1="30" y1="10" x2="30" y2="130" stroke="#343b45"/><path d="'+d+'" fill="none" stroke="#5ab4ff" stroke-width="2.5"/>';
    g+='<line x1="'+X(sat)+'" y1="10" x2="'+X(sat)+'" y2="130" stroke="#ff9f43" stroke-dasharray="4 3"/><text x="'+(X(sat)-4)+'" y="20" fill="#ff9f43" font-size="10" text-anchor="end">sat. '+fmt(sat,0)+'°F</text>';
    g+='<circle cx="'+X(t)+'" cy="'+Y(o)+'" r="6" fill="#2EC4B6"/><text x="34" y="18" fill="#9AA0A6" font-size="9">O₂ ppm</text><text x="300" y="145" fill="#9AA0A6" font-size="9" text-anchor="end">°F</text>';
    var nb=t>=sat-2?10:Math.max(0,Math.round((t-140)/12)); for(var k=0;k<nb;k++){g+='<circle cx="'+(200+(k%5)*20)+'" cy="'+(60-((Date.now()/40+k*13)%40))+'" r="3" fill="#cfe9ff" opacity=".7"/>';}
    $("daSvg").innerHTML=g;}
  $("daT").addEventListener("input",da); $("daP").addEventListener("input",da); $("daMatch").addEventListener("click",function(){$("daT").value=Math.round(SAT[+$("daP").value]);da();});
  setInterval(da,200); da();

  /* S4: condensate savings */
  S("w-s4","Condensate savings calculator",
    '<div class="grid2">'+EW.fld("csL","Steam load (lb/h)",2000)+EW.fld("csP","Condensate returned (%)",70)+EW.fld("csT","Condensate temp (°F)",180)+EW.fld("csM","Cold makeup temp (°F)",55)+'</div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Water saved / day</span><span class="v" id="csW">–</span></div><div class="ro"><span class="k">Heat saved / day</span><span class="v" id="csB">–</span></div><div class="ro"><span class="k">Fuel saved / day</span><span class="v" id="csF">–</span></div><div class="ro"><span class="k">Makeup (salt + chemicals) cut</span><span class="v" id="csC">–</span></div></div>'+
    '<div class="meter-fill"><div id="csBar"></div></div><p class="wnote">Assumes 24 h/day, 8.34 lb per gallon, 1 Btu per lb per °F, and an 80%-efficient boiler (1 therm = 100,000 Btu). Typical values for teaching.</p>');
  function cs(){var L=v("csL"),p=v("csP")/100,T=v("csT"),M=v("csM"),lb=L*24*p,gal=lb/8.34,btu=lb*(T-M),th=btu/100000/0.8;
    $("csW").textContent=isFinite(gal)?fmt(gal,0)+" gal":"–"; $("csB").textContent=isFinite(btu)?fmt(btu/1e6,2)+" MMBtu":"–"; $("csF").textContent=isFinite(th)?fmt(th,0)+" therms":"–"; $("csC").textContent=isFinite(p)?fmt(p*100,0)+"%":"–"; $("csBar").style.width=Math.max(0,Math.min(100,p*100))+"%";}
  ["csL","csP","csT","csM"].forEach(function(id){$(id).addEventListener("input",cs);}); cs();

  /* Shared water-level simulator (used in S5 and S6) */
  function levelSim(id,opts){
    var box=S(id,opts.title,
      '<div class="svgbox"><svg id="'+id+'Svg" viewBox="0 0 320 200" role="img" aria-label="Gauge glass water level"></svg></div>'+
      (opts.feed?'<div class="grid2">'+EW.fld(id+"Bp","Boiler / header pressure (psi)",115)+'</div><label class="lbl" for="'+id+'Fp">Feed pump discharge pressure: <b id="'+id+'Fpv">125</b> psi</label><input type="range" id="'+id+'Fp" min="80" max="150" value="125"><div class="row"><label class="toggle"><input type="checkbox" id="'+id+'Run" checked> Boiler steaming</label></div>':
        '<label class="lbl" for="'+id+'Lv">Drag the water level: <b id="'+id+'Lvv">62</b>%</label><input type="range" id="'+id+'Lv" min="0" max="80" value="62"><label class="toggle"><input type="checkbox" id="'+id+'Stuck"> Stuck primary float (sludge)</label><div class="row"><button type="button" class="secondary" id="'+id+'Reset">Manual reset (aux LWCO)</button></div>')+
      '<p class="status" id="'+id+'Out" aria-live="polite"></p>');
    var L=58, pump=false, auxTrip=false, prim=false;
    var POFF=62, PON=52, PRI=38, AUX=30, TUBES=22;
    function draw(){var g='<rect x="120" y="10" width="40" height="180" rx="8" fill="#0f1114" stroke="#9AA0A6" stroke-width="2"/>';
      var y=function(p){return 190-p*2.2;};
      g+='<rect x="122" y="'+y(L)+'" width="36" height="'+(190-y(L))+'" fill="#5ab4ff" opacity=".55"/>';
      var lines=[[POFF,"Pump off","#2EC4B6"],[PON,"Pump on","#2EC4B6"]]; if(!opts.feed){lines.push([PRI,"Primary LWCO","#ffd166"],[AUX,"Aux LWCO (manual reset)","#ff6b5b"]);} lines.push([TUBES,"Top of tubes","#ff6b5b"]);
      lines.forEach(function(l){g+='<line x1="100" y1="'+y(l[0])+'" x2="180" y2="'+y(l[0])+'" stroke="'+l[2]+'" stroke-dasharray="4 3"/><text x="186" y="'+(y(l[0])+4)+'" fill="'+l[2]+'" font-size="10">'+l[1]+'</text>';});
      var burnerOn=!prim&&!auxTrip&&(!opts.feed||$(id+"Run").checked);
      g+='<circle cx="50" cy="40" r="12" fill="'+(pump?"#2EC4B6":"#1e2b38")+'" stroke="#9AA0A6"/><text x="50" y="66" fill="#9AA0A6" font-size="10" text-anchor="middle">PUMP</text>';
      g+='<circle cx="50" cy="100" r="12" fill="'+(burnerOn?"#ff9f43":"#1e2b38")+'" stroke="#9AA0A6"/><text x="50" y="126" fill="#9AA0A6" font-size="10" text-anchor="middle">BURNER</text>';
      if(!opts.feed) g+='<rect x="20" y="145" width="62" height="24" rx="5" fill="'+(auxTrip?"#ff3b30":"#1e2b38")+'" '+(auxTrip?'class="blink"':'')+'/><text x="51" y="161" fill="#fff" font-size="8" text-anchor="middle">MANUAL RESET</text>';
      $(id+"Svg").innerHTML=g;}
    if(opts.feed){
      setInterval(function(){var bp=v(id+"Bp"), fp=+$(id+"Fp").value, run=$(id+"Run").checked; $(id+"Fpv").textContent=fp;
        if(L<=PON) pump=true; if(L>=POFF) pump=false;
        var flow=pump&&fp>bp?Math.min(1,(fp-bp)/8):0;
        L+=flow*0.9-(run?0.35:0); L=Math.max(0,Math.min(80,L)); prim=L<=TUBES+8;
        var msg;
        if(pump&&fp<=bp) msg='<span class="no">⚠️ No flow into boiler: feed pressure '+fp+' psi is not above boiler pressure '+bp+' psi. The pump runs but the level keeps falling.</span>';
        else if(pump) msg='<span class="ok">Pump on, feed '+fp+' psi > boiler '+bp+' psi: water goes in and the level rises.</span>'+(fp-bp<3?' (Barely above: slow fill.)':'');
        else msg="Pump off. Level drops slowly as water leaves as steam.";
        if(prim) msg+=' <span class="no">Level near the low water cutoff! The LWCO will shut the burner down.</span>';
        $(id+"Out").innerHTML=msg; draw();},200);
    } else {
      function upd(){L=+$(id+"Lv").value; $(id+"Lvv").textContent=L; var stuck=$(id+"Stuck").checked;
        pump=L<=PON; prim=!stuck&&L<=PRI; if(L<=AUX) auxTrip=true;
        var m=[]; if(pump)m.push("Pump On ✓"); if(prim)m.push("Primary LWCO tripped: burner off"); if(stuck&&L<=PRI&&!auxTrip)m.push('<span class="no">Primary float is stuck. Burner still firing!</span>');
        if(auxTrip)m.push('<span class="no">Aux LWCO tripped: burner locked out. MANUAL RESET needed. Find out why the water got low.</span>');
        if(stuck&&auxTrip)m.push("This is why there are two cutoffs: one stuck switch can't let the boiler run dry.");
        if(L<=TUBES)m.push('<span class="no">Water below the top of the tubes: metal overheats.</span>');
        $(id+"Out").innerHTML=m.join(" · ")||"Normal level."; draw();}
      $(id+"Lv").addEventListener("input",upd); $(id+"Stuck").addEventListener("change",upd);
      $(id+"Reset").addEventListener("click",function(){if(L>AUX+5){auxTrip=false;upd();} else $(id+"Out").innerHTML='<span class="no">Can\'t reset: the level is still low. Restore water first.</span>';});
      upd();
    }
  }
  levelSim("w-s5",{title:"Feed pressure vs. boiler pressure",feed:true});
  levelSim("w-s6",{title:"Water level simulator",feed:false});

  /* S7: blowdown trainer */
  S("w-s7","Blowdown valve sequence trainer",
    '<div class="svgbox"><svg id="bdSvg" viewBox="0 0 320 110" role="img" aria-label="Blowdown line with two valves"></svg></div>'+
    '<div class="chips" id="bdBtns"><button data-v="oq">Open quick-opening</button><button data-v="os">Open slow-opening (slowly)</button><button data-v="cs">Close slow-opening</button><button data-v="cq">Close quick-opening</button><button data-v="walk">🚶 Walk away</button></div>'+
    '<p class="status" id="bdOut" aria-live="polite">Zach\'s turn. Tap the steps in order.</p><div class="row"><button type="button" class="secondary" id="bdReset">↺ Start over</button></div><p class="wnote">A common sequence. Always follow the site\'s written procedure. Only Zach operates blowdown valves.</p>');
  var BD=["oq","os","cs","cq"], bdi=0, qOpen=false, sOpen=false, lvl=60;
  var BDM={oq:"Quick-opening valve open first.",os:"Slow-opening valve opened slowly: blowing down. Sludge leaving!",cs:"Close the slow-opening valve first.",cq:"Quick-opening valve closed last. Done. Never walk away during a blowdown."};
  function bdDraw(){var flow=qOpen&&sOpen, g='<rect x="10" y="10" width="90" height="70" rx="20" fill="#1e2b38" stroke="#9AA0A6"/><rect x="12" y="'+(80-lvl*0.9)+'" width="86" height="'+(lvl*0.9-2)+'" fill="#5ab4ff" opacity=".4"/><rect x="14" y="66" width="82" height="10" fill="#6b4a2a" opacity="'+(bdi>=2?0.2:0.9)+'"/>';
    g+='<path d="M55 80 V95 H300" stroke="'+(flow?"#ff9f43":"#59616c")+'" stroke-width="8" fill="none"/>';
    g+='<rect x="130" y="85" width="28" height="20" rx="3" fill="'+(qOpen?"#2EC4B6":"#4a525d")+'"/><text x="144" y="80" fill="#9AA0A6" font-size="9" text-anchor="middle">quick</text><rect x="200" y="85" width="28" height="20" rx="3" fill="'+(sOpen?"#2EC4B6":"#4a525d")+'"/><text x="214" y="80" fill="#9AA0A6" font-size="9" text-anchor="middle">slow</text>';
    g+='<rect x="270" y="40" width="40" height="45" rx="6" fill="#1e2b38" stroke="#9AA0A6"/><text x="290" y="35" fill="#9AA0A6" font-size="9" text-anchor="middle">separator</text>';
    if(flow){for(var k=0;k<6;k++){g+='<circle cx="'+(60+((Date.now()/5+k*40)%240))+'" cy="95" r="3" fill="#6b4a2a"/>';}}
    $("bdSvg").innerHTML=g;}
  each($("bdBtns").querySelectorAll("button"),function(b){b.type="button";b.addEventListener("click",function(){var s=b.getAttribute("data-v");
    if(s==="walk"){$("bdOut").innerHTML=(qOpen||sOpen)?'<span class="no">⚠️ Never leave while a blowdown valve is open. The boiler can lose water fast.</span>':"Valves closed. OK to move on.";return;}
    if(s===BD[bdi]){ if(s==="oq")qOpen=true; if(s==="os"){sOpen=true;lvl=54;} if(s==="cs")sOpen=false; if(s==="cq")qOpen=false; bdi++;
      $("bdOut").innerHTML='<span class="ok">✓ '+BDM[s]+'</span>'; }
    else{ var why={oq:"The quick-opening valve opens first, before the slow-opening valve.",os:"Open the quick-opening valve first, then blow with the slow-opening valve.",cs:"Close the slow-opening valve first after blowing.",cq:"The quick-opening valve closes LAST, after the slow-opening valve."}[BD[bdi]]||"";
      $("bdOut").innerHTML='<span class="no">Not that one yet. '+why+'</span>'; }});});
  $("bdReset").addEventListener("click",function(){bdi=0;qOpen=sOpen=false;lvl=60;$("bdOut").textContent="Tap the steps in order.";});
  setInterval(bdDraw,120);

  /* S8: traps */
  var s8=S("w-s9","Steam trap identifier","");
  EW.sorter(s8,["Thermostatic","F&T","Inverted bucket","Thermodynamic (disc)"],[
    {label:"Opens when cooler condensate or air reaches it",bin:0,why:"Thermostatic traps react to temperature."},
    {label:"Float drains water + separate air vent",bin:1,why:"Float and thermostatic: float for condensate, thermostatic vent for air."},
    {label:"Bucket floats and sinks to open/close",bin:2,why:"Inverted bucket."},
    {label:"Small disc snaps using flash steam",bin:3,why:"Thermodynamic (disc) traps cycle with a snapping sound."}]);
  var dg=document.createElement("div"); dg.innerHTML='<p class="lbl" style="margin-top:14px"><b>Diagnose it</b></p>'; s8.appendChild(dg);
  EW.chooser(dg,[{prompt:"The condensate return line right after a trap is scalding hot and you hear steam blowing through.",options:["Failed open","Failed closed"],answer:0,why:"Live steam is blowing into the return. Wastes fuel and overheats condensate units."},
    {prompt:"A unit heater coil is cold at the bottom and barely heats.",options:["Failed open","Failed closed"],answer:1,why:"Condensate is backing up in the coil, so steam can't get in."},
    {prompt:"Pipes bang loudly at startup near a trap.",options:["Failed open","Failed closed"],answer:1,why:"Backed-up condensate gets slammed by steam: water hammer."},
    {prompt:"The condensate receiver is venting lots of flash steam and the pump sounds like gravel.",options:["Failed open","Failed closed"],answer:0,why:"Leaking traps overheat condensate, which flashes and makes the pump cavitate."}],{label:"Symptom"});
  var prv=document.createElement("div");
  var PRV=[["Strainer","Upstream; catches scale and dirt before the PRV."],["High-side gauge","Shows header pressure going in."],["PRV","Drops header steam to a lower, steady pressure (pilot-operated holds it steady)."],["Low-side gauge","Shows the reduced pressure."],["Safety relief valve","Downstream, sized for the LOWER pressure."],["Bypass valve","Lets the line run while the PRV is serviced (manually throttled)."]];
  prv.innerHTML='<p class="lbl" style="margin-top:14px"><b>PRV station</b>: tap each part</p><div class="chips" id="prvC">'+PRV.map(function(p,k){return '<button data-v="'+k+'">'+(k+1)+'. '+p[0]+'</button>';}).join("")+'</div><div class="tree-node" id="prvO" aria-live="polite">Steam flows left to right through parts 1–5; the bypass goes around the PRV.</div>';
  s8.appendChild(prv); H.chipGroup($("prvC"),function(k){$("prvO").innerHTML="<b>"+PRV[k][0]+"</b>: "+PRV[k][1];});

  /* S9: steam vs hot water */
  var PARTS=[["Burner and firing controls",1,1],["Steam space / water line",1,0],["Gauge glass and try cocks",1,0],["Steam traps",1,0],["Daily bottom blowdown",1,0],["Pressure (psi) operating control and high limit",1,0],["Temperature operating control and high limit",0,1],["Expansion tank",0,1],["Circulators (pumps)",0,1],["Relief valve",1,1],["LWCO",1,1],["Lots of makeup water / softener",1,0]];
  S("w-s10","Steam vs. hot water boiler",'<div class="chips" id="cmpC"><button data-v="1">Steam boiler</button><button data-v="2">Hot water boiler</button></div><ul id="cmpL" class="clist" style="list-style:none;padding:0"></ul>');
  H.chipGroup($("cmpC"),function(k){var i=+k; $("cmpL").innerHTML=PARTS.map(function(p){var on=p[i]; return '<li class="tpill'+(on?" on":"")+'" style="display:block;text-align:left;margin:4px 0;'+(on?"":"opacity:.45;text-decoration:line-through")+'">'+(on?"✓ ":"✗ ")+p[0]+'</li>';}).join("");}).pick("1");

  /* Action: log sheet */
  S("w-action","Daily boiler log",
    '<div class="grid2">'+EW.txt("a6date","Date","")+EW.fld("a6psi","Steam pressure (psi)","")+EW.sel("a6lvl","Water level in glass",[["","–"],["normal","Normal (mid-glass)"],["low","Low"],["high","High"]])+EW.fld("a6stack","Stack temp (°F)","")+EW.fld("a6hard","Softener hardness (gpg)","")+EW.sel("a6regen","Softener regen mode",[["","–"],["meter","Meter"],["timer","Timer"]])+'</div>'+
    '<p class="result-big" id="a6hardOut" aria-live="polite"></p>'+
    '<p class="lbl" style="margin-top:12px">Softener shortcut</p><div class="grid3">'+EW.fld("a6cap","Capacity (grains)","")+EW.fld("a6gpg","Raw hardness (gpg)","")+EW.fld("a6gpd","Gal/day","")+'</div><p class="result-big" id="a6days" aria-live="polite"></p>'+
    EW.area("a6bd","Blowdown steps I watched (in order)","1. …")+EW.chk("a6zach","Zach checked this"));
  EW.keep(["a6date","a6psi","a6lvl","a6stack","a6hard","a6regen","a6cap","a6gpg","a6gpd","a6bd","a6zach"],function(){
    var h=v("a6hard"); $("a6hardOut").innerHTML=!isFinite(h)?"Enter the softened-water hardness.":h<=0.5?'<span class="ok">✓ Zero soft (about 0 gpg).</span>':'<span class="no">Hardness showing ('+h+' gpg). Check salt, bridging, and regeneration.</span>';
    var d=v("a6cap")/(v("a6gpg")*v("a6gpd")); $("a6days").textContent=isFinite(d)&&d>0?"About "+fmt(d,1)+" days between regenerations.":"Enter capacity, hardness and gal/day.";});

  /* ---------- S8: conductivity and automatic surface blowdown ---------- */
  function chipsC(id,list){return '<div class="chips" id="'+id+'">'+list.map(function(t,i){return '<button data-v="'+i+'">'+t+'</button>';}).join("")+'</div>';}
  function cardC(id,def){return '<div class="infocard" id="'+id+'" aria-live="polite">'+(def||"")+'</div>';}
  var ION=[["Na","Sodium (Na+)","Comes from the makeup water, and from sodium-based treatment chemicals. A softener adds sodium too.","#4ea8ff"],
           ["Ca","Calcium (Ca2+)","Makeup water. One of the two hardness ions (the scale-formers).","#ffd23f"],
           ["Mg","Magnesium (Mg2+)","Makeup water. The other hardness ion.","#ff9a3c"],
           ["Cl","Chloride (Cl-)","Makeup water. Stays dissolved and rides along into the boiler.","#3ecf6a"],
           ["SO4","Sulfate (SO4 2-)","Makeup water. Can combine with calcium into hard scale if it concentrates.","#b07cff"],
           ["HCO3","Bicarbonate (HCO3-)","Makeup water. Part of the alkalinity.","#ff5a5f"],
           ["SiO2","Silica","Makeup water. Dissolved, and watched closely because it can bake into hard deposits.","#d2a679"]];
  var IC={Na:6,Ca:3,Mg:2,Cl:4,SO4:2,HCO3:3,SiO2:1};
  S("w-s8","Tap the ion: what's in the water?",
    '<div class="svgbox"><svg id="ionSvg" viewBox="0 0 300 150" role="img" aria-label="Beaker of makeup water with dissolved ions"></svg></div>'+
    chipsC("ionC",ION.map(function(i){return i[1].split(" (")[0];}))+cardC("ionO","Tap an ion to see where it comes from.")+
    '<div class="row" style="margin-top:8px"><button type="button" id="ionSoft">Run it through the softener</button><button type="button" id="ionRet">Add return condensate</button><button type="button" class="secondary" id="ionReset">↺ Reset</button></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Conductivity (EXAMPLE index)</span><span class="v" id="ionCond">–</span></div><div class="ro" id="ionHRo"><span class="k">Hardness (EXAMPLE gpg)</span><span class="v" id="ionH">–</span></div></div>'+
    '<p class="wnote">Example numbers only. Each dot is a bundle of ions.</p>');
  var ions=[], ionSel=-1, ionDil=0;
  function ionInit(){ions=[];ionDil=0;var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280;}
    ION.forEach(function(t){for(var k=0;k<IC[t[0]];k++){ions.push({t:t[0],x:30+rnd()*240,y:22+rnd()*100,keep:true});}});}
  function ionDraw(){var g='<rect x="14" y="8" width="272" height="130" rx="14" fill="#10242e" stroke="#5ab4ff" stroke-width="2"/>';
    ions.forEach(function(d){if(!d.keep) return; var ti=0;ION.forEach(function(t,i){if(t[0]===d.t)ti=i;}); var on=ti===ionSel;
      g+='<circle cx="'+d.x.toFixed(0)+'" cy="'+d.y.toFixed(0)+'" r="'+(on?8:6)+'" fill="'+ION[ti][3]+'" stroke="'+(on?"#fff":"none")+'" stroke-width="2" opacity="'+(ionDil?0.85:1)+'"/>';});
    $("ionSvg").innerHTML=g;
    var n=0,h=0; ions.forEach(function(d){if(d.keep){n++; if(d.t==="Ca"||d.t==="Mg")h++;}});
    $("ionCond").textContent=n*30+" µS/cm"; $("ionH").textContent=h*3+" gpg"; EW.setBand($("ionHRo"),h?"band-y":"band-g");}
  ionInit(); ionDraw();
  H.chipGroup($("ionC"),function(i){ionSel=+i; $("ionO").innerHTML="<b>"+ION[ionSel][1]+":</b> "+ION[ionSel][2]; ionDraw();});
  $("ionSoft").addEventListener("click",function(){ions.forEach(function(d){if(d.t==="Ca"||d.t==="Mg")d.t="Na";}); $("ionO").innerHTML="<b>Softener:</b> calcium and magnesium swapped for sodium, one for one. <b>Hardness drops to zero, but the number of dissolved ions (and the conductivity) stays the same.</b> It is a swap, not a removal."; ionDraw();});
  $("ionRet").addEventListener("click",function(){ionDil++; var alive=ions.filter(function(d){return d.keep;}); for(var k=0;k<Math.ceil(alive.length*0.4);k++){alive[k*2%alive.length].keep=false; alive=ions.filter(function(d){return d.keep;});} $("ionO").innerHTML="<b>Return condensate:</b> nearly pure water, so it <b>dilutes</b> the feedwater. Conductivity falls, and so does the makeup you need."; ionDraw();});
  $("ionReset").addEventListener("click",function(){ionInit();ionSel=-1;$("ionO").textContent="Tap an ion to see where it comes from.";ionDraw();});

  var CY_FEED=350, CY_SP=3500;
  S("w-s8-2","Cycles of concentration (EXAMPLE numbers)",
    '<label class="lbl" for="cyS">Cycles of concentration: <b id="cySv">5</b></label><input type="range" id="cyS" min="1" max="30" value="5">'+
    '<div class="row"><label class="check-row"><input type="checkbox" id="cyV" checked> Automatic blowdown valve enabled</label></div>'+
    '<div class="svgbox"><svg id="cySvg" viewBox="0 0 300 150" role="img" aria-label="Boiler water tank with conductivity gauge and setpoint line"></svg></div>'+
    '<div class="readouts" aria-live="polite"><div class="ro" id="cyRo"><span class="k">Boiler water (EXAMPLE)</span><span class="v" id="cyC">–</span></div><div class="ro"><span class="k">Blowdown (share of feedwater)</span><span class="v" id="cyB">–</span></div></div>'+
    cardC("cyO","")+'<p class="wnote">EXAMPLE feedwater 350 µS/cm. The 3,500 µS/cm setpoint line is West Mechanical\'s recommended setpoint (as read on the MegaTron; confirm units on the controller). Not a real boiler.</p>');
  function cyDraw(){var c=+$("cyS").value, on=$("cyV").checked, raw=CY_FEED*c, capped=on&&raw>=CY_SP, shown=capped?CY_SP:raw, over=!on&&raw>CY_SP;
    $("cySv").textContent=c; $("cyC").textContent=Math.round(shown).toLocaleString("en-US")+" µS/cm"; $("cyB").textContent=fmt(100/c,1)+"%";
    EW.setBand($("cyRo"),over?"band-r":capped?"band-g":null);
    var fill=Math.min(1,shown/(CY_FEED*30)), spy=130-110*(CY_SP/(CY_FEED*30)), g='<rect x="30" y="10" width="140" height="130" rx="12" fill="#10242e" stroke="'+(over?"#ff5a5f":"#5ab4ff")+'" stroke-width="3"/>';
    g+='<rect x="32" y="'+(140-128*Math.max(.15,fill)+0).toFixed(0)+'" width="136" height="'+(128*Math.max(.15,fill)).toFixed(0)+'" fill="'+(over?"#5a2320":"#143a4a")+'"/>';
    var nd=Math.round(4+40*Math.min(1,shown/(CY_FEED*30))*(capped?0.6:1)); for(var k=0;k<nd;k++){g+='<circle cx="'+(40+(k*37)%120)+'" cy="'+(30+((k*53)%100))+'" r="3" fill="'+(over?"#ff8a80":"#7fd6ff")+'"/>';}
    g+='<line x1="30" y1="'+spy.toFixed(0)+'" x2="250" y2="'+spy.toFixed(0)+'" stroke="#ffd23f" stroke-width="2" stroke-dasharray="5 3"/><text x="252" y="'+(spy+3).toFixed(0)+'" fill="#ffd23f" font-size="8">setpoint</text>';
    g+='<rect x="200" y="30" width="16" height="100" fill="#0d0f12" stroke="#59616c"/><rect x="201" y="'+(130-98*Math.min(1,shown/(CY_FEED*30))).toFixed(0)+'" width="14" height="'+(98*Math.min(1,shown/(CY_FEED*30))).toFixed(0)+'" fill="'+(over?"#ff5a5f":"#2EC4B6")+'"/>';
    g+='<circle cx="250" cy="110" r="10" fill="'+(capped?"#3ecf6a":"#ff5a5f")+'"/><text x="250" y="132" fill="#9AA0A6" font-size="8" text-anchor="middle">valve '+(capped?"open":"closed")+'</text>';
    $("cySvg").innerHTML=g;
    $("cyO").innerHTML=over?"<b>Past the setpoint with the valve disabled.</b> Risks: 🫧 foaming, 💧 carryover into the steam header, and 🧱 scale on the tubes.":capped?"<b>At the setpoint the valve opens.</b> Hot salty water leaves, the dots thin out, and the reading falls back. The boiler holds near the setpoint.":"Below the setpoint: the valve stays closed and the salts keep concentrating as steam leaves.";}
  $("cyS").addEventListener("input",cyDraw); $("cyV").addEventListener("change",cyDraw); cyDraw();

  S("w-s8-3","Condensate return and blowdown (EXAMPLE numbers)",
    '<label class="lbl" for="crS">Condensate return: <b id="crSv">0</b>%</label><input type="range" id="crS" min="0" max="90" step="5" value="0">'+
    '<div class="readouts" aria-live="polite"><div class="ro"><span class="k">Feedwater (EXAMPLE)</span><span class="v" id="crF">–</span></div><div class="ro"><span class="k">Cycles</span><span class="v" id="crC">–</span></div><div class="ro" id="crBRo"><span class="k">Blowdown</span><span class="v" id="crB">–</span></div></div>'+
    '<p class="lbl" style="margin:8px 0 0">Blowdown, with this return</p><div class="bar alt"><i id="crBar" style="width:0;transition:width .2s"></i></div><p class="lbl" style="margin:6px 0 0">Blowdown, with 0% return</p><div class="bar"><i style="width:20%"></i></div>'+
    '<p class="wnote">Simplified EXAMPLE: makeup water 700 µS/cm, 3,500 µS/cm setpoint (West Mechanical recommended), returned condensate treated as nearly zero conductivity. Real boilers also have deaerator steam, chemicals, and varying return.</p>');
  function crDraw(){var r=+$("crS").value/100, feed=700*(1-r), cyc=3500/feed, bd=100/cyc;
    $("crSv").textContent=Math.round(r*100); $("crF").textContent=Math.round(feed)+" µS/cm"; $("crC").textContent=fmt(cyc,0); $("crB").textContent="about "+fmt(bd,0)+"%"; $("crBar").style.width=Math.min(100,bd)+"%"; EW.setBand($("crBRo"),bd<=10?"band-g":null);}
  $("crS").addEventListener("input",crDraw); crDraw();

  var CT=[["Conductivity","How well water carries electric current. Dissolved ions carry it, so more dissolved salts means a higher reading."],["TDS","Total dissolved solids: the salts dissolved in the water, in ppm. Roughly conductivity times a factor that isn't one fixed number."],
    ["µS/cm (microsiemens)","The unit conductivity is read in. Also written µmho/cm."],["Cycles of concentration","How many times saltier the boiler water is than the feedwater. Blowdown as a share of feedwater is about 1 divided by cycles."],
    ["Setpoint","The reading at which the controller opens the blowdown valve."],["Differential","How far the reading must fall below the setpoint before the valve closes again."],
    ["Skimmer line","The surface blowdown line that takes water from just under the water line."],["Carryover","Boiler water carried into the steam lines, often from foaming."],
    ["Priming","Water thrown into the steam outlet, usually from a high water level, low pressure, or a sudden big steam demand."],["Foaming","Bubbles that stop popping at the surface and fill the steam space with foam."]];
  S("w-s8-4","Term chips: tap for a definition",chipsC("ctC",CT.map(function(t){return t[0];}))+cardC("ctO","Tap a term."));
  H.chipGroup($("ctC"),function(i){var t=CT[+i]; $("ctO").innerHTML="<b>"+t[0]+":</b> "+t[1];});
})();
