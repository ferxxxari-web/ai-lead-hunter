import fs from 'fs';
let content = fs.readFileSync('src/components/LeadDashboard.tsx', 'utf8');

const oldHeader = `<header className="mb-10">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 ml-[-2px]">見込み客フィード</h1>
                                    <p className="text-slate-500 font-medium">AIが探知した最新的確なリードです。</p>
                                </div>
                                <button onClick={handleScan} disabled={isScanning} className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95 flex items-center gap-2">
                                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                                    スキャンを開始
                                </button>
                            </div>
                            
                            {/* ROI Dashboard Panel */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">今月のAI抽出リード</div>
                                    <div className="text-3xl font-black text-slate-800">{posts.length}<span className="text-base font-bold text-slate-400 ml-1">件</span></div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">DM送信数</div>
                                    <div className="text-3xl font-black text-slate-800">{posts.filter(p => p.status === 'replied').length}<span className="text-base font-bold text-slate-400 ml-1">件</span></div>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm relative overflow-hidden">
                                    <div className="absolute right-[-10px] top-[-10px] opacity-10"><Target className="w-24 h-24 text-emerald-600" /></div>
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 relative z-10">想定アポ獲得数 (10%)</div>
                                    <div className="text-3xl font-black text-emerald-900 relative z-10">{Math.floor(posts.filter(p => p.status === 'replied').length * 0.1)}<span className="text-base font-bold text-emerald-600/60 ml-1">件</span></div>
                                </div>
                                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl border border-teal-700 p-5 shadow-sm text-white relative overflow-hidden">
                                     <div className="absolute right-[-10px] top-[-10px] opacity-10"><Zap className="w-24 h-24 text-white" /></div>
                                    <div className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-1 relative z-10">今月の期待売上 (単価30万)</div>
                                    <div className="text-3xl font-black text-white relative z-10 tracking-tight">¥{(Math.floor(posts.filter(p => p.status === 'replied').length * 0.1) * 300000).toLocaleString()}</div>
                                </div>
                            </div>
                        </header>`;

const newHeader = `<div className="space-y-12">
                            {/* 1. Today's Tasks */}
                            <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-sm font-bold text-teal-400 tracking-widest uppercase mb-2 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> 今日の営業タスク
                                        </h2>
                                        <div className="flex items-baseline gap-4">
                                            <div className="text-4xl font-black">
                                                未対応 <span className="text-5xl text-teal-400">{posts.filter(p => !p.status || p.status === 'pending').length}</span> 件
                                            </div>
                                            <div className="text-slate-400 font-medium">/ 抽出済 {posts.length}件</div>
                                        </div>
                                    </div>
                                    <button onClick={handleScan} disabled={isScanning} className="w-full md:w-auto px-10 py-5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl font-black text-lg transition-all shadow-lg shadow-teal-500/30 active:scale-95 flex items-center justify-center gap-3">
                                        {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                                        新しいリードを取得する
                                    </button>
                                </div>
                            </section>

                            {/* 2. ROI Dashboard Panel */}
                            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">今月のAI抽出リード</div>
                                    <div className="text-2xl font-black tracking-tight">{posts.length}<span className="text-sm font-bold text-slate-500 ml-1">件</span></div>
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DM送信数</div>
                                    <div className="text-2xl font-black tracking-tight">{posts.filter(p => p.status === 'replied').length}<span className="text-sm font-bold text-slate-500 ml-1">件</span></div>
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">想定アポ獲得数 (10%)</div>
                                    <div className="text-2xl font-black tracking-tight">{Math.floor(posts.filter(p => p.status === 'replied').length * 0.1)}<span className="text-sm font-bold text-slate-500 ml-1">件</span></div>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner text-white relative overflow-hidden">
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">今月の期待売上 (単価30万)</div>
                                    <div className="text-2xl font-black tracking-tight text-emerald-400">+¥{(Math.floor(posts.filter(p => p.status === 'replied').length * 0.1) * 300000).toLocaleString()}</div>
                                </div>
                            </section>

                            <div className="flex items-center justify-between mt-8 mb-2">
                                <h3 className="text-xl font-bold text-slate-900">見込み客リスト</h3>
                                <div className="text-sm font-medium text-slate-500 flex gap-4">
                                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>未対応</span>
                                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>DM送信済</span>
                                </div>
                            </div>`;

