"use client";
import { API_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  voteAverage,
  releaseDate,
  className = "",
  showLabel = false,
}: FavoriteButtonProps) {
  const { user, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const apiMediaType = mediaType.toUpperCase();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const apiUrl = API_URL;
        const response = await fetch(
          `${apiUrl}/favorites/check/${tmdbId}?type=${apiMediaType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(!!data.isFavorite);
        }
      } catch (error) {
        console.error("Erro ao checar favorito", error);
      } finally {
        setLoading(false);
      }
    };

    checkFavorite();
  }, [tmdbId, user, token, apiMediaType]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const apiUrl = API_URL;

    try {
      if (isFavorite) {
        const res = await fetch(
          `${apiUrl}/favorites/${tmdbId}?type=${apiMediaType}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          setIsFavorite(false);
          toast.info(`"${title}" removido dos seus favoritos.`);
        }
      } else {
        const payload = {
          tmdbId,
          mediaType: apiMediaType,
          title,
          posterPath: posterPath || undefined,
          backdropPath: backdropPath || undefined,
          voteAverage: voteAverage || undefined,
          releaseDate: releaseDate || undefined,
        };

        const res = await fetch(`${apiUrl}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 409) {
          setIsFavorite(true);
          toast.success(`"${title}" adicionado aos seus favoritos!`);
        }
      }
    } catch (error) {
      console.error("Erro ao alterar favorito", error);
      toast.error("Erro ao atualizar seus favoritos.");
    } finally {
      setLoading(false);
    }
  };

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer disabled:opacity-50 ${
          isFavorite
            ? "bg-rose-500/20 border-rose-500 text-rose-400"
            : "bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform ${
            isFavorite ? "text-rose-500 fill-rose-500 scale-110" : ""
          }`}
        />
        <span>{isFavorite ? "Favoritado" : "Favoritar"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
      className={`flex items-center justify-center transition-all duration-300 disabled:opacity-50 focus:outline-none cursor-pointer ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-transform ${
          isFavorite
            ? "text-rose-500 fill-rose-500 scale-110"
            : "text-zinc-100 hover:text-rose-400"
        }`}
      />
    </button>
  );
}
