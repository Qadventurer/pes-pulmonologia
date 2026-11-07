const NKEY="quiz-gazometria-notes-v1";
let notes={};try{notes=JSON.parse(localStorage.getItem(NKEY)||"{}")||{}}catch(e){notes={}}
function saveNotes(){try{localStorage.setItem(NKEY,JSON.stringify(notes))}catch(e){}}
const fmt=n=>String(n).replace(".",",");
const list=document.getElementById("list");
function cell(k,v,u,ref,flag,abn){
  const d=document.createElement("div");d.className="cell"+(abn?" abn":"");
  const kk=document.createElement("div");kk.className="k";kk.textContent=k;
  if(ref){const r=document.createElement("span");r.className="r";r.textContent=ref;kk.append(r)}
  const vv=document.createElement("div");vv.className="v";
  const t=document.createElement("span");t.textContent=v;vv.append(t);
  if(u){const s=document.createElement("span");s.className="u";s.textContent=u;vv.append(s)}
  if(flag){const f=document.createElement("span");f.className="fl";f.textContent=flag;vv.append(f)}
  d.append(kk,vv);return d;
}
function wide(k,v){
  const d=document.createElement("div");d.className="cell wide";
  const kk=document.createElement("div");kk.className="k";kk.textContent=k;
  const vv=document.createElement("div");vv.className="v";vv.textContent=v;
  d.append(kk,vv);return d;
}
function fl(v,lo,hi){return v<lo?"↓":(v>hi?"↑":"")}


function build(c){
  const el=document.createElement("article");el.className="card";el.id="c"+c.n;
  const top=document.createElement("div");top.className="top";
  const num=document.createElement("div");num.className="num";num.textContent="#"+String(c.n).padStart(2,"0");
  const vig=document.createElement("p");vig.className="vig";vig.textContent=c.vig;
  top.append(num,vig);
  const tbl=document.createElement("div");tbl.className="tbl";
  const f1=fl(c.ph,7.35,7.45),f2=fl(c.pco2,35,45),f4=fl(c.hco3,22,26),f5=fl(c.be,-2,2);
  tbl.append(cell("pH",fmt(c.ph.toFixed(2)),"","7,35–7,45",f1,!!f1));
  tbl.append(cell("PaCO₂",c.pco2,"mmHg","35–45",f2,!!f2));
  const venous=c.po2label;
  const f3=venous?"":(c.pao2<80?"↓":"");
  tbl.append(cell(venous||"PaO₂",c.pao2,"mmHg",venous?"":"80–100",f3,!!f3));
  tbl.append(cell("HCO₃⁻",c.hco3,"mmol/l","22–26",f4,!!f4));
  tbl.append(cell("BE",(c.be>0?"+":"")+fmt(c.be.toFixed(1)),"mmol/l","−2…+2",f5,!!f5));
  tbl.append(cell(venous?"SaO₂":(/^SpO/.test(c.sao2)?"Saturacja":"SaO₂"),c.sao2.replace(/^SpO₂ /,""),"","",""));
  tbl.append(wide("Warunki",c.fio2));
  c.ex.forEach(e=>tbl.append(cell(e[0],e[1].split(" ")[0],e[1].split(" ").slice(1).join(" "),"","")));
  const mine=document.createElement("div");mine.className="mine";
  const lb=document.createElement("label");lb.htmlFor="t"+c.n;lb.textContent="Twoja interpretacja";
  const ta=document.createElement("textarea");ta.id="t"+c.n;ta.placeholder="Wpisz zaburzenie, kompensację, rozpoznanie i postępowanie…";ta.value=notes[c.n]||"";
  ta.addEventListener("input",()=>{if(ta.value)notes[c.n]=ta.value;else delete notes[c.n];saveNotes()});
  mine.append(lb,ta);
  const act=document.createElement("div");act.className="act";
  const b=document.createElement("button");b.className="show";b.textContent="Pokaż odpowiedź";b.setAttribute("aria-expanded","false");b.setAttribute("aria-controls","a"+c.n);
  act.append(b);
  const ans=document.createElement("div");ans.className="ans";ans.id="a"+c.n;ans.hidden=true;
  const tag=document.createElement("div");tag.className="tag";tag.textContent=c.tag;
  const dx=document.createElement("div");dx.className="dx";dx.textContent=c.dx;
  const dl=document.createElement("dl");dl.className="steps";
  c.steps.forEach(s=>{const r=document.createElement("div");r.className="st";const dt=document.createElement("dt");dt.textContent=s[0];const dd=document.createElement("dd");dd.textContent=s[1];r.append(dt,dd);dl.append(r)});
  const pr=document.createElement("div");pr.className="pearl";pr.textContent=c.pearl;
  ans.append(tag,dx,dl,pr);
  el.append(top,tbl,mine,act,ans);el._ta=ta;el._ans=ans;el._b=b;
  b.onclick=()=>{ans.hidden=!ans.hidden;b.textContent=ans.hidden?"Pokaż odpowiedź":"Ukryj odpowiedź";b.setAttribute("aria-expanded",!ans.hidden)};
  return el;
}
const els=CASES.map(c=>{const e=build(c);list.append(e);return e});
document.getElementById("collapse").onclick=()=>els.forEach(e=>{e._ans.hidden=true;e._b.textContent="Pokaż odpowiedź";e._b.setAttribute("aria-expanded","false")});
let armedN=false;
document.getElementById("resetNotes").onclick=function(){
  if(!armedN){armedN=true;this.textContent="Potwierdź usunięcie wszystkich";setTimeout(()=>{armedN=false;this.textContent="Wyczyść moje odpowiedzi"},3500);return}
  armedN=false;this.textContent="Wyczyść moje odpowiedzi";notes={};saveNotes();els.forEach(e=>{e._ta.value=""});
};
