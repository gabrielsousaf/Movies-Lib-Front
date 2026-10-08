"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Trash2, Edit2, ThumbsUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReviewItem } from "./ReviewItem";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    likes: number;
  };
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  isLiked?: boolean; // Se o usuario logado deu like
}

interface ReviewSectionProps {
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
}

export function ReviewSection({ tmdbId, mediaType, title, posterPath }: ReviewSectionProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userReview, setUserReview] = useState<Review | null>(null);
  
  // Formulario
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    fetchReviews();
  }, [tmdbId, mediaType, token]);

  const fetchReviews = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/reviews/media/${tmdbId}?type=${mediaType}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data);
        
        if (user) {
          const mine = data.data.find((r: Review) => r.user.id === user.id);
          if (mine) {
            setUserReview(mine);
            setRating(mine.rating);
            setContent(mine.content || "");
          } else {
            setUserReview(null);
            setRating(5);
            setContent("");
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitLoading(true);
    setErrorMsg("");

    try {
      const method = userReview ? "PATCH" : "POST";
      const url = userReview 
        ? `${apiUrl}/reviews/${userReview.id}`
        : `${apiUrl}/reviews`;

      const payload = userReview 
        ? { rating, content }
        : { tmdbId, mediaType, title, posterPath, rating, content };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditing(false);
        fetchReviews(); // Recarrega
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Erro ao salvar avaliação.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !userReview) return;
    if (!confirm("Tem certeza que deseja excluir sua avaliação?")) return;

    try {
      const res = await fetch(`${apiUrl}/reviews/${userReview.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUserReview(null);
        setRating(5);
        setContent("");
        setIsEditing(false);
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!token) return alert("Faça login para curtir.");
    
    try {
      const res = await fetch(`${apiUrl}/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchReviews(); // atualiza os likes
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`w-5 h-5 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-600'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getAvatarSrc = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("/")) return `${apiUrl}${url}`;
    return url;
  };

  if (loading) {
    return <div className="py-8 text-center text-zinc-500">Carregando avaliações...</div>;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary-500" />
        Avaliações e Resenhas
      </h2>

      {/* Area do usuário atual */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
        {!user ? (
          <div className="text-center py-4">
            <p className="text-zinc-400 mb-4">Faça login para avaliar este título.</p>
            <Link href="/login" className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors font-medium">
              Entrar
            </Link>
          </div>
        ) : userReview && !isEditing ? (
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Sua Avaliação</h3>
            <ReviewItem
              review={userReview as any}
              apiUrl={apiUrl}
              onLike={handleLike}
              isMyReview={true}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-zinc-100 font-semibold">{userReview ? "Editar Avaliação" : "Adicionar Avaliação"}</h3>
            
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Nota</label>
              {renderStars(rating, true)}
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Comentário (opcional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="O que você achou?"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors font-medium disabled:opacity-50"
              >
                {submitLoading ? "Salvando..." : "Salvar"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors font-medium"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-6">
        {reviews.filter(r => r.user.id !== user?.id).length === 0 ? (
          <p className="text-zinc-500">Nenhuma outra avaliação ainda. Seja o primeiro a avaliar!</p>
        ) : (
          reviews
            .filter(r => r.user.id !== user?.id)
            .map((review) => (
              <ReviewItem
                key={review.id}
                review={review as any}
                apiUrl={apiUrl}
                onLike={handleLike}
              />
            ))
        )}
      </div>
    </section>
  );
}
