"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare, Trash2, Edit2, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  _count?: {
    likes: number;
    comments?: number;
  };
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
}

interface ReviewItemProps {
  review: Review;
  apiUrl: string;
  onLike: (reviewId: string) => void;
  isMyReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewItem({ review, apiUrl, onLike, isMyReview, onEdit, onDelete }: ReviewItemProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(review._count?.comments || 0);
  const [localIsLiked, setLocalIsLiked] = useState(review.isLiked || false);
  const [localLikeCount, setLocalLikeCount] = useState(review._count?.likes || 0);

  useEffect(() => {
    setCommentCount(review._count?.comments || 0);
    setLocalIsLiked(review.isLiked || false);
    setLocalLikeCount(review._count?.likes || 0);
  }, [review]);

  const getAvatarSrc = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("/")) return `${apiUrl}${url}`;
    return url;
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-600'}`}
          />
        ))}
      </div>
    );
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${apiUrl}/reviews/${review.id}/comments`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setComments(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${apiUrl}/reviews/${review.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      if (res.ok) {
        setNewComment("");
        loadComments();
        setCommentCount((c) => c + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!token || !confirm("Tem certeza que deseja excluir seu comentário?")) return;

    try {
      const res = await fetch(`${apiUrl}/reviews/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        loadComments();
        setCommentCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeClick = () => {
    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    setLocalLikeCount(localIsLiked ? Math.max(0, localLikeCount - 1) : localLikeCount + 1);
    
    // Call parent handler (which hits API and re-fetches)
    onLike(review.id);
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
      <div className="flex gap-4">
        <Link href={`/user/${review.user.username}`} className="shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
            {review.user.avatarUrl ? (
              <img src={getAvatarSrc(review.user.avatarUrl)!} alt={review.user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm font-bold">
                {review.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link href={`/user/${review.user.username}`} className="font-semibold text-zinc-100 hover:text-primary-500 transition-colors">
                {review.user.displayName || review.user.username}
              </Link>
              <div className="text-xs text-zinc-500 mt-0.5">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {renderStars(review.rating)}
              {isMyReview && (
                <div className="flex gap-2">
                  <button onClick={onEdit} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={onDelete} className="text-zinc-500 hover:text-red-500 transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {review.content && (
            <p className="text-zinc-300 text-sm whitespace-pre-line mt-3 mb-4 leading-relaxed">
              {review.content}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button 
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                localIsLiked 
                  ? "bg-primary-500/20 text-primary-500 border border-primary-500/50" 
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${localIsLiked ? "fill-primary-500" : ""}`} />
              <span>{localLikeCount}</span>
            </button>
            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentCount}</span> Comentários
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-zinc-800 ml-16">
          <h4 className="text-sm font-bold text-zinc-200 mb-4">Comentários</h4>
          
          {loadingComments ? (
            <div className="text-zinc-500 text-sm">Carregando comentários...</div>
          ) : (
            <div className="space-y-4 mb-4">
              {comments.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      {comment.user.avatarUrl ? (
                        <img src={getAvatarSrc(comment.user.avatarUrl)!} alt={comment.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                          {comment.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <Link href={`/user/${comment.user.username}`} className="font-semibold text-sm text-zinc-200 hover:text-primary-500">
                          {comment.user.displayName || comment.user.username}
                        </Link>
                        {user && user.id === comment.user.id && (
                          <button onClick={() => deleteComment(comment.id)} className="text-zinc-500 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>
                      <div className="text-xs text-zinc-500 mt-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {user ? (
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-sm text-zinc-500 mt-2">
              <Link href="/login" className="text-primary-500 hover:underline">Faça login</Link> para comentar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
