"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  className?: string; // Optional styling
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
}: WatchlistButtonProps) {
  const { user, token } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // MediaType is stored as uppercase MOVIE or TV in backend
  const apiMediaType = mediaType.toUpperCase();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const checkWatchlist = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
        // To accurately check we also should send mediaType but the backend route is `check/:tmdbId`
        // so it might check globally by ID.
        const response = await fetch(`${apiUrl}/watchlist/check/${tmdbId}?mediaType=${apiMediaType}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsInWatchlist(data.inWatchlist);
        }
      } catch (error) {
        console.error("Erro ao checar watchlist", error);
      } finally {
        setLoading(false);
      }
    };

    checkWatchlist();
  }, [tmdbId, user, token, apiMediaType]);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Impede default
    e.stopPropagation(); // Impede o clique de subir para o Link do Card
    
    if (!user || !token) {
      // Redireciona para o login se não estiver logado
      router.push("/login");
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

    try {
      if (isInWatchlist) {
        // Remover
        // Note that delete usually accepts the ID but we might need mediaType as well.
        await fetch(`${apiUrl}/watchlist/${tmdbId}?mediaType=${apiMediaType}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInWatchlist(false);
      } else {
        // Adicionar
        const payload = {
          tmdbId,
          mediaType: apiMediaType,
          title,
          posterPath,
          backdropPath,
          voteAverage,
          releaseDate,
          status: "WATCHLIST"
        };

        await fetch(`${apiUrl}/watchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Erro ao alterar watchlist", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      title={isInWatchlist ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
      className={`flex items-center justify-center transition-all duration-300 disabled:opacity-50 focus:outline-none ${className}`}
    >
      {isInWatchlist ? (
        <BookmarkCheck className="w-5 h-5 text-primary-500 fill-primary-500" />
      ) : (
        <Bookmark className="w-5 h-5 text-zinc-100 group-hover:text-primary-500 hover:text-primary-400" />
      )}
    </button>
  );
}
