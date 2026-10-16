(()=>{'use strict';
const teams=(window.SOCO?.teams||[]).map(t=>t.name),valid=new Set(teams);
const key='sococup_v4_3_calendario_locale';const $=id=>document.getElementById(id);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parse=text=>{const rows=[];const errors=[];const seen=new Set();const count=new Map();text.replace(/^\uFEFF/,'').split(/\r?\n/).forEach((line,i)=>{if(!line.trim())return;const parts=line.split(';').map(v=>v.trim());if(parts.length!==5){errors.push(`Riga ${i+1}: servono 5 campi separati da ;`);return}const [r,a,b,ha,hb]=parts;const round=Number(r);if(!Number.isInteger(round)||round<1||round>36){errors.push(`Riga ${i+1}: giornata non valida`);return}if(!valid.has(a)||!valid.has(b)||a===b){errors.push(`Riga ${i+1}: nome squadra non valido o ripetuto`);return}if((ha==='')!==(hb==='')){errors.push(`Riga ${i+1}: inserisci entrambi i gol o nessuno`);return}if(ha!==''&&(!/^\d+$/.test(ha)||!/^\d+$/.test(hb)||Number(ha)>99||Number(hb)>99)){errors.push(`Riga ${i+1}: gol non validi`);return}for(const t of [a,b]){const k=`${round}|${t}`;if(seen.has(k)){errors.push(`Riga ${i+1}: ${t} compare due volte nella giornata ${round}`)}seen.add(k)}count.set(round,(count.get(round)||0)+1);if(count.get(round)>5)errors.push(`Giornata ${round}: più di 5 partite`);rows.push({round,home:a,away:b,hg:ha===''?null:Number(ha),ag:hb===''?null:Number(hb)})});return {rows,errors}};
const toCSV=rows=>rows.map(x=>[x.round,x.home,x.away,x.hg??'',x.ag??''].join(';')).join('\n');
const official=Array.isArray(window.SOCO_FIXTURES)?window.SOCO_FIXTURES:[];
// V4.3: le bozze delle versioni precedenti non possono più nascondere il calendario ufficiale.
// Una bozza locale è accettata solo se contiene gli stessi 180 abbinamenti ufficiali.
const identity=x=>`${x.round}|${x.home}|${x.away}`;
const officialKeys=new Set(official.map(identity));
const validOfficial=official.length===180&&officialKeys.size===180&&Array.from({length:36},(_,i)=>official.filter(x=>x.round===i+1).length===5).every(Boolean);
let rows=[...official],hasLocal=false;
try{
 const saved=JSON.parse(localStorage.getItem(key)||'null');
 if(validOfficial&&Array.isArray(saved)&&saved.length===official.length){
  const checked=parse(toCSV(saved));
  if(!checked.errors.length&&checked.rows.length===180&&checked.rows.every(x=>officialKeys.has(identity(x)))){
   const localByKey=new Map(checked.rows.map(x=>[identity(x),x]));
   rows=official.map(x=>({...x,hg:localByKey.get(identity(x)).hg,ag:localByKey.get(identity(x)).ag}));
   hasLocal=true;
  }
 }
}catch{}
const textarea=$('fixturescsv'),status=$('fixturestatus'),buttons=$('rounds'),detail=$('rounddetail');if(!buttons)return;
textarea.value=toCSV(rows);if(!validOfficial){status.textContent='Attenzione: file delle partite ufficiali mancante o incompleto. Controlla assets/partite-ufficiali.js.';}
const show=r=>{const matches=rows.filter(x=>x.round===r);const sa=matches[0]?.serieARound;const heading=`<strong>Giornata ${r}</strong>${sa?` <span class="tag">Serie A · ${sa}ª giornata</span>`:''}`;detail.innerHTML=matches.length?heading+`<div class="fixture-list">${matches.map(x=>`<div class="fixture"><span>${esc(x.home)}</span><b>${x.hg===null?'–':x.hg+' : '+x.ag}</b><span>${esc(x.away)}</span>${x.fpHome!==null&&x.fpHome!==undefined?`<small class="muted">Fantapunti: ${x.fpHome} – ${x.fpAway}</small>`:''}</div>`).join('')}</div><p class="note">${matches.length}/5 incontri inseriti · ${hasLocal?'bozza locale su questo dispositivo':'calendario ufficiale importato dall’Excel Socoleague'}</p>`:heading+'<p>Non sono stati ancora inseriti incontri verificati per questa giornata.</p>'};
buttons.innerHTML=Array.from({length:36},(_,i)=>`<button type="button" data-r="${i+1}" aria-label="Giornata ${i+1}">${i+1}</button>`).join('');let selected=1;const select=r=>{selected=r;buttons.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.r)===r));show(r)};buttons.addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b)select(Number(b.dataset.r))});select(1);
$('savefixtures').addEventListener('click',()=>{const parsed=parse(textarea.value);if(parsed.errors.length){status.textContent='Non salvato: '+parsed.errors.slice(0,4).join(' · ')+(parsed.errors.length>4?' …':'');return}try{localStorage.setItem(key,JSON.stringify(parsed.rows));if(validOfficial&&(parsed.rows.length!==180||parsed.rows.some(x=>!officialKeys.has(identity(x))))){status.textContent='Non salvato: per mantenere il calendario pubblico devi conservare tutti i 180 abbinamenti ufficiali.';return}rows=validOfficial?official.map(x=>({...x,...parsed.rows.find(y=>identity(y)===identity(x)),fpHome:x.fpHome,fpAway:x.fpAway,serieARound:x.serieARound})):parsed.rows;hasLocal=true;status.textContent=`Salvate ${rows.length} partite su questo dispositivo. Non sono visibili agli altri.`;select(selected)}catch{status.textContent='Impossibile salvare: memoria browser non disponibile.'}});
$('clearfixtures').addEventListener('click',()=>{if(!confirm('Cancellare il calendario salvato soltanto su questo dispositivo?'))return;rows=[...official];hasLocal=false;textarea.value=toCSV(rows);localStorage.removeItem(key);status.textContent='Bozza locale cancellata: ripristinate le partite condivise.';select(selected)});
$('exportfixtures').addEventListener('click',()=>{const data=textarea.value;const blob=new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sococup-calendario.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='CSV esportato. Ricorda: non è pubblicato online.'});
})();