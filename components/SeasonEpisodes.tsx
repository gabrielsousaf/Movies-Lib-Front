"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Calendar, Clock, ImageIcon, PlayCircle } from "lucide-react";

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  vote_average: number;
  air_date: string;
  runtime: number;
}

interface SeasonEpisodesProps {
  seriesId: number;
  seasons: Season[];
}

export function SeasonEpisodes({ seriesId, seasons }: SeasonEpisodesProps) {
  // Ignorar temporada 0 (geralmente são os Extras/Especiais) se possível por padrão
  const defaultSeason = seasons.find((s) => s.season_number === 1)?.season_number || seasons[0]?.season_number || 1;
  
  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
        const response = await fetch(`${apiUrl}/tmdb/series/${seriesId}/season/${selectedSeason}`);
        if (response.ok) {
          const data = await response.json();
          setEpisodes(data.episodes || []);
        }
      } catch (error) {
        console.error("Erro ao buscar episódios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [seriesId, selectedSeason]);

  // Ordenar para mostrar os episódios mais bem avaliados também (se quiser destacar)
  // Mas normalmente exibe-se em ordem normal de lançamento
  // O usuário pediu: "listar os melhores episodios com as informacoes e um dropdwon"
  // Podemos ordenar por vote_average, ou simplesmente exibir a nota em destaque.
  // Vamos exibir na ordem de episódio, mas enfatizando a nota.

  if (!seasons || seasons.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-primary-500" />
          Episódios
        </h2>

        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-100 py-3 pl-4 pr-12 rounded-lg font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 hover:bg-zinc-800 transition-colors shadow-lg"
          >
            {seasons
              .filter((s) => s.episode_count > 0) // Esconde temporadas vazias
              .map((season) => (
              <option key={season.id} value={season.season_number} className="bg-zinc-900 text-white">
                {season.name} ({season.episode_count} episódios)
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            ▼
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-6">
          {episodes.map((episode) => (
            <div 
              key={episode.id} 
              className="group flex flex-col md:flex-row gap-6 bg-zinc-900/40 hover:bg-zinc-800/80 p-4 rounded-2xl border border-zinc-800/50 transition-all duration-300"
            >
              {/* Thumbnail do Episódio */}
              <div className="w-full md:w-64 aspect-video shrink-0 relative rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-zinc-700/50">
                {episode.still_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
                    alt={episode.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full opacity-50">
                    <ImageIcon className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                
                {/* Overlay do Episódio Number */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md text-sm font-bold text-white shadow-lg border border-white/10">
                  T{selectedSeason}:E{episode.episode_number}
                </div>
              </div>

              {/* Informações do Episódio */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-primary-400 transition-colors truncate">
                      {episode.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 font-medium">
                      {episode.air_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(episode.air_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {episode.runtime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {episode.runtime} min
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Nota / Avaliação */}
                  <div className="flex items-center gap-1.5 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
                    <Star className={`w-5 h-5 ${episode.vote_average >= 8 ? 'text-primary-500 fill-primary-500' : 'text-yellow-500 fill-yellow-500'}`} />
                    <span className="font-bold text-zinc-100 text-lg">
                      {episode.vote_average.toFixed(1)}
                    </span>
                    <span className="text-zinc-500 text-xs font-medium">/ 10</span>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 md:line-clamp-4 mt-2">
                  {episode.overview || "Nenhuma sinopse disponível para este episódio."}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-center py-12">Nenhum episódio encontrado para esta temporada.</p>
      )}
    </section>
  );
}
