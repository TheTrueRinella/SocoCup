(()=>{'use strict';
const URL='https://ckpmsdxkxhdqqcbnmhjp.supabase.co';
const KEY='sb_publishable_vBBxybG-Q4tkkOLYM_mDlA_ZTA35etI';
const names=['Berlusca Dortmund','STOKE AZZO','Palermo Saint-Rosalia','Hertavernello','Aston Birra','Lamin Kiadura','ipsiwich down','Vecio Lanificio Rossi United','palermo','Ciccio Kebab FC'];
async function start(){
 if(!window.supabase)return;
 const sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 async function read(){try{const {data:{session}}=await sb.auth.getSession();if(!session)return null;const {data,error}=await sb.from('sococup_profiles').select('team_id').eq('user_id',session.user.id).maybeSingle();if(error)return null;const id=Number(data?.team_id);return id>=1&&id<=10?{id,name:names[id-1]}:null}catch{return null}}
 const profile=await read();window.sococupAccount=profile;
 document.dispatchEvent(new CustomEvent('sococup:account',{detail:profile}));
 const nav=document.querySelector('#nav');
 if(nav){let a=[...nav.querySelectorAll('a')].find(x=>x.getAttribute('href')==='login.html');if(!a){a=document.createElement('a');a.href='login.html';nav.append(a)}
 if(profile){a.textContent='Esci';a.classList.add('soco-nav-logout');a.href='#';a.title='Esci da '+profile.name;a.addEventListener('click',async e=>{e.preventDefault();if(!confirm('Vuoi uscire da SocoCup?'))return;try{await sb.auth.signOut();location.href='login.html'}catch{alert('Disconnessione non riuscita. Riprova.')}})}else{a.textContent='Accedi';a.href='login.html'}}
 if(profile){
  let account=nav.querySelector('.soco-nav-account');
  if(!account){account=document.createElement('a');account.className='soco-nav-account';account.href='login.html';nav.insertBefore(account,nav.firstChild)}
  const img=document.createElement('img');img.src='assets/teams-logos/'+profile.id+'.png';img.alt='';img.onerror=()=>img.remove();
  const label=document.createElement('span');label.textContent=profile.name;
  account.replaceChildren(img,label);account.title='Squadra collegata: '+profile.name;
 }
 const menu=document.getElementById('menubtn');
 if(menu){menu.setAttribute('aria-controls','nav');menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String(nav.classList.contains('open'))));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}})}
 const socialAccount=document.querySelector('.left a[href="login.html"]');if(socialAccount)socialAccount.querySelector('.navtext')?.replaceChildren(document.createTextNode(profile?'Esci':'Accedi'));
 if(profile&&socialAccount){socialAccount.addEventListener('click',async e=>{e.preventDefault();if(!confirm('Vuoi uscire da SocoCup?'))return;await sb.auth.signOut();location.href='login.html'})}
 const bottom=document.querySelector('.bottom-nav a[href="login.html"]');if(bottom&&profile){bottom.setAttribute('aria-label','Esci');bottom.addEventListener('click',async e=>{e.preventDefault();if(!confirm('Vuoi uscire da SocoCup?'))return;await sb.auth.signOut();location.href='login.html'})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();