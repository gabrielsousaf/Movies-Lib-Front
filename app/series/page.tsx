import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { Flame, Clapperboard, Star } from "lucide-react";

interface Series {
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
  results: Series[];
}

export default async function SeriesHubPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  async function fetchSeries(endpoint: string): Promise<Series[]> {
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

  const [trending, popular, topRated] = await Promise.all([
    fetchSeries("/tmdb/series/trending?timeWindow=week"),
    fetchSeries("/tmdb/series/popular"),
    fetchSeries("/tmdb/series/top-rated"),
  ]);

  const featuredSeries = trending.slice(0, 5);
  const trendingList = trending.slice(5);

  return (
    <div className="pb-12">
      {featuredSeries.length > 0 && <HeroBanner movies={featuredSeries} mediaType="tv" />}

      <div className="flex flex-col gap-2 -mt-16 md:-mt-32 relative z-20">
        <MovieRow icon={<Flame className="w-5 h-5" />} title="Séries em Alta na Semana" movies={trendingList} mediaType="tv" />
        <MovieRow icon={<Clapperboard className="w-5 h-5" />} title="Séries Populares" movies={popular} mediaType="tv" />
        <MovieRow icon={<Star className="w-5 h-5" />} title="Séries Mais Bem Avaliadas" movies={topRated} mediaType="tv" />
      </div>
    </div>
  );
}
