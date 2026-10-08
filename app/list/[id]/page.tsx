"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { List as ListIcon, Lock, Globe, Trash2, Edit2, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CustomListItem {
  id: string;
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
  addedAt: string;
}

interface CustomList {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  user?: {
    username: string;
    displayName: string | null;
  };
  items: CustomListItem[];
}

export default function ListDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [list, setList] = useState<CustomList | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    if (authLoading) return;
    fetchListDetails();
  }, [id, authLoading, token]);

  const fetchListDetails = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/lists/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Lista não encontrada ou privada.");
      }
    } catch (error) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (tmdbId: number, mediaType: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`${apiUrl}/lists/${id}/items/${tmdbId}?type=${mediaType}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setList(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter(item => !(item.tmdbId === tmdbId && item.mediaType === mediaType))
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (errorMsg || !list) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{errorMsg || "Erro ao carregar lista"}</h1>
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white underline">
          Voltar
        </button>
      </div>
    );
  }

  const isOwner = user?.id === list.userId;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8 flex flex-col gap-6">
        <Link href="/lists" className="text-zinc-400 hover:text-zinc-100 flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ListIcon className="w-8 h-8 text-primary-500" />
              <h1 className="text-3xl font-bold text-white">{list.title}</h1>
            </div>
            
            {list.description && (
              <p className="text-zinc-400 text-lg mb-4 max-w-2xl">{list.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
              <span className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">
                {list.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {list.isPublic ? "Pública" : "Privada"}
              </span>
              <span>
                Criada por{" "}
                {list.user ? (
                  <Link href={`/user/${list.user.username}`} className="text-primary-500 hover:text-primary-400 transition-colors">
                    {list.user.displayName || list.user.username}
                  </Link>
                ) : (
                  <span className="text-zinc-500">Desconhecido</span>
                )}
              </span>
              <span>{list.items.length} itens</span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copiado para a área de transferência!");
                }}
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            </div>
          )}
        </div>
      </div>

      {list.items.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-lg">Esta lista está vazia no momento.</p>
          {isOwner && <p className="text-zinc-600 text-sm mt-2">Explore filmes e séries e adicione-os à sua lista!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {list.items.map((item) => (
            <div key={item.id} className="relative group">
              <MovieCard
                id={item.tmdbId}
                title={item.title}
                posterPath={item.posterPath || ""}
                voteAverage={item.voteAverage || 0}
                releaseDate={item.releaseDate || ""}
                mediaType={item.mediaType.toLowerCase() as "movie" | "tv"}
              />
              {isOwner && (
                <button
                  onClick={() => handleRemoveItem(item.tmdbId, item.mediaType)}
                  className="absolute top-2 right-2 z-20 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remover da lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
