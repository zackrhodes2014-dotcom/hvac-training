/* Shared helpers for the electrical modules (13-19): safety gate, unlock animation, widget builders. */
var EW=(function(){
  "use strict";
  var $=H.$, store=H.store, num=H.num, fmt=H.fmt, each=H.each;
  var SVGNS="http://www.w3.org/2000/svg";
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function slot(id,title,inner){var b=$(id); if(!b) return null; b.innerHTML='<span class="wtitle">'+title+'</span>'+inner; return b;}
  function fld(id,label,val,extra){
    return '<div class="fld"><label for="'+id+'">'+label+'</label><input type="number" inputmode="decimal" step="any" id="'+id+'"'+
      (val!=null&&val!==""?' value="'+val+'"':'')+(extra||'')+'></div>';
  }
  function txt(id,label,ph){return '<div class="fld"><label for="'+id+'">'+label+'</label><input type="text" id="'+id+'" placeholder="'+esc(ph||"")+'"></div>';}
  function area(id,label,ph){return '<div class="fld"><label for="'+id+'">'+label+'</label><textarea id="'+id+'" placeholder="'+esc(ph||"")+'"></textarea></div>';}
  function sel(id,label,opts){return '<div class="fld"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+opts.map(function(o){
      var v=Array.isArray(o)?o[0]:o, t=Array.isArray(o)?o[1]:o; return '<option value="'+esc(v)+'">'+esc(t)+'</option>';}).join("")+'</select></div>';}
  function chk(id,label){return '<label class="check-row"><input type="checkbox" id="'+id+'"> '+label+'</label>';}
  /* persist the listed inputs (text/number/select/checkbox) in this module's store */
  function keep(ids,cb){
    ids.forEach(function(id){
      var e=$(id); if(!e) return;
      if(e.type==="checkbox"){
        var v=store.get("f:"+id); if(v!=null) e.checked=v==="1";
        e.addEventListener("change",function(){store.set("f:"+id,e.checked?"1":"0"); if(cb)cb();});
      } else {
        H.persistInput(e,id);
        if(cb){e.addEventListener("input",cb);e.addEventListener("change",cb);}
      }
    });
    if(cb) cb();
  }
  function v(id){return num($(id).value);}
  function svg(tag,attrs){var e=document.createElementNS(SVGNS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e;}
  function setBand(elm,cls){elm.classList.remove("band-g","band-y","band-r"); if(cls) elm.classList.add(cls);}

  /* Scenario chooser: one prompt at a time, pick an option, see why. */
  function chooser(box,rounds,opts){
    opts=opts||{};
    var key="ch:"+box.id, i=0, score=0, answered=false;
    var wrap=document.createElement("div"); wrap.className="chooser"; box.appendChild(wrap);
    function render(){
      var r=rounds[i];
      wrap.innerHTML='<p class="ch-count">'+(opts.label||"Card")+' '+(i+1)+' of '+rounds.length+' · Score '+score+'</p>'+
        '<div class="ch-prompt">'+r.prompt+'</div>'+
        '<div class="chips ch-opts">'+r.options.map(function(o,k){return '<button type="button" data-k="'+k+'">'+o+'</button>';}).join("")+'</div>'+
        '<div class="ch-fb" aria-live="polite"></div>'+
        '<div class="row"><button type="button" class="secondary ch-next" hidden>Next →</button></div>';
      answered=false;
      each(wrap.querySelectorAll(".ch-opts button"),function(b){
        b.addEventListener("click",function(){
          if(answered) return; answered=true;
          var k=+b.getAttribute("data-k"), ok=k===r.answer;
          if(ok) score++;
          b.classList.add(ok?"right":"wrong");
          if(!ok) wrap.querySelector('.ch-opts [data-k="'+r.answer+'"]').classList.add("right");
          var fb=wrap.querySelector(".ch-fb");
          fb.className="ch-fb show "+(ok?"good":"bad");
          fb.innerHTML=(ok?"✓ Right. ":"✗ Not quite. ")+r.why;
          var nx=wrap.querySelector(".ch-next"); nx.hidden=false;
          nx.textContent=i<rounds.length-1?"Next →":"Finish";
          store.set(key,JSON.stringify({i:i,score:score}));
        });
      });
      wrap.querySelector(".ch-next").addEventListener("click",function(){
        if(i<rounds.length-1){i++;render();}
        else{ wrap.innerHTML='<p class="result-big">Done: '+score+' of '+rounds.length+' right.</p><div class="row"><button type="button" class="secondary ch-again">↺ Try again</button></div>';
          wrap.querySelector(".ch-again").addEventListener("click",function(){i=0;score=0;render();}); }
      });
    }
    render();
    return wrap;
  }

  /* Sorter: tap an item, then tap a bin. */
  function sorter(box,bins,items){
    var wrap=document.createElement("div"); wrap.className="sorter"; box.appendChild(wrap);
    var placed={}, picked=null;
    function render(){
      var left=items.filter(function(it,k){return placed[k]==null;});
      var html='<p class="lbl">Tap an item, then tap the bin it belongs in.</p><div class="chips so-items">'+
        items.map(function(it,k){return placed[k]!=null?'':'<button type="button" data-k="'+k+'"'+(picked===k?' aria-pressed="true"':'')+'>'+it.label+'</button>';}).join("")+
        (left.length?'':'<span class="ok">✓ All sorted!</span>')+'</div><div class="bins">'+
        bins.map(function(bn,b){return '<button type="button" class="bin" data-b="'+b+'"><b>'+bn+'</b><span>'+
          items.map(function(it,k){return placed[k]===b?'<i class="'+(it.bin===b?"ok":"no")+'">'+it.label+(it.bin===b?" ✓":" ✗")+'</i>':'';}).join("")+'</span></button>';}).join("")+
        '</div><p class="so-fb wnote" aria-live="polite"></p><div class="row"><button type="button" class="secondary so-reset">↺ Start over</button></div>';
      wrap.innerHTML=html;
      each(wrap.querySelectorAll(".so-items button"),function(bt){bt.addEventListener("click",function(){picked=+bt.getAttribute("data-k");render();});});
      each(wrap.querySelectorAll(".bin"),function(bt){bt.addEventListener("click",function(){
        if(picked==null) return; var b=+bt.getAttribute("data-b"), it=items[picked];
        placed[picked]=b; picked=null; render();
        var fb=wrap.querySelector(".so-fb"); fb.innerHTML=(it.bin===b?"✓ ":"✗ Belongs in "+bins[it.bin]+". ")+it.why;
      });});
      wrap.querySelector(".so-reset").addEventListener("click",function(){placed={};picked=null;render();});
    }
    render();
    return wrap;
  }

  /* Order puzzle with up/down buttons */
  function orderPuzzle(box,steps,tips){
    var wrap=document.createElement("div"); wrap.className="order"; box.appendChild(wrap);
    var idx=steps.map(function(s,k){return k;});
    function shuffle(){for(var k=idx.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=idx[k];idx[k]=idx[j];idx[j]=t;}
      if(idx.every(function(x,k){return x===k;})) shuffle();}
    shuffle(); var solved=false;
    function render(){
      wrap.innerHTML='<ol class="ord-list">'+idx.map(function(s,p){
        return '<li'+(solved?' class="ok"':'')+'><span class="ord-t">'+steps[s]+(solved&&tips?'<small>🔎 '+tips[s]+'</small>':'')+'</span>'+
          (solved?'':'<span class="ord-b"><button type="button" class="secondary" data-up="'+p+'" aria-label="Move up">▲</button><button type="button" class="secondary" data-dn="'+p+'" aria-label="Move down">▼</button></span>')+'</li>';}).join("")+'</ol>'+
        '<div class="row">'+(solved?'':'<button type="button" class="ord-check">Check my order</button>')+'<button type="button" class="secondary ord-shuffle">↺ Shuffle</button></div><p class="status ord-fb" aria-live="polite"></p>';
      each(wrap.querySelectorAll("[data-up]"),function(b){b.addEventListener("click",function(){var p=+b.getAttribute("data-up");if(p>0){var t=idx[p];idx[p]=idx[p-1];idx[p-1]=t;render();}});});
      each(wrap.querySelectorAll("[data-dn]"),function(b){b.addEventListener("click",function(){var p=+b.getAttribute("data-dn");if(p<idx.length-1){var t=idx[p];idx[p]=idx[p+1];idx[p+1]=t;render();}});});
      var c=wrap.querySelector(".ord-check"); if(c) c.addEventListener("click",function(){
        var right=idx.filter(function(x,k){return x===k;}).length;
        if(right===idx.length){solved=true;render();wrap.querySelector(".ord-fb").innerHTML='<span class="ok">✓ Perfect order! Each step now shows what Zach looks for.</span>';}
        else wrap.querySelector(".ord-fb").innerHTML='<span class="no">'+right+' of '+idx.length+' in the right spot. Keep going.</span>';
      });
      wrap.querySelector(".ord-shuffle").addEventListener("click",function(){solved=false;shuffle();render();});
    }
    render();
    return wrap;
  }

  /* Persistent checklist */
  function checklist(box,items,key,onChange){
    var wrap=document.createElement("div"); wrap.className="clist"; box.appendChild(wrap);
    wrap.innerHTML=items.map(function(it,k){return '<label class="check-row"><input type="checkbox" data-k="'+k+'"> <span>'+it+'</span></label>';}).join("");
    var boxes=wrap.querySelectorAll("input");
    function count(){var n=0;each(boxes,function(b){if(b.checked)n++;});return n;}
    each(boxes,function(b){
      var k=b.getAttribute("data-k"); var sv=store.get("cl:"+key+":"+k); if(sv==="1") b.checked=true;
      b.addEventListener("change",function(){store.set("cl:"+key+":"+k,b.checked?"1":"0"); if(onChange) onChange(count(),items.length);});
    });
    if(onChange) onChange(count(),items.length);
    return wrap;
  }

  /* Photo slots: preview only (photos are not uploaded anywhere or saved, to keep storage small) */
  function photoSlots(box,labels){
    var wrap=document.createElement("div"); wrap.className="photos"; box.appendChild(wrap);
    wrap.innerHTML=labels.map(function(l,k){return '<label class="photo"><input type="file" accept="image/*" capture="environment" data-k="'+k+'"><span class="ph-box"><span>📷 '+l+'</span></span></label>';}).join("")+
      '<p class="wnote">Photos stay on this screen only; they are not uploaded or saved.</p>';
    each(wrap.querySelectorAll("input[type=file]"),function(inp){inp.addEventListener("change",function(){
      var f=inp.files&&inp.files[0]; if(!f) return; var u=URL.createObjectURL(f);
      var bx=inp.parentNode.querySelector(".ph-box"); bx.style.backgroundImage='url("'+u+'")'; bx.classList.add("has");
    });});
    return wrap;
  }

  /* ---------- Safety gate ---------- */
  function safetyGate(){
    var boxes=document.querySelectorAll("#safety .srule input"), st=$("safetyStatus");
    var gated=document.querySelectorAll("main > section[data-gated]");
    each(gated,function(s){
      var n=document.createElement("div"); n.className="lock-note";
      n.innerHTML='🔒 Locked until you tick every rule on the safety card. <a href="#safety">Go to the safety card ↑</a>';
      s.insertBefore(n,s.children[1]||null);
    });
    function paint(){
      var c=0; each(boxes,function(b){if(b.checked)c++;});
      var all=c===boxes.length;
      each(gated,function(s){s.classList.toggle("locked",!all);});
      st.innerHTML=all?'<span class="ok">✅ All '+boxes.length+' rules ticked. The lessons below are unlocked.</span>':
        '<span class="warn-t">Tick "I understand" on all '+boxes.length+' rules ('+c+'/'+boxes.length+' so far) to unlock Section 1.</span>';
      $("safety").classList.toggle("all-ok",all);
    }
    each(boxes,function(b){
      var k=b.getAttribute("data-rule"); if(store.get("safety:"+k)==="1") b.checked=true;
      var lab=document.createElement("span"); lab.className="iu"; lab.textContent="I understand"; b.parentNode.appendChild(lab);
      b.addEventListener("change",function(){store.set("safety:"+k,b.checked?"1":"0"); paint();});
    });
    paint();
  }
  /* ---------- Unlock message ---------- */
  function unlockAnim(){
    var nx=$("next"), un=$("unlock"); if(!nx||!un) return;
    function openLock(){un.classList.add("open"); nx.classList.add("unlocked");}
    if(H.reduceMotion||!("IntersectionObserver" in window)) openLock();
    else new IntersectionObserver(function(en,obs){ if(en[0].isIntersecting&&!nx.classList.contains("locked")){openLock();obs.disconnect();} },{threshold:0.4}).observe(nx);
  }
  safetyGate(); unlockAnim();

  return {$:$,num:num,fmt:fmt,each:each,store:store,esc:esc,slot:slot,fld:fld,txt:txt,area:area,sel:sel,chk:chk,keep:keep,v:v,svg:svg,
    setBand:setBand,chooser:chooser,sorter:sorter,orderPuzzle:orderPuzzle,checklist:checklist,photoSlots:photoSlots};
})();
