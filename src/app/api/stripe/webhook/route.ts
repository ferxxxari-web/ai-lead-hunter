import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import clientPromise from '@/lib/mongodb';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ai-lead-hunter');

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const subscriptionId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const userId = session.metadata?.userId;

                if (userId) {
                    await db.collection('users').updateOne(
                        { _id: new ObjectId(userId) },
                        {
                            $set: {
                                stripeSubscriptionId: subscription.id,
                                stripePriceId: (subscription as any).items.data[0].price.id,
                                stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                                subscriptionStatus: 'active',
                            },
                        }
                    );
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const status = subscription.status === 'active' ? 'active' : 'canceled';

                await db.collection('users').updateOne(
                    { stripeCustomerId: customerId },
                    {
                        $set: {
                            stripeSubscriptionId: subscription.id,
                            stripePriceId: (subscription as any).items.data[0].price.id,
                            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                            subscriptionStatus: status,
                        },
                    }
                );
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
