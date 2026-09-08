import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from "recharts";
import "./style.css";

const API="http://127.0.0.1:5000/api";
const cats=["Organic","Recyclable","Hazardous","General"];
function App(){
 const [records,setRecords]=useState([]), [stats,setStats]=useState({});
 const [form,setForm]=useState({name:"",weight:""});
 const [prediction,setPrediction]=useState(null), [loading,setLoading]=useState(false);
 const load=()=>Promise.all([fetch(API+"/records").then(r=>r.json()),fetch(API+"/stats").then(r=>r.json())]).then(([a,b])=>{setRecords(a);setStats(b)});
 useEffect(()=>{load()},[]);
 const classify=async e=>{e.preventDefault();setLoading(true);setPrediction(null);
   const r=await fetch(API+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
   const d=await r.json(); setPrediction(d); setLoading(false); if(d.saved) load();
 };
 const remove=async id=>{await fetch(API+"/records/"+id,{method:"DELETE"});load()};
 const chart=cats.map(c=>({name:c,value:stats[c]||0}));
 return <div className="app">
  <aside><div className="logo">♻️ EcoSort</div><p className="muted">AI Waste Management</p>
   <nav><a href="#dashboard">Dashboard</a><a href="#classify">AI Classifier</a><a href="#records">Records</a></nav>
   <div className="tip"><b>Smart tip</b><br/>Separate dry and wet waste to improve recycling efficiency.</div>
  </aside>
  <main>
   <header><div><span className="eyebrow">SMART WASTE PLATFORM</span><h1>Waste Management Dashboard</h1></div><span className="status">● API Connected</span></header>
   <section id="dashboard" className="cards">
    <Card t="Total Records" v={stats.total||0} i="📋"/><Card t="Recyclable" v={stats.Recyclable||0} i="♻️"/>
    <Card t="Organic" v={stats.Organic||0} i="🌱"/><Card t="Hazardous" v={stats.Hazardous||0} i="⚠️"/>
   </section>
   <section className="grid2">
    <div className="panel"><h2>Waste Distribution</h2><ResponsiveContainer width="100%" height={270}><BarChart data={chart}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
    <div className="panel"><h2>Category Share</h2><ResponsiveContainer width="100%" height={270}><PieChart><Pie data={chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>{chart.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
   </section>
   <section id="classify" className="panel"><h2>🤖 AI Waste Classifier</h2><p className="muted">Enter an item and its approximate weight. The system predicts the appropriate category.</p>
    <form onSubmit={classify} className="form"><input required placeholder="Waste item e.g. plastic bottle" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="number" min="0.01" step="0.01" placeholder="Weight (kg)" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})}/><button disabled={loading}>{loading?"Classifying...":"Classify Waste"}</button></form>
    {prediction&&<div className="result"><div className="resultIcon">♻</div><div><b>{prediction.category}</b><p>{prediction.recommendation}</p><small>Confidence: {prediction.confidence}%</small></div></div>}
   </section>
   <section id="records" className="panel"><div className="row"><h2>Recent Records</h2><button className="secondary" onClick={load}>Refresh</button></div>
    <div className="tableWrap"><table><thead><tr><th>Item</th><th>Weight</th><th>Category</th><th>Confidence</th><th>Action</th></tr></thead><tbody>
     {records.length?records.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.weight} kg</td><td><span className="badge">{r.category}</span></td><td>{r.confidence}%</td><td><button className="delete" onClick={()=>remove(r.id)}>Delete</button></td></tr>):<tr><td colSpan="5" className="empty">No records yet. Classify your first item above.</td></tr>}
    </tbody></table></div>
   </section>
   <footer>EcoSort • Educational waste-management project • AI predictions are for demonstration purposes.</footer>
  </main>
 </div>
}
function Card({t,v,i}){return <div className="card"><span>{i}</span><div><p>{t}</p><strong>{v}</strong></div></div>}
createRoot(document.getElementById("root")).render(<App/>);