"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bookmark, Film, Eye, Heart, Check, Trash2 } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { toast } from "sonner";

interface WatchlistItem {
  id: string;
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
  status: "WATCHLIST" | "WATCHED";
}

interface FavoriteItem {
  id: string;
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
}

export default function WatchlistPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"WATCHLIST" | "WATCHED" | "FAVORITES">("WATCHLIST");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [watchRes, favRes] = await Promise.all([
          fetch(`${apiUrl}/watchlist/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/favorites/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (watchRes.ok) {
          const watchData = await watchRes.json();
          setWatchlistItems(Array.isArray(watchData) ? watchData : watchData.data || []);
        }

        if (favRes.ok) {
          const favData = await favRes.json();
          setFavoriteItems(Array.isArray(favData) ? favData : favData.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, authLoading, router, apiUrl]);

  const handleToggleStatus = async (item: WatchlistItem) => {
    if (!token) return;
    const newStatus = item.status === "WATCHLIST" ? "WATCHED" : "WATCHLIST";
    try {
      const res = await fetch(
        `${apiUrl}/watchlist/${item.tmdbId}/status?type=${item.mediaType}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setWatchlistItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
        );
        toast.success(
          newStatus === "WATCHED"
            ? `"${item.title}" movido para Já Assistidos!`
            : `"${item.title}" movido para Quero Assistir!`
        );
      }
    } catch {
      toast.error("Erro ao atualizar status do título.");
    }
  };

  const handleRemoveWatchlist = async (item: WatchlistItem) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${apiUrl}/watchlist/${item.tmdbId}?type=${item.mediaType}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setWatchlistItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.info(`"${item.title}" removido da lista.`);
      }
    } catch {
      toast.error("Erro ao remover item.");
    }
  };

  const handleRemoveFavorite = async (item: FavoriteItem) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${apiUrl}/favorites/${item.tmdbId}?type=${item.mediaType}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setFavoriteItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.info(`"${item.title}" removido dos favoritos.`);
      }
    } catch {
      toast.error("Erro ao remover favorito.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const wantToWatchCount = watchlistItems.filter((i) => i.status === "WATCHLIST").length;
  const watchedCount = watchlistItems.filter((i) => i.status === "WATCHED").length;
  const favoritesCount = favoriteItems.length;

  const displayedItems =
    activeTab === "FAVORITES"
      ? favoriteItems
      : watchlistItems.filter((i) => i.status === activeTab);

  const movies = displayedItems.filter((i) => i.mediaType === "MOVIE");
  const series = displayedItems.filter((i) => i.mediaType === "TV");

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/50">
            <Bookmark className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Minha Biblioteca</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Gerencie os títulos que você quer assistir, já assistiu e seus favoritos.
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab("WATCHLIST")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "WATCHLIST"
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Quero Assistir
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/30">
              {wantToWatchCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("WATCHED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "WATCHED"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            Já Assistidos
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/30">
              {watchedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("FAVORITES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "FAVORITES"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Heart className="w-4 h-4" />
            Favoritos
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/30">
              {favoritesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Estado Vazio */}
      {displayedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
          <Film className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300 mb-2">
            {activeTab === "WATCHLIST"
              ? "Sua lista 'Quero Assistir' está vazia"
              : activeTab === "WATCHED"
              ? "Nenhum título marcado como 'Já Assistido'"
              : "Sua lista de Favoritos está vazia"}
          </h2>
          <p className="text-zinc-500 text-center max-w-md mb-6 text-sm">
            {activeTab === "WATCHLIST"
              ? "Explore nosso catálogo e clique em 'Quero Assistir' nos filmes e séries que deseja ver depois."
              : activeTab === "WATCHED"
              ? "Marque os filmes e séries que você já viu para acompanhar suas horas de tela nas estatísticas do seu perfil!"
              : "Clique no ícone de coração nos seus filmes e séries preferidos para destacá-los aqui."}
          </p>
          <button
            onClick={() => router.push("/movies/explore")}
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer text-sm"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {movies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary-500 pl-3">
                Filmes ({movies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <MovieCard
                      id={item.tmdbId}
                      mediaType="movie"
                      title={item.title}
                      posterPath={item.posterPath}
                      voteAverage={item.voteAverage}
                      releaseDate={item.releaseDate || undefined}
                    />
                    {activeTab !== "FAVORITES" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(item as WatchlistItem)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title={
                            activeTab === "WATCHLIST"
                              ? "Marcar como Já Assistido"
                              : "Mover para Quero Assistir"
                          }
                        >
                          {activeTab === "WATCHLIST" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Já Assisti</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-primary-400" />
                              <span>Para Ver</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveWatchlist(item as WatchlistItem)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-800/50 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remover da lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRemoveFavorite(item)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-800/50 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Favorito</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary-500 pl-3">
                Séries ({series.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {series.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <MovieCard
                      id={item.tmdbId}
                      mediaType="tv"
                      title={item.title}
                      posterPath={item.posterPath}
                      voteAverage={item.voteAverage}
                      releaseDate={item.releaseDate || undefined}
                    />
                    {activeTab !== "FAVORITES" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(item as WatchlistItem)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title={
                            activeTab === "WATCHLIST"
                              ? "Marcar como Já Assistido"
                              : "Mover para Quero Assistir"
                          }
                        >
                          {activeTab === "WATCHLIST" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Já Assisti</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-primary-400" />
                              <span>Para Ver</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveWatchlist(item as WatchlistItem)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-800/50 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remover da lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRemoveFavorite(item)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-800/50 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Favorito</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
