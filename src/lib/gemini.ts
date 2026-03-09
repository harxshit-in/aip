import { GoogleGenAI, Type } from "@google/genai";

export const analyzeExamPaper = async (apiKey: string, text: string) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
  Analyze the following exam paper text and extract the questions.
  For each question, determine its subject and the specific chapter/topic it belongs to.
  
  Exam Paper Text:
  ${text.substring(0, 30000)} // Limit text to avoid token limits
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_text: { type: Type.STRING },
            subject: { type: Type.STRING },
            detected_chapter: { type: Type.STRING },
            difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" }
          },
          required: ["question_text", "subject", "detected_chapter", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateStudyStrategy = async (apiKey: string, trendsData: any) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
  Based on the following exam trend analysis, generate a study strategy.
  
  Trends Data:
  ${JSON.stringify(trendsData)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          priority_chapters: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          study_time_allocation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapter: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              }
            }
          },
          weekly_plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.STRING },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
