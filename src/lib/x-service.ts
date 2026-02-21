// No external scraper clent needed, using REST API

export interface XPost {
    id: string;
    text: string;
    authorId: string;
    createdAt: string;
    authorName?: string;
    authorUsername?: string;
    url?: string;
}

const getApifyToken = () => process.env.APIFY_API_TOKEN;

// apifyClientオブジェクトも関数内で初期化して毎回最新のトークンを参照するようにする

export async function fetchRecentPosts(query: string, excludeKeywords: string[] = []): Promise<XPost[]> {
    console.log(`Searching X via Apify REST API for: ${query}, Excluding: ${excludeKeywords}`);

    const apifyToken = getApifyToken();
    const isDemoMode = !apifyToken || apifyToken === 'your_apify_api_token_here';
    console.log(`[DEBUG] isDemoMode: ${isDemoMode}`);

    if (isDemoMode) {
        return getDemoPosts(query, excludeKeywords);
    }

    try {
        // Apify REST APIを使ってActorを直接呼び出し
        const url = `https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs?token=${apifyToken}&waitForFinish=120`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                searchTerms: [query],
                searchMode: "live", // 最新のツイート順
                maxItems: 10
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Apify run failed: ${res.status} ${errText}`);
        }

        const result = await res.json();
        const datasetId = result.data.defaultDatasetId;

        // 検索結果のデータセットを取得
        const dRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
        if (!dRes.ok) {
            throw new Error(`Failed to fetch dataset with status ${dRes.status}`);
        }

        const items = await dRes.json();

        return items
            .filter((tweet: any) => {
                const text = tweet.fullText || tweet.full_text || tweet.text || '';
                return text && !excludeKeywords.some(kw => text.includes(kw));
            })
            .map((tweet: any) => {
                const authorUsername = tweet.author?.userName || tweet.user?.screen_name || '';
                return {
                    id: tweet.id_str || tweet.id || '',
                    text: tweet.fullText || tweet.full_text || tweet.text || '',
                    authorId: tweet.author?.id || tweet.user?.id_str || '',
                    createdAt: tweet.createdAt || tweet.created_at || new Date().toISOString(),
                    authorName: tweet.author?.name || tweet.author?.userName || tweet.user?.name || tweet.user?.screen_name || 'X User',
                    authorUsername: authorUsername,
                    url: tweet.url || (authorUsername && (tweet.id_str || tweet.id) ? `https://x.com/${authorUsername}/status/${tweet.id_str || tweet.id}` : undefined)
                };
            }).slice(0, 10);
    } catch (error: any) {
        console.error("Apify Search Error details:", error);
        // デバッグ用: ダミーではなくエラーを含んだ要素を1つ返す
        return [{
            id: 'error_id_123',
            text: `[ERROR] Apify連携に失敗しました: ${error?.message || String(error)}`,
            authorId: 'error_user',
            createdAt: new Date().toISOString(),
            authorName: 'System Error'
        }];
    }
}

function getDemoPosts(query: string, excludeKeywords: string[]): XPost[] {
    const allDemoPosts = [
        {
            id: "1",
            text: "最近アプリ開発を始めたんだけど、Reactの学習で詰まってしまった。誰か助けて...",
            authorId: "user_a",
            createdAt: new Date().toISOString(),
            authorName: "学習者A"
        },
        {
            id: "2",
            text: "Xの自動運用ツールってどれがいいんだろう？自分で作るのは大変そうだな。",
            authorId: "user_b",
            createdAt: new Date().toISOString(),
            authorName: "マーケターB"
        },
        {
            id: "3",
            text: "今日のランチはカレーでした。美味しかった！ #ランチ",
            authorId: "user_c",
            createdAt: new Date().toISOString(),
            authorName: "グルメC"
        }
    ];

    return allDemoPosts.filter(post => !excludeKeywords.some(kw => post.text.includes(kw)));
}
