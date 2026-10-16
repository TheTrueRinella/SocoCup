(()=>{'use strict';
document.addEventListener('DOMContentLoaded',async()=>{
const $=id=>document.getElementById(id), notice=$('online-notice'),who=$('online-who'),feed=$('online-feed'),login=$('login-panel'),composer=$('online-composer'),form=$('online-post-form');
const URL='https://ckpmsdxkxhdqqcbnmhjp.supabase.co',KEY='sb_publishable_vBBxybG-Q4tkkOLYM_mDlA_ZTA35etI';
const fallback=['Berlusca Dortmund','STOKE AZZO','Palermo Saint-Rosalia','Hertavernello','Aston Birra','Lamin Kiadura','ipsiwich down','Vecio Lanificio Rossi United','palermo','Ciccio Kebab FC'];
const msg=(text,bad=false)=>{notice.textContent=text;notice.style.color=bad?'#ffb4a7':''};
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const formatDate=v=>{try{return new Date(v).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}catch{return ''}};
if(!window.supabase){msg('Libreria Supabase non caricata. Riprova aggiornando la pagina.',true);return}
const sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let uid=null,team=null,teams=new Map(fallback.map((n,i)=>[i+1,n])),busy=false;
const getAuthor=row=>row.user_id??row.author_id??row.profile_id;
const getText=row=>row.content??row.body??row.text??row.message??'';
const getPostRef=row=>row.post_id??row.postid;
const displayName=row=>teams.get(Number(row.team_id))||'Fantasquadra';
async function refresh(){
 msg('Caricamento dei post…');
 const result=await sb.from('sococup_posts').select('*').order('created_at',{ascending:false}).limit(50);
 if(result.error){msg('Bacheca non disponibile: '+result.error.message,true);return}
 const posts=result.data||[];feed.replaceChildren();
 if(!posts.length){feed.append(make('p','', 'Ancora nessun post. Inaugura tu Soco X!'));msg('Bacheca pronta · nessun post pubblicato');return}
 const ids=posts.map(p=>p.id);let comments=[],likes=[];
 const c=await sb.from('sococup_comments').select('*').in('post_id',ids).order('created_at',{ascending:true}).limit(500);
 if(!c.error)comments=c.data||[];
 const l=await sb.from('sococup_likes').select('*').in('post_id',ids).limit(2000);
 if(!l.error)likes=l.data||[];
 for(const post of posts){
 const card=make('article','soco-post');const head=make('div','soco-post-head');head.append(make('strong','',displayName(post)),make('small','',formatDate(post.created_at)));card.append(head,make('p','soco-post-body',getText(post)));
 const own=getAuthor(post)===uid;
 if(own){const del=make('button','soco-small','Elimina post');del.type='button';del.addEventListener('click',async()=>{if(!confirm('Eliminare questo post?'))return;const r=await sb.from('sococup_posts').delete().eq('id',post.id).eq('user_id',uid);if(r.error)msg('Eliminazione non riuscita: '+r.error.message,true);else refresh()});card.append(del)}
 const related=comments.filter(x=>String(getPostRef(x))===String(post.id)),reaction=likes.filter(x=>String(getPostRef(x))===String(post.id));
 const actions=make('div','soco-actions');const like=make('button','soco-small',`♥ ${reaction.length} Mi piace`);like.type='button';const liked=reaction.some(x=>getAuthor(x)===uid);if(liked)like.classList.add('is-liked');like.disabled=!uid;
 like.addEventListener('click',async()=>{like.disabled=true;let r;if(liked){r=await sb.from('sococup_likes').delete().eq('post_id',post.id).eq('user_id',uid)}else{r=await sb.from('sococup_likes').insert({post_id:post.id,user_id:uid})}if(r.error){msg('Mi piace non salvato: '+r.error.message,true);like.disabled=false}else refresh()});actions.append(like);card.append(actions);
 const discussion=make('div','soco-comments');for(const comment of related){const item=make('div','soco-comment');const title=make('strong','',displayName(comment)+' · ');item.append(title,document.createTextNode(getText(comment)));discussion.append(item)}card.append(discussion);
 if(uid){const cf=make('form','soco-comment-form');const input=make('input');input.type='text';input.maxLength=250;input.required=true;input.placeholder='Scrivi un commento…';input.setAttribute('aria-label','Commento al post');const submit=make('button','soco-small','Invia');submit.type='submit';cf.append(input,submit);cf.addEventListener('submit',async ev=>{ev.preventDefault();const content=input.value.trim();if(!content)return;submit.disabled=true;const r=await sb.from('sococup_comments').insert({post_id:post.id,user_id:uid,content});if(r.error){msg('Commento non pubblicato: '+r.error.message,true);submit.disabled=false}else refresh()});card.append(cf)}feed.append(card)
 }
 msg('Soco X · '+posts.length+' post caricati');
}
try{
 const sessionResult=await sb.auth.getSession();const session=sessionResult.data?.session;
 if(session){uid=session.user.id;const profile=await sb.from('sococup_profiles').select('team_id').eq('user_id',uid).maybeSingle();if(profile.error)throw profile.error;if(profile.data?.team_id){team=Number(profile.data.team_id)}}
 const names=await sb.from('sococup_teams').select('id,name');if(!names.error)for(const t of names.data||[])teams.set(Number(t.id),t.name);
 if(team){who.textContent='Stai scrivendo come '+teams.get(team);composer.hidden=false;login.hidden=true}else{uid=null;who.textContent='Puoi leggere la bacheca. Per pubblicare, accedi con la tua squadra.';composer.hidden=true;login.hidden=false}
 await refresh();
}catch(e){msg('Errore di collegamento: '+(e.message||String(e)),true);login.hidden=false}
form.addEventListener('submit',async ev=>{ev.preventDefault();if(!uid||!team||busy)return;const input=$('online-post-text'),content=input.value.trim();if(!content||content.length>500)return;busy=true;const btn=form.querySelector('button');btn.disabled=true;msg('Pubblicazione…');const r=await sb.from('sococup_posts').insert({author_id:uid,content});busy=false;btn.disabled=false;if(r.error){msg('Pubblicazione non riuscita: '+r.error.message,true)}else{input.value='';refresh()}});
});
})();
