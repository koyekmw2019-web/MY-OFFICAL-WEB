/* FIX07 — generated UI only, after existing release build and routing patches.
   Reuses actual pending states. Does not modify Identity, exam timer, data,
   roles, payment handlers, backend or service worker. */
import assert from 'node:assert/strict';
import {copyFileSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const motion='yk-v7912-fix07-page-motion.css',loading='yk-v7912-fix07-loading.css';
for(const asset of [motion,loading])copyFileSync(resolve('assets',asset),join(dist,'assets',asset));
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
    // This loader already owns the three-asset lazy Promise and its retry.
    // Reflect its actual pending state; no new fetch, delay or search behavior.
    html=insert(html,"if(status)status.innerHTML='<p class=\"dictionary-empty\" role=\"status\">Loading dictionary…", "if(status)status.setAttribute('aria-busy','true');\n  if(status)status.innerHTML='<p class=\"dictionary-empty\" role=\"status\">Loading dictionary…");
    html=insert(html,"document.getElementById('yk863RetryDictionary')?.addEventListener('click',load)}});","document.getElementById('yk863RetryDictionary')?.addEventListener('click',load)}})\n   .finally(()=>status?.removeAttribute('aria-busy'));");
  }
  writeFileSync(file,html,'utf8');
}
assert.equal(pages.length,41);assert.equal(motionCount,27);assert.equal(loadingCount,7);
console.log(JSON.stringify({fix:'FIX07',motionRoutes:motionCount,loadingRoutes:loadingCount,sensitiveRoutes:pages.length-motionCount,scope:'generated UI only'}));
