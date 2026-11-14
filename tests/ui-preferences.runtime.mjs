/** Minimal isolated DOM behavior test; no browser, API, or real accounts. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
class Element {
 constructor(tag='DIV',classes=''){this.tagName=tag.toUpperCase();this.className=classes;this.children=[];this.parentNode=null;this.dataset={};this.attrs={};this.listeners={};this.textContent='';this.innerHTML='';}
 get classList(){const self=this;return {contains:n=>self.className.split(' ').includes(n),add:n=>{if(!self.className.split(' ').includes(n))self.className=(self.className+' '+n).trim()},remove:n=>{self.className=self.className.split(' ').filter(x=>x!==n).join(' ')},toggle:(n,force)=>{let has=self.className.split(' ').includes(n),val=force===undefined?!has:force;self.className=val?[...new Set([...self.className.split(' ').filter(Boolean),n])].join(' '):self.className.split(' ').filter(x=>x!==n).join(' ');return val}}}
 append(...xs){for(const x of xs)this.insertBefore(x,null)}
 insertBefore(el,before){if(el.parentNode)el.parentNode.children=el.parentNode.children.filter(x=>x!==el);const i=this.children.indexOf(before);if(i<0)this.children.push(el);else this.children.splice(i,0,el);el.parentNode=this;return el}
 get nextSibling(){if(!this.parentNode)return null;return this.parentNode.children[this.parentNode.children.indexOf(this)+1]||null}
 getAttribute(k){return this.attrs[k]??null}
 hasAttribute(k){return Object.hasOwn(this.attrs,k)}
 setAttribute(k,v){this.attrs[k]=String(v)}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}
 click(){const e={target:this,stopPropagation:()=>{},key:null};for(const f of this.listeners.click||[])f(e);for(const f of doc.listeners.click||[])f(e)}
 closest(s){let el=this;while(el){if(el.matches(s))return el;el=el.parentNode}return null}
 focus(){}
 contains(t){return t===this||this.children.some(c=>c.contains(t))}
 matches(s){return s.startsWith('.')?this.className.split(' ').includes(s.slice(1)):s.startsWith('#')?this.id===s.slice(1):this.tagName===s.toUpperCase()}
 querySelector(s){if(s==='.yk-ui-lang-value' && this.innerHTML.includes('yk-ui-lang-value')){this._langValue??={textContent:'မြန်မာ'};return this._langValue}return this.querySelectorAll(s)[0]||null}
 querySelectorAll(s){const selectors=s.split(',').map(x=>x.trim()),found=[];const walk=node=>{for(const child of node.children){if(selectors.some(sel=>child.matches(sel)))found.push(child);walk(child)}};walk(this);return found}
}
const html=new Element('HTML');html.lang='my';html.setAttribute('data-yk-ui-theme','dark');
const body=new Element('BODY');const header=new Element('DIV','header-actions');const lang=new Element('DIV','lang lang-switch');const options=['my','en','ja'].map((c,i)=>{let b=new Element('BUTTON',i===0?'active':'');b.dataset.lang=c;b.textContent={my:'မြန်မာ',en:'English',ja:'日本'}[c];return b});
for(const b of options)lang.append(b);header.append(lang,new Element('BUTTON','menu-toggle'));body.append(header);html.append(body);
const doc={documentElement:html,body,readyState:'complete',listeners:{},createElement:t=>new Element(t),addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},querySelector(s){if(s.includes('> .lang-switch'))return lang;if(s.includes('.header-actions,'))return header;if(s==='meta[name="theme-color"]')return null;return html.querySelector(s)},querySelectorAll:s=>html.querySelectorAll(s)};
const store=new Map();const localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
const MutationObserver=class{observe(){}};
options.forEach(b=>b.addEventListener('click',()=>{html.lang=b.dataset.lang;options.forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
vm.runInNewContext(readFileSync('assets/yk-ui-preferences.js','utf8'),{document:doc,localStorage,MutationObserver});
const trigger=html.querySelector('.yk-ui-lang-trigger');const theme=html.querySelector('.yk-ui-theme-toggle');const picker=html.querySelector('.yk-ui-lang-picker');
assert(trigger&&theme&&picker, 'language dropdown and theme toggle inserted');
assert.equal(options.length,lang.children.length,'original language buttons retained');
assert.equal(trigger.getAttribute('aria-expanded'),'false');
trigger.click();assert(picker.classList.contains('yk-ui-lang-open'),'language menu opens');
options[1].click();assert.equal(html.lang,'en','original translation behavior retained');
assert.equal(trigger.querySelector('.yk-ui-lang-value').textContent,'English');
assert.equal(trigger.getAttribute('aria-expanded'),'false','menu closes after selection');
theme.click();assert.equal(html.getAttribute('data-yk-ui-theme'),'light');assert.equal(store.get('yk_ui_theme'),'light');
theme.click();assert.equal(html.getAttribute('data-yk-ui-theme'),'dark');assert.equal(store.get('yk_ui_theme'),'dark');
assert.equal(body.children.length,1,'page structure not duplicated');
console.log('PASS UI runtime mock: existing language action, dropdown, theme toggle, persistence, no network');
