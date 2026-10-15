"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, SlidersHorizontal } from "lucide-react";

interface Genre {
  id: number;
  name: string;
}

interface CatalogFilterBarProps {
  mediaType: "movies" | "series";
  genres: Genre[];
  currentCategory: string;
}

export function CatalogFilterBar({ mediaType, genres, currentCategory }: CatalogFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentMinVote = searchParams.get("minVote") || "";
  const currentSortBy = searchParams.get("sortBy") || "popularity.desc";

  const hasActiveFilters = Boolean(currentGenre || currentYear || currentMinVote || (currentSortBy && currentSortBy !== "popularity.desc"));

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reseta para a primeira página ao filtrar

    // Se estiver em uma categoria fixa (ex: popular, trending) e aplicar filtro, redireciona para /explore
    let targetPath = pathname;
    if (value && currentCategory !== "explore") {
      targetPath = `/${mediaType}/explore`;
    }

    router.push(`${targetPath}?${params.toString()}`);
  };

  const clearFilters = () => {
    const targetPath = `/${mediaType}/explore`;
    router.push(targetPath);
  };

  const currentYearNumber = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYearNumber - i);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-8 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold">
          <SlidersHorizontal className="w-5 h-5 text-primary-500" />
          <span>Filtros do Catálogo</span>
          {hasActiveFilters && (
            <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-medium ml-2">
              Filtros ativos
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
            Limpar todos os filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seletor de Gênero */}
        <div>
          <label className="block text-xs uppercase font-bold text-zinc-400 mb-1.5">Gênero</label>
          <select
            value={currentGenre}
            onChange={(e) => updateParam("genre", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="">Todos os Gêneros</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Ano */}
        <div>
          <label className="block text-xs uppercase font-bold text-zinc-400 mb-1.5">Ano de Lançamento</label>
          <select
            value={currentYear}
            onChange={(e) => updateParam("year", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="">Qualquer Ano</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Nota Mínima */}
        <div>
          <label className="block text-xs uppercase font-bold text-zinc-400 mb-1.5">Nota Mínima</label>
          <select
            value={currentMinVote}
            onChange={(e) => updateParam("minVote", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="">Todas as Notas</option>
            <option value="6">★ 6.0 ou mais</option>
            <option value="7">★ 7.0 ou mais</option>
            <option value="8">★ 8.0 ou mais</option>
            <option value="8.5">★ 8.5 ou mais</option>
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-xs uppercase font-bold text-zinc-400 mb-1.5">Ordenar Por</label>
          <select
            value={currentSortBy}
            onChange={(e) => updateParam("sortBy", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="popularity.desc">Mais Populares</option>
            <option value="vote_average.desc">Melhores Avaliações</option>
            <option value={mediaType === "movies" ? "primary_release_date.desc" : "first_air_date.desc"}>
              Mais Recentes
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
