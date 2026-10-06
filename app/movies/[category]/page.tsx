import { MovieCard } from "@/components/MovieCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

interface Movie {
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
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const categoryTitles: Record<string, string> = {
  "popular": "Filmes Populares",
  "trending": "Filmes em Alta",
  "top-rated": "Filmes Mais Avaliados",
  "now-playing": "Filmes em Cartaz",
};

export default async function MoviesCategoryPage({
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  // Se a categoria não existir no nosso mapeamento, retorna 404
  if (!categoryTitles[category]) {
    notFound();
  }

  let results: Movie[] = [];
  let totalPages = 0;

  try {
    const response = await fetch(`${apiUrl}/tmdb/movies/${category}?page=${currentPage}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: ApiResponse = await response.json();
      results = data.results || [];
      totalPages = data.total_pages || 0;
    }
  } catch (error) {
    console.error(`Erro ao buscar filmes da categoria ${category}:`, error);
  }

  // TMDB suporta no máximo 500 páginas
  const maxPages = Math.min(totalPages, 500);

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
          {categoryTitles[category]}
        </h1>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">Nenhum filme encontrado nesta página.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                id={item.id}
                title={item.title || item.name || "Sem título"}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                releaseDate={item.release_date || item.first_air_date}
              />
            ))}
          </div>

          {/* Paginação */}
          {maxPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              {currentPage > 1 ? (
                <Link
                  href={`/movies/${category}?page=${currentPage - 1}`}
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
                  href={`/movies/${category}?page=${currentPage + 1}`}
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
