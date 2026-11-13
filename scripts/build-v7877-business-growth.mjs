/** v7.87.7 cumulative post-build addition. Runs AFTER v7.87.6.
 * Leaves existing homepage, 12 exam engines, Student/Member Dashboards,
 * existing identity/paid access/YKCR/API and SEO canonical markup untouched.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist');
const read=p=>readFileSync(join(root,p),'utf8');
const write=(p,s)=>writeFileSync(join(root,p),s,'utf8');
const assets=['assets/yk-v7877-growth.css','assets/yk-v7877-growth.js','assets/yk-v7877-cta.css','assets/yk-v7877-cta.js'];
for(const p of assets)assert(existsSync(join(root,p)),`Missing published ${p}`);
const inject=(page,head,body)=>{
 assert.equal(page.split('</head>').length-1,1,'Missing single head close');
 assert.equal(page.split('</body>').length-1,1,'Missing single body close');
 return page.replace('</head>',head+'\n</head>').replace('</body>',body+'\n</body>');
};
// Admin-only: append an independent analytics panel, not a replacement Dashboard.
let admin=read('admin-dashboard.html');
for(const token of ['<body data-dashboard="admin">','id="dashboardBody"','yk-dashboard-v758.js','yk-dashboard-pro-v784.js'])assert(admin.includes(token),'Missing original Admin Dashboard marker: '+token);
assert(!admin.includes('yk-v7877-growth.js'),'Prevent duplicate Admin build');
admin=inject(admin,'<link rel="stylesheet" href="/assets/yk-v7877-growth.css?v=7877">',
 '<script defer src="/assets/yk-v7877-growth.js?v=7877"></script>');
write('admin-dashboard.html',admin);
// The current class consultation URL is already published by the website's Video Course page.
const contact='https://www.facebook.com/share/19kc6Vk9XM/';
const video=read('video-class.html');
assert(video.includes(`href="${contact}"`),'Do not invent a new Facebook consultation destination');
const routes=['truck','taxi','bus'];
for(const course of routes){
 const pagePath=`study/ssw-${course}.html`;
 let html=read(pagePath);
 assert(html.includes('<main class="wrap">')&&html.includes('<a class="cta" href="/mock-exams.html">'),pagePath+' original study guide missing');
 assert(html.includes('STUDYING WITH YE KUN'),pagePath+' original brand missing');
 const old='<div><a class="cta" href="/mock-exams.html">';
 assert.equal(html.split(old).length-1,1,pagePath+' duplicate Mock CTA');
 const banner=`<a class="yk877-class-cta" data-yk877-course="${course}" href="${contact}" target="_blank" rel="noopener noreferrer" aria-label="${course.toUpperCase()} class information on Facebook">`+
   `STUDYING WITH YE KUN · သင်တန်းစုံစမ်းရန် ↗</a><small class="yk877-class-note">`+
   `Facebook ပေါ်မှာ သင်တန်းအကြောင်း စုံစမ်းနိုင်ပါတယ်။ Button click သာ စာရင်းကောက်ပါမယ်။</small>`;
 // Append beside (not replace) existing Mock Exam CTA.
 html=html.replace(old,'<div>'+banner+'<a class="cta" href="/mock-exams.html">');
 html=inject(html,'<link rel="stylesheet" href="/assets/yk-v7877-cta.css?v=7877">',
  '<script defer src="/assets/yk-v7877-cta.js?v=7877"></script>');
 assert(html.includes(`data-yk877-course="${course}"`)&&html.includes('/mock-exams.html'));
 write(pagePath,html);
}
// Existing Video Course contact button is reused; no new contact address.
let updatedVideo=video;
const oldVideo=`<a class="vc-btn vc-btn-red" href="${contact}" target="_blank" rel="noopener noreferrer">`;
assert.equal(updatedVideo.split(oldVideo).length-1,1,'Existing video class consultation link changed');
updatedVideo=updatedVideo.replace(oldVideo,`<a class="vc-btn vc-btn-red" data-yk877-course="general" href="${contact}" target="_blank" rel="noopener noreferrer">`);
updatedVideo=inject(updatedVideo,'','<script defer src="/assets/yk-v7877-cta.js?v=7877"></script>');
write('video-class.html',updatedVideo);
// 12 Exam and Student Dashboard files are intentionally not read or modified here.
console.log(JSON.stringify({version:'7.87.7',adminGrowthPanel:1,classLandingPages:3,videoConsultationTracked:1,
 newProtectedFunctions:1,newPublicClickFunctions:1,existingExamEnginesChanged:false,
 existingIdentityPaymentYKCRChanged:false,newStudentDatabase:false,anonymousViewTracking:false},null,2));
