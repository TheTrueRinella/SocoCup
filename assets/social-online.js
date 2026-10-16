(async()=>{
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cfg=window.SOCO_BACKEND||{};
const notice=$('#online-notice'), login=$('#login-panel'), composer=$('#online-composer'), feed=$('#online-feed'), who=$('#online-who');
if(!cfg.url||!cfg.publishableKey){notice.textContent='Soco X online non ancora configurato. La V5 contiene già il codice e le regole del database, ma prima di pubblicare e commentare bisogna collegare Supabase. Nessun accesso fittizio è attivo.';return}
if(!window.supabase){notice.textContent='Impossibile caricare il client Supabase. Riprova con connessione internet.';return}
const sb=window.supabase.createClient(cfg.url,cfg.publishableKey);let user=null,team=null;
const error=e=>{notice.textContent=e?.message||String(e)};
async function sync(){const {data:{user:u},error:e}=await sb.auth.getUser();if(e){error(e);return}user=u;team=null;
 if(user){const r=await sb.from('team_members').select('team_name').eq('user_id',user.id).maybeSingle();if(r.error){error(r.error);return}team=r.data?.team_name||null}
 login.hidden=!!user;composer.hidden=!team;$('#logout').hidden=!user;
 who.textContent=user?(team?'Accesso: '+team:'Account autenticato, ma nessuna squadra assegnata. Chiedi all’amministratore di associarla.'): 'Accedi per pubblicare come la tua squadra.';
 await render()}
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();const email=$('#login-email').value.trim(),password=$('#login-password').value;notice.textContent='Accesso in corso…';const r=await sb.auth.signInWithPassword({email,password});if(r.error){error(r.error);return}notice.textContent='Accesso effettuato.';await sync()});
$('#logout').addEventListener('click',async()=>{await sb.auth.signOut();notice.textContent='Disconnesso.';await sync()});
$('#online-post-form').addEventListener('submit',async e=>{e.preventDefault();if(!team)return;const text=$('#online-post-text').value.trim();if(!text)return;const r=await sb.from('social_posts').insert({author_id:user.id,body:text.slice(0,500)});if(r.error){error(r.error);return}$('#online-post-text').value='';notice.textContent='Post pubblicato.';await render()});
feed.addEventListener('submit',async e=>{const form=e.target.closest('.online-reply-form');if(!form)return;e.preventDefault();if(!team)return;const text=form.querySelector('input').value.trim();if(!text)return;const r=await sb.from('social_replies').insert({post_id:form.dataset.id,author_id:user.id,body:text.slice(0,250)});if(r.error){error(r.error);return}notice.textContent='Risposta pubblicata.';await render()});
async function render(){const p=await sb.from('social_posts').select('id,body,created_at,team_name').order('created_at',{ascending:false}).limit(60);if(p.error){error(p.error);return}const posts=p.data||[];let replies=[];if(posts.length){const r=await sb.from('social_replies').select('post_id,body,created_at,team_name').in('post_id',posts.map(x=>x.id)).order('created_at',{ascending:true}).limit(500);if(r.error){error(r.error);return}replies=r.data||[]}
 feed.innerHTML=posts.length?posts.map(p=>`<article class="post"><div class="posthead"><strong>${esc(p.team_name)}</strong><time>${new Date(p.created_at).toLocaleString('it-IT')}</time></div><p>${esc(p.body)}</p>${replies.filter(r=>r.post_id===p.id).map(r=>`<div class="reply"><b>${esc(r.team_name)}</b><p>${esc(r.body)}</p></div>`).join('')}${team?`<form class="online-reply-form replyform" data-id="${esc(p.id)}"><input required maxlength="250" placeholder="Rispondi come ${esc(team)}" aria-label="Rispondi"><button type="submit">Rispondi</button></form>`:''}</article>`).join(''):'<div class="empty">Nessun post online. La bacheca è pronta.</div>'}
 await sync();
})();
