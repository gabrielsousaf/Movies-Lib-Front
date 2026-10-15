import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { Flame, Clapperboard, Star, Ticket, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface ApiResponse {
  results: Movie[];
}

export default async function MoviesHubPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  async function fetchMovies(endpoint: string): Promise<Movie[]> {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        next: { revalidate: 3600 },
      });
      if (response.ok) {
        const data: ApiResponse = await response.json();
        return data.results || [];
      }
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
    }
    return [];
  }

  const [trending, popular, topRated, nowPlaying] = await Promise.all([
    fetchMovies("/tmdb/movies/trending?timeWindow=week"),
    fetchMovies("/tmdb/movies/popular"),
    fetchMovies("/tmdb/movies/top-rated"),
    fetchMovies("/tmdb/movies/now-playing"),
  ]);

  const featuredMovies = trending.slice(0, 5);
  const trendingList = trending.slice(5);

  return (
    <div className="pb-12">
      {featuredMovies.length > 0 && <HeroBanner movies={featuredMovies} />}

      <div className="container mx-auto px-4 -mt-8 md:-mt-16 mb-6 relative z-30 flex justify-end">
        <Link
          href="/movies/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-primary-500 rounded-xl text-sm font-semibold text-zinc-100 transition-all shadow-xl backdrop-blur-md group"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
          Explorar com Filtros
          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold ml-1">Gêneros e Anos</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 relative z-20">
        <MovieRow icon={<Flame className="w-5 h-5" />} title="Filmes em Alta na Semana" movies={trendingList} />
        <MovieRow icon={<Clapperboard className="w-5 h-5" />} title="Filmes Populares" movies={popular} />
        <MovieRow icon={<Star className="w-5 h-5" />} title="Filmes Mais Bem Avaliados" movies={topRated} />
        <MovieRow icon={<Ticket className="w-5 h-5" />} title="Filmes Em Cartaz" movies={nowPlaying} />
      </div>
    </div>
  );
}
