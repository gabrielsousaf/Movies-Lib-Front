"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bookmark, Film } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";

interface WatchlistItem {
  id: string; // db uuid
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
  status: "WATCHLIST" | "WATCHED";
}

export default function WatchlistPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return; // Espera Auth carregar

    if (!user || !token) {
      router.push("/login");
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
        const response = await fetch(`${apiUrl}/watchlist/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Erro ao carregar lista", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const movies = items.filter(i => i.mediaType === "MOVIE");
  const series = items.filter(i => i.mediaType === "TV");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/50">
          <Bookmark className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Minha Lista</h1>
          <p className="text-zinc-400 mt-1">Sua coleção pessoal de filmes e séries salvos.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
          <Film className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300 mb-2">Sua lista está vazia</h2>
          <p className="text-zinc-500 text-center max-w-md mb-6">
            Você ainda não adicionou nenhum título. Explore nosso catálogo e clique no ícone de "Salvar" nos filmes que deseja assistir depois.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {movies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary-500 pl-3">Filmes Salvos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((item) => (
                  <MovieCard
                    key={item.id}
                    id={item.tmdbId}
                    mediaType="movie"
                    title={item.title}
                    posterPath={item.posterPath}
                    voteAverage={item.voteAverage}
                    releaseDate={item.releaseDate || undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary-500 pl-3">Séries Salvas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {series.map((item) => (
                  <MovieCard
                    key={item.id}
                    id={item.tmdbId}
                    mediaType="tv"
                    title={item.title}
                    posterPath={item.posterPath}
                    voteAverage={item.voteAverage}
                    releaseDate={item.releaseDate || undefined}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
