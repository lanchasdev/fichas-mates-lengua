require('../js/rng.js');
['1_4','5_8','9_11'].forEach(f=>require('../levels/levels_'+f+'.js'));
const L=KUMON_LEVELS; let n=0,bad=0;
const ids=L.map(l=>l.id).sort((a,b)=>a-b).join();
console.log('niveles',ids);
for(const l of L)for(const s of l.sublevels){
  const r=makeRng(5);
  for(let i=0;i<50;i++){const e=s.gen(r);n++;
    let blanks=0;
    if(e.kind==='col'){} 
    else if(e.kind==='seq')blanks=e.items.filter(x=>x===null).length;
    else if(e.kind==='tokens')e.tokens.forEach(t=>{if(t==='__'||(t&&t.box))blanks++;if(t&&t.n==='__')blanks++;if(t&&t.d==='__')blanks++;});
    const a=Array.isArray(e.answer)?e.answer.length:1;
    const ok=['col','seq','tokens','problem'].includes(e.kind)&&(e.kind==='col'||e.kind==='problem'||a===blanks)&&JSON.stringify(e).indexOf('−')<0&&['cols2','cols3','wide'].includes(s.layout);
    if(!ok){bad++;if(bad<5)console.log('BAD',s.id,JSON.stringify(e));}
  }}
console.log(n,'ejercicios, malos:',bad);
