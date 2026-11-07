const $=id=>document.getElementById(id);
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let DOCS=[],cur=0,term='';
async function decrypt(pw){
  const enc=new TextEncoder();
  const base=await crypto.subtle.importKey('raw',enc.encode(pw.normalize('NFC')),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(BANK_ENC.salt),iterations:BANK_ENC.it,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(BANK_ENC.iv),additionalData:enc.encode('pes-bank-v1')},key,b64(BANK_ENC.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}
function clean(h){
  const d=new DOMParser().parseFromString(h,'text/html');
  d.querySelectorAll('script,iframe,object,embed,link,style,meta,form').forEach(e=>e.remove());
  d.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{if(/^on/i.test(a.name)||/^\s*javascript:/i.test(a.value))e.removeAttribute(a.name)})});
  return d.body.innerHTML;
}
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function mark(root,t){
  if(!t)return;const re=new RegExp(esc(t),'gi');
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(n=>{if(!re.test(n.nodeValue))return;re.lastIndex=0;const f=document.createDocumentFragment();let last=0,m;
    while((m=re.exec(n.nodeValue))){f.append(n.nodeValue.slice(last,m.index));const k=document.createElement('mark');k.textContent=m[0];f.append(k);last=m.index+m[0].length}
    f.append(n.nodeValue.slice(last));n.replaceWith(f)});
}
function plain(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent.toLowerCase()}
function renderList(){
  let h='',g='';
  DOCS.forEach((d,i)=>{
    if(term&&!d.p.includes(term.toLowerCase()))return;
    if(d.g!==g){g=d.g;h+=`<h2></h2>`}
    h+=`<button class="doc ${i===cur?'on':''}" data-i="${i}"></button>`;
  });
  $('list').innerHTML=h;
  const btns=$('list').querySelectorAll('button.doc'),hs=$('list').querySelectorAll('h2');
  let gi=0,g2='';
  const shown=DOCS.map((d,i)=>i).filter(i=>!term||DOCS[i].p.includes(term.toLowerCase()));
  btns.forEach((b,k)=>{b.textContent=DOCS[shown[k]].t});
  let hi=0,gg='';shown.forEach(i=>{if(DOCS[i].g!==gg){gg=DOCS[i].g;hs[hi++].textContent=gg}});
  $('hits').textContent=term?`Dokumenty z wynikami: ${shown.length}`:'';
}
function show(i){
  cur=i;const d=DOCS[i];
  $('doc').innerHTML=`<div class="meta"></div>`+d.h;
  $('doc').firstChild.textContent=d.g;
  mark($('doc'),term);
  const m=$('doc').querySelector('mark');if(m)m.scrollIntoView({block:'center'});else window.scrollTo({top:0});
  renderList();
}
function open_(data){
  DOCS=data.map(d=>({t:d.t,g:d.g,h:clean(d.h),p:plain(d.h)}));
  $('gate').style.display='none';$('app').style.display='grid';show(0);
}
$('f').addEventListener('submit',async e=>{
  e.preventDefault();const pw=$('pw').value;if(!pw)return;
  $('go').disabled=true;$('err').textContent='Sprawdzam…';
  try{const data=await decrypt(pw);$('pw').value='';$('err').textContent='';open_(data)}
  catch(x){$('err').textContent='Nieprawidłowe hasło.';$('go').disabled=false}
});
$('list').addEventListener('click',e=>{const b=e.target.closest('button.doc');if(b)show(+b.dataset.i)});
let tm;$('q').addEventListener('input',e=>{clearTimeout(tm);tm=setTimeout(()=>{term=e.target.value.trim();show(cur)},250)});
$('lock').addEventListener('click',()=>{DOCS=[];$('doc').innerHTML='';$('list').innerHTML='';$('q').value='';term='';$('app').style.display='none';$('gate').style.display='block';$('go').disabled=false;$('pw').focus()});
