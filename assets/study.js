/* Flip Card Study: chapter picker, Fisher-Yates deck, flip, Got it / Missed it, summary */
(function(){
  "use strict";
  var H=window.HVAC, $=function(id){return document.getElementById(id);};
  var deck=[], pos=0, flipped=false, answered={}, lastDeckIds=[];
  function shuffle(a){a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t;} return a;}
  window.HVAC_SHUFFLE=shuffle;
  function getSel(){var s=H.study.getSel(); return Array.isArray(s)?s.filter(function(id){return H.byId[id];}):H.MODULES.map(function(m){return m.id;});}
  function statHTML(mid){var st=H.study.stats(mid), sp=st.total?st.seen/st.total*100:0, cp=st.total?st.correct/st.total*100:0;
    return '<div class="stat">Seen '+st.seen+'/'+st.total+' · Correct '+st.correct+'/'+st.total+'</div><div class="bars2"><div class="bar" aria-hidden="true"><i style="width:'+sp+'%"></i></div><div class="bar ok" aria-hidden="true"><i style="width:'+cp+'%"></i></div></div>';}
  function renderPicker(){
    var sel=getSel(), L=$("modList"); L.innerHTML="";
    H.MODULES.forEach(function(m){var on=sel.indexOf(m.id)>=0;
      var lab=document.createElement("label"); lab.className="pk"+(on?" on":""); lab.setAttribute("data-mid",m.id);
      lab.innerHTML='<input type="checkbox" value="'+m.id+'"'+(on?" checked":"")+'><span class="nm">M'+m.num+' · '+H.esc(m.title)+' <small>('+H.cards(m.id).length+' cards)</small></span><span>'+statHTML(m.id)+'</span>';
      L.appendChild(lab);});
    Array.prototype.forEach.call(L.querySelectorAll("input"),function(c){c.addEventListener("change",saveSel);});
    count();
  }
  function cur(){return Array.prototype.filter.call($("modList").querySelectorAll("input"),function(c){return c.checked;}).map(function(c){return c.value;});}
  function saveSel(){H.study.setSel(cur()); Array.prototype.forEach.call($("modList").querySelectorAll(".pk"),function(l){l.classList.toggle("on",l.querySelector("input").checked);}); count();}
  function count(){var s=cur(),n=0; s.forEach(function(id){n+=H.cards(id).length;}); $("pickCount").textContent=s.length+" module"+(s.length===1?"":"s")+" · "+n+" cards"; $("buildBtn").disabled=!n;}
  function setAll(ids){Array.prototype.forEach.call($("modList").querySelectorAll("input"),function(c){c.checked=ids.indexOf(c.value)>=0;}); saveSel();}
  $("selAll").addEventListener("click",function(){setAll(H.MODULES.map(function(m){return m.id;}));});
  $("selNone").addEventListener("click",function(){setAll([]);});
  Array.prototype.forEach.call(document.querySelectorAll("[data-group]"),function(b){b.addEventListener("click",function(){var g=b.getAttribute("data-group"); setAll(H.MODULES.filter(function(m){return m.group===g;}).map(function(m){return m.id;}));});});

  function show(id){["picker","deck","summary"].forEach(function(s){$(s).hidden=s!==id;}); window.scrollTo(0,0);}
  function allCards(mids){var out=[]; mids.forEach(function(mid){H.cards(mid).forEach(function(c){out.push({id:c.id,q:c.q,a:c.a,mid:mid});});}); return out;}
  function start(cards){deck=shuffle(cards); lastDeckIds=cards; pos=0; answered={}; window.HVAC_DECK=deck; show("deck"); renderCard();}
  $("buildBtn").addEventListener("click",function(){var s=cur(); if(!s.length) return; start(allCards(s));});
  function renderCard(){var c=deck[pos], m=H.byId[c.mid];
    flipped=false; $("scard").classList.remove("flipped"); $("scard").classList.add("noanim");
    var tag="M"+m.num+" · "+m.title; $("mtagF").textContent=tag; $("mtagB").textContent=tag;
    $("cardQ").textContent=c.q; $("cardA").textContent=c.a;
    $("deckPos").textContent="Card "+(pos+1)+" of "+deck.length; $("deckBar").style.width=(pos/deck.length*100)+"%";
    $("gotBtn").disabled=true; $("missBtn").disabled=true; $("nextBtn").disabled=true; $("gotBtn").classList.remove("sel"); $("missBtn").classList.remove("sel");
    $("nextBtn").textContent=pos===deck.length-1?"Finish deck ›":"Next ›";
    requestAnimationFrame(function(){$("scard").classList.remove("noanim");});}
  function flip(){flipped=!flipped; $("scard").classList.toggle("flipped",flipped); if(flipped){H.study.seen(deck[pos].id); $("gotBtn").disabled=false; $("missBtn").disabled=false;}}
  $("scard").addEventListener("click",flip);
  $("scard").addEventListener("keydown",function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();flip();}});
  function answer(res){var c=deck[pos]; answered[c.id]=res; H.study.result(c.id,res); $("gotBtn").classList.toggle("sel",res==="got"); $("missBtn").classList.toggle("sel",res==="miss"); $("nextBtn").disabled=false;}
  $("gotBtn").addEventListener("click",function(){answer("got");});
  $("missBtn").addEventListener("click",function(){answer("miss");});
  $("nextBtn").addEventListener("click",function(){if(pos<deck.length-1){pos++;renderCard();}else summary();});
  $("backPick").addEventListener("click",function(){renderPicker();show("picker");});
  function summary(){var got=0,miss=0; deck.forEach(function(c){if(answered[c.id]==="got")got++;else if(answered[c.id]==="miss")miss++;});
    $("smScore").textContent=got+" / "+deck.length+" got it";
    var mids=[]; deck.forEach(function(c){if(mids.indexOf(c.mid)<0)mids.push(c.mid);});
    mids.sort(function(a,b){return H.byId[a].index-H.byId[b].index;});
    $("smStats").innerHTML=mids.map(function(mid){var m=H.byId[mid]; var dg=0,dn=0; deck.forEach(function(c){if(c.mid===mid){dn++; if(answered[c.id]==="got")dg++;}});
      return '<div class="pk2"><b>M'+m.num+' · '+H.esc(m.title)+'</b> <span class="stat">(this deck: '+dg+'/'+dn+')</span>'+statHTML(mid)+'</div>';}).join("");
    $("missedOnly").disabled=!miss; $("missedOnly").textContent=miss?"Study missed cards only ("+miss+")":"No missed cards 🎉";
    show("summary");}
  $("reshuffle").addEventListener("click",function(){start(lastDeckIds);});
  $("missedOnly").addEventListener("click",function(){var m=deck.filter(function(c){return answered[c.id]==="miss";}); if(m.length) start(m);});
  $("toPicker").addEventListener("click",function(){renderPicker();show("picker");});
  $("resetStudy").addEventListener("click",function(){var d=$("confirmDlg");d.hidden=false;$("cfNo").focus();});
  $("cfNo").addEventListener("click",function(){$("confirmDlg").hidden=true;});
  $("cfYes").addEventListener("click",function(){$("confirmDlg").hidden=true;H.study.reset();renderPicker();});
  H.onProfile(function(){deck=[];renderPicker();show("picker");});
  renderPicker();
})();
