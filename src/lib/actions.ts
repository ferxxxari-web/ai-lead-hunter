import { fetchRecentPosts, XPost } from "@/lib/x-service";
import { ProjectContext, scoreLead, LeadScore } from "@/lib/ai-scoring";

export interface DashboardData {
    posts: (XPost & { evaluation?: LeadScore })[];
}

export async function getDashboardData(query: string, context: ProjectContext, excludeKeywords: string[] = []): Promise<DashboardData> {
    // 1. Xから投稿を取得
    const posts = await fetchRecentPosts(query, excludeKeywords);

    // 2. 各投稿をAIで判定
    const evaluatedPosts = await Promise.all(
        posts.map(async (post) => {
            const evaluation = await scoreLead(post.text, context);
            return { ...post, evaluation };
        })
    );

    return { posts: evaluatedPosts };
}
