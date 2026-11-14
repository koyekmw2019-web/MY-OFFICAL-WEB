import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const icons = [
  '<path d="m3 10 9-7 9 7v10H15v-7H9v7H3z"/>',
  '<path d="M12 5v16M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1z"/>',
  '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3"/>',
  '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
];
const tabs = [['home','Home','/#home'],['study','Study','/#study-hub'],['exam','Exam','/mock-exams.html'],['video','Video','/video-class.html'],['account','Account','/dashboard.html']];
const nav = '<div class="yk-mobile-nav-space" aria-hidden="true"></div><nav id="yk-mobile-nav" aria-label="Main navigation">' + tabs.map(([key,label,href],i)=>`<a data-tab="${key}" href="${href}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[i]}</svg><span>${label}</span></a>`).join('') + '</nav><script defer src="/assets/yk-mobile-nav.js?v=1"></script>';
function walk(dir) { return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]); }
let count=0;
for(const file of walk('dist')) {
  let html=readFileSync(file,'utf8');
  if(html.includes('id="yk-mobile-nav"')) throw new Error(`Navigation already injected: ${file}`);
  if(!html.includes('</head>') || !html.includes('</body>')) throw new Error(`Incomplete HTML: ${file}`);
  html=html.replace('</head>','<link rel="stylesheet" href="/assets/yk-mobile-nav.css?v=1"></head>').replace('</body>',nav+'</body>');
  writeFileSync(file,html); count++;
}
if(count<22) throw new Error(`Missing expected public pages: ${count}`);
console.log(`PASS mobile navigation injected into ${count} public pages`);
