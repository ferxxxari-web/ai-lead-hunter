import { TwitterApi } from 'twitter-api-v2';

export interface XPost {
    id: string;
    text: string;
    authorId: string;
    createdAt: string;
    authorName?: string;
}

const bearerToken = process.env.X_BEARER_TOKEN;
const isDemoMode = !bearerToken || bearerToken === 'your_x_bearer_token_here';

const twitterClient = new TwitterApi(bearerToken || '');
const roClient = twitterClient.readOnly;

export async function fetchRecentPosts(query: string, excludeKeywords: string[] = []): Promise<XPost[]> {
    console.log(`Searching X for: ${query}, Excluding: ${excludeKeywords}`);

    if (isDemoMode) {
        return getDemoPosts(query, excludeKeywords);
    }

    try {
        const searchResult = await roClient.v2.search(query, {
            'tweet.fields': ['created_at', 'author_id'],
            expansions: ['author_id'],
            'user.fields': ['name', 'username'],
            max_results: 10,
        });

        const users = new Map(searchResult.includes?.users?.map(u => [u.id, u]) || []);

        return searchResult.data.data
            .filter(tweet => !excludeKeywords.some(kw => tweet.text.includes(kw)))
            .map(tweet => ({
                id: tweet.id,
                text: tweet.text,
                authorId: tweet.author_id || '',
                createdAt: tweet.created_at || new Date().toISOString(),
                authorName: users.get(tweet.author_id || '')?.name || 'X User'
            }));
    } catch (error) {
        console.error("X API Search Error:", error);
        return getDemoPosts(query, excludeKeywords);
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
