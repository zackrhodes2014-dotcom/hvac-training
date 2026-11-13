/* HVAC Training: shared storage, progress, study stats, navigation, PWA wiring.
   Loaded in <head> of every page (before page scripts). No external dependencies. */
(function(){
  "use strict";
  var LEGACY_NS="hvacTraining:v1";              /* single blob used before profiles existed */
  var PKEY="hvacTraining:activeProfile";        /* ian | landon | admin */
  var PPREFIX="hvacTraining:v1:profile:";       /* per-profile state: hvacTraining:v1:profile:<id> */
  var PROFILES=[{id:"ian",name:"Ian"},{id:"landon",name:"Landon"},{id:"admin",name:"Admin"}];
  var NS=LEGACY_NS;
  var MODULES=[
    {id:"m1", num:1, title:"Foundations of Refrigeration and Air Conditioning", group:"ref", file:"m1.html", sections:6, action:false, oldPrefix:"hvac1:"},
    {id:"m4", num:4, title:"Energy and Matter", group:"ref", file:"m4.html", sections:6, action:true, oldPrefix:"hvac4:"},
    {id:"m5", num:5, title:"Gases", group:"ref", file:"m5.html", sections:6, action:true, oldPrefix:"hvac5:"},
    {id:"m6", num:6, title:"Boiler Room Fundamentals", group:"mech", file:"m6.html", sections:9, action:true},
    {id:"m7", num:7, title:"Chiller Fundamentals", group:"mech", file:"m7.html", sections:9, action:true},
    {id:"m8", num:8, title:"West Mechanical Field Notes", group:"mech", file:"m8.html", sections:13, action:true},
    {id:"m13", num:13, title:"Basic Electricity", group:"elec", file:"m13.html", sections:6, action:true},
    {id:"m14", num:14, title:"Electrical Power", group:"elec", file:"m14.html", sections:3, action:true},
    {id:"m15", num:15, title:"Basic Electronics", group:"elec", file:"m15.html", sections:4, action:true},
    {id:"m16", num:16, title:"Electric Motors", group:"elec", file:"m16.html", sections:5, action:true},
    {id:"m17", num:17, title:"Electrical Control Systems", group:"elec", file:"m17.html", sections:6, action:true},
    {id:"m18", num:18, title:"Electrical Troubleshooting", group:"elec", file:"m18.html", sections:4, action:true},
    {id:"m19", num:19, title:"Servicing Electric Motors and Controls", group:"elec", file:"m19.html", sections:5, action:true}
  ];
  var GROUPS=[{id:"ref",title:"Refrigeration Fundamentals"},{id:"mech",title:"Boilers & Chillers"},{id:"elec",title:"Electrical"}];
  var byId={}; MODULES.forEach(function(m,i){m.index=i; byId[m.id]=m;});

  var mem={}, canStore=true;
  try{localStorage.setItem(NS+":probe","1");localStorage.removeItem(NS+":probe");}catch(e){canStore=false;}
  function lsGet(k){if(!canStore) return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null; try{return localStorage.getItem(k);}catch(e){return null;}}
  function lsSet(k,v){if(!canStore){mem[k]=v;return false;} try{localStorage.setItem(k,v);return true;}catch(e){return false;}}
  function validPid(id){return id==="ian"||id==="landon"||id==="admin";}
  function activeProfile(){var v=lsGet(PKEY);return validPid(v)?v:"ian";}
  /* The profile is bound when the page loads, so in-memory state from one profile can never be written into another. */
  var pagePid=activeProfile();
  function keyFor(pid){return PPREFIX+(validPid(pid)?pid:pagePid);}
  function blank(){return {v:1,migrated:false,last:null,lastAt:0,modules:{},study:{cards:{},sel:null},ui:{}};}
  function read(pid){
    var raw=lsGet(keyFor(pid||pagePid));
    var o=null; try{o=raw?JSON.parse(raw):null;}catch(e){o=null;}
    if(!o||typeof o!=="object"||o.v!==1) o=blank();
    if(!o.modules||typeof o.modules!=="object") o.modules={};
    if(!o.study||typeof o.study!=="object") o.study={cards:{},sel:null};
    if(!o.study.cards) o.study.cards={};
    if(!o.ui) o.ui={};
    return o;
  }
  function write(o,pid){return lsSet(keyFor(pid||pagePid),JSON.stringify(o));}
  function cardsFor(mid){return (window.HVAC_CARDS&&window.HVAC_CARDS[mid])||[];}
  function moduleOfCard(id){return String(id).split("-")[0];}

  /* ---------- One-time migration from the standalone Module 1/4/5 apps (same origin) ---------- */
  function migrate(){
    if(!canStore) return;
    /* 1) the pre-profile single blob becomes Ian's profile (once), then is removed */
    try{
      var legacy=localStorage.getItem(LEGACY_NS);
      if(legacy!=null){ if(localStorage.getItem(keyFor("ian"))==null) localStorage.setItem(keyFor("ian"),legacy); localStorage.removeItem(LEGACY_NS); }
    }catch(e){}
    /* 2) standalone-app keys (hvac1:, hvac4:, hvac5:), once per profile.
          Pre-profile keys "hvacN:<key>" go to Ian only. The standalone apps later added their own
          per-profile keys "hvacN:<key>:profile:<id>"; those go to the matching profile here. */
    ["ian","landon","admin"].forEach(function(pid){
      var o=read(pid); if(o.migrated) return;
      var imported=[];
      MODULES.forEach(function(m){
        if(!m.oldPrefix) return;
        var plain={}, prof={};
        try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i); if(!k||k.indexOf(m.oldPrefix)!==0) continue;
          var sub=k.slice(m.oldPrefix.length), mm=sub.match(/^(.*):profile:(ian|landon|admin)$/);
          if(mm){ if(mm[2]===pid) prof[mm[1]]=localStorage.getItem(k); }
          else plain[sub]=localStorage.getItem(k);}}catch(e){}
        var src={}, k2;
        if(pid==="ian") for(k2 in plain) src[k2]=plain[k2];
        for(k2 in prof) src[k2]=prof[k2];               /* the profile-specific copy wins */
        var dst=o.modules[m.id]||{}, copied=0;
        for(k2 in src){
          if(k2==="probe"||k2.indexOf("dismiss:")===0||k2.indexOf("migrated:")===0||k2.indexOf("profile")===0) continue;
          if(!(k2 in dst)){dst[k2]=src[k2];copied++;}
        }
        if(!copied) return;
        o.modules[m.id]=dst;
        try{
          var P=JSON.parse(dst["progress:v1"]||"null");
          if(P&&P.results){
            for(var idx in P.results){
              var cid=m.id+"-c"+(Number(idx)+1), r=P.results[idx];
              var c=o.study.cards[cid]||(o.study.cards[cid]={seen:1,res:null,correct:0});
              c.seen=1; c.res=r; if(r==="got") c.correct=(c.correct||0)+1;
            }
            for(var s2 in (P.seen||{})){var id2=m.id+"-c"+(Number(s2)+1); if(!o.study.cards[id2]) o.study.cards[id2]={seen:1,res:null,correct:0};}
          }
        }catch(e){}
        imported.push(m.id);
      });
      o.migrated=true; o.migratedFrom=imported; write(o,pid);
    });
  }
  migrate();
  /* The safety-card unlock was removed: drop any stored safety ticks ("safety:<n>") from every profile. */
  (function purgeSafety(){ if(!canStore) return;
    ["ian","landon","admin"].forEach(function(pid){ var raw=lsGet(keyFor(pid)); if(!raw||raw.indexOf('"safety:')<0) return;
      var o=read(pid), ch=false; for(var mid in o.modules){ for(var k in o.modules[mid]){ if(k.indexOf("safety:")===0){delete o.modules[mid][k]; ch=true;} } } if(ch) write(o,pid); });
  })();

  /* ---------- Per-module key/value store (drop-in for the old store objects) ---------- */
  function store(mid){
    return {
      get:function(k){var o=read(),m=o.modules[mid];return (m&&Object.prototype.hasOwnProperty.call(m,k))?m[k]:null;},
      set:function(k,v){var o=read();(o.modules[mid]||(o.modules[mid]={}))[k]=String(v);return write(o);},
      del:function(k){var o=read();if(o.modules[mid]){delete o.modules[mid][k];write(o);}}
    };
  }
  function progress(mid){
    var raw=store(mid).get("progress:v1"); if(!raw) return null;
    try{var P=JSON.parse(raw);return (P&&P.v===1)?P:null;}catch(e){return null;}
  }
  function summary(mid){
    var m=byId[mid], P=progress(mid)||{}, N=cardsFor(mid).length||5;
    var secDone=0; for(var k in (P.sections||{})) if(P.sections[k]) secDone++;
    secDone=Math.min(secDone,m.sections);
    var got=0; for(var r in (P.results||{})) if(P.results[r]==="got") got++;
    var quizDone=got>=N, act=!!P.action;
    var units=m.sections+1+(m.action?1:0);
    var doneUnits=secDone+(quizDone?1:0)+(m.action&&act?1:0);
    return {secDone:secDone,secTotal:m.sections,best:P.best||0,got:got,quizN:N,quizDone:quizDone,action:act,
      units:units,doneUnits:doneUnits,done:doneUnits===units,last:P.last||null,started:!!(P.last||secDone||got||act||(P.seen&&Object.keys(P.seen).length))};
  }

  /* ---------- Study stats (shared by module quizzes and Flip Card Study) ---------- */
  var study={
    seen:function(cid){var o=read();var c=o.study.cards[cid]||(o.study.cards[cid]={seen:0,res:null,correct:0});c.seen=1;write(o);},
    result:function(cid,res){var o=read();var c=o.study.cards[cid]||(o.study.cards[cid]={seen:0,res:null,correct:0});
      c.seen=1;c.res=res;if(res==="got")c.correct=(c.correct||0)+1;c.t=Date.now();write(o);},
    stats:function(mid){var o=read(),list=cardsFor(mid),seen=0,ok=0,tries=0;
      list.forEach(function(cd){var c=o.study.cards[cd.id];if(c){if(c.seen)seen++;if(c.res==="got")ok++;tries+=c.correct||0;}});
      return {total:list.length,seen:seen,correct:ok,correctCount:tries};},
    card:function(cid){return read().study.cards[cid]||null;},
    reset:function(){var o=read();o.study.cards={};write(o);},
    getSel:function(){return read().study.sel;},
    setSel:function(sel){var o=read();o.study.sel=sel;write(o);}
  };

  function setLast(mid){var o=read();o.last=mid;o.lastAt=Date.now();write(o);}
  function resetModule(mid){var o=read();if(o.modules[mid]){delete o.modules[mid]["progress:v1"];}write(o);}
  function resetAll(){var o=read();var n=blank();n.migrated=true;n.ui=o.ui||{};write(n);}

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

  /* ---------- Module page chrome: home / prev / next ---------- */
  function injectNav(mid){
    var m=byId[mid]; if(!m) return;
    var prev=MODULES[m.index-1], next=MODULES[m.index+1];
    var top=document.createElement("nav"); top.className="appnav"; top.setAttribute("aria-label","Module navigation");
    top.innerHTML='<a class="an-home" href="./" aria-label="Back to all modules">⌂ Home</a>'+
      '<span class="an-title">Module '+m.num+'</span>'+
      (prev?'<a class="an-arrow" href="'+prev.file+'" aria-label="Previous: Module '+prev.num+' '+esc(prev.title)+'">‹ M'+prev.num+'</a>':'<span class="an-arrow off">‹</span>')+
      (next?'<a class="an-arrow" href="'+next.file+'" aria-label="Next: Module '+next.num+' '+esc(next.title)+'">M'+next.num+' ›</a>':'<a class="an-arrow" href="./">Done ⌂</a>');
    var pb=document.getElementById("progress"); if(pb&&pb.parentNode===document.body) document.body.insertBefore(top,pb.nextSibling); else document.body.insertBefore(top,document.body.firstChild);
    var bot=document.createElement("nav"); bot.className="modnav"; bot.setAttribute("aria-label","Previous and next module");
    bot.innerHTML=(prev?'<a class="mn prev" href="'+prev.file+'"><small>‹ Previous</small>Module '+prev.num+': '+esc(prev.title)+'</a>':'<span class="mn empty"></span>')+
      '<a class="mn home" href="./"><small>⌂</small>All modules</a>'+
      (next?'<a class="mn next" href="'+next.file+'"><small>Next ›</small>Module '+next.num+': '+esc(next.title)+'</a>':'<a class="mn next" href="study.html"><small>Next ›</small>Flip Card Study</a>');
    var foot=document.querySelector("footer");
    if(foot) foot.parentNode.insertBefore(bot,foot); else document.body.appendChild(bot);
    setLast(mid);
  }

  /* ---------- Profiles: switcher pill on every screen ---------- */
  var profileListeners=[];
  function onProfile(fn){profileListeners.push(fn);}
  function setProfile(pid){
    if(!validPid(pid)||pid===pagePid) return;
    lsSet(PKEY,pid);
    if(profileListeners.length){pagePid=pid; paintSwitchers(); profileListeners.forEach(function(fn){try{fn(pid);}catch(e){}});}
    else location.reload();   /* module pages hold state in memory: reload so nothing crosses profiles */
  }
  function resetProfile(){var o=read();var n=blank();n.migrated=true;n.ui=o.ui||{};write(n);}
  function profileName(pid){for(var i=0;i<PROFILES.length;i++) if(PROFILES[i].id===(pid||pagePid)) return PROFILES[i].name; return "Ian";}
  function paintSwitchers(){
    document.documentElement.setAttribute("data-profile",pagePid);
    Array.prototype.forEach.call(document.querySelectorAll(".profsw"),function(w){
      Array.prototype.forEach.call(w.querySelectorAll("button[data-pid]"),function(b){var on=b.getAttribute("data-pid")===pagePid;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
      var a=w.querySelector(".prof-admin"); if(a) a.hidden=pagePid!=="admin";
    });
  }
  function buildSwitcher(){
    var w=document.createElement("div"); w.className="profsw";
    w.innerHTML='<div class="prof-pill" role="group" aria-label="Profile">'+PROFILES.map(function(p){return '<button type="button" data-pid="'+p.id+'">'+p.name+'</button>';}).join("")+'</div>'+
      '<span class="prof-admin" hidden><span class="prof-tag">Admin / review mode</span><button type="button" class="prof-reset">Reset this profile</button></span>';
    Array.prototype.forEach.call(w.querySelectorAll("button[data-pid]"),function(b){b.addEventListener("click",function(){setProfile(b.getAttribute("data-pid"));});});
    w.querySelector(".prof-reset").addEventListener("click",function(){
      if(pagePid!=="admin") return;
      if(window.confirm("Reset the Admin profile? All Admin progress, quiz scores and study stats will be cleared. Ian's and Landon's progress is not touched.")){resetProfile(); location.reload();}
    });
    return w;
  }
  function mountSwitcher(){
    var slot=document.getElementById("profileSlot");
    if(!slot){ var h=document.querySelector("body > header")||document.querySelector("header");
      slot=document.createElement("div"); slot.className="prof-slot";
      if(h) h.insertBefore(slot,h.firstChild); else document.body.insertBefore(slot,document.body.firstChild); }
    slot.appendChild(buildSwitcher()); paintSwitchers();
    /* header "Learner" chip follows the active profile */
    Array.prototype.forEach.call(document.querySelectorAll("header .chip"),function(c){
      if(/^👤 Learner: /.test(c.textContent)) c.textContent=pagePid==="admin"?"👤 Admin review":"👤 Learner: "+profileName();});
  }
  /* another tab switched profiles: reload so this tab follows instead of writing stale state */
  window.addEventListener("storage",function(e){if(e.key===PKEY&&activeProfile()!==pagePid){ if(profileListeners.length){pagePid=activeProfile();paintSwitchers();profileListeners.forEach(function(fn){fn(pagePid);});} else location.reload(); }});

  /* ---------- Service worker + install prompt ---------- */
  var secure=location.protocol==="https:"||(location.protocol==="http:"&&/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname));
  var isStandalone=false;
  try{isStandalone=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||window.navigator.standalone===true;}catch(e){}
  var deferredPrompt=null, swReady=false;
  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault(); deferredPrompt=e;
    var b=document.getElementById("installBanner");
    if(b&&!isStandalone&&!read().ui.dismissInstall){b.hidden=false;document.body.classList.add("has-banner");}
  });
  window.addEventListener("appinstalled",function(){deferredPrompt=null;var o=read();o.ui.dismissInstall=1;write(o);
    ["installBanner","iosHint"].forEach(function(id){var e=document.getElementById(id);if(e)e.hidden=true;});});
  function wireInstall(){
    var b=document.getElementById("installBanner"), ios=document.getElementById("iosHint");
    if(!b) return;
    function hideB(el,flag){el.hidden=true;if(flag){var o=read();o.ui[flag]=1;write(o);}
      document.body.classList.toggle("has-banner",!b.hidden||(ios&&!ios.hidden));}
    document.getElementById("installBtn").addEventListener("click",function(){
      if(!deferredPrompt){hideB(b);return;}
      var p=deferredPrompt;deferredPrompt=null;
      try{p.prompt();if(p.userChoice)p.userChoice.then(function(c){hideB(b,c&&c.outcome==="accepted"?"dismissInstall":null);},function(){hideB(b);});else hideB(b);}catch(e){hideB(b);}
    });
    document.getElementById("installClose").addEventListener("click",function(){hideB(b,"dismissInstall");});
    var ua=navigator.userAgent||"";
    var isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    if(ios){
      if(isIOS&&!isStandalone&&!read().ui.dismissIos){ios.hidden=false;document.body.classList.add("has-banner");}
      document.getElementById("iosClose").addEventListener("click",function(){hideB(ios,"dismissIos");});
    }
  }
  if(secure&&"serviceWorker" in navigator){
    window.addEventListener("load",function(){
      navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready;}).then(function(){
        swReady=true; var c=document.getElementById("offlineChip"); if(c) c.hidden=false;
      }).catch(function(){});
    });
  }

  document.addEventListener("DOMContentLoaded",function(){
    var mid=document.body.getAttribute("data-module");
    mountSwitcher();
    if(mid) injectNav(mid);
    wireInstall();
  });

  window.HVAC={NS:NS,PKEY:PKEY,PPREFIX:PPREFIX,PROFILES:PROFILES,profile:function(){return pagePid;},profileName:profileName,setProfile:setProfile,onProfile:onProfile,resetProfile:resetProfile,keyFor:keyFor,MODULES:MODULES,GROUPS:GROUPS,byId:byId,read:read,write:write,store:store,progress:progress,summary:summary,
    cards:cardsFor,moduleOfCard:moduleOfCard,study:study,setLast:setLast,resetModule:resetModule,resetAll:resetAll,esc:esc,
    canStore:canStore,isStandalone:isStandalone};
})();
