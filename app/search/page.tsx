import { MovieCard } from "@/components/MovieCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: string; // 'movie', 'tv', 'person'
}

interface ApiResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const currentPage = typeof params.page === "string" ? parseInt(params.page) || 1 : 1;
  const searchType = typeof params.type === "string" ? params.type : "multi"; // 'multi', 'movie', 'tv'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  let results: SearchResult[] = [];
  let totalResults = 0;
  let totalPages = 0;

  if (query) {
    try {
      let endpoint = `/tmdb/search?query=${encodeURIComponent(query)}&page=${currentPage}`;
      
      if (searchType === "movie") {
        endpoint = `/tmdb/movies/search?query=${encodeURIComponent(query)}&page=${currentPage}`;
      } else if (searchType === "tv") {
        endpoint = `/tmdb/series/search?query=${encodeURIComponent(query)}&page=${currentPage}`;
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        cache: "no-store", 
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        
        // Se for 'multi', o TMDB retorna tudo misturado, precisamos filtrar 'person'
        // Se for 'movie' ou 'tv' direto, todos os resultados já são do tipo certo
        if (searchType === "multi") {
          results = (data.results || []).filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
        } else {
          results = data.results || [];
        }
        
        totalResults = data.total_results || 0;
        totalPages = data.total_pages || 0;
      }
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    }
  }

  // Só renderiza até a página 500 porque a API do TMDB limita paginação em 500 páginas
  const maxPages = Math.min(totalPages, 500);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">
          Resultados da busca para: <span className="text-primary-500">"{query}"</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          {totalResults > 0 
            ? `Encontramos ${totalResults} resultado(s).` 
            : "Nenhum resultado encontrado."}
        </p>

        {query && (
          <div className="flex gap-4 mt-6">
            <Link 
              href={`/search?q=${encodeURIComponent(query)}&type=multi`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchType === 'multi' ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Tudo
            </Link>
            <Link 
              href={`/search?q=${encodeURIComponent(query)}&type=movie`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchType === 'movie' ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Apenas Filmes
            </Link>
            <Link 
              href={`/search?q=${encodeURIComponent(query)}&type=tv`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchType === 'tv' ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Apenas Séries
            </Link>
          </div>
        )}
      </div>

      {!query ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">Digite algo na barra de busca para encontrar filmes e séries.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">Não encontramos nada correspondente a "{query}" nesta página.</p>
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
                  href={`/search?q=${encodeURIComponent(query)}&type=${searchType}&page=${currentPage - 1}`}
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
                  href={`/search?q=${encodeURIComponent(query)}&type=${searchType}&page=${currentPage + 1}`}
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
