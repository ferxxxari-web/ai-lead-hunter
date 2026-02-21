"use client";

import { useState, useEffect } from "react";
import {
  Search,
  User,
  Copy,
  CheckCircle2,
  AlertCircle,
  Send,
  Bell,
  Zap,
  Settings,
  Loader2,
  Menu,
  X,
  HelpCircle,
  Target,
  ArrowRight,
  LogOut,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { postReply } from "@/lib/x-actions";
import { useSession, signOut } from "next-auth/react";

interface Post {
  id: string;
  text: string;
  authorName?: string;
  authorUsername?: string;
  url?: string;
  createdAt?: string;
  evaluation?: {
    isLead: boolean;
    score: number;
    reason: string;
    suggestedReply: string;
  };
  status?: "pending" | "replied" | "ignored" | "negotiating" | "won" | "lost";
}

interface ProjectSettings {
  name: string;
  url: string;
  description: string;
  targetAudience: string;
}

export default function LeadDashboard({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState(initialPosts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "leads" | "keywords" | "settings" | "guide"
  >("leads");

  const [settings, setSettings] = useState<ProjectSettings>({
    name: "AI Lead Hunter",
    url: "https://ai-lead-hunter.jp",
    description:
      "X(Twitter)から見込み客を自動で見つけ出し、AIが自然な日本語で返信案を作成するツール。",
    targetAudience: "SaaS開発者、個人開発者、マーケター",
  });

  const [keywords, setKeywords] = useState<string[]>([
    "アプリ開発 悩み",
    "自動化 ツール",
    "集客 困った",
  ]);
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([
    "プロフ見て",
    "副業支援",
    "勧誘",
  ]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newNegativeKeyword, setNewNegativeKeyword] = useState("");
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userPlan, setUserPlan] = useState<{
    id: string;
    name: string;
    limit: number;
    priceId?: string;
  }>({ id: "free", name: "無料プラン", limit: 5 });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // User Status & Plan
        const statusRes = await fetch("/api/user/status");
        const statusData = await statusRes.json();
        if (statusData.plan) {
          setUserPlan(statusData.plan);
        }

        // Settings
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        if (
          settingsData &&
          !settingsData.error &&
          Object.keys(settingsData).length > 0
        ) {
          setSettings({
            name: settingsData.name || "AI Lead Hunter",
            url: settingsData.url || "https://ai-lead-hunter.jp",
            description:
              settingsData.description ||
              "X(Twitter)から見込み客を自動で見つけ出し、AIが自然な日本語で返信案を作成するツール。",
            targetAudience:
              settingsData.targetAudience ||
              "SaaS開発者、個人開発者、マーケター",
          });
          if (settingsData.keywords) setKeywords(settingsData.keywords);
          if (settingsData.negativeKeywords)
            setNegativeKeywords(settingsData.negativeKeywords);
        }

        // Leads from DB
        const leadsRes = await fetch("/api/leads");
        const leadsData = await leadsRes.json();
        if (Array.isArray(leadsData)) {
          const dbPosts: Post[] = leadsData.map((l) => ({
            id: l.tweetId,
            text: l.content,
            authorName: l.authorName,
            authorUsername: l.authorUsername,
            url: l.url,
            createdAt: l.createdAt,
            evaluation: {
              isLead: true,
              score: l.score,
              reason: "過去の履歴",
              suggestedReply: l.suggestedReply,
            },
            status: l.status,
          }));

          const mergedPosts = [...initialPosts];
          dbPosts.forEach((dbPost) => {
            if (!mergedPosts.find((p) => p.id === dbPost.id)) {
              mergedPosts.push(dbPost);
            }
          });
          setPosts(mergedPosts);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setIsLoaded(true);
      }
    };

    if (session) {
      loadInitialData();
      setShowDashboard(true);
    }
  }, [session]);

  // Save settings to DB
  useEffect(() => {
    const saveSettings = async () => {
      if (!isLoaded || !session) return;
      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...settings,
            keywords,
            negativeKeywords,
          }),
        });
      } catch (error) {
        console.error("Failed to save to DB:", error);
      }
    };
    saveSettings();
  }, [settings, keywords, negativeKeywords, isLoaded, session]);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: userPlan.priceId || "price_placeholder",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("決済画面の作成に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  const handleScan = async () => {
    if (userPlan.id === "free" && posts.length >= userPlan.limit) {
      toast.error(
        "無料プランの上限に達しました。アップグレードをご検討ください。",
      );
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading("最新の投稿をスキャン中...");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: keywords.join(" "),
          context: settings,
          excludeKeywords: negativeKeywords,
        }),
      });
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);

        // Save leads to DB
        for (const post of data.posts) {
          if (post.evaluation?.isLead) {
            try {
              await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tweetId: post.id,
                  authorName: post.authorName,
                  authorUsername: post.authorUsername,
                  url: post.url,
                  createdAt: post.createdAt,
                  content: post.text,
                  score: post.evaluation.score,
                  suggestedReply: post.evaluation.suggestedReply,
                  status: "pending",
                }),
              });
            } catch (e) {
              console.error("Failed to save lead to DB:", e);
            }
          }
        }
        toast.success("スキャンが完了しました", { id: toastId });
      } else {
        throw new Error("データの取得に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました", { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExecute = async (tweetId: string, replyText: string) => {
    setExecutingId(tweetId);
    try {
      const result = await postReply(tweetId, replyText);
      if (result.success) {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tweetId, status: "replied" }),
        });
        setPosts(
          posts.map((p) =>
            p.id === tweetId ? { ...p, status: "replied" } : p,
          ),
        );
        setCopiedId(tweetId);
        toast.success("回答を送信しました");
      }
    } catch (error) {
      toast.error("送信に失敗しました");
    } finally {
      setExecutingId(null);
    }
  };

  const handleStatusChange = async (
    tweetId: string,
    newStatus: Post["status"],
  ) => {
    setPosts(
      posts.map((p) => (p.id === tweetId ? { ...p, status: newStatus } : p)),
    );
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetId,
          ...posts.find((p) => p.id === tweetId),
          status: newStatus,
        }),
      });
      toast.success("ステータスを更新しました");
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handleReplyChange = (tweetId: string, newReply: string) => {
    setPosts(
      posts.map((p) =>
        p.id === tweetId
          ? {
              ...p,
              evaluation: p.evaluation
                ? { ...p.evaluation, suggestedReply: newReply }
                : p.evaluation,
            }
          : p,
      ),
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("コピーしました");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword("");
      toast.success("キーワードを追加しました");
    }
  };

  const addNegativeKeyword = () => {
    if (newNegativeKeyword && !negativeKeywords.includes(newNegativeKeyword)) {
      setNegativeKeywords([...negativeKeywords, newNegativeKeyword]);
      setNewNegativeKeyword("");
      toast.success("除外キーワードを追加しました");
    }
  };

  const removeKeyword = (kw: string) =>
    setKeywords(keywords.filter((k) => k !== kw));
  const removeNegativeKeyword = (kw: string) =>
    setNegativeKeywords(negativeKeywords.filter((k) => k !== kw));

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 overflow-hidden relative">
        <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-md">
              <Send className="w-4 h-4 text-white rotate-[-10deg]" />
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
              AI Lead Hunter
            </div>
          </div>
          <button
            onClick={() => setShowDashboard(true)}
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all"
          >
            ログイン
          </button>
        </nav>
        <main className="relative pt-20 pb-40 px-8 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
            Xから質の高いリードを
            <br />
            <span className="text-teal-600">自動で一本釣り。</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto text-center">
            SNSの海をAIが24時間スキャン。あなたのサービスを求めている人を
            <br />
            ピンポイントで見つけ出し、最適な返信案を作成します。
          </p>
          <button
            onClick={() => setShowDashboard(true)}
            className="px-10 py-4 rounded-xl bg-teal-600 text-white text-lg font-bold hover:bg-teal-700 transition-all shadow-lg"
          >
            無料で始める
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-hidden relative flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-6 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
            <Send className="w-4 h-4 text-white rotate-[-10deg]" />
          </div>
          <div className="text-lg font-bold tracking-tight text-slate-900">
            AI Lead Hunter
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {[
            { id: "leads", icon: Bell, label: "見込み客フィード" },
            { id: "keywords", icon: Zap, label: "キーワード設定" },
            { id: "settings", icon: Settings, label: "プロジェクト設定" },
            { id: "guide", icon: HelpCircle, label: "操作ガイド" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === item.id
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  activeTab === item.id ? "text-teal-600" : "text-slate-400",
                )}
              />
              {item.label}
            </button>
          ))}
        </div>

        {userPlan.id === "free" && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
              Current Plan
            </div>
            <div className="text-sm font-bold mb-3">
              無料プラン (残り {userPlan.limit - posts.length}枠)
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-2 bg-white text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-3 h-3 fill-current" /> プロ版にアップグレード
            </button>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3 overflow-hidden">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full border border-slate-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                  Account
                </div>
                <div className="text-xs font-bold text-slate-700 truncate leading-none">
                  {session?.user?.name || "ユーザー"}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        {activeTab === "leads" && (
          <>
            <header className="mb-10">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 ml-[-2px]">
                    見込み客フィード
                  </h1>
                  <p className="text-slate-500 font-medium">
                    AIが探知した最新的確なリードです。
                  </p>
                </div>
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95 flex items-center gap-2"
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 fill-current" />
                  )}
                  スキャンを開始
                </button>
              </div>

              {/* ROI Dashboard Panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    今月のAI抽出リード
                  </div>
                  <div className="text-3xl font-black text-slate-800">
                    {posts.length}
                    <span className="text-base font-bold text-slate-400 ml-1">
                      件
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    DM送信数
                  </div>
                  <div className="text-3xl font-black text-slate-800">
                    {posts.filter((p) => p.status === "replied").length}
                    <span className="text-base font-bold text-slate-400 ml-1">
                      件
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] opacity-10">
                    <Target className="w-24 h-24 text-emerald-600" />
                  </div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 relative z-10">
                    想定アポ獲得数 (10%)
                  </div>
                  <div className="text-3xl font-black text-emerald-900 relative z-10">
                    {Math.floor(
                      posts.filter((p) => p.status === "replied").length * 0.1,
                    )}
                    <span className="text-base font-bold text-emerald-600/60 ml-1">
                      件
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl border border-teal-700 p-5 shadow-sm text-white relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] opacity-10">
                    <Zap className="w-24 h-24 text-white" />
                  </div>
                  <div className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-1 relative z-10">
                    今月の期待売上 (単価30万)
                  </div>
                  <div className="text-3xl font-black text-white relative z-10 tracking-tight">
                    ¥
                    {(
                      Math.floor(
                        posts.filter((p) => p.status === "replied").length *
                          0.1,
                      ) * 300000
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </header>
            <div className="grid gap-6 pb-20">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all p-8 relative overflow-hidden"
                >
                  {(!post.status || post.status === "pending") && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                  )}
                  {post.status === "replied" && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
                  )}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {post.authorUsername ? (
                            <a
                              href={`https://x.com/${post.authorUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1 transition-colors"
                            >
                              <span>{post.authorName || "User"}</span>
                              <span className="text-slate-500 font-normal text-sm">
                                @{post.authorUsername}
                              </span>
                            </a>
                          ) : (
                            <span>@{post.authorName || "User"}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {post.url ? (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline transition-colors"
                            >
                              X (Twitter) •{" "}
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString(
                                    "ja-JP",
                                  )
                                : new Date().toLocaleDateString("ja-JP")}
                            </a>
                          ) : (
                            <span>
                              X (Twitter) •{" "}
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString(
                                    "ja-JP",
                                  )
                                : new Date().toLocaleDateString("ja-JP")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {post.evaluation && (
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold border",
                          post.evaluation.score >= 70
                            ? "bg-teal-50 text-teal-700 border-teal-100"
                            : "bg-slate-50 text-slate-500 border-slate-100",
                        )}
                      >
                        見込み度: {post.evaluation.score}%
                      </div>
                    )}
                  </div>
                  <blockquote className="text-lg text-slate-800 leading-relaxed mb-8 font-medium">
                    {post.text}
                  </blockquote>
                  {post.evaluation?.isLead && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                      <p className="text-slate-700 text-sm mb-6 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        {post.evaluation.suggestedReply}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleExecute(
                              post.id,
                              post.evaluation!.suggestedReply,
                            )
                          }
                          disabled={
                            executingId === post.id || post.status === "replied"
                          }
                          className="flex-1 px-6 py-3 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all"
                        >
                          {executingId === post.id
                            ? "送信中..."
                            : post.status === "replied"
                              ? "送信済み"
                              : "回答を送信"}
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              post.evaluation!.suggestedReply,
                              post.id,
                            )
                          }
                          className="px-4 py-3 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {/* Other tabs simplified for space, would be restored in full flow */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">プロジェクト設定</h1>
            <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              {(["name", "url", "description", "targetAudience"] as const).map(
                (key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      {key}
                    </label>
                    <input
                      value={settings[key]}
                      onChange={(e) =>
                        setSettings({ ...settings, [key]: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                ),
              )}
              <button
                onClick={() => toast.success("保存しました")}
                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold"
              >
                保存する
              </button>
            </div>
          </div>
        )}
        {activeTab === "keywords" && (
          <div className="max-w-2xl space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900">
              キーワード設定
            </h1>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-teal-700 text-lg">
                探知キーワード（検索したい言葉）
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <div
                    key={kw}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm flex items-center gap-2"
                  >
                    {kw}{" "}
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="例: エンジニア 探してる"
                  onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={addKeyword}
                  className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>

            <div className="bg-rose-50/30 p-8 rounded-2xl border border-rose-100 space-y-6 shadow-sm">
              <h3 className="font-bold text-rose-600 text-lg">
                除外キーワード（ノイズになる言葉）
              </h3>
              <p className="text-sm text-slate-500 mb-2">
                ここに登録した言葉が含まれる投稿は、スキャン結果から自動で除外されます。
              </p>
              <div className="flex flex-wrap gap-2">
                {negativeKeywords.map((kw) => (
                  <div
                    key={kw}
                    className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2 shadow-sm"
                  >
                    {kw}{" "}
                    <button
                      onClick={() => removeNegativeKeyword(kw)}
                      className="text-rose-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newNegativeKeyword}
                  onChange={(e) => setNewNegativeKeyword(e.target.value)}
                  placeholder="例: 裏垢, 業者, 募集"
                  onKeyDown={(e) => e.key === "Enter" && addNegativeKeyword()}
                  className="flex-1 border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={addNegativeKeyword}
                  className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors"
                >
                  除外する
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "guide" && (
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
              操作ガイド
            </h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed text-balance">
              AI Lead Hunterへようこそ！
              <br />
              このツールは以下の3つのステップで、あなたの代わりにSNS上の見込み客を自動で発掘します。
            </p>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-50 text-teal-700 font-black text-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    プロジェクト設定を入力する
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed ml-14">
                  まずは左メニューの「プロジェクト設定」を開き、あなたが売りたいサービス（または解決できる課題）の
                  <b>名前・URL・ターゲット・概要</b>を詳しく入力します。
                  <br />
                  AIはこの情報を読み込んで、「どんな言葉で見込み客に話しかければいいか」を学習します。できるだけ詳しく書くのがコツです。
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-50 text-teal-700 font-black text-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    探知キーワードを決める
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed ml-14">
                  次に「キーワード設定」タブを開き、あなたのターゲットが
                  <b>X（Twitter）でつぶやきそうなお困りごと</b>
                  のキーワードを入力します。
                  <br />
                  （例: 「売上 上がらない」「エンジニア 不足」「アプリ 開発
                  費用」など）
                  <br />
                  逆に拾いたくない言葉（ノイズ）は「除外キーワード」に設定してください。
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-8 border border-teal-200 shadow-md bg-teal-50/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-600"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-600 text-white font-black text-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    スキャンを開始する！
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed ml-14">
                  準備完了です！「見込み客フィード」に戻り、右上の
                  <b>「スキャンを開始」</b>ボタンを押してください。
                  <br />
                  AIがネットの海を数十秒〜数分かけてスキャンし、条件に合う「熱い見込み客」と「AIが考えた自然なリプライ（返信）案」をセットで表示します。
                  <br />
                  あとは内容を確認して、「回答を送信」を押すだけで自動でXに返信されます！
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
