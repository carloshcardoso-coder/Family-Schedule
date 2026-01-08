
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseNaturalLanguageTask = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a seguinte descrição de tarefa e retorne um objeto JSON estruturado: "${input}". 
      Data e hora atual é: ${new Date().toISOString()}.
      Retorne valores para 'title' (título), 'description' (descrição) e 'dueDate' (data de entrega em string ISO). 
      Se o usuário não especificar o ano, assuma o ano atual. Se não especificar a hora, assuma 12:00.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            dueDate: { type: Type.STRING, description: "ISO 8601 date string" },
          },
          required: ["title", "description", "dueDate"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao analisar com Gemini:", error);
    return null;
  }
};
