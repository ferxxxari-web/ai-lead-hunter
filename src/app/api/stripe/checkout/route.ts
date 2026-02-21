import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let targetPriceId = STRIPE_PLANS.PRO.priceId;

        // 環境変数からの読み込みに失敗している場合の保護
        if (!targetPriceId || targetPriceId === 'price_placeholder') {
            targetPriceId = process.env.STRIPE_PRO_PRICE_ID as string;
        }

        if (!targetPriceId || targetPriceId === 'price_placeholder') {
            return NextResponse.json({ error: 'Stripe PRO Price ID is not configured on the server' }, { status: 500 });
        }

        const userId = (session.user as any).id;
        const client = await clientPromise;
        const db = client.db('ai-lead-hunter');

        // ユーザー情報を取得（既存の Stripe Customer ID があれば再利用）
        const user = await db.collection('users').findOne({ _id: userId });
        let stripeCustomerId = (user as any)?.stripeCustomerId;

        if (!stripeCustomerId) {
            // 新しい Stripe Customer を作成
            const customer = await stripe.customers.create({
                email: session.user.email!,
                metadata: {
                    userId: userId.toString(),
                },
            });
            stripeCustomerId = customer.id;

            // DB に Customer ID を保存
            await db.collection('users').updateOne(
                { _id: userId },
                { $set: { stripeCustomerId } }
            );
        }

        console.log('--- Stripe Checkout Request ---');
        console.log('Target Price ID:', targetPriceId);
        console.log('Customer ID:', stripeCustomerId);
        console.log('Success URL:', `${process.env.NEXTAUTH_URL}/dashboard?status=success`);

        // Checkout Session の作成
        const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: targetPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?status=cancel`,
            metadata: {
                userId: userId.toString(),
            },
        });

        console.log('Stripe Session Created:', stripeSession.id);
        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error('=== Stripe Checkout Error ===');
        console.error('Error Object:', error);
        console.error('Error Message:', error.message);
        if (error.type) console.error('Stripe Error Type:', error.type);
        if (error.raw?.message) console.error('Stripe Raw Message:', error.raw.message);
        return NextResponse.json({
            error: error.message,
            rawMessage: error.raw?.message || 'Unknown Stripe Error'
        }, { status: 500 });
    }
}
