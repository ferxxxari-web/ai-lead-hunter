import { openai } from './openai';

export interface LeadScore {
    isLead: boolean;
    score: number; // 0-100
    reason: string;
    suggestedReply: string;
}

export interface ProjectContext {
    name: string;
    url: string;
    description: string;
    targetAudience: string;
}

export async function scoreLead(postText: string, context: ProjectContext): Promise<LeadScore> {
    const prompt = `
あなたは優秀なセールス・マーケティングアシスタントです。
以下のX(Twitter)の投稿が、指定された「商品・サービス」の見込み客（リード）であるかどうかを判定し、自然な日本語の返信案を作成してください。

【商品・サービスの説明】
サービス名: ${context.name}
URL: ${context.url}
概要: ${context.description}
ターゲット: ${context.targetAudience}

【判定基準】
1. 投稿者が解決したい具体的な悩みや、達成したい目標を持っているか。
2. その悩みや目標が、提供するサービスで解決可能か。
3. 投稿の語り口（トーン）に合わせて、親しみやすく、かつプロフェッショナルな返信を作成してください。
4. 強引な勧誘ではなく、共感を示しながら「役立つ情報」としてサービスを紹介してください。

【出力フォーマット (JSON)】
{
  "isLead": boolean,
  "score": number (0-100),
  "reason": "なぜ見込み客と判定したか（日本語）",
  "suggestedReply": "140文字以内の返信案（日本語、URLを含む）"
}

【Xの投稿】
"${postText}"
`;

    try {
        // APIキーがない場合はデモ用データを返す
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return getDemoEvaluation(postText, context);
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return {
            isLead: result.isLead ?? false,
            score: result.score ?? 0,
            reason: result.reason ?? "判定に失敗しました",
            suggestedReply: result.suggestedReply ?? "",
        };
    } catch (error) {
        console.error("AI Scoring Error:", error);
        return getDemoEvaluation(postText, context);
    }
}

function getDemoEvaluation(text: string, context: ProjectContext): LeadScore {
    if (text.includes("学習で詰まってしまった")) {
        return {
            isLead: true,
            score: 92,
            reason: `${context.name}のターゲット層である学習者による具体的な悩みです。`,
            suggestedReply: `${context.name}の開発チームです！Reactの学習、最初は大変ですよね...💦 私たちのツールも${context.description}を目指して作っています。もしよろしければ、解決のヒントになるURL(${context.url})を置いておきますね。応援しています！`
        };
    }
    if (text.includes("自動運用ツール")) {
        return {
            isLead: true,
            score: 85,
            reason: "Xの自動化に明確な関心を持っており、課題解決のツールを求めています。",
            suggestedReply: `${context.name}を使って効率化しませんか？日本語のニュアンスを大切にしながら、${context.description}をお手伝いできます。詳細は ${context.url} をご覧ください！✨`
        };
    }
    return {
        isLead: false,
        score: 12,
        reason: "日常的な投稿であり、特定の解決策を求めている文脈ではないためアプローチ不要です。",
        suggestedReply: ""
    };
}
