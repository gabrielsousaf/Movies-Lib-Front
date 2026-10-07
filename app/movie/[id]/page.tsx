import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Play, ImageIcon, Layers } from "lucide-react";
import { MovieRow } from "@/components/MovieRow";
import { ImageGallery } from "@/components/ImageGallery";
import { WatchlistButton } from "@/components/WatchlistButton";
import { AddToListModal } from "@/components/AddToListModal";
import { ReviewSection } from "@/components/ReviewSection";
import { notFound } from "next/navigation";

// Definimos uma interface básica do retorno para não poluir muito o código
interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  recommendations?: {
    results: any[];
  };
  images?: {
    backdrops: {
      file_path: string;
    }[];
  };
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  "watch/providers"?: {
    results: {
      BR?: {
        link: string;
        flatrate?: { logo_path: string; provider_name: string }[];
        buy?: { logo_path: string; provider_name: string }[];
        rent?: { logo_path: string; provider_name: string }[];
      };
    };
  };
}

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const movieId = resolvedParams.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  let movie: MovieDetails | null = null;

  try {
    const response = await fetch(`${apiUrl}/tmdb/movies/${movieId}`, {
      next: { revalidate: 0 },
    });

    if (response.ok) {
      movie = await response.json();
    } else if (response.status === 404) {
      return notFound();
    }
  } catch (error) {
    console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500">Filme não encontrado ou erro no servidor.</p>
      </div>
    );
  }

  // Buscar detalhes da coleção (franquia) se existir
  let collection: any = null;
  if (movie.belongs_to_collection) {
    try {
      const collRes = await fetch(`${apiUrl}/tmdb/collections/${movie.belongs_to_collection.id}`, {
        next: { revalidate: 0 },
      });
      if (collRes.ok) {
        collection = await collRes.json();
      }
    } catch (e) {
      console.error(`Erro ao buscar coleção ${movie.belongs_to_collection.id}:`, e);
    }
  }

  // Identificar o ano de lançamento
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : "";

  // Formatar o tempo de duração (ex: 130 -> 2h 10m)
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const runtimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Pegar os 10 atores principais
  const cast = movie.credits?.cast?.slice(0, 10) || [];

  // Encontrar o trailer oficial no YouTube
  const trailer = movie.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );

  return (
    <div className="pb-12">
      {/* HEADER / BACKDROP SECTION */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex items-end pb-12">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : "https://via.placeholder.com/1920x1080?text=Sem+Imagem"
            }
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-30 md:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end">
          {/* Poster */}
          <div className="hidden md:block w-64 shrink-0 rounded-lg overflow-hidden shadow-2xl ring-1 ring-zinc-800">
            {movie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={256}
                height={384}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-64 h-96 bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-500">Sem Pôster</span>
              </div>
            )}
          </div>

          {/* Info Básica */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            
            {movie.tagline && (
              <p className="text-xl text-zinc-400 italic mb-4">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base text-zinc-300 font-medium mb-6">
              <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
              
              {releaseYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>{releaseYear}</span>
                </div>
              )}
              
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span>{runtimeFormatted}</span>
                </div>
              )}

              {/* Watchlist Button na página de detalhes */}
              <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-4 sm:border-l sm:border-zinc-700 sm:pl-4 mt-4 sm:mt-0">
                <div className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl px-4 py-2 transition-colors">
                  <span className="text-zinc-300 text-sm font-medium">Favoritar:</span>
                  <WatchlistButton 
                    tmdbId={movie.id}
                    mediaType="movie"
                    title={movie.title}
                    posterPath={movie.poster_path}
                    backdropPath={movie.backdrop_path}
                    voteAverage={movie.vote_average}
                    releaseDate={movie.release_date}
                    className="w-8 h-8 rounded-full hover:bg-zinc-700 flex items-center justify-center"
                  />
                </div>
                <AddToListModal
                  tmdbId={movie.id}
                  mediaType="MOVIE"
                  title={movie.title}
                  posterPath={movie.poster_path}
                  backdropPath={movie.backdrop_path}
                  voteAverage={movie.vote_average}
                  releaseDate={movie.release_date}
                  buttonClassName="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                />
              </div>
              
              <div className="flex gap-2 items-center">
                {movie.genres.slice(0, 3).map((genre) => (
                  <span key={genre.id} className="px-2.5 py-0.5 border border-zinc-700 rounded-full text-xs">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="max-w-3xl hidden md:block mb-8">
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Sinopse</h3>
              <p className="text-zinc-400 leading-relaxed">
                {movie.overview || "Nenhuma sinopse disponível."}
              </p>
            </div>

            {/* ONDE ASSISTIR */}
            {movie["watch/providers"]?.results?.BR && (
              <div className="hidden md:block">
                <h3 className="text-lg font-semibold text-zinc-100 mb-3">Onde Assistir</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {movie["watch/providers"].results.BR.flatrate?.map((provider) => (
                    <div key={provider.provider_name} className="flex flex-col items-center gap-1">
                      <Image
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={40}
                        height={40}
                        className="rounded-xl shadow-lg"
                        title={provider.provider_name}
                      />
                    </div>
                  ))}
                  {movie["watch/providers"].results.BR.rent?.map((provider) => (
                    <div key={`rent-${provider.provider_name}`} className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                      <Image
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={`Alugar no ${provider.provider_name}`}
                        width={40}
                        height={40}
                        className="rounded-xl shadow-lg border border-zinc-700"
                        title={`Alugar: ${provider.provider_name}`}
                      />
                    </div>
                  ))}
                  <a 
                    href={movie["watch/providers"].results.BR.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-500 hover:text-primary-400 underline ml-2"
                  >
                    Ver mais no TMDB
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERVIEW MOBILE (Fica embaixo do header em telas pequenas) */}
      <div className="md:hidden container mx-auto px-4 mt-8 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">Sinopse</h3>
          <p className="text-zinc-400 leading-relaxed text-sm">
            {movie.overview || "Nenhuma sinopse disponível."}
          </p>
        </div>

        {/* ONDE ASSISTIR MOBILE */}
        {movie["watch/providers"]?.results?.BR && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Onde Assistir</h3>
            <div className="flex flex-wrap gap-4 items-center">
              {movie["watch/providers"].results.BR.flatrate?.map((provider) => (
                <div key={provider.provider_name} className="flex flex-col items-center gap-1">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    width={40}
                    height={40}
                    className="rounded-xl shadow-lg"
                    title={provider.provider_name}
                  />
                </div>
              ))}
              {movie["watch/providers"].results.BR.rent?.map((provider) => (
                <div key={`rent-${provider.provider_name}`} className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={`Alugar no ${provider.provider_name}`}
                    width={40}
                    height={40}
                    className="rounded-xl shadow-lg border border-zinc-700"
                    title={`Alugar: ${provider.provider_name}`}
                  />
                </div>
              ))}
              <a 
                href={movie["watch/providers"].results.BR.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-500 hover:text-primary-400 underline ml-2"
              >
                Ver mais no TMDB
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* COLUNA ESQUERDA: Trailer e Recomendações */}
        <div className="lg:col-span-2 min-w-0 space-y-12">
          {/* TRAILER SECTION */}
          {trailer && (
            <section>
              <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                <Play className="w-6 h-6 text-primary-500" />
                Trailer Oficial
              </h2>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-zinc-800">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                  title={trailer.name}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}

          {/* GALERIA DE IMAGENS SECTION */}
          {movie.images?.backdrops && movie.images.backdrops.length > 0 && (
            <div>
              <ImageGallery images={movie.images.backdrops} />
            </div>
          )}

          {/* COLEÇÃO (FRANQUIA/TRILOGIA) SECTION */}
          {collection && collection.parts && collection.parts.length > 0 && (
            <div>
              <MovieRow 
                title={collection.name} 
                movies={collection.parts} 
                icon={<Layers className="w-5 h-5" />} 
                disableContainer={true}
                smallButtons={true}
              />
            </div>
          )}

          {/* AVALIAÇÕES SECTION */}
          <ReviewSection 
            tmdbId={movie.id} 
            mediaType="MOVIE" 
            title={movie.title} 
            posterPath={movie.poster_path} 
          />

          {/* RECOMENDAÇÕES SECTION */}
          {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
            <div>
              <MovieRow 
                title="Filmes Recomendados" 
                movies={movie.recommendations.results} 
                disableContainer={true}
                smallButtons={true}
              />
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Elenco */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Elenco Principal</h2>
          
          <div className="flex flex-col gap-4">
            {cast.length > 0 ? (
              cast.map((actor) => (
                <Link key={actor.id} href={`/person/${actor.id}`} className="group flex items-center gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 hover:bg-zinc-800 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden bg-zinc-800">
                    {actor.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-xs">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200 text-sm group-hover:text-primary-500 transition-colors">{actor.name}</p>
                    <p className="text-zinc-500 text-xs">{actor.character}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-500">Elenco não disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

