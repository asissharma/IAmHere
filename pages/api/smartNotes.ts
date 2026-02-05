import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { action, text, context, filename, history = [], customPrompt } = req.body;

    if (!text && !context && !customPrompt) {
        return res.status(400).json({ error: "Text, context, or custom prompt is required" });
    }

    // Construct prompt based on action
    let prompt = "";
    const fileContext = filename ? `\n\nFile: "${filename}"` : "";

    if (customPrompt) {
        // User's custom request
        prompt = `${customPrompt}${fileContext}\n\nContent: ${text || context}`;
    } else {
        switch (action) {
            case "simplify":
                prompt = `Explain the following text like I'm 5 years old. Use simple analogies. Keep it concise.${fileContext}\n\nText: ${text || context}`;
                break;
            case "summarize":
                prompt = `Provide a structured summary of the following text using bullet points. Highlight key takeaways.${fileContext}\n\nText: ${text || context}`;
                break;
            case "examples":
                prompt = `Provide 3 concrete, real-world examples that illustrate the concepts in the following text. Explain why each example fits.${fileContext}\n\nText: ${text || context}`;
                break;
            case "quiz":
                prompt = `Create a multiple-choice practice question based on this text. Format it with the question, 4 options, and the correct answer with a brief explanation.${fileContext}\n\nText: ${text || context}`;
                break;
            case "action_items":
                prompt = `Extract a checklist of actionable steps or "to-do" items from this text. Verbs should be imperative.${fileContext}\n\nText: ${text || context}`;
                break;
            case "key_concepts":
                prompt = `Identify the main concepts or terms in this text and provide a brief definition for each.${fileContext}\n\nText: ${text || context}`;
                break;
            case "flashcards":
                prompt = `Create 3 Q&A flashcards based on this text. Format as:\nQ: [Question]\nA: [Answer]${fileContext}\n\nText: ${text || context}`;
                break;
            default:
                prompt = `Assist with the following text:${fileContext} ${text || context}`;
        }
    }

    try {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.headers.host}`;

        // Reuse existing chat API with history support
        const response = await axios.post(`${baseUrl}/api/chat`, {
            message: prompt,
            history: history || [],
            systemInstruction: "You are a helpful study assistant. Your goal is to help the user understand their notes better. Be concise, direct, and format your responses in clean markdown for readability."
        });

        const result = response.data.response;
        return res.status(200).json({ result, history: response.data.history });

    } catch (error) {
        console.error("Smart Notes Error:", error);
        return res.status(500).json({ error: "Failed to generate smart insight." });
    }
}
