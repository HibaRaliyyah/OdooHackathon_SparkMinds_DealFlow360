// ============================================================
// DealFlow360 — OpenRouter AI Client
// Server-side only — never expose API key to browser
// ============================================================

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
export async function callOpenRouter(messages: ChatMessage[]): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.warn('[AI] OPENROUTER_API_KEY not configured — using fallback');
    return null;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'DealFlow360',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
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
