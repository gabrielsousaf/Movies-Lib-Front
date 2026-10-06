"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;
  overview: string;
}

interface HeroBannerProps {
  movies: Movie[];
  mediaType?: "movie" | "tv";
}

export function HeroBanner({ movies, mediaType = "movie" }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Troca de filme a cada 10 segundos
  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length);
  };

  const movie = movies[currentIndex];
  const title = movie.title || movie.name || "Título Indisponível";
  const imageUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "https://via.placeholder.com/1920x1080?text=Sem+Imagem";

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] flex items-center group overflow-hidden bg-zinc-950">
      {/* Background Image com transição suave */}
      {movies.map((m, index) => {
        const bgUrl = m.backdrop_path
          ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
          : "https://via.placeholder.com/1920x1080?text=Sem+Imagem";
          
        return (
          <div 
            key={m.id} 
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={bgUrl}
              alt={m.title || m.name || "Filme"}
              fill
              priority={index === 0}
              className="object-cover"
            />
            {/* Gradient overlays to blend with the dark background */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        );
      })}

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-2xl transition-all duration-700 ease-in-out">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            {title}
          </h1>
          
          <p className="text-zinc-300 text-sm sm:text-base md:text-lg mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {movie.overview || "Nenhuma sinopse disponível para este título."}
          </p>

          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link 
              href={mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Play className="w-5 h-5 fill-black" />
              Assistir
            </Link>
            
            <Link 
              href={mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`}
              className="flex items-center gap-2 bg-zinc-500/50 backdrop-blur-md text-white px-6 py-3 rounded-md font-semibold hover:bg-zinc-500/70 transition-colors"
            >
              <Info className="w-5 h-5" />
              Mais Informações
            </Link>
          </div>
        </div>
      </div>

      {/* Seta Esquerda */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        aria-label="Filme anterior"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Seta Direita */}
      <button 
        onClick={handleNext}
        className="absolute right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        aria-label="Próximo filme"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Indicadores (Pontinhos) */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Ir para o filme ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
