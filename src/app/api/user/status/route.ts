import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { STRIPE_PLANS } from '@/lib/stripe';
import { ObjectId } from 'mongodb';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const client = await clientPromise;
        const db = client.db('ai-lead-hunter');

        // Auth アダプターが作成した users コレクションから取得
        const user = await db.collection('users').findOne({
            $or: [
                { _id: new ObjectId(userId) },
                { _id: userId }
            ]
        });

        if (!user) {
            return NextResponse.json({ plan: STRIPE_PLANS.FREE });
        }

        const plan = user.subscriptionStatus === 'active' ? STRIPE_PLANS.PRO : STRIPE_PLANS.FREE;

        return NextResponse.json({
            plan,
            subscriptionStatus: user.subscriptionStatus || 'none',
            currentPeriodEnd: user.stripeCurrentPeriodEnd,
        });
    } catch (error: any) {
        console.error('User Status Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
