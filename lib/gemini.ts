
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

export const generateLogisticsInsights = async (stats: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analiza estos datos logísticos de Maya Express y proporciona 3 puntos clave de optimización en español. Responde en formato JSON: { "insights": [ { "title": "...", "desc": "..." } ] }. Datos: ${JSON.stringify(stats)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks in the response
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText || '{"insights": []}');
  } catch (error) {
    console.error("Error generating insights:", error);
    return { insights: [{ title: "Error de Análisis", desc: "No se pudieron generar perspectivas en este momento." }] };
  }
};

export const chatWithAssistant = async (message: string, context: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "Eres un experto en logística mexicana, experto en Carta Porte 3.1 y gestión de flotas. Responde de forma concisa y profesional en español."
    });

    const result = await model.generateContent(`Eres el asistente de Maya Express. Contexto: ${context}. Usuario: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chatWithAssistant:", error);
    return "Lo siento, tuve un problema al procesar tu consulta.";
  }
};
