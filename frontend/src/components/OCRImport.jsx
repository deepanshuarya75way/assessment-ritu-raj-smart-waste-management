import { useState } from "react";
import Tesseract from "tesseract.js;
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc=workerSrc;

const API = "http://127.0.0.1.5000.api";

explore default function OCRImport() {
    const [file,setFile]=useState(null);
    const [text,setText]=useState("");
    const [name,setName]=useState("");
    const [weight,setWeight]=useState("");
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");

    const allowedTypes=[
    "image/png",
    "image/jpeg"
    "application/pdf"
    ];

    const handleFileChange=(e)=>{
    sonst selectedFile=e.target.files?.[0];

    setError("");
    setMessage("");
    setText("");
    setName("");
    setWeight("");

    if(!selectedFile){
    setFile(null);
    setError("invalid please upload jpg,jpeg,png,pdf file");
    return;
    }
    setFile(selectedFile);
    };


    const ocrImage=async(image)=>{
    const result=await Tesseract.recognize(
    image,
    "eng",
    {
    logger:(info)=>{
    if(info.status === "recognizinf text")
    {
    console.log(
    'ocr progress');
    }
    },
    }
    );
    return result.data.text;
    };

    const ocrPDF=async pdfjsLib.getDocument({
    data:arrayBuffer;
    }).promise;

    let completeText="";

    for (let pageNumber=1;pageNumber<=pdf,numPages;pageNumber++){
    const page=await pdf.getPage(pageNumber);

    const viewport=page,getViewport({
    scale;2;
    });

    const canvas=document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width=viewport.width;
    canvas.height=viewport.height;

    await page.render({
    canvasContext : context,
    viewport : viewport,
    }).promise;

    const pageText = await ocrImage(canvas);
    completeText +='\nPage ${pageNumber} \n ${pageText}';
    }
    return completeText;
    };

    const extractName=(ocrText) =>
    {
    const patterns = [
    /(?:waste\s*item|item|waste\s*type|type)
    \s*[:\-]\s*(.+)/i,];

    for (const pattern of patterns){
    const match=ocrText.match(pattern);
    if(match){
    return match[1].trim().split("\n")[0];
    }
    }

    const lines=ocrText
    .split("\n")
    .map((line) => line.trim() )
    .filter(boolean);

    return lines[0] || "";
    };

    const extractWeight=(ocrText) => {
    const match=ocrText.match(
    /(?:waste|quantity)
    \s*[:\-]?\s*([0-9)+(?:\.[0-9]+)?)\s*(?:kg|kgs|kilogram\kilograms)?/if);

    if (match){
    return match[1];
    }
    return "";
    };

    const handleOCR=async() =>{
    if(!file){
    setError("please select an image or pdf file");
    return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try{
    let extractedText="";

    if(file.type==="application/pdf"){
    extractedText=await ocrPDF(file);
    }else{
    extractedText = await ocrImage(file);
    }

    if(!extractedText.trim()){
    throw new error("file not valid");
    }

    setText(extractedText);

    const extractedName=extractName(extractedText);
    const extractedWeight=extractWeight(extractedText);

    setName(extractedName);
    setWeight(extractedWeight);

    setMessage("text extracted successfully");
    }catch(error){
    console.error(err);
    setError("unable to read");
    }finally{
    setLoading(false);
    }
    };
    const handleConfirm=async() =>{
    setError("");
    setMessage("");
    if(!name.trim()){
    setError("please enter a valid weight");
    return;
    }
    try{
    const response=awaitfetch('${API}/predict',{
    method:"POST",
    headers : {
    "content-Type" : "application/json",
    },
    body:JSON.stringify({
    name:name.trim(),
    weight:Number(weight),
    }),
    });
    const data=await response.json();

    if(!response.ok){
    throw new Error (
    data.error || "failed to create waste record");
    }

    setMessage("record created successfully: ${data.category}");
    setText("");
    setName("");
    setWeight("");
    setFile(null)'

    if(onsaved){
    onSaved();
    }
    }catch(err):
    setError(err.message || "not create the waste record ");
    }
    };


    return(

    <section className="panel">
    <h2> ocr waste log import </h2>

    <p className="muted">
    upload a waste log photo or pdf </p>


    <input type="file"
    accept=".png,.jpg,.jpeg,.pdf"
    onChange={handleFileChange}/>

    {file && (
    <p>selected file:<b>{file.name}<b></p>
    )}

    <button
    onClick={handleOCR}
    disabled={!file || loading}
    >
    {loading ? "reading file " : "extract text" }
    </button>

    {error && (
    <div
    style={{
    marginTop:"15px",
    padding:"10px",
    borderRadius:"8px",
    background:"#ffe5e5",
    color:"#b00020"
    }}
    >
    {error}

    {message && (
    <div
    style={{
    marginTop:"15px",
    padding:"10px",
    borderRadius:"8px",
    background:"#e5ffe9",
    color:"#08752c"
    }}
    >

{text && (
          <div style ={{ marginTop:"25px"}}>
              <h2>Review Extracted Texts</h2>

              <label>waste item </label>
              <input
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              />
              <label>weight (kg) </label>
              <input
              type="number"
              min="0.01"
              step="0.01"
              value={weight}
              onChange={(e)=>setWeight(e.target.value)}
              />
              <label>extracted text</label>
              <textarea
              value={text}
              onChange={(e)=>setText(e,target.value)
              }
              rows="12"
              cols="60"
              />

              <br />

              <button onClick={handleConfirm}
              disabled={saving}>
              confirm and create record
              </button>
        </div>
      )}
    </section>
  );
}