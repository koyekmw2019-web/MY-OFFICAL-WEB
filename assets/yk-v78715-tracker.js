/** v7.87.15: bounded, browser-local event record. Does not transmit anything. */
import {INSIGHTS_KEY,cleanEvents,addInsightEvent} from './yk-v78715-insights-engine.js';
export function recordInsightEvent(event){
 try{const old=cleanEvents(JSON.parse(localStorage.getItem(INSIGHTS_KEY)||'[]'));const next=addInsightEvent(old,event);localStorage.setItem(INSIGHTS_KEY,JSON.stringify(next));return true}
 catch{return false}
}
