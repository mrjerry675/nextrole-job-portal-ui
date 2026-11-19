// Structural test with a small API mock. This does not replace running in Figma.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let serial=0; const all=[];
class Node {
 constructor(type){this.type=type;this.id=String(++serial);this.name=type;this.children=[];this._w=100;this._h=100;this.layoutMode='NONE';this.primaryAxisSizingMode='FIXED';this.counterAxisSizingMode='FIXED';this.itemSpacing=0;this.paddingLeft=this.paddingRight=this.paddingTop=this.paddingBottom=0;this.fontSize=14;this.characters='';this.reactions=[];all.push(this);}
 get width(){return this.size()[0]} get height(){return this.size()[1]}
 size(){
  if(this.type==='TEXT'){const char=this.fontSize*.54,line=this.fontSize*1.45;const rows=this.characters.split('\n');const natural=Math.max(1,...rows.map(r=>r.length*char));if(this.textAutoResize==='HEIGHT')return[this._w,rows.reduce((n,r)=>n+Math.max(1,Math.ceil(r.length*char/this._w)),0)*line];return[natural,rows.length*line];}
  if(this.layoutMode==='NONE'||!this.children.length)return[this._w,this._h];
  const sizes=this.children.map(n=>n.size()),h=this.layoutMode==='HORIZONTAL',gap=this.itemSpacing*(sizes.length-1);
  const pw=this.paddingLeft+this.paddingRight,ph=this.paddingTop+this.paddingBottom;
  const contentW=(h?sizes.reduce((n,s)=>n+s[0],gap):Math.max(...sizes.map(s=>s[0])))+pw;
  const contentH=(h?Math.max(...sizes.map(s=>s[1])):sizes.reduce((n,s)=>n+s[1],gap))+ph;
  return[(h?this.primaryAxisSizingMode:this.counterAxisSizingMode)==='AUTO'?contentW:this._w,(h?this.counterAxisSizingMode:this.primaryAxisSizingMode)==='AUTO'?contentH:this._h];
 }
 resize(w,h){assert(w>0&&h>0);this._w=w;this._h=h;}
 appendChild(n){if(n.parent)n.parent.children=n.parent.children.filter(c=>c!==n);this.children.push(n);n.parent=this;}
 findOne(fn){for(const child of this.children){if(fn(child))return child;const nested=child.findOne(fn);if(nested)return nested;}return null;}
 findAll(fn){return this.children.flatMap(c=>[...(fn(c)?[c]:[]),...c.findAll(fn)]);}
 createInstance(){const copy=n=>{const c=new Node(n.type);for(const key of Object.keys(n))if(!['id','children','parent','reactions'].includes(key))c[key]=n[key];c.reactions=n.reactions.map(r=>JSON.parse(JSON.stringify(r)));for(const child of n.children)c.appendChild(copy(child));return c;};const n=copy(this);n.type='INSTANCE';return n;}
 async setReactionsAsync(r){this.reactions=r;}
}
let current=new Node('PAGE'),closed; const pages=[current];
const result=new Promise(resolve=>{closed=resolve});
const make=type=>{const n=new Node(type);current.appendChild(n);return n;};
const figma={createFrame:()=>make('FRAME'),createRectangle:()=>make('RECTANGLE'),createText:()=>make('TEXT'),createPage:()=>{const p=new Node('PAGE');pages.push(p);return p;},setCurrentPageAsync:async p=>{current=p;},loadFontAsync:async()=>{},createComponentFromNode:n=>{n.type='COMPONENT';return n;},combineAsVariants:(nodes,parent)=>{const s=new Node('COMPONENT_SET');parent.appendChild(s);nodes.forEach(n=>s.appendChild(n));return s;},viewport:{scrollAndZoomIntoView(){}},closePlugin:closed};
vm.runInNewContext(fs.readFileSync('figma-plugin/code.js','utf8'),{figma,console});

(async()=>{
 const message=await result;assert(message.startsWith('Created 21'),message);
 assert.equal(pages.length,2);assert.equal(pages[0].children.length,0);
 const roots=current.children.filter(n=>n.type==='FRAME'&&n.name.startsWith('Nextrole /'));
 assert.equal(roots.length,21);
 const sets=current.children.filter(n=>n.type==='COMPONENT_SET');assert.equal(sets.length,5);
 assert.deepEqual(sets.map(n=>n.children.length),[6,4,2,2,3]);
 assert.equal(current.flowStartingPoints.length,2);
 const ids=new Set(all.map(n=>n.id));let nav=0,variants=0;
 for(const n of all)for(const r of n.reactions)for(const a of r.actions){assert(ids.has(a.destinationId));assert.equal(a.transition.type,'SMART_ANIMATE');if(a.navigation==='CHANGE_TO')variants++;else nav++;}
 assert(variants>=7);assert(nav>30);
 for(const root of roots){assert(root.clipsContent);assert.equal(root.overflowDirection,'VERTICAL');assert(root.width===1440||root.width===390);}
 const horizontalOverflow=[];
 for(const n of all.filter(n=>n.layoutMode==='HORIZONTAL'&&n.children.length)){
   const used=n.children.reduce((total,c)=>total+c.width,0)+n.itemSpacing*(n.children.length-1)+n.paddingLeft+n.paddingRight;
   if(used>n.width+3)horizontalOverflow.push({name:n.name,width:n.width,estimatedUsed:Math.round(used)});
 }
 assert.equal(horizontalOverflow.length,0,JSON.stringify(horizontalOverflow));
 const report={status:'PASS',scope:'API mock, component and route validation, approximate width checks. Native Figma execution is still required.',screens:roots.length,desktopScreens:roots.filter(n=>n.width===1440).length,mobileScreens:roots.filter(n=>n.width===390).length,componentSets:sets.length,navigationReactions:nav,interactiveVariantReactions:variants,flowStarts:2,scrolling:'All screen roots use vertical prototype scrolling.'};
 fs.writeFileSync('figma-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
