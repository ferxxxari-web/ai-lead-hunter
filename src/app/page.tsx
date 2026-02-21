import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";

export default async function LandingPage() {
    const session = await getServerSession(authOptions);

    // ログイン済みならダッシュボードへ
    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ナビゲーション */}
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">AI Lead Hunter</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">ログイン</a>
                    <a href="/login" className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/10 active:scale-95">
                        無料で始める
                    </a>
                </div>
            </nav>

            {/* ヒーローセクション */}
            <main className="max-w-5xl mx-auto px-6 pt-20 pb-40 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100 mb-8 uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                    24時間稼働のAI営業エージェント
                </div>
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                    Xから、あなたのサービスを<br />
                    <span className="text-teal-600">欲しがる客</span>をAIが見つける
                </h1>
                <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
                    手動の営業活動はもう不要です。AIが24時間Xを監視し、<br />
                    あなたのターゲットにぴったりの投稿を見つけて返信案まで作成します。
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/login" className="w-full sm:w-auto px-10 py-4 bg-teal-600 text-white rounded-2xl text-lg font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95">
                        無料でスキャンを開始する
                    </a>
                    <a href="/login" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all active:scale-95">
                        仕組みを見る
                    </a>
                </div>
            </main>

            {/* フッター */}
            <footer className="border-t border-slate-100 py-20 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-slate-400 fill-current" />
                        </div>
                        <span className="text-lg font-bold text-slate-400">AI Lead Hunter</span>
                    </div>
                    <p className="text-sm text-slate-400">© 2026 AI Lead Hunter. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