content = content.replace(oldHeader, newHeader);

// Now let's replace the card loop entirely.
const oldLoopStart = `<div className="grid gap-6 pb-20">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:border-teal-200 transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><User className="w-5 h-5 text-slate-400" /></div>
                                            <div>`;

const newLoopStart = `<div className="grid gap-6 pb-20">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all p-8 relative overflow-hidden">
                                    {(!post.status || post.status === 'pending') && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>}
                                    {(post.status === 'replied') && <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><User className="w-5 h-5 text-slate-500" /></div>
                                            <div>`;

content = content.replace(oldLoopStart, newLoopStart);

// Replace the status block in card
const oldStatusBlock = `}
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {post.url ? (
                                                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors">
                                                            X (Twitter) • {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}
                                                        </a>
                                                    ) : (
                                                        <span>X (Twitter) • {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {post.evaluation && (
                                            <div className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold border", post.evaluation.score >= 70 ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-slate-50 text-slate-500 border-slate-100")}>
                                                見込み度: {post.evaluation.score}%
                                            </div>
                                        )}
                                    </div>
                                    <blockquote className="text-lg text-slate-800 leading-relaxed mb-8 font-medium">{post.text}</blockquote>
                                    {post.evaluation?.isLead && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                                            <p className="text-slate-700 text-sm mb-6 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">{post.evaluation.suggestedReply}</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleExecute(post.id, post.evaluation!.suggestedReply)} disabled={executingId === post.id || post.status === 'replied'} className="flex-1 px-6 py-3 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
                                                    {executingId === post.id ? "送信中..." : post.status === 'replied' ? "送信済み" : "回答を送信"}
                                                </button>
                                                <button onClick={() => copyToClipboard(post.evaluation!.suggestedReply, post.id)} className="px-4 py-3 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>`;

const newStatusBlock = `}
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {post.url ? (
                                                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors">
                                                            X (Twitter) • {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}
                                                        </a>
                                                    ) : (
                                                        <span>X (Twitter) • {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {post.evaluation && (
                                                <div className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold border", post.evaluation.score >= 70 ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-slate-50 text-slate-500 border-slate-100")}>
                                                    見込み度: {post.evaluation.score}%
                                                </div>
                                            )}
                                            <select 
                                                value={post.status || 'pending'} 
                                                onChange={(e) => handleStatusChange(post.id, e.target.value as Post['status'])}
                                                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                                            >
                                                <option value="pending">未対応</option>
                                                <option value="replied">DM送信済</option>
                                                <option value="negotiating">交渉中</option>
                                                <option value="won">アポ獲得・成約</option>
                                                <option value="lost">見送り・NG</option>
                                                <option value="ignored">除外</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <blockquote className="text-lg text-slate-800 leading-relaxed mb-8 font-medium">{post.text}</blockquote>
                                    
                                    {post.evaluation?.isLead && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                                                    <span>AIが作成したDM案（編集可能）</span>
                                                </div>
                                                <textarea 
                                                    value={post.evaluation.suggestedReply}
                                                    onChange={(e) => handleReplyChange(post.id, e.target.value)}
                                                    className="w-full text-slate-800 text-sm leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-y min-h-[140px]"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleExecute(post.id, post.evaluation!.suggestedReply)} disabled={executingId === post.id || post.status === 'replied'} className="flex-1 px-6 py-4 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {executingId === post.id ? "自動送信中..." : post.status === 'replied' ? "送信済み" : "この内容で送信する"}
                                                </button>
                                                <button onClick={() => { copyToClipboard(post.evaluation!.suggestedReply, post.id); handleStatusChange(post.id, 'replied'); }} className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                                    <Copy className="w-4 h-4" /> コピーして手動で送る
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}`;

content = content.replace(oldStatusBlock, newStatusBlock);
fs.writeFileSync('src/components/LeadDashboard.tsx', content);
