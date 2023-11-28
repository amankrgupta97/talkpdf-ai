import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings';
import md5 from 'md5'

export const getPinecone = () => {
     return new Pinecone({
            environment: process.env.PINECONE_ENVIRONMENT!,
            apiKey: process.env.PINECONE_API_KEY!
        })
    }

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number };
    };
};

export async function loadS3IntoPinecone(fileKey: string) {

    //1-obtain the pdf->download and read from pdf
    console.log('downloading s3 file into file system')
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
        throw new Error("could not download from s3")
    }
    console.log("loading pdf into memory"+file_name)
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[];
    // 2- split and segment the pdf
    const documents = await Promise.all(pages.map(prepareDocument));
    console.log(documents);

    // 3- vectorise and embed individual documents
    // const vectors=await Promise.all(documents.flat().map(embedDocument))
    const vectors = [];

    for (const document of documents.flat()) {
        // Introduce a 30-second delay before processing each document
        await new Promise(resolve => setTimeout(resolve, 21 * 1000));

        // Call the embedDocument function for the current document
        const vector = await embedDocument(document);

        // Push the result into the vectors array
        vectors.push(vector);
    }

    console.log(vectors)

    //4- upload to pinecone
    const client=getPinecone()
    const pineconeIndex= client.index('talkpdf')
    // const namespace=pineconeIndex.namespace(converToAscii(fileKey));
    console.log("inserting vectors into pinecone")
    await pineconeIndex.upsert(vectors)
    return documents[0];
}

async function embedDocument(doc: Document) {

    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)
        return {
            id:hash,
            values:embeddings,
            metadata:{
                text:doc.metadata.text,
                pageNumber:doc.metadata.pageNumber
            }
        } as PineconeRecord

    } catch (error) {
        console.log('error embedding document')
        throw error
    }

}
export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}
async function prepareDocument(page: PDFPage) {
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, '')
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ])
    return docs
}