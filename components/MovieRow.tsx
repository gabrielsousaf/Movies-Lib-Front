"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface MovieRowProps {
  title: string;
  icon?: React.ReactNode;
  movies: Movie[];
  mediaType?: "movie" | "tv";
  disableContainer?: boolean;
  smallButtons?: boolean;
}

export function MovieRow({ title, icon, movies, mediaType, disableContainer, smallButtons }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scrola o equivalente à largura atual da tela, menos um card de margem
      const scrollAmount = direction === "left" ? -(clientWidth - 200) : clientWidth - 200;
      
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className={`relative group/row ${disableContainer ? 'py-2' : 'py-6 container mx-auto px-4'}`}>
      <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-zinc-100 mb-4">
        {icon && <span className="text-primary-500">{icon}</span>}
        {title}
      </h2>
      
      <div className="relative">
        {/* Seta Esquerda */}
        <button 
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/row:opacity-100 hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm rounded-r-lg ${disableContainer ? '' : '-ml-4'}`}
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className={`${smallButtons ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide scroll-smooth"
        >
          {movies.map((movie) => {
            const itemMediaType = movie.media_type || mediaType || "movie";
            
            return (
              <div key={movie.id} className="min-w-[160px] max-w-[160px] md:min-w-[200px] md:max-w-[200px] snap-start shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title || movie.name || "Sem título"}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                  releaseDate={movie.release_date || movie.first_air_date}
                  mediaType={itemMediaType as "movie" | "tv"}
                />
              </div>
            );
          })}
        </div>

        {/* Seta Direita */}
        <button 
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/row:opacity-100 hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm rounded-l-lg ${disableContainer ? '' : '-mr-4'}`}
          aria-label="Rolar para direita"
        >
          <ChevronRight className={`${smallButtons ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
        </button>
      </div>
    </section>
  );
}
