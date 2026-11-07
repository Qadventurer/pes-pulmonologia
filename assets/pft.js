const $=id=>document.getElementById(id);
const f=(x,d)=>x==null?'':x.toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:d}).replace('-','−');
const zc=z=>z<=-1.645?'lo':(z>=1.645?'hi':'');
const zcell=z=>`<span class="z ${zc(z)}">${(z>0?'+':'')+f(z,2)}${z<=-1.645?' ↓':z>=1.645?' ↑':''}</span>`;
const col=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};
const N=CASES.length;
let D=CASES[0],idx=0,st={};
function chart(host,o){
  const W=460,H=340,m={l:46,r:12,t:12,b:40},pw=W-m.l-m.r,ph=H-m.t-m.b;
  const X=v=>m.l+(v-o.x0)/(o.x1-o.x0)*pw,Y=v=>m.t+(o.y1-v)/(o.y1-o.y0)*ph;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label}">`;
  for(let v=o.x0;v<=o.x1+1e-9;v+=o.xs){s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${m.t}" y2="${m.t+ph}" stroke="var(--line)" stroke-width="1"/><text x="${X(v)}" y="${m.t+ph+16}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${f(v,o.xs<1?1:0)}</text>`}
  for(let v=o.y0;v<=o.y1+1e-9;v+=o.ys){const z=Math.abs(v)<1e-9;s+=`<line x1="${m.l}" x2="${m.l+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${z&&o.zero?'var(--muted)':'var(--line)'}" stroke-width="${z&&o.zero?1.4:1}"/><text x="${m.l-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${f(v,0)}</text>`}
  s+=`<text x="${m.l+pw/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="var(--ink)">${o.xl}</text>`;
  s+=`<text transform="translate(12 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" font-size="12" fill="var(--ink)">${o.yl}</text>`;
  for(const l of o.lines){s+=`<polyline fill="none" stroke="${l.c}" stroke-width="2" ${l.d?`stroke-dasharray="${l.d}"`:''} stroke-linejoin="round" points="${l.pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`}
  for(const k of (o.marks||[]))s+=`<line x1="${X(k.x)}" x2="${X(k.x)}" y1="${Y(0)}" y2="${Y(k.y)}" stroke="${col('--muted')}" stroke-dasharray="3 3"/><circle cx="${X(k.x)}" cy="${Y(k.y)}" r="4" fill="${k.c}"/><text x="${X(k.x)+7}" y="${Y(k.y)-6}" font-size="11" fill="var(--ink)">${k.t}</text>`;
  host.innerHTML=s+'</svg>'}
function draw(){
  const cv=D.curves,P=cv.pre,Q=cv.post,R=cv.pred;
  const cs={pre:col('--pre'),post:col('--post'),pred:col('--pred')};
  const comb=c=>c.ex.concat(c.ins);
  const xm=Math.max(...[P,Q,R].map(c=>Math.max(...comb(c).map(p=>p[0]))));
  const ymax=Math.max(...[P,Q,R].map(c=>Math.max(...c.ex.map(p=>p[1]))));
  const ymin=Math.min(...[P,Q,R].map(c=>Math.min(...c.ins.map(p=>p[1]))));
  const nice=(v,s)=>Math.ceil(v/s)*s;
  chart($('fv'),{label:'Krzywa przepływ-objętość',x0:0,x1:nice(xm+0.01,1),xs:1,y0:-nice(-ymin,2),y1:nice(ymax,2),ys:2,xl:'Objętość (L)',yl:'Przepływ (L/s)',zero:true,
    lines:[{pts:comb(R),c:cs.pred,d:'2 4'},{pts:comb(Q),c:cs.post,d:'6 4'},{pts:comb(P),c:cs.pre}]});
  const tm=Math.max(6,Math.ceil(Math.max(P.tend,Q.tend)/3)*3);
  const vm=nice(Math.max(R.vt.at(-1)[1],P.vt.at(-1)[1],Q.vt.at(-1)[1])+0.01,1);
  const ext=c=>D.trunc?c.vt:c.vt.concat([[tm,c.vt.at(-1)[1]]]);
  const fev=D.spir[1];
  chart($('vt'),{label:'Krzywa objętość-czas',x0:0,x1:tm,xs:tm>12?2:1,y0:0,y1:vm,ys:1,xl:'Czas (s)',yl:'Objętość (L)',
    lines:[{pts:ext(R),c:cs.pred,d:'2 4'},{pts:ext(Q),c:cs.post,d:'6 4'},{pts:ext(P),c:cs.pre}],marks:[{x:1,y:fev.pre,c:cs.pre,t:'FEV₁ '+f(fev.pre,2)}]});
}
function simple(id,rows){let t=`<thead><tr><th class="l">Parametr</th><th class="l">Jedn.</th><th>Należna</th><th>Granica</th><th>Wynik</th><th>% nal.</th><th>Z</th></tr></thead><tbody>`;
 for(const r of rows)t+=`<tr><td class="l">${r.name}</td><td class="u">${r.unit}</td><td>${f(r.pred,r.dec)}</td><td>${r.limLabel} ${f(r.lim,r.dec)}</td><td>${f(r.val,r.dec)}</td><td>${f(r.pct,0)}</td><td>${zcell(r.z)}</td></tr>`;
 $(id).innerHTML=t+'</tbody>'}
