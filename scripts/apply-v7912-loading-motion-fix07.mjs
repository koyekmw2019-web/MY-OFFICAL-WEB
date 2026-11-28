/* FIX07 — generated UI only, after existing release build and routing patches.
   Reuses actual pending states. Does not modify Identity, exam timer, data,
   roles, payment handlers, backend or service worker. */
import assert from 'node:assert/strict';
import {copyFileSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const motion='yk-v7912-fix07-page-motion.css',loading='yk-v7912-fix07-loading.css';
const mobileHome='yk-v7912-fix08-mobile-home.css';
for(const asset of [motion,loading,mobileHome])copyFileSync(resolve('assets',asset),join(dist,'assets',asset));
const pages=readdirSync(dist,{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
const dashboards=new Set(['dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html']);
const sensitive=page=>page==='login.html'||page==='mock-second-license.html'||page.startsWith('exams/');
const insert=(html,from,to)=>{assert.equal(html.split(from).length,2,'FIX07 expected one anchor: '+from.slice(0,100));return html.replace(from,()=>to);};
const link=asset=>'<link rel="stylesheet" href="/assets/'+asset+'?v=7912-fix07">';
// Native transitions can be skipped even on a modern browser. A no-delay
// content reveal is used only when the arriving document has no transition.
const entry='<script id="yk07-motion-entry">(()=>{const root=document.documentElement;const reveal=()=>{if(window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches)root.classList.add("yk07-entry")};if("onpagereveal" in window)window.addEventListener("pagereveal",e=>{if(!e.viewTransition)reveal()});else document.addEventListener("DOMContentLoaded",reveal,{once:true});document.addEventListener("animationend",e=>{if(e.animationName==="yk7912Entry")root.classList.remove("yk07-entry")})})();</script>';

const panel='<div class="yk07-skeleton" aria-hidden="true"><div class="yk07-sk-panel"><span class="yk07-sk-heading"></span><span class="yk07-sk-line"></span><div class="yk07-sk-grid">'+ '<span class="yk07-sk-tile"></span>'.repeat(6)+'</div></div></div>';
let motionCount=0,loadingCount=0;
for(const page of pages){
  const file=join(dist,page);
  let html=readFileSync(file,'utf8');
  if(!sensitive(page)){html=insert(html,'</head>',link(motion)+entry+'</head>');motionCount++;}
  if(dashboards.has(page)||['index.html','mock-exams.html','login.html'].includes(page)){
    html=insert(html,'</head>',link(loading)+'</head>');loadingCount++;
  }
  if(dashboards.has(page)){
    const anchor='<section id="dashboardBody" aria-label="Dashboard content"></section>';
    html=insert(html,anchor,anchor.replace('</section>',panel+'</section>'));
  }
  if(page==='index.html'){
    // FIX13: replace the old red arrival line with the same neutral three-row
    // skeleton as Exam Center. The boot state ends on actual DOM readiness;
    // the existing Mobile Home pending flag takes over only when applicable.
    const homeBoot='<script id="yk7913-home-boot">(()=>{const root=document.documentElement;const home=()=>/^\\/(?:index(?:\\.html)?)?$/.test(location.pathname)&&(!location.hash||location.hash==="#home");if(!home())return;root.setAttribute("data-yk7913-home-boot","true");const done=()=>root.removeAttribute("data-yk7913-home-boot");document.addEventListener("DOMContentLoaded",done,{once:true});window.addEventListener("pageshow",done,{once:true});window.addEventListener("hashchange",()=>{if(!home())done()});setTimeout(done,12000)})();</script>';
    const row='<div class="yk791-sk-row"><i class="yk791-sk-circle"></i><i class="yk791-sk-line"></i><i class="yk791-sk-end"></i></div>';
    const homeSkeleton='<div id="yk7913HomeSkeleton" role="status" aria-live="polite"><span class="yk7913-sr" data-my="ပင်မစာမျက်နှာ ဖွင့်နေသည်…" data-en="Loading Home…" data-ja="ホームを読み込み中…">ပင်မစာမျက်နှာ ဖွင့်နေသည်…</span><div aria-hidden="true"><i class="yk791-sk-line yk791-sk-heading"></i>'+row.repeat(3)+'</div></div>';
    html=insert(html,'</head>', '<link rel="stylesheet" href="/assets/'+mobileHome+'?v=7912-fix13">'+homeBoot+'</head>');
    html=insert(html,'<main class="yk790-dashboard" id="yk790MobileHome"',homeSkeleton+'<main class="yk790-dashboard" id="yk790MobileHome"');
    html=insert(html,'yk-v7900-mobile-home.js?v=7901qa-ui7911','yk-v7900-mobile-home.js?v=7901qa-ui7911-fix13');
    // This loader already owns the three-asset lazy Promise and its retry.
    // Reflect its actual pending state; no new fetch, delay or search behavior.
    html=insert(html,"if(status)status.innerHTML='<p class=\"dictionary-empty\" role=\"status\">Loading dictionary…", "if(status)status.setAttribute('aria-busy','true');\n  if(status)status.innerHTML='<p class=\"dictionary-empty\" role=\"status\">Loading dictionary…");
    html=insert(html,"document.getElementById('yk863RetryDictionary')?.addEventListener('click',load)}});","document.getElementById('yk863RetryDictionary')?.addEventListener('click',load)}})\n   .finally(()=>status?.removeAttribute('aria-busy'));");
  }
  writeFileSync(file,html,'utf8');
}
assert.equal(pages.length,41);assert.equal(motionCount,27);assert.equal(loadingCount,7);
console.log(JSON.stringify({fix:'FIX07',motionRoutes:motionCount,loadingRoutes:loadingCount,sensitiveRoutes:pages.length-motionCount,scope:'generated UI only'}));
