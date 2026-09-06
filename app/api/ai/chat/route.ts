import { NextResponse } from 'next/server';
import { callOpenRouter, ChatMessage } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `You are DealFlow Copilot, the official AI assistant for DealFlow360 Enterprise CPQ.
Your job is to assist users with:
1. Understanding DealFlow360 B2B CPQ features (Quotation builder, Tier pricing, Discount governance, Risk flags).
2. Explaining multi-stage approvals (Sales Rep -> Sales Manager -> Finance Controller).
3. Guiding multi-warehouse fulfillment allocation (North America Hub, East Coast Depot, West Coast Depot).
4. Explaining One-Time and Recurring Subscription billing cycles.
5. Answering questions concisely, professionally, and accurately.

CRITICAL FORMATTING RULES:
- DO NOT use literal asterisks (*) or double-asterisks (**) anywhere in your response.
- Present answers in clean structured paragraphs, numbered points (1., 2., 3.), or clean bullet points (•).
- Keep formatting elegant, structured, and easy to read.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message || body.prompt;
    const history: ChatMessage[] = body.history || [];

    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'Message parameter is required' }, { status: 400 });
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6), // keep context window of last 6 messages
      { role: 'user', content: userMessage },
    ];

    const aiReply = await callOpenRouter(messages, false);

    if (!aiReply) {
      return NextResponse.json({
        success: true,
        reply: "I'm DealFlow Copilot. I can help you manage your quotations, tier policies, warehouse fulfillment allocations, and recurring invoices!",
        usedFallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      usedFallback: false,
    });
  } catch (error: any) {
    console.error('Chatbot API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Chatbot processing failed' },
      { status: 500 }
    );
  }
}
