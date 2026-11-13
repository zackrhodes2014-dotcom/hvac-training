/* Home screen: module grid, progress, continue, resets */
(function(){
  "use strict";
  var H=window.HVAC, $=function(id){return document.getElementById(id);};
  function confirmBox(msg,yes){var d=$("confirmDlg");$("cfMsg").textContent=msg;d.hidden=false;$("cfNo").focus();
    function close(){d.hidden=true;$("cfYes").onclick=null;$("cfNo").onclick=null;}
    $("cfNo").onclick=close; $("cfYes").onclick=function(){close();yes();};}
  function render(){
    var pid=H.profile(), nm=H.profileName();
    $("heroSub").textContent=pid==="admin"?"Admin / review mode: progress here is separate from the learners.":nm+"'s training path, built up from the fundamentals.";
    $("resetWho").textContent=nm; $("migNote").hidden=true;
    var o=H.read(), all=H.MODULES.map(function(m){return {m:m,s:H.summary(m.id)};});
    var units=0,doneU=0,doneM=0,secs=0,secT=0;
    all.forEach(function(x){units+=x.s.units;doneU+=x.s.doneUnits;if(x.s.done)doneM++;secs+=x.s.secDone;secT+=x.s.secTotal;});
    var pct=units?Math.round(doneU/units*100):0;
    $("ovPct").textContent=pct+"%"; $("ovBar").style.width=pct+"%"; $("ovBarWrap").setAttribute("aria-valuenow",pct);
    $("ovMods").textContent=doneM+" of "+all.length+" modules done"; $("ovSecs").textContent=secs+"/"+secT+" sections";
    var rec=null; for(var i=0;i<all.length;i++){if(!all[i].s.done){rec=all[i].m;break;}}
    var c=$("continueBtn");
    if(o.last&&H.byId[o.last]){var lm=H.byId[o.last], ls=H.summary(lm.id);
      c.href=lm.file+(ls.last?"#"+ls.last:""); c.textContent="▶ Continue where you left off: M"+lm.num+" "+lm.title;}
    else if(rec){c.href=rec.file; c.textContent="▶ Start with Module "+rec.num;}
    if(o.migratedFrom&&o.migratedFrom.length){$("migNote").hidden=false;$("migNote").textContent="✓ Progress from the earlier standalone apps ("+o.migratedFrom.map(function(id){return H.byId[id]?"Module "+H.byId[id].num:id;}).join(", ")+") was imported.";}
    var seen=0,tot=0; H.MODULES.forEach(function(m){var st=H.study.stats(m.id);seen+=st.seen;tot+=st.total;});
    $("studySum").textContent="("+seen+"/"+tot+" cards seen)";
    var g=$("groups"); g.innerHTML="";
    H.GROUPS.forEach(function(gr){
      var h=document.createElement("h2");h.className="group";h.textContent=gr.title;g.appendChild(h);
      var box=document.createElement("div");box.className="mods";g.appendChild(box);
      all.filter(function(x){return x.m.group===gr.id;}).forEach(function(x){
        var m=x.m,s=x.s,isRec=rec&&rec.id===m.id, p=Math.round(s.doneUnits/s.units*100);
        var wrap=document.createElement("div");
        wrap.innerHTML='<a class="mod'+(s.done?" done":"")+(isRec?" rec":"")+'" href="'+m.file+'" data-mid="'+m.id+'">'+
          (isRec?'<span class="recb">★ Recommended next</span><br>':'')+
          '<span class="num">Module '+m.num+'</span><div class="title">'+H.esc(m.title)+'</div>'+
          '<span class="check" aria-label="'+(s.done?"Done":"Not done")+'">✓</span>'+
          '<div class="meta"><span>Sections <b class="secs">'+s.secDone+'/'+s.secTotal+'</b></span><span>Best quiz <b class="best">'+s.best+'/'+s.quizN+'</b></span>'+(m.action?'<span>Action item '+(s.action?'<b>✓</b>':'<b>–</b>')+'</span>':'')+'</div>'+
          '<div class="bar sm"><i style="width:'+p+'%"></i></div></a>'+
          (s.started?'<div class="mod-actions"><button type="button" class="linkbtn" data-reset="'+m.id+'">Reset Module '+m.num+'</button></div>':'');
        while(wrap.firstChild) box.appendChild(wrap.firstChild);
      });
    });
    Array.prototype.forEach.call(g.querySelectorAll("[data-reset]"),function(b){b.addEventListener("click",function(){
      var m=H.byId[b.getAttribute("data-reset")];
      confirmBox("Reset "+H.profileName()+"'s progress for Module "+m.num+": "+m.title+"? Sections, quiz score and the action item will be cleared.",function(){H.resetModule(m.id);render();});});});
  }
  $("resetAll").addEventListener("click",function(){confirmBox("Reset ALL of "+H.profileName()+"'s progress in every module, plus Flip Card Study stats? Other profiles are not touched. This can't be undone.",function(){H.resetAll();render();});});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("confirmDlg").hidden)$("cfNo").click();});
  window.addEventListener("pageshow",render);
  H.onProfile(render);
  render();
})();
