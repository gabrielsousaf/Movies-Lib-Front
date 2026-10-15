import { API_URL } from "@/lib/api";
import { MovieCard } from "@/components/MovieCard";
import { CatalogFilterBar } from "@/components/CatalogFilterBar";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

interface Series {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface ApiResponse {
  page: number;
  results: Series[];
  total_pages: number;
  total_results: number;
}

const categoryTitles: Record<string, string> = {
  "popular": "Séries Populares",
  "trending": "Séries em Alta",
  "top-rated": "Séries Mais Avaliadas",
  "explore": "Explorar Séries",
};

export default async function SeriesCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = resolvedParams.category;
  const currentPage = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) || 1 : 1;
  const apiUrl = API_URL;

  // Se a categoria não existir no nosso mapeamento, retorna 404
  if (!categoryTitles[category]) {
    notFound();
  }

  const genre = typeof resolvedSearchParams.genre === "string" ? resolvedSearchParams.genre : "";
  const year = typeof resolvedSearchParams.year === "string" ? resolvedSearchParams.year : "";
  const minVote = typeof resolvedSearchParams.minVote === "string" ? resolvedSearchParams.minVote : "";
  const sortBy = typeof resolvedSearchParams.sortBy === "string" ? resolvedSearchParams.sortBy : "popularity.desc";

  const hasCustomFilters = Boolean(genre || year || minVote || (sortBy && sortBy !== "popularity.desc"));

  let results: Series[] = [];
  let totalPages = 0;
  let genres: { id: number; name: string }[] = [];

  try {
    // Buscar lista de gêneros de séries
    const genresRes = await fetch(`${apiUrl}/tmdb/genres/series`, { next: { revalidate: 86400 } });
    if (genresRes.ok) {
      const genresData = await genresRes.json();
      genres = genresData.genres || [];
    }

    let endpoint = "";
    if (category === "explore" || hasCustomFilters) {
      const queryParams = new URLSearchParams();
      if (genre) queryParams.set("genres", genre);
      if (year) queryParams.set("year", year);
      if (minVote) queryParams.set("minVote", minVote);
      if (sortBy) queryParams.set("sortBy", sortBy);
      queryParams.set("page", String(currentPage));

      endpoint = `/tmdb/series/discover?${queryParams.toString()}`;
    } else {
      endpoint = `/tmdb/series/${category}?page=${currentPage}`;
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: ApiResponse = await response.json();
      results = data.results || [];
      totalPages = data.total_pages || 0;
    }
  } catch (error) {
    console.error(`Erro ao buscar séries da categoria ${category}:`, error);
  }

  // TMDB suporta no máximo 500 páginas
  const maxPages = Math.min(totalPages, 500);

  const buildPageUrl = (pageNumber: number) => {
    const sp = new URLSearchParams();
    if (genre) sp.set("genre", genre);
    if (year) sp.set("year", year);
    if (minVote) sp.set("minVote", minVote);
    if (sortBy) sp.set("sortBy", sortBy);
    sp.set("page", String(pageNumber));
    return `/series/${category}?${sp.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
          {categoryTitles[category]}
        </h1>
      </div>

      {/* Barra de Filtros Avançados */}
      <CatalogFilterBar
        mediaType="series"
        genres={genres}
        currentCategory={category}
      />

      {results.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 text-lg">Nenhuma série encontrada para os filtros selecionados.</p>
          <p className="text-zinc-500 text-sm mt-1">Tente remover alguns filtros ou selecionar outros anos/gêneros.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                id={item.id}
                title={item.name || item.title || "Sem título"}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                releaseDate={item.first_air_date || item.release_date}
                mediaType="tv"
              />
            ))}
          </div>

          {/* Paginação */}
          {maxPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Link>
              ) : (
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-md text-zinc-600 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              )}

              <span className="text-zinc-400 text-sm font-medium">
                Página {currentPage} de {maxPages}
              </span>

              {currentPage < maxPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-md text-zinc-600 cursor-not-allowed">
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
