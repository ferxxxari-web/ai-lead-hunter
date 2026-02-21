"use server";
import { TwitterApi } from 'twitter-api-v2';

export async function postReply(tweetId: string, text: string) {
    const apiKey = process.env.X_API_KEY;
    const apiSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;

    // APIキーが未設定、またはデフォルトのプレースホルダーの場合はデモモードとして扱う
    if (!apiKey || !apiSecret || !accessToken || !accessSecret ||
        apiKey === 'your_x_api_key_here') {
        console.log("Demo Mode: Skipping real tweet post. Target Tweet ID:", tweetId);
        // デモモードでは成功したことにして、2秒待機して「送信した感」を出す
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, demo: true };
    }

    try {
        const client = new TwitterApi({
            appKey: apiKey,
            appSecret: apiSecret,
            accessToken: accessToken,
            accessSecret: accessSecret,
        });

        await client.v2.reply(text, tweetId);
        return { success: true };
    } catch (error) {
        console.error("X API Post Error:", error);
        throw new Error("Xへの返信投稿に失敗しました。API制限や認証情報を確認してください。");
    }
}
