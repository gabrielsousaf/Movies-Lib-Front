import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { WatchlistButton } from "./WatchlistButton";
import { AddToListModal } from "./AddToListModal";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType?: "movie" | "tv";
}

export function MovieCard({ id, title, posterPath, voteAverage, releaseDate, mediaType = "movie" }: MovieCardProps) {
  // O TMDB usa esse base_url para imagens
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://via.placeholder.com/500x750?text=Sem+Imagem";

  // Formatar ano
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Formatar nota (ex: 8.5)
  const rating = voteAverage ? voteAverage.toFixed(1) : "N/R";

  const href = mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;

  return (
    <Link href={href} className="group flex flex-col gap-3">
      {/* Container da Imagem */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-all group-hover:border-zinc-700">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge de Nota sobre a imagem */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-xs font-semibold text-zinc-100 border border-white/10">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span>{rating}</span>
        </div>

        {/* Botão de Watchlist e Adicionar à Lista */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WatchlistButton 
            tmdbId={id} 
            mediaType={mediaType} 
            title={title} 
            posterPath={posterPath} 
            voteAverage={voteAverage} 
            releaseDate={releaseDate} 
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:scale-110"
          />
          <AddToListModal
            tmdbId={id}
            mediaType={mediaType === "tv" ? "TV" : "MOVIE"}
            title={title}
            posterPath={posterPath || null}
            backdropPath={null}
            voteAverage={voteAverage}
            releaseDate={releaseDate || null}
            buttonClassName="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:scale-110 flex items-center justify-center text-zinc-100 hover:text-primary-500 focus:outline-none"
            iconOnly={true}
          />
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-zinc-100 truncate group-hover:text-primary-500 transition-colors">
          {title}
        </h3>
        <span className="text-xs text-zinc-500">{year}</span>
      </div>
    </Link>
  );
}
