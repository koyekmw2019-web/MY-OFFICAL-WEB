import assert from 'node:assert/strict';
import {aggregateCohort,periodDays,summarizeFollowups} from '../netlify/functions/_shared/yk-crm-insights-v78717.mjs';
for(const [period,n] of [['7',7],['30',30],['90',90],['all',0],[undefined,30]])assert.equal(periodDays(period),n);
for(const v of ['1','120','0','-1','30;drop','NaN','ALL'])assert.equal(periodDays(v),null);
const data=aggregateCohort([
 {status:'new',course:'truck',lead_source:'facebook',n:3},
 {status:'contacted',course:'truck',lead_source:'youtube',n:2},
 {status:'interested',course:'taxi',lead_source:'youtube',n:4},
 {status:'enrolled',course:'truck',lead_source:'facebook',n:2},
 {status:'closed',course:'bus',lead_source:'referral',n:1},
 {status:'enrolled',course:'taxi',lead_source:'youtube',n:2},
 {status:'hacked',course:'bus',lead_source:'facebook',n:999},
 {status:'enrolled',course:'bus',lead_source:'unknown',n:20}]);
assert.equal(data.total,14);assert.equal(data.active,9);assert.equal(data.counts.enrolled,4);
assert.equal(data.byCourse.truck.total,7);assert.equal(data.byCourse.taxi.enrolled,2);
assert.equal(data.bySource.youtube.total,8);assert.equal(data.enrolledStageSharePercent,28.6);
assert.equal(aggregateCohort([]).enrolledStageSharePercent,null);
const f=summarizeFollowups({overdue:'3',today:2,next_7_days:5,unscheduled:null});
assert.deepEqual(f,{overdue:3,today:2,next7Days:5,unscheduled:0});
assert(!('conversionRate' in data)&&!('revenueYen' in data),'Do not label self-reported status as verified conversion or revenue');
console.log('PASS v78717-engine: valid windows, scoped pipeline groupings, follow-up counts, no fake conversion');
