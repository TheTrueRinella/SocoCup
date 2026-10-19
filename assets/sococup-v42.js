(()=>{'use strict';
const fixtures=()=>Array.isArray(window.SOCO_FIXTURES)?window.SOCO_FIXTURES:[];
const done=g=>g.hg!==null&&g.hg!==undefined&&g.ag!==null&&g.ag!==undefined&&Number.isFinite(Number(g.hg))&&Number.isFinite(Number(g.ag));
function start(){
 const games=fixtures();
 const select=document.getElementById('v42-round-select');
 if(select){for(let n=1;n<=36;n++){const o=document.createElement('option');o.value=String(n);o.textContent='Giornata '+n;select.append(o)}
 const current=Math.min(36,Math.max(1,...games.filter(done).map(g=>Number(g.round)||1))+1);
 select.value=String(current);
 select.addEventListener('change',()=>{document.querySelector('[data-v29-round="'+select.value+'"]')?.click()});
 document.getElementById('rounds')?.addEventListener('click',e=>{const btn=e.target.closest('[data-v29-round]');if(btn)select.value=btn.dataset.v29Round});
 document.querySelector('[data-v29-round="'+current+'"]')?.click();
 }
 const host=document.getElementById('v42-home-summary');
 if(host){const played=games.filter(done),last=Math.max(0,...played.map(g=>Number(g.round)||0));const next=games.find(g=>Number(g.round)>last);const title=document.createElement('strong');title.textContent=last?'Risultati disponibili fino alla giornata '+last:'Campionato 2026/27';const body=document.createElement('p');body.textContent='Calendario completo: '+games.length+' partite in 36 giornate. '+(next?'Prossimo turno da giocare: giornata '+next.round+'.':'I risultati successivi non sono ancora disponibili.');const link=document.createElement('a');link.href='pronostici.html';link.textContent='Apri SocoBet · Pronostici 1/X/2 →';host.replaceChildren(title,body,link)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();