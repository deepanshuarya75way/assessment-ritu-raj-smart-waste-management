from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os, re

app=Flask(__name__)
CORS(app)
DB=os.path.join(os.path.dirname(__file__),"waste.db")

def conn():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
def init():
    c=conn(); c.execute("""CREATE TABLE IF NOT EXISTS records(
      id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,weight REAL NOT NULL,
      category TEXT NOT NULL,confidence INTEGER NOT NULL,recommendation TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"""); c.commit(); c.close()
def classify(name):
    s=name.lower()
    rules={
      "Recyclable": ["plastic","bottle","paper","cardboard","can","tin","glass","metal","newspaper","box"],
      "Organic": ["food","fruit","vegetable","vegetables","peel","leaf","leaves","garden","tea","coffee","organic","banana","apple"],
      "Hazardous": ["battery","chemical","paint","bulb","medicine","syringe","pesticide","e-waste","electronic","thermometer"]
    }
    for cat, words in rules.items():
        if any(w in s for w in words): return cat,92
    return "General",78
recs={
 "Recyclable":"Clean and place it in the dry/recyclable waste stream. Reuse when possible.",
 "Organic":"Place it in wet/organic waste for composting or biological processing.",
 "Hazardous":"Keep separate and take it to an authorized hazardous/e-waste collection point.",
 "General":"Place in general waste and avoid mixing it with recyclable or hazardous materials."
}
@app.get("/api/health")
def health(): return jsonify(status="ok",service="EcoSort API")
@app.get("/api/records")
def records():
    c=conn(); rows=c.execute("SELECT * FROM records ORDER BY id DESC").fetchall(); c.close()
    return jsonify([dict(x) for x in rows])
@app.get("/api/stats")
def stats():
    c=conn(); rows=c.execute("SELECT category,COUNT(*) n FROM records GROUP BY category").fetchall(); c.close()
    d={x["category"]:x["n"] for x in rows}; d["total"]=sum(d.values()); return jsonify(d)
@app.post("/api/predict")
def predict():
    data=request.get_json() or {}; name=str(data.get("name","")).strip()
    try: weight=float(data.get("weight",0))
    except: weight=0
    if not name or weight<=0: return jsonify(error="Valid item and weight are required"),400
    category,confidence=classify(name); recommendation=recs[category]
    c=conn(); cur=c.execute("INSERT INTO records(name,weight,category,confidence,recommendation) VALUES(?,?,?,?,?)",
      (name,weight,category,confidence,recommendation)); c.commit(); rid=cur.lastrowid; c.close()
    return jsonify(id=rid,name=name,weight=weight,category=category,confidence=confidence,recommendation=recommendation,saved=True)
@app.delete("/api/records/<int:rid>")
def delete(rid):
    c=conn(); c.execute("DELETE FROM records WHERE id=?",(rid,)); c.commit(); c.close(); return jsonify(deleted=True)
if __name__=="__main__":
    init(); app.run(host="127.0.0.1",port=5000,debug=True)