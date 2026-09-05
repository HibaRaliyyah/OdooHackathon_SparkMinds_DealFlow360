import { NextResponse } from 'next/server';
import { getUpsellRecommendations } from '@/lib/ai/recommendations';
import { QUOTATIONS } from '@/lib/data/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quotation = body.quotation || QUOTATIONS[0];
    const recs = await getUpsellRecommendations(quotation);
    return NextResponse.json({
      success: true,
      data: recs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'AI processing error' }, { status: 500 });
  }
}
