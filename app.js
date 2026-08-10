
const names=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const KEY="planner-data-v1"; let data=JSON.parse(localStorage.getItem(KEY)||"{}");
let start=weekStart(new Date()), day=0, page="week";
function key(d){return d.toISOString().slice(0,10)}
function weekStart(d){let x=new Date(d.getFullYear(),d.getMonth(),d.getDate()),n=x.getDay();x.setDate(x.getDate()+(n===0?-6:1-n));return x}
function add(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmt(d){return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"})}
function range(d){let e=add(d,6);return `${d.getDate()} a ${e.getDate()} de ${e.toLocaleDateString("pt-BR",{month:"long"})} de ${e.getFullYear()}`}
function get(k){if(!data[k])data[k]={days:[[],[],[],[],[],[],[]]};return data[k]}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function render(){
 const wk=get(key(start)); document.querySelector("#weekTitle").textContent="Semana de "+range(start);
 document.querySelector("#dayTitle").textContent=names[day]+" • "+fmt(add(start,day));
 const tabs=document.querySelector("#days");tabs.innerHTML="";
 names.forEach((n,i)=>{let b=document.createElement("button");b.className="day"+(i===day?" active":"");b.innerHTML=n+"<small>"+fmt(add(start,i))+"</small>";b.onclick=()=>{day=i;render()};tabs.appendChild(b)});
 const box=document.querySelector("#tasks");box.innerHTML="";
 if(!wk.days[day].length){box.innerHTML='<div class="empty">Nenhuma tarefa ainda.</div>'}
 wk.days[day].forEach((t,i)=>{let r=document.createElement("div");r.className="task"+(t.done?" done":"");
 let c=document.createElement("input");c.type="checkbox";c.checked=t.done;c.onchange=()=>{t.done=c.checked;save();render()};
 let info=document.createElement("div"),title=document.createElement("div");title.className="title";title.textContent=t.text;info.appendChild(title);
 if(t.time){let s=document.createElement("small");s.textContent="🕐 "+t.time;info.appendChild(s)}
 let del=document.createElement("button");del.className="delete";del.textContent="🗑️";del.onclick=()=>{wk.days[day].splice(i,1);save();render()};r.append(c,info,del);box.appendChild(r)});
 let total=0,done=0;Object.values(data).forEach(w=>w.days.forEach(ds=>{total+=ds.length;done+=ds.filter(t=>t.done).length}));
 let p=total?Math.round(done/total*100):0;document.querySelector("#pct").textContent=p+"%";document.querySelector("#bar").style.width=p+"%";
 document.querySelector("#weekView").hidden=page!=="week";document.querySelector("#historyView").hidden=page!=="history";
 document.querySelector("#weekTab").classList.toggle("active",page==="week");document.querySelector("#historyTab").classList.toggle("active",page==="history");
 if(page==="history")renderHistory();
}
function renderHistory(){
 const box=document.querySelector("#history");box.innerHTML="";let keys=Object.keys(data).sort().reverse();
 if(!keys.length){box.innerHTML='<div class="empty">Nenhuma semana salva ainda.</div>';return}
 keys.forEach(k=>{let w=data[k],d=new Date(k+"T00:00:00"),count=w.days.reduce((a,x)=>a+x.length,0),done=w.days.reduce((a,x)=>a+x.filter(t=>t.done).length,0);
 let row=document.createElement("div");row.className="history-row";row.innerHTML="<div><b>Semana de "+range(d)+"</b><small>"+count+" tarefas • "+done+" concluídas</small></div>";
 let open=document.createElement("button");open.className="open";open.textContent="Abrir";open.onclick=()=>{start=d;day=0;page="week";render()};
 let del=document.createElement("button");del.className="delete";del.textContent="🗑️";del.onclick=()=>{if(confirm("Excluir esta semana do histórico?")){delete data[k];save();render()}};
 row.append(open,del);box.appendChild(row);
 })
}
document.querySelector("#form").onsubmit=e=>{e.preventDefault();let t=document.querySelector("#text"),time=document.querySelector("#time");if(!t.value.trim())return;get(key(start)).days[day].push({text:t.value.trim(),time:time.value,done:false});save();t.value="";time.value="";render();t.focus()};
document.querySelector("#prev").onclick=()=>{start=add(start,-7);day=0;render()};
document.querySelector("#next").onclick=()=>{start=add(start,7);day=0;render()};
document.querySelector("#today").onclick=()=>{start=weekStart(new Date());day=0;render()};
document.querySelector("#weekTab").onclick=()=>{page="week";render()};
document.querySelector("#historyTab").onclick=()=>{page="history";render()};
if("serviceWorker" in navigator) addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
render();
