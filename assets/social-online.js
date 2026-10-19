(()=>{'use strict';
document.addEventListener('DOMContentLoaded',async()=>{
const $=id=>document.getElementById(id), notice=$('online-notice'),who=$('online-who'),feed=$('online-feed'),login=$('login-panel'),composer=$('online-composer'),form=$('online-post-form');
const URL='https://ckpmsdxkxhdqqcbnmhjp.supabase.co',KEY='sb_publishable_vBBxybG-Q4tkkOLYM_mDlA_ZTA35etI';
const virtualPeople=[
 {name:'Marco Rossetti',handle:'@marco_rossetti',bio:'Palermo FC · Ironia e pallone',slug:'marco-rossetti'},
 {name:'Giulia Moretti',handle:'@giulia_moretti',bio:'Serie A · Milan e analisi calcistiche',slug:'giulia-moretti'},
 {name:'Alessandro Ferri',handle:'@ale_ferri',bio:'Juventus · Mercato e trattative',slug:'alessandro-ferri'},
 {name:'Davide Conti',handle:'@davide_conti',bio:'Inter · Fantacalcio e bonus',slug:'davide-conti'},
 {name:'Luca Romano',handle:'@luca_romano',bio:'Napoli · Opinioni senza filtri',slug:'luca-romano'},
 {name:'Sara Bellini',handle:'@sara_bellini',bio:'Tifosa rosanero · Commenti e ironia',slug:'sara-bellini'},
 {name:'Pietro Mancini',handle:'@pietro_mancini',bio:'Fantacalcio · Analisi delle giornate',slug:'pietro-mancini'},
 {name:'Elena Costa',handle:'@elena_costa',bio:'Calcio italiano · Opinioni e curiosità',slug:'elena-costa'},
 {name:'Simone Vitale',handle:'@simone_vitale',bio:'Tifoso · Battute da spogliatoio',slug:'simone-vitale'},
 {name:'Chiara Greco',handle:'@chiara_greco',bio:'Serie A · Numeri e statistiche',slug:'chiara-greco'},
 {name:'Andrea Rizzo',handle:'@andrea_rizzo',bio:'SocoCup · Tifoso appassionato',slug:'andrea-rizzo'},
 {name:'Valentina Serra',handle:'@valentina_serra',bio:'Calcio e cultura sportiva',slug:'valentina-serra'},
 {name:'Matteo Caruso',handle:'@matteo_caruso',bio:'Commenti dopo ogni giornata',slug:'matteo-caruso'},
 {name:'Francesca De Luca',handle:'@francesca_deluca',bio:'Calcio femminile e Serie A',slug:'francesca-deluca'},
 {name:'Riccardo Gallo',handle:'@riccardo_gallo',bio:'Fantacalcio · Difensori e bonus',slug:'riccardo-gallo'},
 {name:'Marta Orlando',handle:'@marta_orlando',bio:'SocoCup · Pagelle e curiosità',slug:'marta-orlando'},
 {name:'Nicola Ferrara',handle:'@nicola_ferrara',bio:'Calcio · Cronache virtuali',slug:'nicola-ferrara'},
 {name:'Alessia Marino',handle:'@alessia_marino',bio:'Tifosa · Umorismo calcistico',slug:'alessia-marino'},
 {name:'Giorgio Fontana',handle:'@giorgio_fontana',bio:'SocoCup · Analisi tattica',slug:'giorgio-fontana'},
 {name:'Federica Bruno',handle:'@federica_bruno',bio:'Fantacalcio · Formazioni',slug:'federica-bruno'},
 {name:'Stefano Messina',handle:'@stefano_messina',bio:'Tifoso · Sfottò bonari',slug:'stefano-messina'},
 {name:'Irene Romano',handle:'@irene_romano',bio:'Calcio italiano · Discussioni',slug:'irene-romano'},
 {name:'Lorenzo Sala',handle:'@lorenzo_sala',bio:'SocoCup · Curiosità statistiche',slug:'lorenzo-sala'},
 {name:'Beatrice Leone',handle:'@beatrice_leone',bio:'Tifosa · Reazioni alle partite',slug:'beatrice-leone'},
 {name:'Tommaso Villa',handle:'@tommaso_villa',bio:'Fantacalcio · Opinioni',slug:'tommaso-villa'}
];
const virtualByName=new Map(virtualPeople.map(p=>[p.name,p]));
function virtualAvatar(p,small=false){const im=document.createElement('img');im.className='virtual-avatar'+(small?' sm':'');im.src='assets/avatars/'+p.slug+'.svg';im.alt='';im.loading='lazy';return im}
function openVirtualProfile(p){const modal=document.createElement('div');modal.className='virtual-popover';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Profilo di '+p.name);const card=document.createElement('div');card.className='virtual-popover-card';const close=document.createElement('button');close.className='virtual-close';close.textContent='×';close.setAttribute('aria-label','Chiudi');close.onclick=()=>modal.remove();card.append(close,virtualAvatar(p));const name=document.createElement('h2');name.textContent=p.name;card.append(name);const handle=document.createElement('div');handle.className='virtual-handle';handle.textContent=p.handle;card.append(handle);const bio=document.createElement('p');bio.textContent=p.bio;card.append(bio);const disclosure=document.createElement('p');disclosure.className='virtual-label';disclosure.textContent='Profilo virtuale di Soco X: personaggio fittizio, non una persona reale.';card.append(disclosure);modal.append(card);modal.onclick=e=>{if(e.target===modal)modal.remove()};document.body.append(modal);close.focus()}
function setupVirtualPeople(){const wrap=document.getElementById('virtual-people-list');if(!wrap)return;for(const p of virtualPeople){const btn=document.createElement('button');btn.className='virtual-person';btn.type='button';btn.append(virtualAvatar(p));const n=document.createElement('strong');n.textContent=p.name;btn.append(n);const label=document.createElement('small');label.textContent=p.handle;btn.append(label);btn.onclick=()=>openVirtualProfile(p);wrap.append(btn)}}
setupVirtualPeople();
const fallback=['Berlusca Dortmund','STOKE AZZO','Palermo Saint-Rosalia','Hertavernello','Aston Birra','Lamin Kiadura','ipsiwich down','Vecio Lanificio Rossi United','palermo','Ciccio Kebab FC'];
const msg=(text,bad=false)=>{notice.textContent=text;notice.style.color=bad?'#ffb4a7':''};
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const formatDate=v=>{try{return new Date(v).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}catch{return ''}};
if(!window.supabase){msg('Libreria Supabase non caricata. Riprova aggiornando la pagina.',true);return}
const sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let uid=null,team=null,teams=new Map(fallback.map((n,i)=>[i+1,n])),busy=false,activeTeam=0;
let personalName='', postingAs='team';
const identityName=row=>row.identity_type==='personal'&&row.display_name?row.display_name:null;
function identityPicker(){
 const host=$('soco-identity-panel');if(!host||!team)return;
 host.hidden=false;host.replaceChildren();
 const title=make('strong','','Pubblica come');host.append(title);
 const select=make('select','soco-identity-select');select.setAttribute('aria-label','Identità per post e commenti');
 const optionTeam=make('option','',teams.get(team)+' · Squadra ufficiale ✓');optionTeam.value='team';
 const optionPerson=make('option','',personalName?personalName+' · Allenatore / tifoso':'Profilo personale · Imposta nome');optionPerson.value='personal';
 select.append(optionTeam,optionPerson);select.value=postingAs;
 select.onchange=()=>{postingAs=select.value;localStorage.setItem('soco_identity_'+uid,postingAs);if(postingAs==='personal'&&!personalName)editName();};
 const edit=make('button','soco-small','Modifica nome personale');edit.type='button';edit.onclick=editName;
 const hint=make('small','','La scelta vale per i nuovi post e commenti. I vecchi contenuti restano della squadra.');
 host.append(select,edit,hint);
 function editName(){const name=prompt('Nome e cognome da mostrare su Soco X (max 60 caratteri):',personalName);if(name===null)return;const clean=name.trim().replace(/\s+/g,' ').slice(0,60);if(!clean){alert('Inserisci un nome prima di usare il profilo personale.');postingAs='team';select.value='team';return}personalName=clean;localStorage.setItem('soco_personal_name_'+uid,clean);optionPerson.textContent=clean+' · Allenatore / tifoso';}
}
function identityPayload(){if(postingAs==='personal'){if(!personalName){alert('Imposta prima il tuo nome personale.');return null}return {identity_type:'personal',display_name:personalName}}return {identity_type:'team',display_name:null}}

const getAuthor=row=>row.user_id??row.author_id??row.profile_id;
const getText=row=>row.content??row.body??row.text??row.message??'';
const getPostRef=row=>row.post_id??row.postid;
const authorTeams=new Map();
const displayName=row=>identityName(row)||teams.get(Number(row.team_id??authorTeams.get(getAuthor(row))))||'Fantasquadra';
const teamId=row=>Number(row.team_id??authorTeams.get(getAuthor(row)))||0;
const palettes=[['#e8b83b','#16191d'],['#d82c45','#202b43'],['#f2b8d8','#151515'],['#ff9b44','#421d25'],['#8b64ff','#202a64'],['#f7d04b','#183b48'],['#8ce0d1','#214c4c'],['#e95d4f','#212a3e'],['#efbd80','#6b304a'],['#f3cb50','#a23532']];
const themeFor=id=>{const p=palettes[(Number(id)-1+palettes.length)%palettes.length];return {primary:p[0],secondary:p[1]}};
const applyTheme=(el,id)=>{const t=themeFor(id);el.style.setProperty('--team-primary',t.primary);el.style.setProperty('--team-secondary',t.secondary)};
const logoCache=new Map();
function teamLogo(id){const n=Number(id);if(!Number.isInteger(n)||n<1||n>10)return '';if(!logoCache.has(n)){const src='assets/teams-logos/'+n+'.png';const preload=new Image();preload.src=src;logoCache.set(n,src)}return logoCache.get(n)}
for(let i=1;i<=10;i++)teamLogo(i);
const avatar=(name,id)=>{const el=make('span','soco-avatar');applyTheme(el,id);el.setAttribute('aria-hidden','true');const fallback=make('span','soco-avatar-fallback',(name||'?').trim().slice(0,2).toUpperCase());el.append(fallback);const logo=teamLogo(id);if(logo){const im=document.createElement('img');im.alt='';im.loading='eager';im.decoding='async';im.src=logo;im.addEventListener('load',()=>{fallback.hidden=true},{once:true});im.addEventListener('error',()=>{im.remove();fallback.hidden=false},{once:true});el.append(im)}return el};
async function refresh(){
 msg('Caricamento dei post…');
 const result=await sb.from('sococup_posts').select('*').order('created_at',{ascending:false}).limit(50);
 if(result.error){msg('Bacheca non disponibile: '+result.error.message,true);return}
 const posts=result.data||[];feed.replaceChildren();
 if(!posts.length){feed.append(make('p','', 'Ancora nessun post. Inaugura tu Soco X!'));msg('Bacheca pronta · nessun post pubblicato');return}
 const ids=posts.map(p=>p.id);let comments=[],likes=[],botComments=[];
 const c=await sb.from('sococup_comments').select('*').in('post_id',ids).order('created_at',{ascending:true}).limit(500);
 if(!c.error)comments=c.data||[];
  const bc=await sb.from('sococup_bot_comments').select('id,post_id,bot_name,content,created_at').in('post_id',ids).order('created_at',{ascending:true}).limit(500);
  if(!bc.error)botComments=bc.data||[];
 const l=await sb.from('sococup_likes').select('*').in('post_id',ids).limit(2000);
 if(!l.error)likes=l.data||[];
 const authors=[...new Set([...posts,...comments].map(getAuthor).filter(Boolean))];
 if(authors.length){const profiles=await sb.from('sococup_profiles').select('user_id,team_id').in('user_id',authors);if(!profiles.error)for(const p of profiles.data||[])authorTeams.set(p.user_id,Number(p.team_id));}
 if(uid&&team)authorTeams.set(uid,team);
 const selector=$('soco-team-filter');
 if(selector){selector.replaceChildren();const all=make('button','soco-filter'+(!activeTeam?' selected':''),'Tutti');all.type='button';all.onclick=()=>{activeTeam=0;refresh()};selector.append(all);for(const [id,name] of teams){const count=posts.filter(p=>teamId(p)===id).length;const btn=make('button','soco-filter'+(activeTeam===id?' selected':''),name+' · '+count);applyTheme(btn,id);btn.type='button';btn.onclick=()=>{activeTeam=id;refresh()};selector.append(btn)}}
 const profile=$('soco-profile');
 if(profile){
  profile.hidden=!activeTeam;
  if(activeTeam){
   const name=teams.get(activeTeam)||'Fantasquadra';
   const count=posts.filter(p=>teamId(p)===activeTeam).length;
   const n=$('soco-profile-name'),a=$('soco-profile-avatar'),s=$('soco-profile-stats'),back=$('soco-profile-back');
   n.textContent=name;a.replaceChildren(avatar(name,activeTeam));applyTheme(profile,activeTeam);
   s.textContent=count+' '+(count===1?'post':'post')+' tra gli ultimi '+posts.length+' della lega';
   back.onclick=()=>{activeTeam=0;refresh()};
  }
 }
 const visible=activeTeam?posts.filter(p=>teamId(p)===activeTeam):posts;
 if(!visible.length)feed.append(make('p','soco-empty','Nessun post pubblicato da questa squadra.'));
 for(const post of visible){
 const card=make('article','soco-post');applyTheme(card,teamId(post));const head=make('div','soco-post-head');head.append(post.identity_type==='personal'?make('span','soco-person-avatar','👤'):avatar(displayName(post),teamId(post)));
 const authorButton=make('button','soco-author',displayName(post));authorButton.type='button';authorButton.title='Vedi i post di '+displayName(post);authorButton.onclick=()=>{activeTeam=teamId(post);refresh();document.getElementById('soco-team-filter')?.scrollIntoView({behavior:'smooth',block:'start'})};if(post.identity_type!=='personal')head.append(make('span','soco-official','✓ Squadra ufficiale'));else head.append(make('span','soco-person-tag','Allenatore / tifoso'));head.append(authorButton,make('small','',formatDate(post.created_at)));card.append(head,make('p','soco-post-body',getText(post)));
 const own=getAuthor(post)===uid;
 if(own){const del=make('button','soco-small','Elimina post');del.type='button';del.addEventListener('click',async()=>{if(!confirm('Eliminare questo post?'))return;const r=await sb.from('sococup_posts').delete().eq('id',post.id).eq('author_id',uid);if(r.error)msg('Eliminazione non riuscita: '+r.error.message,true);else refresh()});card.append(del)}
 const related=comments.filter(x=>String(getPostRef(x))===String(post.id)),reaction=likes.filter(x=>String(getPostRef(x))===String(post.id));
 const actions=make('div','soco-actions');const like=make('button','soco-small',`♥ ${reaction.length} Mi piace`);like.type='button';const liked=reaction.some(x=>getAuthor(x)===uid);if(liked)like.classList.add('is-liked');like.disabled=!uid;
 like.addEventListener('click',async()=>{like.disabled=true;let r;if(liked){r=await sb.from('sococup_likes').delete().eq('post_id',post.id).eq('user_id',uid)}else{r=await sb.from('sococup_likes').insert({post_id:post.id,user_id:uid})}if(r.error){msg('Mi piace non salvato: '+r.error.message,true);like.disabled=false}else refresh()});actions.append(like);card.append(actions);
 const discussion=make('div','soco-comments');for(const comment of related){const item=make('div','soco-comment');applyTheme(item,teamId(comment));const title=make('strong','',displayName(comment)+(comment.identity_type==='personal'?' · Allenatore/tifoso · ':' · ✓ Squadra · '));item.append(title,document.createTextNode(getText(comment)));
 // Show the action only for comments owned by the authenticated user.
 if(uid&&String(getAuthor(comment))===String(uid)){
  const remove=make('button','soco-small soco-delete-comment','Elimina');remove.type='button';remove.setAttribute('aria-label','Elimina il tuo commento');
  remove.style.cssText='display:inline-block;margin-left:8px;font-size:12px;text-decoration:underline;';
  remove.addEventListener('click',async()=>{
   if(!confirm('Vuoi eliminare questo commento?'))return;
   remove.disabled=true;
   const ownerColumn=comment.author_id!=null?'author_id':comment.user_id!=null?'user_id':'profile_id';
   const result=await sb.from('sococup_comments').delete().eq('id',comment.id).eq(ownerColumn,uid).select('id');
   if(result.error){msg('Impossibile eliminare il commento: '+result.error.message,true);remove.disabled=false;return}
   if(!result.data?.length){msg('Commento non eliminato: controlla i permessi del database.',true);remove.disabled=false;return}
   await refresh();
  });item.append(remove)
 }
 discussion.append(item)}for(const botComment of botComments.filter(x=>String(x.post_id)===String(post.id))){const item=make('div','soco-comment soco-bot-comment');item.setAttribute('aria-label','Commento di personaggio virtuale');const p=virtualByName.get(botComment.bot_name);if(p){item.append(virtualAvatar(p,true));const block=make('div','virtual-comment-text');const name=make('button','virtual-name',p.name);name.type='button';name.onclick=()=>openVirtualProfile(p);block.append(name,make('span','virtual-handle',' · '+p.handle+' · Bot virtuale'));block.append(make('div','',botComment.content||''));item.append(block)}else{const block=make('div','virtual-comment-text');block.append(make('strong','',botComment.bot_name||'Profilo virtuale'),make('div','',botComment.content||''));item.append(block)}discussion.append(item)}card.append(discussion);
 if(uid){const cf=make('form','soco-comment-form');const input=make('input');input.type='text';input.maxLength=250;input.required=true;input.placeholder='Scrivi un commento…';input.setAttribute('aria-label','Commento al post');const submit=make('button','soco-small','Invia');submit.type='submit';cf.append(input,submit);cf.addEventListener('submit',async ev=>{ev.preventDefault();const content=input.value.trim();if(!content)return;submit.disabled=true;const identity=identityPayload();if(!identity){submit.disabled=false;return}const r=await sb.from('sococup_comments').insert({post_id:post.id,author_id:uid,content,...identity});if(r.error){msg('Commento non pubblicato: '+r.error.message+' (verifica il file SQL della v32)',true);submit.disabled=false}else refresh()});card.append(cf)}feed.append(card)
 }
 msg('Soco X · '+posts.length+' post caricati'+(activeTeam?' · filtro: '+teams.get(activeTeam):''));
}
try{
 const sessionResult=await sb.auth.getSession();const session=sessionResult.data?.session;
 if(session){uid=session.user.id;const profile=await sb.from('sococup_profiles').select('team_id').eq('user_id',uid).maybeSingle();if(profile.error)throw profile.error;if(profile.data?.team_id){team=Number(profile.data.team_id)}}
 const names=await sb.from('sococup_teams').select('id,name');if(!names.error)for(const t of names.data||[])teams.set(Number(t.id),t.name);
 if(team){personalName=localStorage.getItem('soco_personal_name_'+uid)||'';postingAs=localStorage.getItem('soco_identity_'+uid)||'team';identityPicker();who.textContent='Account collegato: '+teams.get(team); composer.hidden=false;login.hidden=true}else{uid=null;who.textContent='Puoi leggere la bacheca. Per pubblicare, accedi con la tua squadra.';composer.hidden=true;login.hidden=false}
 await refresh();
}catch(e){msg('Errore di collegamento: '+(e.message||String(e)),true);login.hidden=false}
form.addEventListener('submit',async ev=>{ev.preventDefault();if(!uid||!team||busy)return;const input=$('online-post-text'),content=input.value.trim();if(!content||content.length>500)return;busy=true;const btn=form.querySelector('button');btn.disabled=true;msg('Pubblicazione…');const identity=identityPayload();if(!identity){busy=false;btn.disabled=false;return}const r=await sb.from('sococup_posts').insert({author_id:uid,content,...identity});busy=false;btn.disabled=false;if(r.error){msg('Pubblicazione non riuscita: '+r.error.message+' (verifica di aver applicato il file SQL della v32)',true)}else{input.value='';refresh()}});
});
})();