import LeadDashboard from "@/components/LeadDashboard";
import { getDashboardData } from "@/lib/actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 初期データ取得（認証ユーザーの文脈に合わせて後ほど拡張）
  const context = {
    name: "AI Lead Hunter",
    url: "https://ai-lead-hunter.jp",
    description: "AIを使ってX(Twitter)から見込み客を自動で見つけ、自然な日本語で返信するツール",
    targetAudience: "SaaS開発者、個人開発者、マーケター"
  };

  const { posts } = await getDashboardData("アプリ開発 AI", context);

  return (
    <main>
      <LeadDashboard initialPosts={posts} />
    </main>
  );
}
