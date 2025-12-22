// Frontend LLM Service - Updated to use backend proxy

// Determine API URL based on environment
const API_URL = import.meta.env.PROD 
  ? '/api/chat' // In production (served by same origin), use relative path
  : 'http://localhost:3000/api/chat'; // In dev, point to local backend

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callLLM(messages: LLMMessage[], temperature = 0.7, jsonMode = false): Promise<string> {
  try {
    // No API Key needed here anymore! It's securely stored in the backend.
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('LLM API Error:', response.status, errorData);
      throw new Error(`LLM call failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('LLM Service Error:', error);
    return ''; // Return empty string on failure to handle gracefully
  }
}
