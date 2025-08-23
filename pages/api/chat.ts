// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey: string = process.env.GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

interface HistoryItem {
  role: string;
  text: string;
}

declare module 'marked' {
  interface MarkedOptions {
    highlight?: (code: string, lang: string) => string;
  }
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

marked.setOptions({
  highlight: function (code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlightedCode = hljs.highlight(code, { language }).value;
    return `<div style="scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1); background-color: #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"><pre><code class="hljs language-${language}">${highlightedCode}</code></pre></div>`;
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { message, history, systemInstruction } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let modifiedHistory = [];

      if (history) {
        modifiedHistory = history.map((item: HistoryItem) => ({
          role: item.role,
          parts: [{ text: item.text }]
        }));
      }

      try {
        let InstructionForSystem = systemInstruction || "You are a teacher and be straight forward.";
        let role ="Your name is Kaala Sharma, and you provide insightful, precise, and professional responses."
        const fullInstruction = `${InstructionForSystem} ${role}`;
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: fullInstruction,
        });

        const chatSession = model.startChat({
          generationConfig,
          safetySettings,
          history: modifiedHistory,
        });

        const result = await chatSession.sendMessage(message);
        
        const responseText = result.response.text();
        const formattedResponse = await marked(responseText);
        const styledResponse = formattedResponse.replace(
          /<pre><code class="/g, 
          `<pre style="border: 0.5px solid #555; background-color: #1E1E1E; color: #D4D4D4; border-radius: 30px; padding: 25px; margin-bottom: 16px; box-shadow: 0 4px 12px rgb(255 255 255); width: 100%; max-width: 100%; overflow-x: auto; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1);"><code style="color: inherit; display: block;" class="`
        );
        
        res.status(200).json({ response: styledResponse });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the request' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
}
