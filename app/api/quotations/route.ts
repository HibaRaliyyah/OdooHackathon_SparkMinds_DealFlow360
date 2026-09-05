import { NextResponse } from 'next/server';
import { QUOTATIONS } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: QUOTATIONS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      data: {
        id: `q-${Date.now()}`,
        quotationNumber: `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
