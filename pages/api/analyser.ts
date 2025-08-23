import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";
import path from "path";
import util from "util";

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });
const multerMiddleware = util.promisify(upload.single("file"));

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    responseLimit: "10mb", // Adjust the response limit as needed
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = `${protocol}://${req.headers.host}`;

  if (req.method === "POST") {
    try {
      // Parse the incoming file using multer
      await multerMiddleware(req as any, res as any);

      const { url, text, analysisType, analysisPrompt } = req.body;
      const file = (req as any).file;
      let chunks: any[] = [];
      let finalOutput;
      if(file || url || text ){
        // Step 1: Extract Text
        const textContent = await extractTextFromFile(file, url, text);

        // Initial Prompt
        const initialPrompt = `You have to ${analysisType} the given data.`;

        // Step 2: Chunking and Processing
        chunks = processChunks(textContent, initialPrompt);
      }      
        finalOutput = await sendPromptToGemini(baseUrl, analysisPrompt,chunks);
        chunks.push({ role: "user", text: analysisPrompt});

      res.status(200).json({ history: chunks, summary: finalOutput });
    } catch (error) {
      console.error("Error in processing:", error);
      res.status(500).json({ error: "Processing error." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}

/**
 * Extract text from the provided file, URL, or plain text.
 */
const extractTextFromFile = async (file: any, url: string, text: string): Promise<string> => {
  if (text) return text;

  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileBuffer = file.buffer; // File buffer in memory

    switch (ext) {
      case ".pdf":
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;
      case ".docx":
        const { value: docxText } = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxText;
      case ".txt":
        return fileBuffer.toString("utf8");
      default:
        throw new Error("Unsupported file type.");
    }
  }

  if (url) {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const contentType = response.headers["content-type"]?.toLowerCase();

      if (contentType.includes("application/pdf")) {
        const pdfData = await pdfParse(response.data);
        return pdfData.text;
      } else if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        const { value: docxText } = await mammoth.extractRawText({ buffer: Buffer.from(response.data) });
        return docxText;
      } else if (contentType.includes("text/plain")) {
        return Buffer.from(response.data).toString("utf8");
      } else {
        throw new Error("Unsupported file type at the provided URL.");
      }
    } catch (error) {
      console.error("Error fetching or parsing URL content:", error);
      throw new Error("Failed to extract content from the URL.");
    }
  }

  throw new Error("No valid input provided.");
};

/**
 * Split large text content into smaller chunks for processing.
 */
const processChunks = (text: string, initialPrompt: string, chunkSize = 2000) => {
  const chunks = [{ role: "user", text: initialPrompt }];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({ role: "user", text: text.slice(i, i + chunkSize) });
  }
  return chunks;
};

/**
 * Send a text chunk to the Gemini API for processing based on analysis type.
 */
const sendPromptToGemini = async (baseUrl : string, message:string,history? : any) => {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let historyOfChat = history;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post(`${baseUrl}/api/chat`, {
        message,
        historyOfChat,
        systemInstruction: `You are an expert tutor generating precise insights.`,
      });
      return response.data.response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt === MAX_RETRIES) throw new Error("Failed to process your request after multiple attempts.");
    }
  }
};
