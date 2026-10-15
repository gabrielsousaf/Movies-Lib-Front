"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, List, Star, Heart, FileText, BarChart3, Clock, Film, Tv, ThumbsUp, MessageSquare, Flame } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { toast } from "sonner";

interface ProfileStats {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  createdAt: string;
  totalFavorites: number;
  totalWatchlist: number;
  totalReviews: number;
  totalLists: number;
  totalFollowers: number;
  totalFollowing: number;
  isFollowing: boolean;
}

interface UserStats {
  username: string;
  time: {
    totalMinutes: number;
    totalHours: number;
    totalDays: number;
  };
  counts: {
    watchedMovies: number;
    watchedSeries: number;
    watchedEpisodes: number;
    showsFollowed: number;
    watchlist: number;
    reviews: number;
    favorites: number;
    customLists: number;
  };
  ratings: {
    average: number;
    total: number;
    distribution: Record<number, number>;
  };
  engagement: {
    likesReceived: number;
    commentsReceived: number;
  };
}

export function ProfileView({ username }: { username: string }) {
  const { token, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const [activeTab, setActiveTab] = useState<"favorites" | "lists" | "reviews" | "stats">("favorites");

  // Tab Data States
  const [favorites, setFavorites] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    fetchProfile();
  }, [username, token]);

  useEffect(() => {
    if (!profile) return;
    if (activeTab === "favorites") fetchFavorites();
    if (activeTab === "lists") fetchLists();
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "stats") fetchStats();
  }, [activeTab, profile, token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/users/${username}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.totalFollowers);
      } else {
        if (res.status === 404) setError("Usuário não encontrado.");
        else setError("Erro ao carregar perfil.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingTab(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/users/${username}/favorites`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const fetchLists = async () => {
    setLoadingTab(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/lists/user/${username}?limit=50`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLists(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingTab(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/reviews/user/${username}?limit=50`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const fetchStats = async () => {
    setLoadingTab(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/users/${username}/stats`, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const toggleFollow = async () => {
    if (!token) return toast.error("Faça login para seguir outros usuários.");
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`${apiUrl}/users/${username}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        if (isFollowing) {
          toast.info(`Você deixou de seguir @${username}`);
        } else {
          toast.success(`Você agora está seguindo @${username}!`);
        }
      } else {
        toast.error("Erro ao atualizar seguidor.");
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar de seguir.");
      toast.error("Erro de conexão.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-24">
        <h1 className="text-3xl font-bold text-white mb-4">Puxa!</h1>
        <p className="text-zinc-400">{error || "Algo deu errado."}</p>
      </div>
    );
  }

  const isMe = currentUser?.username === profile.username;

  const getAvatarUrl = (url: string | null) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left mb-8">
        <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-800 overflow-hidden">
          {profile.avatarUrl ? (
            <img
              src={getAvatarUrl(profile.avatarUrl)}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl font-bold text-zinc-500 uppercase">
              {profile.username.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.displayName || profile.username}</h1>
              <p className="text-zinc-400 text-lg">@{profile.username}</p>
            </div>
            
            {!isMe && (
              <button
                onClick={toggleFollow}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-100"
                    : "bg-primary-600 hover:bg-primary-500 text-white"
                }`}
              >
                {isFollowing ? "Deixar de Seguir" : "Seguir"}
              </button>
            )}
            {isMe && (
              <Link
                href="/profile"
                className="px-6 py-2 rounded-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
              >
                Editar Perfil
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-zinc-300 max-w-2xl">{profile.bio}</p>
          )}

          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6 text-sm">
            <div className="flex gap-4 items-center bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800/50">
              <div className="text-center px-2 border-r border-zinc-800">
                <span className="block font-bold text-lg text-white">{followersCount}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Seguidores</span>
              </div>
              <div className="text-center px-2">
                <span className="block font-bold text-lg text-white">{profile.totalFollowing}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Seguindo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>Entrou em {new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "favorites" ? "border-primary-500 text-primary-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Heart className="w-4 h-4" />
          Favoritos ({profile.totalFavorites})
        </button>
        <button
          onClick={() => setActiveTab("lists")}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "lists" ? "border-primary-500 text-primary-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <List className="w-4 h-4" />
          Listas Públicas ({profile.totalLists})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "reviews" ? "border-primary-500 text-primary-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Star className="w-4 h-4" />
          Avaliações ({profile.totalReviews})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "stats" ? "border-primary-500 text-primary-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Estatísticas
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {!profile.isPublic && !isMe ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-300 mb-2">Perfil Privado</h2>
            <p className="text-zinc-500 max-w-md mx-auto">Esta conta é privada. Você não pode ver suas listas ou favoritos.</p>
          </div>
        ) : loadingTab ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              favorites.length === 0 ? (
                <p className="text-zinc-500 text-center py-12">Nenhum favorito público.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {favorites.map((fav) => (
                    <MovieCard
                      key={fav.id}
                      id={fav.tmdbId}
                      title={fav.title}
                      posterPath={fav.posterPath}
                      voteAverage={fav.voteAverage || 0}
                      releaseDate={fav.releaseDate}
                      mediaType={fav.mediaType.toLowerCase() as "movie" | "tv"}
                    />
                  ))}
                </div>
              )
            )}

            {/* Lists Tab */}
            {activeTab === "lists" && (
              lists.length === 0 ? (
                <p className="text-zinc-500 text-center py-12">Nenhuma lista pública.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lists.map((list) => (
                    <Link key={list.id} href={`/list/${list.id}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col h-full">
                      <h3 className="text-lg font-bold text-zinc-100 mb-2">{list.title}</h3>
                      <p className="text-zinc-400 text-sm flex-1">{list.description || "Sem descrição."}</p>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              reviews.length === 0 ? (
                <p className="text-zinc-500 text-center py-12">Nenhuma avaliação pública.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex gap-4">
                      {review.posterPath && (
                        <Link href={`/${review.mediaType.toLowerCase()}/${review.tmdbId}`} className="shrink-0 w-20 h-30 block relative overflow-hidden rounded-md">
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${review.posterPath}`}
                            alt={review.title}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      )}
                      <div className="flex-1">
                        <Link href={`/${review.mediaType.toLowerCase()}/${review.tmdbId}`} className="font-bold text-zinc-100 hover:text-primary-400 text-lg">
                          {review.title}
                        </Link>
                        <div className="flex items-center gap-1 mt-1 mb-3">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-white">{review.rating.toFixed(1)}</span>
                          <span className="text-zinc-500 text-sm ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.content && (
                          <p className="text-zinc-300 bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                            {review.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              !stats ? (
                <p className="text-zinc-500 text-center py-12">Carregando estatísticas...</p>
              ) : (
                <div className="space-y-8">
                  {/* Hero banner de tempo assistido */}
                  <div className="bg-gradient-to-r from-primary-950/60 via-zinc-900 to-zinc-900 border border-primary-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                        <Clock className="w-8 h-8 text-primary-500" />
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold tracking-widest text-primary-400">Tempo Total de Tela</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl md:text-4xl font-extrabold text-white">
                            {stats.time.totalHours.toLocaleString()}
                          </span>
                          <span className="text-lg text-zinc-400 font-medium">horas</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">
                          Equivalente a <strong className="text-zinc-200">{stats.time.totalDays} dias inteiros</strong> assistindo a filmes e episódios.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="flex-1 md:flex-initial bg-zinc-950/60 border border-zinc-800 rounded-xl px-5 py-3 text-center">
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Média das Notas</span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xl font-bold text-yellow-500">
                          <Star className="w-5 h-5 fill-yellow-500" />
                          <span>{stats.ratings.average > 0 ? stats.ratings.average : "-"}</span>
                        </div>
                      </div>
                      <div className="flex-1 md:flex-initial bg-zinc-950/60 border border-zinc-800 rounded-xl px-5 py-3 text-center">
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Curtidas Recebidas</span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xl font-bold text-red-500">
                          <Flame className="w-5 h-5" />
                          <span>{stats.engagement.likesReceived}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Contadores Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <Film className="w-5 h-5 text-primary-500" />
                        <span className="text-xs uppercase font-semibold tracking-wider">Filmes Assistidos</span>
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-white">{stats.counts.watchedMovies}</span>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <Tv className="w-5 h-5 text-primary-500" />
                        <span className="text-xs uppercase font-semibold tracking-wider">Episódios Vistos</span>
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-white">{stats.counts.watchedEpisodes}</span>
                      <span className="text-xs text-zinc-500 block mt-1">{stats.counts.showsFollowed} séries acompanhadas</span>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <FileText className="w-5 h-5 text-primary-500" />
                        <span className="text-xs uppercase font-semibold tracking-wider">Resenhas Escritas</span>
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-white">{stats.counts.reviews}</span>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <List className="w-5 h-5 text-primary-500" />
                        <span className="text-xs uppercase font-semibold tracking-wider">Listas Criadas</span>
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-white">{stats.counts.customLists}</span>
                    </div>
                  </div>

                  {/* Distribuição de Notas (Histograma Letterboxd style) */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white">Distribuição de Avaliações</h3>
                        <p className="text-xs text-zinc-400">Histograma de notas concedidas pelo usuário (1 a 5 estrelas)</p>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                        {stats.ratings.total} avaliações
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.ratings.distribution[star] || 0;
                        const percentage = stats.ratings.total > 0 
                          ? Math.round((count / stats.ratings.total) * 100) 
                          : 0;

                        return (
                          <div key={star} className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 w-12 text-zinc-300 font-medium shrink-0">
                              <span>{star}</span>
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex-1 bg-zinc-950 h-5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                              <div
                                className="bg-gradient-to-r from-primary-600 to-primary-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-16 text-right text-xs font-semibold text-zinc-400 shrink-0">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumo da Comunidade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                        <ThumbsUp className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-white">{stats.engagement.likesReceived}</span>
                        <p className="text-xs text-zinc-400">Curtidas recebidas em comentários e avaliações</p>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-white">{stats.engagement.commentsReceived}</span>
                        <p className="text-xs text-zinc-400">Respostas e comentários recebidos da comunidade</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
