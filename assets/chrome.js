(function(){
  var page=location.pathname.split('/').pop()||'index.html';
  var links=[['index.html','Zestawy'],['rady-przed-pes.html','Rady przed PES'],['bank.html','Bazy pytań'],['czynnosciowe.html','Czynnościowe'],['gazometria.html','Gazometrie'],['rtg.html','RTG i TK']];
  if(!document.querySelector('link[data-hm-fonts]')){
    var f=document.createElement('link');f.rel='stylesheet';f.setAttribute('data-hm-fonts','');
    f.href='https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@500&display=swap';
    document.head.appendChild(f);
  }
  var bar=document.createElement('header');bar.className='mast';
  var h='<div class="in"><a class="brand" href="index.html">PES z chorób płuc</a><nav aria-label="Nawigacja" style="display:contents">';
  links.forEach(function(l){h+='<a href="'+l[0]+'"'+(l[0]===page?' aria-current="page"':'')+'>'+l[1]+'</a>'});
  bar.innerHTML=h+'</nav></div>';
  document.body.insertBefore(bar,document.body.firstChild);
  document.querySelectorAll('.nav').forEach(function(n){n.style.display='none'});
  var cs=getComputedStyle(document.body);
  var pt=parseFloat(cs.paddingTop)+parseFloat(cs.marginTop),pr=parseFloat(cs.paddingRight)+parseFloat(cs.marginRight),pl=parseFloat(cs.paddingLeft)+parseFloat(cs.marginLeft);
  bar.style.margin=(-(pt||0))+'px '+(-(pr||0))+'px 16px '+(-(pl||0))+'px';
})();
