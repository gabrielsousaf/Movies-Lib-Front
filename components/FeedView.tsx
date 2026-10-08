"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ReviewSection } from "./ReviewSection";

interface FeedItem {
  type: "REVIEW" | "LIST";
  createdAt: string;
  item: any;
}

export function FeedView() {
  const { user, token } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    async function loadFeed() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/feed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFeed(data.data);
        }
      } catch (err) {
        console.error("Erro ao carregar o feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [token, apiUrl]);

  if (!user) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Faça login para ver seu feed.</p>
        <Link href="/login" className="inline-block mt-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors">
          Entrar
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-zinc-400">Carregando feed...</div>;
  }

  if (feed.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900 rounded-xl border border-zinc-800">
        <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <h3 className="text-xl font-bold text-zinc-200 mb-2">Seu feed está vazio</h3>
        <p className="text-zinc-400 max-w-md mx-auto">
          Você ainda não segue ninguém ou as pessoas que você segue ainda não publicaram nenhuma avaliação ou lista.
        </p>
        <Link href="/search?type=user" className="inline-block mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition-colors">
          Encontrar Pessoas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {feed.map((entry, idx) => {
        const key = `${entry.type}-${entry.item.id}-${idx}`;
        const author = entry.item.user;
        const avatarSrc = author?.avatarUrl?.startsWith("/") ? `${apiUrl}${author.avatarUrl}` : author?.avatarUrl;

        return (
          <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/user/${author.username}`}>
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 cursor-pointer">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={author.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">
                      {author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div>
                <Link href={`/user/${author.username}`} className="font-medium text-zinc-100 hover:text-primary-500 transition-colors">
                  {author.displayName || author.username}
                </Link>
                <div className="text-sm text-zinc-400">
                  {entry.type === "REVIEW" ? "Avaliou um título" : "Criou uma lista"} · {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {entry.type === "REVIEW" && (
              <div>
                <div className="mb-2">
                  <h4 className="font-bold text-lg text-zinc-100">{entry.item.title || "Filme/Série"}</h4>
                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    <span className="font-bold">{entry.item.rating.toFixed(1)}</span>
                  </div>
                </div>
                {entry.item.content && (
                  <p className="text-zinc-300 mt-2 whitespace-pre-wrap line-clamp-4">
                    {entry.item.content}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-zinc-300">{entry.item._count?.likes || 0}</span> curtidas
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium text-zinc-300">{entry.item._count?.comments || 0}</span> comentários
                  </div>
                </div>
              </div>
            )}

            {entry.type === "LIST" && (
              <div>
                <h4 className="font-bold text-lg text-zinc-100 mb-2">{entry.item.name}</h4>
                {entry.item.description && (
                  <p className="text-zinc-300 mb-4">{entry.item.description}</p>
                )}
                <Link href={`/lists/${entry.item.id}`} className="text-primary-500 hover:text-primary-400 text-sm font-medium">
                  Ver Lista Completa →
                </Link>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-zinc-300">{entry.item._count?.items || 0}</span> itens
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
