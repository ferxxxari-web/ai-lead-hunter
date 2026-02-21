import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        apifyToken: process.env.APIFY_API_TOKEN || 'MISSING',
        envKeys: Object.keys(process.env).filter(k => k.includes('APIFY') || k.includes('X_'))
    });
}
