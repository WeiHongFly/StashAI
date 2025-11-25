import { GoogleGenAI, Type } from "@google/genai";
import { Category, AIAnalysisResult, InventoryItem } from "../types";

// Initialize Gemini Client
// Note: In a production app, API keys should be handled via a secure backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes an image of an item to extract details.
 */
export const analyzeItemImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  try {
    // Determine model based on task. Vision task needs flash-image or pro-image.
    // Using gemini-2.5-flash-image for speed and efficiency for this use case.
    const modelId = 'gemini-2.5-flash-image';

    const prompt = `
      Analyze this image of a household item. 
      Identify the item name.
      Categorize it into one of these: Food, Electronics, Clothing, Documents, Medicine, Tools, Misc.
      If it is food or medicine, try to read the expiry date from the package. Return YYYY-MM-DD format if found, otherwise null.
      Suggest a typical home location for this item (e.g., "Kitchen Pantry", "Medicine Cabinet").
      Add a short 1-sentence description/note.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(Category) },
            expiryDate: { type: Type.STRING, nullable: true },
            suggestedLocation: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ['name', 'category', 'suggestedLocation']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Fallback if parsing fails or returns empty
    return {
      name: result.name || 'Unknown Item',
      category: result.category as Category || Category.Misc,
      expiryDate: result.expiryDate || undefined,
      suggestedLocation: result.suggestedLocation || 'Living Room',
      notes: result.notes
    };

  } catch (error) {
    console.error("Gemini Image Analysis Failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

/**
 * Natural language search/assistant for the inventory.
 */
export const askInventoryAssistant = async (query: string, inventory: InventoryItem[]): Promise<string> => {
  try {
    // Using gemini-2.5-flash for text reasoning
    const modelId = 'gemini-2.5-flash';

    // Prepare context
    const inventoryContext = JSON.stringify(inventory.map(item => ({
      name: item.name,
      location: item.location,
      expiry: item.expiryDate,
      notes: item.notes
    })));

    const prompt = `
      You are StashAI, a helpful home inventory assistant.
      Here is the user's current inventory JSON:
      ${inventoryContext}

      User Query: "${query}"

      Answer the user's question based strictly on the inventory list provided. 
      If the user is looking for an item, tell them the location.
      If they ask about expired items, check the dates against today (${new Date().toISOString().split('T')[0]}).
      Keep the tone friendly, concise, and helpful.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "I couldn't find that in your inventory.";

  } catch (error) {
    console.error("Gemini Chat Failed:", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};
