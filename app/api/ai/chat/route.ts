import { NextResponse } from 'next/server';
import { callOpenRouter, ChatMessage } from '@/lib/ai/openrouter';

const STAFF_SYSTEM_PROMPT = `You are DealFlow Copilot, the official enterprise AI assistant for DealFlow360 CPQ platform staff (Admins, Sales Managers, Sales Reps, and Finance Controllers).
Your job is to assist internal staff with:
1. DealFlow360 B2B CPQ administration (Quotation builder, Tier pricing rules, Discount governance, Risk flags, Margins).
2. Multi-stage approval workflows (Sales Rep -> Sales Manager -> Finance Controller).
3. Multi-warehouse fulfillment allocation logic (North America Hub, East Coast Depot, West Coast Depot, Backordering).
4. One-Time and Recurring Subscription billing cycles, invoices, and accounting.
5. Administrative system configuration, user roles, and deal health audits.

CRITICAL FORMATTING RULES:
- DO NOT use literal asterisks (*) or double-asterisks (**) anywhere in your response.
- Present answers in clean structured paragraphs, numbered points (1., 2., 3.), or clean bullet points (•).
- Keep formatting elegant, structured, and easy to read.`;

const CUSTOMER_DEFAULT_PROMPT = `You are DealFlow, the friendly and supportive customer assistant for DealFlow360 Customer Portal.

CRITICAL SECURITY & ACCESS RESTRICTION RULES:
1. STRICT ACCESS LIMITATION: You are ONLY authorized to answer customer-facing questions regarding quotations, invoices, payments, recurring subscriptions, and order status.
2. ZERO ADMINISTRATION ACCESS: You must NEVER disclose, answer, or discuss:
   - Internal administration, backend settings, or system configuration
   - Internal profit margins, product cost prices, or pricing algorithms
   - Multi-warehouse backend allocation logic, stock transfers, or supplier logistics
   - Internal sales approval thresholds, discount governance policies, or risk score matrices
   - Internal staff roles, employee notes, audit trails, or other customers' information
   - Internal sales rep commissions or management workflows
3. REFUSAL PROTOCOL: If a user asks about any administration, backend, staff-only, or internal management topics, politely refuse by saying: "I can only assist with your quotes, invoices, payment options, and customer portal questions. For administrative or internal inquiries, please contact your account representative directly."
4. TONE: Warm, friendly, helpful, respectful, and concise.
5. FORMATTING: DO NOT use literal asterisks (*). Use clean bullet points (•) or numbered lists.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message || body.prompt;
    const history: ChatMessage[] = body.history || [];
    const customSystemPrompt: string | undefined = body.systemPrompt;
    const role: string = body.role || 'STAFF';

    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'Message parameter is required' }, { status: 400 });
    }

    const effectiveSystemPrompt =
      role === 'CUSTOMER'
        ? (customSystemPrompt || CUSTOMER_DEFAULT_PROMPT)
        : (customSystemPrompt || STAFF_SYSTEM_PROMPT);

    const messages: ChatMessage[] = [
      { role: 'system', content: effectiveSystemPrompt },
      ...history.slice(-6),
      { role: 'user', content: userMessage },
    ];

    const aiReply = await callOpenRouter(messages, false);

    if (!aiReply) {
      const fallbackReply =
        role === 'CUSTOMER'
          ? "I'm DealFlow, your personal assistant! I can help you with your quotes, orders, invoices, and payment options. 😊"
          : "I'm DealFlow Copilot. I can help you manage your quotations, tier policies, warehouse fulfillment allocations, and recurring invoices!";

      return NextResponse.json({
        success: true,
        reply: fallbackReply,
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
