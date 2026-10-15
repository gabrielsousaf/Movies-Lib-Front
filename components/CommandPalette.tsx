"use client";
import { API_URL } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Tv, User, ArrowRight, Loader2, Sparkles, X } from "lucide-react";

interface SearchMediaItem {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv" | "person";
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface SearchUserItem {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mediaResults, setMediaResults] = useState<SearchMediaItem[]>([]);
  const [userResults, setUserResults] = useState<SearchUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const apiUrl = API_URL;
  const tmdbImageBase = "https://image.tmdb.org/t/p/w92";

  // Ouvinte global para Ctrl + K / Cmd + K e Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Foco automático no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setMediaResults([]);
      setUserResults([]);
    }
  }, [isOpen]);

  // Busca com debounce de 250ms
  useEffect(() => {
    if (!query.trim()) {
      setMediaResults([]);
      setUserResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [tmdbRes, userRes] = await Promise.all([
          fetch(`${apiUrl}/tmdb/search?query=${encodeURIComponent(query)}&page=1`),
          fetch(`${apiUrl}/users?q=${encodeURIComponent(query)}&limit=4`),
        ]);

        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          const items: SearchMediaItem[] = (tmdbData.results || [])
            .filter((i: any) => i.media_type === "movie" || i.media_type === "tv")
            .slice(0, 5);
          setMediaResults(items);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserResults(Array.isArray(userData) ? userData.slice(0, 3) : []);
        }
      } catch (err) {
        console.error("Erro na busca rápida:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, apiUrl]);

  const allItems = [
    ...mediaResults.map((m) => ({ type: "media" as const, item: m })),
    ...userResults.map((u) => ({ type: "user" as const, item: u })),
  ];

  const handleSelect = (idx: number) => {
    const target = allItems[idx];
    if (!target) {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }

    if (target.type === "media") {
      const isMovie = target.item.media_type === "movie";
      router.push(`/${isMovie ? "movie" : "tv"}/${target.item.id}`);
    } else {
      router.push(`/user/${target.item.username}`);
    }
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Entrada de Busca */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <Search className="w-5 h-5 text-primary-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar filmes, séries, cinefilos e amigos..."
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none text-base font-medium"
          />
          {loading && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-2 py-1 rounded font-mono transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-900">
          {query.trim() === "" ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary-500/40" />
              <p className="font-medium text-zinc-300">Busca Rápida Inteligente</p>
              <p className="text-xs mt-1 text-zinc-500">
                Digite o nome de qualquer filme, série ou @username para encontrar instantaneamente.
              </p>
            </div>
          ) : allItems.length === 0 && !loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Nenhum resultado encontrado para &ldquo;<span className="text-zinc-300">{query}</span>&rdquo;.
            </div>
          ) : (
            <>
              {/* Seção Filmes & Séries */}
              {mediaResults.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Filmes & Séries
                  </div>
                  {mediaResults.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    const title = item.title || item.name;
                    const date = item.release_date || item.first_air_date;
                    const year = date ? date.substring(0, 4) : "";
                    const isMovie = item.media_type === "movie";

                    return (
                      <div
                        key={`media-${item.id}`}
                        onClick={() => handleSelect(idx)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-primary-500/10 text-white" : "hover:bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        <div className="w-10 h-14 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 border border-zinc-800">
                          {item.poster_path ? (
                            <img
                              src={`${tmdbImageBase}${item.poster_path}`}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              {isMovie ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-zinc-100">{title}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {isMovie ? "Filme" : "Série"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            {year && <span>{year}</span>}
                            {item.vote_average ? (
                              <span className="text-yellow-500 font-medium">★ {item.vote_average.toFixed(1)}</span>
                            ) : null}
                          </div>
                        </div>

                        <ArrowRight className={`w-4 h-4 text-primary-500 shrink-0 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Seção Usuários */}
              {userResults.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Cinefilos & Usuários
                  </div>
                  {userResults.map((u, uIdx) => {
                    const globalIdx = mediaResults.length + uIdx;
                    const isSelected = selectedIndex === globalIdx;
                    const avatarSrc = u.avatarUrl?.startsWith("/")
                      ? `${apiUrl}${u.avatarUrl}`
                      : u.avatarUrl;

                    return (
                      <div
                        key={`user-${u.id}`}
                        onClick={() => handleSelect(globalIdx)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-primary-500/10 text-white" : "hover:bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-700">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-zinc-100">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-xs text-zinc-500">@{u.username}</p>
                        </div>

                        <ArrowRight className={`w-4 h-4 text-primary-500 shrink-0 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé com dicas de atalhos e link para busca completa */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/60 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">↵</kbd> abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">Esc</kbd> fechar
            </span>
          </div>

          {query.trim() && (
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
              className="text-primary-400 hover:text-primary-300 font-semibold cursor-pointer"
            >
              Ver todos os resultados →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
