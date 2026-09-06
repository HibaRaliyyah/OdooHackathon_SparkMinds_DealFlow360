// ============================================================
// DealFlow360 — OpenRouter AI Client
// Supports both server-side environment variable & active fallback key
// ============================================================

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Send a request to OpenRouter. Returns null if unavailable.
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  jsonMode: boolean = false
): Promise<string | null> {
  const apiKey = OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[AI] OPENROUTER_API_KEY not configured — using fallback');
    return null;
  }

  try {
    const payload: any = {
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 1000,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'DealFlow360',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000), // 20s timeout
    });

    if (!response.ok) {
      console.error(`[AI] OpenRouter error ${response.status}: ${await response.text()}`);
      return null;
    }

    const data = (await response.json()) as OpenRouterResponse;
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error('[AI] OpenRouter request failed:', err);
    return null;
  }
}