const A_IDS=['a1','a2','a3','a4'];
const key=id=>'quiz-pft-'+id;
function load(id){try{return JSON.parse(ls.get(key(id))||'{}')||{}}catch(e){return {}}}
function save(){const ok=ls.set(key(D.id),JSON.stringify(st));$('saved').textContent=ok?'Zapisano w tej przeglądarce.':'Zapis lokalny niedostępny.'}
function render(){
  $('cnt').textContent=`Przypadek ${idx+1} / ${N}`;
  $('jump').value=String(idx);
  $('pt').innerHTML=`<span><b>${D.sex==='M'?'M':'K'}</b>, <b>${D.age}</b> l.</span><span>wzrost <b>${D.h}</b> cm</span><span>masa <b>${D.w}</b> kg</span><span>BMI <b>${f(D.bmi,1)}</b></span><span>Hb <b>${f(D.hb,1)}</b> g/dl</span>`;
  $('ctx').textContent=D.context;
  $('ex').innerHTML=(D.extra||[]).map(x=>`<li>${x}</li>`).join('');$('ex').hidden=!(D.extra&&D.extra.length);
  let h=`<thead><tr class="grp"><th class="l"></th><th></th><th></th><th></th><th class="g" colspan="3">Przed BD</th><th class="g" colspan="4">Po BD</th></tr><tr><th class="l">Parametr</th><th class="l">Jedn.</th><th>Należna</th><th>DGN</th><th>Wynik</th><th>% nal.</th><th>Z</th><th>Wynik</th><th>% nal.</th><th>Z</th><th>Δ%</th></tr></thead><tbody>`;
  for(const r of D.spir)h+=`<tr><td class="l">${r.name}</td><td class="u">${r.unit}</td><td>${f(r.pred,2)}</td><td>${f(r.lln,2)}</td><td>${f(r.pre,2)}</td><td>${f(r.prePct,0)}</td><td>${zcell(r.preZ)}</td><td>${f(r.post,2)}</td><td>${f(r.postPct,0)}</td><td>${zcell(r.postZ)}</td><td>${(r.dPct>=0?'+':'')+f(r.dPct,1)}</td></tr>`;
  $('tSpir').innerHTML=h+'</tbody>';
  const b=D.bd;$('bd').innerHTML=`<span>ΔFEV₁ <b>${b.dfev>=0?'+':''}${f(b.dfev,0)} ml</b> (${f(b.dfevPct,1)}% wyj., ${f(b.dfevPred,1)}% nal.)</span><span>ΔFVC <b>${b.dfvc>=0?'+':''}${f(b.dfvc,0)} ml</b> (${f(b.dfvcPct,1)}% wyj., ${f(b.dfvcPred,1)}% nal.)</span>`;
  simple('tPl',D.pleth);simple('tDl',D.dlco);
  simple('tPl',D.pleth);simple('tDl',D.dlco);
  draw();
  const A=D.answer;
  const sec=(t,a)=>`<div><h3>${t}</h3><ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  $('key').innerHTML=sec('Interpretacja',A.interp)+sec('Rozpoznanie i różnicowanie',A.dx)+sec('Dalsze postępowanie',A.next)+sec('Pułapki egzaminacyjne',A.pearl);
  st=load(D.id);
  for(const id of A_IDS)$(id).value=st[id]||'';
  $('keyCard').hidden=true;document.querySelector('.duo').classList.remove('open');
  $('reveal').setAttribute('aria-expanded','false');$('reveal').textContent='Pokaż klucz odpowiedzi';
  $('saved').textContent='Odpowiedzi zapisują się w tej przeglądarce.';
  $('prev').disabled=idx===0;$('next').disabled=idx===N-1;
}
function go(i){idx=Math.max(0,Math.min(N-1,i));D=CASES[idx];ls.set('quiz-pft-cur',String(idx));render();window.scrollTo({top:0})}
for(const id of A_IDS)$(id).addEventListener('input',()=>{st[id]=$(id).value;save()});
$('reveal').addEventListener('click',()=>{const o=$('keyCard').hidden;$('keyCard').hidden=!o;document.querySelector('.duo').classList.toggle('open',o);$('reveal').setAttribute('aria-expanded',o);$('reveal').textContent=o?'Ukryj klucz odpowiedzi':'Pokaż klucz odpowiedzi';if(o)$('keyCard').scrollIntoView({behavior:'smooth',block:'start'})});
$('prev').addEventListener('click',()=>go(idx-1));$('next').addEventListener('click',()=>go(idx+1));
$('jump').innerHTML=CASES.map((c,i)=>`<option value="${i}">Przypadek ${i+1}</option>`).join('');
$('jump').addEventListener('change',e=>go(+e.target.value));
$('clear').addEventListener('click',()=>{if(confirm('Usunąć wszystkie Twoje odpowiedzi w tym quizie?')){CASES.forEach(c=>{try{localStorage.removeItem(key(c.id))}catch(e){}});render()}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(draw,50));
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')go(idx+1);if(e.key==='ArrowLeft')go(idx-1)});
{const c=parseInt(ls.get('quiz-pft-cur')||'0',10);go(Number.isFinite(c)?c:0)}
