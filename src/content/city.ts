// Content ported from the RegLife prototype. Created by Anthony Onoja, Ph.D., University of Surrey.
// Educational content, not legal advice. Reflects public rules and guidance as of mid-2026.
import type { Building, Land, Rect, NoticeBoard } from './types'

export const LANDS: Land[] = [
 {x:0,y:7,w:6,d:9,label:'EU QUARTER'},
 {x:8,y:0,w:11.5,d:5,label:'UK BOROUGH'},
 {x:8,y:7,w:8,d:9,label:'YOUR CAMPUS'},
 {x:18,y:7,w:5,d:5.5,label:'US BAY'},
 {x:8,y:18,w:11,d:5.5,label:'CARE DISTRICT'}
]

export const ROADS: Rect[] = [
 {x:0,y:10.6,w:24,d:.8},   // east-west through EU, campus, US
 {x:11.6,y:0,w:.8,d:23.5}  // north-south through UK, campus, care
]

export const BUILDINGS: Building[] = [
 // your campus
 {id:'hq',x:8.6,y:7.6,w:2.4,d:2.2,h:3.2,k:'own',code:'HQ',name:'Product HQ',sub:'Your campus · classify the product'},
 {id:'lab',x:13,y:7.8,w:1.9,d:2,h:2,k:'own',code:'CHG',name:'Change Control Lab',sub:'Your campus · change impact'},
 {id:'tower',x:15,y:7.4,w:.8,d:.8,h:5.4,k:'own',code:'PMS',name:'Watchtower',sub:'Your campus · post-market monitoring'},
 {id:'model',x:8.6,y:12,w:2.4,d:2,h:2.2,k:'own',code:'ML',name:'Model Lab',sub:'Your campus · hallucination, bias, black box'},
 {id:'soc',x:13,y:12,w:2,d:2,h:2.7,k:'own',code:'SOC',name:'Security Ops Centre',sub:'Your campus · cyber, injection, data leaks'},
 {id:'docs',x:13,y:14.5,w:2,d:1.2,h:1.5,k:'own',code:'DOC',name:'Records Office',sub:'Your campus · work documents to take away'},
 {id:'board',x:8.8,y:14.5,w:2,d:1.1,h:1.4,k:'own',code:'RACI',name:'Boardroom',sub:'Your campus · who needs to be involved'},
 // UK
 {id:'mhra',x:8.6,y:.6,w:2.4,d:2,h:3,k:'uk',code:'MHRA',name:'MHRA',sub:'UK Borough · device regulator'},
 {id:'ico',x:13,y:.6,w:2,d:1.6,h:2,k:'uk',code:'ICO',name:'ICO',sub:'UK Borough · data protection regulator'},
 {id:'nhse',x:8.6,y:3,w:2.4,d:1.5,h:2,k:'uk',code:'NHS',name:'NHS England',sub:'UK Borough · DTAC, DCB0129/0160'},
 {id:'sco',x:15.6,y:.6,w:1.6,d:1.4,h:2.2,k:'uk',code:'SCO',name:'Scotland',sub:'UK Borough · NHS Scotland and Scots law'},
 {id:'wal',x:17.6,y:.6,w:1.4,d:1.4,h:1.8,k:'uk',code:'WAL',name:'Wales',sub:'UK Borough · NHS Wales and Welsh language'},
 {id:'ni',x:15.6,y:2.6,w:1.6,d:1.3,h:1.8,k:'uk',code:'NI',name:'Northern Ireland',sub:'UK Borough · Windsor Framework'},
 {id:'nice',x:13,y:2.9,w:1.8,d:1.5,h:1.6,k:'uk',code:'NICE',name:'NICE',sub:'UK Borough · evidence standards'},
 // EU
 {id:'nb',x:.6,y:7.6,w:2,d:2,h:2.5,k:'eu',code:'NB',name:'Notified Body',sub:'EU Quarter · conformity assessment'},
 {id:'aio',x:3.6,y:7.6,w:2,d:2,h:3.3,k:'eu',code:'AIO',name:'EU AI Office',sub:'EU Quarter · AI Act'},
 {id:'dpa',x:.6,y:12,w:2,d:2,h:2,k:'eu',code:'DPA',name:'Data Protection Authority',sub:'EU Quarter · GDPR'},
 {id:'mdcg',x:3.6,y:12,w:2,d:1.8,h:1.6,k:'eu',code:'MDCG',name:'MDCG',sub:'EU Quarter · device guidance'},
 // US
 {id:'fda',x:18.6,y:7.6,w:2.6,d:2,h:3.1,k:'us',code:'FDA',name:'FDA',sub:'US Bay · device regulator'},
 // care
 {id:'trust',x:15.6,y:18.6,w:2.6,d:2,h:2.6,k:'care',code:'TRUST',name:'Trust Digital Office',sub:'Care District · deployer duties and checklist'},
 {id:'drills',x:15.6,y:21.2,w:2.4,d:1.6,h:1.8,k:'care',code:'DRILL',name:'Drill Hall',sub:'Care District · is this a trigger?'},
 {id:'hospital',x:8.6,y:18.6,w:2.6,d:2.2,h:3,k:'care',code:'H',name:'General Hospital',sub:'Care District · deployer duties'},
 {id:'clinic',x:13,y:18.6,w:1.6,d:1.6,h:1.5,k:'care',code:'PT',name:'Patients’ Forum',sub:'Care District · patient rights'},
 {id:'court',x:13,y:21,w:2.2,d:1.6,h:2.2,k:'care',code:'CRT',name:'High Court',sub:'Care District · liability'},
 {id:'library',x:8.6,y:21.4,w:2.4,d:1.3,h:1.6,k:'care',code:'LIB',name:'The Library',sub:'Care District · frameworks'}
]

export const BY_ID: Record<string, Building> = Object.fromEntries(BUILDINGS.map(b => [b.id, b]))

export const NOTICE_BOARDS: NoticeBoard[] = [
 {x:19,y:3.7,t1:'AI ACT · DEVICES',t2:'Annex I · Aug 2027',go:'aio'},
 {x:22.2,y:12,t1:'FDA PCCP',t2:'Plan model changes',go:'fda'},
 {x:18.6,y:23.2,t1:'PRODUCT LIABILITY',t2:'EU PLD · 9 Dec 2026',go:'court'}
]
