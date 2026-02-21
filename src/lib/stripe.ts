import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // 開発環境でエラーにならないよう、ダミーキーを許容（実際の実行時には必要）
  console.warn('STRIPE_SECRET_KEY is not defined in .env.local');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  appInfo: {
    name: 'AI Lead Hunter',
    version: '0.1.0',
  },
});

export const STRIPE_PLANS = {
  FREE: {
    id: 'free',
    name: '無料プラン',
    priceId: '',
    limit: 50, // 初期営業フェーズのため、自身ですぐに上限に達しないよう「5」から大幅に緩和
  },
  PRO: {
    id: 'pro',
    name: 'プロプラン',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
    limit: 10000,
  },
};
