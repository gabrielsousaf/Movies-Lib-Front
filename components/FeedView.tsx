"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, MessageSquare, Users, Globe, ThumbsUp, Star } from "lucide-react";
import Link from "next/link";

interface FeedItem {
  type: "REVIEW" | "LIST";
  createdAt: string;
  item: any;
}

export function FeedView() {
  const { user, token } = useAuth();
  const [scope, setScope] = useState<"following" | "global">("following");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    async function loadFeed() {
      // Se não está logado e está em 'following', direciona para global ou pede login
      if (!token && scope === "following") {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiUrl}/feed?scope=${scope}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setFeed(data.data || []);
        } else {
          setFeed([]);
        }
      } catch (err) {
        console.error("Erro ao carregar o feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [token, scope, apiUrl]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Barra de Seleção de Aba: Seguindo vs. Explorar */}
      <div className="flex items-center justify-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => setScope("following")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            scope === "following"
              ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Seguindo
        </button>
        <button
          onClick={() => setScope("global")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            scope === "global"
              ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          Explorar Comunidade
        </button>
      </div>

      {/* Não logado tentando ver "Seguindo" */}
      {!user && scope === "following" && (
        <div className="text-center py-20 bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <Activity className="w-12 h-12 mx-auto mb-4 text-primary-500/70" />
          <h3 className="text-xl font-bold text-white mb-2">Acompanhe quem você segue</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6 text-sm">
            Faça login para ver as avaliações e listas criadas pelos seus amigos e cinefilos que você segue.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
            >
              Fazer Login
            </Link>
            <button
              onClick={() => setScope("global")}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors border border-zinc-800 cursor-pointer"
            >
              Explorar Comunidade
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Carregando feed {scope === "following" ? "de quem você segue" : "da comunidade"}...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && (user || scope === "global") && feed.length === 0 && (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-xl font-bold text-zinc-200 mb-2">
            {scope === "following" ? "Seu feed está vazio" : "Nenhuma atividade recente na comunidade"}
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto text-sm mb-6">
            {scope === "following"
              ? "Você ainda não segue ninguém ou as pessoas que você segue ainda não publicaram nenhuma avaliação recente."
              : "Seja o primeiro a avaliar um filme ou criar uma lista pública para aparecer no feed da comunidade!"}
          </p>
          <div className="flex items-center justify-center gap-3">
            {scope === "following" ? (
              <>
                <button
                  onClick={() => setScope("global")}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Ver Feed da Comunidade
                </button>
                <Link
                  href="/search"
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold transition-colors border border-zinc-800 cursor-pointer"
                >
                  Encontrar Usuários
                </Link>
              </>
            ) : (
              <Link
                href="/movies"
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Explorar Filmes & Séries
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Lista de Atividades do Feed */}
      {!loading && feed.length > 0 && (
        <div className="space-y-5">
          {feed.map((entry, idx) => {
            const key = `${entry.type}-${entry.item.id}-${idx}`;
            const author = entry.item.user;
            const avatarSrc = author?.avatarUrl?.startsWith("/")
              ? `${apiUrl}${author.avatarUrl}`
              : author?.avatarUrl;

            return (
              <div
                key={key}
                className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/60 transition-all rounded-2xl overflow-hidden p-6 shadow-lg"
              >
                {/* Cabeçalho do Autor */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${author.username}`}>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-zinc-800 hover:ring-primary-500 transition-all">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={author.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold bg-zinc-800">
                            {author.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link
                        href={`/user/${author.username}`}
                        className="font-bold text-zinc-100 hover:text-primary-400 transition-colors text-sm cursor-pointer"
                      >
                        {author.displayName || author.username}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        @{author.username} · {entry.type === "REVIEW" ? "avaliou um título" : "criou uma lista"} ·{" "}
                        {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo da Avaliação */}
                {entry.type === "REVIEW" && (
                  <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-bold text-base text-zinc-100 leading-snug">
                        {entry.item.mediaTitle || entry.item.title || "Filme / Série"}
                      </h4>
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {Number(entry.item.rating).toFixed(1)}
                      </div>
                    </div>

                    {entry.item.hasSpoiler && (
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded mb-2">
                        Contém Spoiler
                      </span>
                    )}

                    {entry.item.content && (
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed">
                        {entry.item.content}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-5 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-semibold text-zinc-300">{entry.item._count?.likes || 0}</span> curtidas
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-semibold text-zinc-300">{entry.item._count?.comments || 0}</span> comentários
                      </div>
                    </div>
                  </div>
                )}

                {/* Conteúdo da Lista */}
                {entry.type === "LIST" && (
                  <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                    <h4 className="font-bold text-base text-zinc-100 mb-1">{entry.item.name}</h4>
                    {entry.item.description && (
                      <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{entry.item.description}</p>
                    )}
                    <Link
                      href={`/list/${entry.item.id}`}
                      className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ver Lista Completa ({entry.item._count?.items || 0} títulos) →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
