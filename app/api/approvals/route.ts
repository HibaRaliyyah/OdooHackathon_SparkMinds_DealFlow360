import { NextResponse } from 'next/server';
import { APPROVAL_REQUESTS } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: APPROVAL_REQUESTS,
  });
}
