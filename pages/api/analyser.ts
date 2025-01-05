import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";

const upload = multer({  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
  if (req.method === "POST") {
    upload.single("file")(req as any, {} as any, async (err: any) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "File upload error." });
        return;
      }

      const { url, text, analysisType,analysisPrompt } = req.body;
      const file = (req as any).file;

      try {
        // Step 1: Extract Text
        const textContent = await extractTextFromFile(file, url, text);
        const initialPrompt = `you have to ${analysisType} the given data`;
        // Step 2: Chunking and Processing
        const chunks = processChunks(textContent,initialPrompt);
        const finalPrompt = analysisPrompt
        const finalOutput = await sendPromptToGemini(baseUrl, chunks,analysisPrompt);
        
        res.status(200).json({ history: chunks,summary: finalOutput });
      } catch (error) {
        console.error("Error in processing:", error);
        res.status(500).json({ error: "Processing error." });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}

/**
 * Extract text from the provided file, URL, or plain text.
 *
 * @param {File} file - The uploaded file.
 * @param {string} url - The provided URL for remote content.
 * @param {string} text - Plain text provided by the user.
 * @returns {Promise<string>} Extracted text content.
 */
const extractTextFromFile = async (file : any, url : string, text : string) => {
  if (text) return text;
  else if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileBuffer = fs.readFileSync(file.path);

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
  }else if (url) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer", // To handle binary data like PDFs or DOCX
      });

      const contentType = response.headers["content-type"]?.toLowerCase();

      if (contentType.includes("application/pdf")) {
        // Handle PDF from URL
        const pdfData = await pdfParse(response.data);
        return pdfData.text;
      } else if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        // Handle DOCX from URL
        const { value: docxText } = await mammoth.extractRawText({
          buffer: Buffer.from(response.data),
        });
        return docxText;
      } else if (contentType.includes("text/plain")) {
        // Handle plain text files from URL
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
 *
 * @param {string} text - The text to chunk.
 * @param {number} chunkSize - The size of each chunk (default: 500 characters).
 * @returns {Object[]} Array of history items for Gemini API.
 */
const processChunks = (text: string, initialPrompt:string,chunkSize = 2000) => {
  const chunks = [];
    chunks.push({ role: "user", text: initialPrompt });
    chunks.push({ role: "model", text: "Ok start with sending the data" });
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({ role: "user", text: text.slice(i, i + chunkSize) });
    chunks.push({ role: "model", text: "next response" });
  }
  return chunks;
};

/**
 * Send a text chunk to the Gemini API for processing based on analysis type.
 *
 * @param {Object[]} history - The conversation history, including all previous chunks.
 * @param {string} message - Final instruction after all chunks are sent.
 * @param {string} analysisType - The type of analysis to perform (e.g., summarize, qa).
 * @returns {Promise<string>} The processed output.
 */
const sendPromptToGemini = async (baseUrl : string, history : any, message:string) => {
    const MAX_RETRIES = 3;
    let attempt = 0;
    console.log(message);
    try{ 
      const response = await axios.post(`${baseUrl}/api/chat`, {
        message,
        history,
        systemInstruction: `You are an expert tutor generating precise`,
      });
      return response.data.response;
    } catch (error) {
        console.error("Error after retries:",error);
        return "Failed to process your request. Please try again later.";
    }
  };
  