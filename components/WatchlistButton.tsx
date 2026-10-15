"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, BookmarkCheck, Eye, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  className?: string;
  showWatchedToggle?: boolean;
}

export function WatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  voteAverage,
  releaseDate,
  className = "",
  showWatchedToggle = false,
}: WatchlistButtonProps) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<"WATCHLIST" | "WATCHED" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const apiMediaType = mediaType.toUpperCase();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const checkWatchlist = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(
          `${apiUrl}/watchlist/check/${tmdbId}?type=${apiMediaType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus(data.inList ? data.status : null);
        }
      } catch (error) {
        console.error("Erro ao checar watchlist", error);
      } finally {
        setLoading(false);
      }
    };

    checkWatchlist();
  }, [tmdbId, user, token, apiMediaType]);

  const handleSetStatus = async (
    e: React.MouseEvent,
    targetStatus: "WATCHLIST" | "WATCHED"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    try {
      if (status === targetStatus) {
        // Se já está com esse status, remove da lista
        const res = await fetch(
          `${apiUrl}/watchlist/${tmdbId}?type=${apiMediaType}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          setStatus(null);
          toast.info(`"${title}" removido da sua lista.`);
        }
      } else {
        // Upsert com o novo status (WATCHLIST ou WATCHED)
        const payload = {
          tmdbId,
          mediaType: apiMediaType,
          title,
          posterPath: posterPath || undefined,
          backdropPath: backdropPath || undefined,
          voteAverage: voteAverage || undefined,
          releaseDate: releaseDate || undefined,
          status: targetStatus,
        };

        const res = await fetch(`${apiUrl}/watchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setStatus(targetStatus);
          if (targetStatus === "WATCHED") {
            toast.success(`"${title}" marcado como Já Assistido!`);
          } else {
            toast.success(`"${title}" salvo em Quero Assistir!`);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao alterar watchlist", error);
      toast.error("Erro ao atualizar sua lista.");
    } finally {
      setLoading(false);
    }
  };

  if (showWatchedToggle) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(e) => handleSetStatus(e, "WATCHLIST")}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer disabled:opacity-50 ${
            status === "WATCHLIST"
              ? "bg-primary-500/20 border-primary-500 text-primary-400"
              : "bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
          }`}
        >
          {status === "WATCHLIST" ? (
            <BookmarkCheck className="w-4 h-4 text-primary-500 fill-primary-500" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span>{status === "WATCHLIST" ? "Na Lista" : "Quero Assistir"}</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleSetStatus(e, "WATCHED")}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer disabled:opacity-50 ${
            status === "WATCHED"
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
              : "bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
          }`}
        >
          {status === "WATCHED" ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span>{status === "WATCHED" ? "Assistido" : "Já Assisti"}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) =>
        handleSetStatus(e, status === "WATCHED" ? "WATCHED" : "WATCHLIST")
      }
      disabled={loading}
      title={
        status === "WATCHED"
          ? "Já Assistido (clique para remover)"
          : status === "WATCHLIST"
          ? "Remover da Minha Lista"
          : "Adicionar à Minha Lista"
      }
      className={`flex items-center justify-center transition-all duration-300 disabled:opacity-50 focus:outline-none cursor-pointer ${className}`}
    >
      {status === "WATCHED" ? (
        <Eye className="w-5 h-5 text-emerald-400" />
      ) : status === "WATCHLIST" ? (
        <BookmarkCheck className="w-5 h-5 text-primary-500 fill-primary-500" />
      ) : (
        <Bookmark className="w-5 h-5 text-zinc-100 group-hover:text-primary-500 hover:text-primary-400" />
      )}
    </button>
  );
}
