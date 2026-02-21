import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    try {
        const client = await clientPromise;
        const db = client.db('ai-lead-hunter');
        const leads = await db.collection('leads').find({ userId }).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(leads);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('ai-lead-hunter');

        const { tweetId, ...updateData } = body;

        await db.collection('leads').updateOne(
            { tweetId, userId },
            { $set: { ...updateData, userId, updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}
