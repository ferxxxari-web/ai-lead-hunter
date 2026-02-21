import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/actions';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, context, excludeKeywords } = body;

        if (!query || !context) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const data = await getDashboardData(query, context, excludeKeywords);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
