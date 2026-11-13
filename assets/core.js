/* Shared lesson core for Modules 4, 5 and 13-19 (adapted from the standalone Module 4/5 apps). */
/* ===== shared core (adapted from HVAC Module 1) ===== */
var H=(function(){
  "use strict";
  var store=HVAC.store(CFG.mid);
  function $(id){return document.getElementById(id);}
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function each(list,fn){Array.prototype.forEach.call(list,fn);}
  function num(v){var n=parseFloat(String(v).replace(/,/g,""));return isFinite(n)?n:NaN;}
  function fmt(n,d){if(!isFinite(n))return "–";d=d==null?2:d;var s=Number(n).toFixed(d);
    var p=s.split(".");p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");return p.join(".");}
  var reduceMotion=false;
  try{reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}

  /* ---------- Saved progress (versioned) ---------- */
  var PKEY="progress:v1";
  var CONTENT_SECTIONS=CFG.sections;
  var ITEMS=CONTENT_SECTIONS.concat(["quiz","action"]);
  function defaults(){return {v:1,seen:{},flipped:{},results:{},best:0,streak:0,bestStreak:0,sections:{},action:false,last:null};}
  function loadP(){
    var raw=store.get(PKEY), d=defaults();
    if(!raw) return d;
    try{
      var o=JSON.parse(raw);
      if(!o||typeof o!=="object"||o.v!==1) return d;
      for(var k in d){ if(!(k in o)||o[k]===null&&d[k]!==null) o[k]=d[k]; }
      return o;
    }catch(e){return d;}
  }
  var P=loadP();
  var canSave=store.set("probe","1"); store.del("probe");
  function saveP(){store.set(PKEY,JSON.stringify(P));}

  /* Reading progress bar */
  var bar=$("progress");
  function onScroll(){
    var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    var pct=max>0?Math.min(100,Math.round(h.scrollTop/max*100)):0;
    bar.style.width=pct+"%"; bar.setAttribute("aria-valuenow",pct);
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  onScroll();

  /* Term chips: tap to open a short definition */
  each(document.querySelectorAll(".terms"),function(row){
    var pop=el("div","term-pop"); pop.setAttribute("aria-live","polite"); row.parentNode.insertBefore(pop,row.nextSibling);
    each(row.querySelectorAll(".term"),function(b){
      b.type="button"; b.setAttribute("aria-expanded","false");
      b.addEventListener("click",function(){
        var open=b.getAttribute("aria-expanded")==="true";
        each(row.querySelectorAll(".term"),function(o){o.setAttribute("aria-expanded","false");});
        if(open){pop.classList.remove("show");return;}
        b.setAttribute("aria-expanded","true");
        pop.innerHTML="<strong>"+b.textContent+":</strong> "+b.getAttribute("data-def");
        pop.classList.add("show");
      });
    });
  });

  /* Predict and reveal */
  each(document.querySelectorAll(".predict"),function(box){
    var id=box.getAttribute("data-id");
    var ta=box.querySelector("textarea"), btn=box.querySelector(".reveal");
    var ans=box.querySelector(".answer"), yours=box.querySelector(".yours");
    var openLabel=btn.getAttribute("data-label")||"Reveal answer";
    var saved=store.get("pred:"+id); if(saved) ta.value=saved;
    ta.addEventListener("input",function(){store.set("pred:"+id,ta.value);});
    btn.addEventListener("click",function(){
      var show=!ans.classList.contains("show");
      ans.classList.toggle("show",show);
      var v=ta.value.trim();
      yours.querySelector("span").textContent=v;
      yours.classList.toggle("show",show&&v.length>0);
      btn.textContent=show?"Hide answer":openLabel;
      btn.setAttribute("aria-expanded",String(show));
    });
  });

  /* Flip cards + Got it / Missed it + flame streak */
  var CARDS=HVAC.cards(CFG.mid);
  var quiz=CARDS.map(function(c){return [c.q,c.a];});
  var N=quiz.length;
  var wrap=$("cards"), cards=[];
  var countEl=$("flipCount"), fill=$("qbarFill");
  function gotCount(){var g=0;for(var k in P.results){if(P.results[k]==="got")g++;}return g;}
  function answeredCount(){return Object.keys(P.results).length;}
  function updateCount(){
    var n=Object.keys(P.seen).length;
    countEl.textContent="Cards flipped: "+n+"/"+N+(n===N?" 🎉":"");
    fill.style.width=(gotCount()/N*100)+"%";
  }
  function setStat(id,html){var e=$(id);if(e)e.innerHTML=html;}
  function updateScore(){
    var g=gotCount(), a=answeredCount();
    $("scoreLine").innerHTML="Score: <b>"+g+"/"+N+"</b>"+(a<N?" ("+a+" checked)":(g===N?" 🏆 Perfect!":""))+
      " · Best: <b>"+P.best+"/"+N+"</b>";
    $("streakBig").innerHTML='<span class="flame" aria-hidden="true">'+(CFG.streakIcon||"🔥")+'</span> Streak: <b>'+P.streak+"</b> <small>(best "+P.bestStreak+")</small>";
    setStat("statScore","Quiz: <b>"+g+"/"+N+"</b>");
    setStat("statBest","Best score: <b>"+P.best+"/"+N+"</b>");
    setStat("statStreak",(CFG.streakIcon||"🔥")+" Streak: <b>"+P.streak+"</b> (best "+P.bestStreak+")");
    if(typeof paintItems==="function") paintItems();
  }
  quiz.forEach(function(qa,i){
    var card=el("div","card"); card.tabIndex=0; card.setAttribute("role","button");
    card.setAttribute("aria-pressed","false");
    card.setAttribute("aria-label","Question "+(i+1)+": "+qa[0]+". Activate to flip.");
    var inner=el("div","card-inner");
    var front=el("div","face front"); front.appendChild(el("div","tag","Question "+(i+1)));
    front.appendChild(el("div","txt",qa[0])); front.appendChild(el("div","hint","Tap to flip ↻"));
    var back=el("div","face back"); back.appendChild(el("div","tag","Answer "+(i+1)));
    back.appendChild(el("div","txt",qa[1]));
    var sc=el("div","selfcheck"); sc.setAttribute("role","group");
    sc.setAttribute("aria-label","Self-check for question "+(i+1));
    sc.appendChild(el("span","sc-q","Did you get it?"));
    var gotB=el("button","sc-btn got","✓ Got it"), missB=el("button","sc-btn miss","✗ Missed it");
    gotB.type="button"; missB.type="button";
    sc.appendChild(gotB); sc.appendChild(missB); back.appendChild(sc);
    back.appendChild(el("div","hint","Tap to flip back ↻"));
    back.setAttribute("aria-hidden","true");
    inner.appendChild(front); inner.appendChild(back); card.appendChild(inner);
    function isFlipped(){return card.classList.contains("flipped");}
    function setTabs(f){gotB.tabIndex=f?0:-1; missB.tabIndex=f?0:-1;}
    function paint(){
      var r=P.results[i];
      gotB.classList.toggle("on",r==="got"); gotB.setAttribute("aria-pressed",String(r==="got"));
      missB.classList.toggle("on",r==="miss"); missB.setAttribute("aria-pressed",String(r==="miss"));
    }
    function setFlipped(f,persist){
      card.classList.toggle("flipped",f);
      card.setAttribute("aria-pressed",String(f));
      front.setAttribute("aria-hidden",String(f)); back.setAttribute("aria-hidden",String(!f));
      card.setAttribute("aria-label",(f?"Answer "+(i+1)+": "+qa[1]:"Question "+(i+1)+": "+qa[0])+". Activate to flip.");
      setTabs(f);
      if(persist){
        if(f){P.seen[i]=1;P.flipped[i]=1;HVAC.study.seen(CARDS[i].id);}else{delete P.flipped[i];}
        saveP();
      }
      updateCount();
    }
    function mark(res){
      if(P.results[i]===res) return;
      P.results[i]=res; HVAC.study.result(CARDS[i].id,res);
      if(res==="got"){P.streak++; if(P.streak>P.bestStreak)P.bestStreak=P.streak;}
      else{P.streak=0;}
      var g=gotCount(); if(g>P.best)P.best=g;
      saveP(); paint(); updateScore(); updateCount();
    }
    gotB.addEventListener("click",function(e){e.stopPropagation();mark("got");});
    missB.addEventListener("click",function(e){e.stopPropagation();mark("miss");});
    card.addEventListener("click",function(e){
      if(e.target.closest&&e.target.closest(".selfcheck")) return;
      setFlipped(!isFlipped(),true);
    });
    card.addEventListener("keydown",function(e){
      if(e.target!==card) return;
      if(e.key==="Enter"||e.key===" "||e.key==="Spacebar"){e.preventDefault();setFlipped(!isFlipped(),true);}
    });
    setTabs(false); paint();
    if(P.flipped[i]){ card.classList.add("no-anim"); setFlipped(true,false); }
    wrap.appendChild(card);
    cards.push({setFlipped:setFlipped,paint:paint,card:card});
  });
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    each(wrap.querySelectorAll(".no-anim"),function(c){c.classList.remove("no-anim");});
  });});
  function resetCardsUI(){
    cards.forEach(function(c){c.setFlipped(false,false);});
    P.seen={}; P.flipped={}; P.results={}; P.streak=0;
    cards.forEach(function(c){c.paint();});
  }
  $("resetCards").addEventListener("click",function(){
    resetCardsUI(); saveP(); updateCount(); updateScore();
  });

  /* ---------- Section / quiz / action completion ---------- */
  function sectionTitle(id){
    var s=$(id), h=s&&s.querySelector("h2");
    return h?h.textContent.replace(/\s+/g," ").trim():id;
  }
  var segWrap=$("segBar");
  ITEMS.forEach(function(id){var d=el("div");d.setAttribute("data-item",id);d.title=id;segWrap.appendChild(d);});
  function itemDone(id){
    if(id==="quiz") return gotCount()===N;
    if(id==="action") return !!P.action;
    return !!P.sections[id];
  }
  function paintItems(){
    var done=0,secDone=0;
    ITEMS.forEach(function(id){
      var on=itemDone(id); if(on)done++;
      var seg=segWrap.querySelector('[data-item="'+id+'"]'); if(seg) seg.classList.toggle("on",on);
      if(id!=="quiz"&&id!=="action"&&on) secDone++;
      var s=$(id==="action"?"action":id); if(s) s.classList.toggle("sec-done",on);
      var a=document.querySelector('nav.toc a[href="#'+id+'"]'); if(a) a.classList.toggle("done",on);
    });
    CONTENT_SECTIONS.forEach(function(id){
      var on=!!P.sections[id];
      var b=document.querySelector('.mark-done[data-sec="'+id+'"]');
      if(b){
        b.classList.toggle("done",on); b.setAttribute("aria-pressed",String(on));
        b.textContent=on?"✓ Section complete (tap to undo)":"Mark section complete";
      }
    });
    var T=CONTENT_SECTIONS.length;
    setStat("statSections","<b>"+secDone+"/"+T+"</b> sections complete"+(secDone===T?" 🎉":""));
    setStat("statItems","Overall: <b>"+done+"/"+ITEMS.length+"</b> (sections + quiz + action item)");
    var ac=$("actionDone"); if(ac) ac.checked=!!P.action;
  }
  each(document.querySelectorAll(".mark-done"),function(b){
    b.addEventListener("click",function(){
      var id=b.getAttribute("data-sec");
      if(P.sections[id]) delete P.sections[id]; else P.sections[id]=true;
      saveP(); paintItems();
    });
  });
  var ad=$("actionDone");
  if(ad) ad.addEventListener("change",function(){P.action=ad.checked; saveP(); paintItems();});
  updateCount(); updateScore(); paintItems();

  /* ---------- Last viewed section + resume ---------- */
  var resumeBtn=$("resumeBtn"), savedLast=P.last;
  if(savedLast && savedLast!==CFG.firstId && $(savedLast) && !location.hash){
    resumeBtn.textContent="▶ Resume where you left off: "+sectionTitle(savedLast);
    resumeBtn.hidden=false;
  }
  resumeBtn.addEventListener("click",function(){
    var t=$(savedLast);
    resumeBtn.hidden=true;
    if(t) t.scrollIntoView({block:"start"});
  });
  var tracking=false, current=null, lastSaveT=null;
  function recordCurrent(){
    if(!tracking||!current||P.last===current) return;
    P.last=current;
    clearTimeout(lastSaveT); lastSaveT=setTimeout(saveP,250);
  }
  function startTracking(){ if(!tracking){tracking=true; recordCurrent();} }
  window.addEventListener("scroll",startTracking,{passive:true});
  window.addEventListener("hashchange",startTracking);
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting) current=en.target.id; });
      recordCurrent();
    },{rootMargin:"-35% 0px -60% 0px",threshold:0});
    each(document.querySelectorAll("main > section[id]"),function(s){io.observe(s);});
  }

  /* ---------- Reset all progress ---------- */
  $("resetProgress").addEventListener("click",function(){
    if(!window.confirm("Reset your progress? This clears quiz scores (including best score and streaks), completed sections, the action-item check, and your resume spot. Your typed predictions and worksheet entries are kept.")) return;
    resetCardsUI();
    P=defaults(); saveP();
    updateCount(); updateScore(); paintItems();
    resumeBtn.hidden=true;
  });
  if(!canSave){ $("storageNote").textContent="⚠️ This browser isn't allowing saved data (private mode?), so progress won't be remembered."; }

  /* PWA wiring lives in assets/common.js (one app-wide manifest + service worker). */

  /* helpers for module widgets */
  function persistInput(inp,key){
    var v=store.get("f:"+key); if(v!=null&&v!=="") inp.value=v;
    inp.addEventListener("input",function(){store.set("f:"+key,inp.value);});
    inp.addEventListener("change",function(){store.set("f:"+key,inp.value);});
  }
  function chipGroup(container,onPick){
    var btns=container.querySelectorAll("button");
    function pick(b){each(btns,function(o){o.setAttribute("aria-pressed",String(o===b));}); onPick(b.getAttribute("data-v"),b);}
    each(btns,function(b){b.type="button";b.setAttribute("aria-pressed","false");b.addEventListener("click",function(){pick(b);});});
    return {pick:function(v){each(btns,function(b){if(b.getAttribute("data-v")===v)pick(b);});}};
  }
  return {store:store,$:$,el:el,each:each,num:num,fmt:fmt,reduceMotion:reduceMotion,persistInput:persistInput,chipGroup:chipGroup};
})();

