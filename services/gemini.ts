import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { Symptom } from '../types/symptom';
import Constants from 'expo-constants';

// Initialize Gemini API with the key from app config
const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.0-flash';

interface ChatContext {
  symptoms: Symptom[];
  messageHistory: string[];
  userDetails?: {
    name?: string;
    age?: number;
  };
}

const chatContexts = new Map<string, ChatContext>();

async function makeGeminiRequest(
  message: string,
  context: ChatContext,
): Promise<string> {
  try {
    const { symptoms, messageHistory, userDetails } = context;

    const userContext = `User context:
${userDetails?.name ? `Name: ${userDetails.name}` : ''}
${userDetails?.age ? `Age: ${userDetails.age}` : ''}
Recent symptoms: ${symptoms.length > 0 
      ? symptoms.map(s => `${s.description} (${s.severity}/10)`).join(', ')
      : 'No symptoms recorded'}`

    const systemPrompt = `You are an empathetic AI health assistant. ${
      userDetails?.name ? `Address the user as ${userDetails.name}. ` : ''
    }Be friendly and supportive while discussing health concerns. Provide general wellness advice but avoid making specific medical diagnoses. Always encourage users to seek professional medical advice for serious concerns.`;

    const symptomsContext = symptoms.map(s => 
      `- ${s.description} in ${s.bodyPart}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}

${userContext}

Current Symptoms:
${symptomsContext}

Previous Messages:
${messageHistory.join('\n')}

User: ${message}`;

    const response = await fetch(
      `${API_URL}/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Update message history
    context.messageHistory.push(`User: ${message}`);
    context.messageHistory.push(`Assistant: ${responseText}`);
    
    // Keep only last 6 messages for context
    if (context.messageHistory.length > 6) {
      context.messageHistory = context.messageHistory.slice(-6);
    }

    return responseText;
  } catch (error) {
    console.error('Error making Gemini request:', error);
    throw error;
  }
}

export async function startChat(symptoms: Symptom[], userDetails?: { name?: string; age?: number }): Promise<{ id: string }> {
  const sessionId = Date.now().toString();
  
  // Initialize chat context
  chatContexts.set(sessionId, {
    symptoms,
    messageHistory: [],
    userDetails,
  });

  // Initialize chat with context
  const initialPrompt = `Hi! I'm using a symptom tracking app, and I could use someone to talk to about what I'm experiencing. I've listed my current symptoms above. Could you help me understand them better? Feel free to ask me questions about how I'm feeling.`;
  
  try {
    const response = await makeGeminiRequest(initialPrompt, chatContexts.get(sessionId)!);
    return { id: sessionId };
  } catch (error) {
    console.error('Error starting chat:', error);
    chatContexts.delete(sessionId);
    throw error;
  }
}

export async function sendMessage(session: { id: string }, message: string): Promise<string> {
  try {
    return await makeGeminiRequest(message, chatContexts.get(session.id)!);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Clean up function to remove old chat contexts
export function cleanupChat(sessionId: string): void {
  chatContexts.delete(sessionId);
} 