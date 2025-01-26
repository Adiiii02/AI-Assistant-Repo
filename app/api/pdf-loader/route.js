import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function GET(req){

    const requrl = req.url;
    const {searchParams} = new URL(requrl)
    const pdfUrl = searchParams.get('pdfUrl')

    //Load Pdf
    const resp = await fetch(pdfUrl)
    const data = await resp.blob()
    const loader = new WebPDFLoader(data)
    const docs = await loader.load()

    let pdfTextContent = ''
    docs.forEach(doc=>{
        pdfTextContent = pdfTextContent + doc.pageContent
    })

    //Split Text into Chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
      
    const output = await splitter.createDocuments([pdfTextContent]);

    let splitterList = []

    output.forEach(doc=>{
        splitterList.push(doc.pageContent)
    })

    return NextResponse.json({result:splitterList})
}