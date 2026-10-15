import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { Flame, Clapperboard, Star, Ticket } from "lucide-react";

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

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Função auxiliar para buscar os filmes
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

  // Busca as 4 listas em paralelo para maior performance
  const [trending, popular, topRated, nowPlaying] = await Promise.all([
    fetchMovies("/tmdb/movies/trending?timeWindow=day"),
    fetchMovies("/tmdb/movies/popular"),
    fetchMovies("/tmdb/movies/top-rated"),
    fetchMovies("/tmdb/movies/now-playing"),
  ]);

  // Os 5 primeiros filmes dos "Em Alta" serão os destaques no topo
  const featuredMovies = trending.slice(0, 5);

  // Remove os filmes em destaque da lista de trending para não ficarem repetidos logo abaixo
  const trendingList = trending.slice(5);

  return (
    <div className="pb-12">
      {/* Banner de Destaque */}
      {featuredMovies.length > 0 && <HeroBanner movies={featuredMovies} />}

      {/* Listas Horizontais de Filmes */}
      <div className="flex flex-col gap-2 -mt-16 md:-mt-32 relative z-20">
        <MovieRow icon={<Flame className="w-5 h-5" />} title="Em Alta Hoje" movies={trendingList} />
        <MovieRow icon={<Clapperboard className="w-5 h-5" />} title="Populares" movies={popular} />
        <MovieRow icon={<Star className="w-5 h-5" />} title="Mais Bem Avaliados" movies={topRated} />
        <MovieRow icon={<Ticket className="w-5 h-5" />} title="Em Cartaz nos Cinemas" movies={nowPlaying} />
      </div>
    </div>
  );
}
