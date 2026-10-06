import Image from "next/image";
import { MovieRow } from "@/components/MovieRow";
import { notFound } from "next/navigation";
import { User, Calendar, MapPin } from "lucide-react";

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  combined_credits?: {
    cast: any[];
    crew: any[];
  };
  images?: {
    profiles: {
      file_path: string;
    }[];
  };
}

export default async function PersonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const personId = resolvedParams.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  let person: PersonDetails | null = null;

  try {
    const response = await fetch(`${apiUrl}/tmdb/person/${personId}`, {
      next: { revalidate: 0 },
    });

    if (response.ok) {
      person = await response.json();
    } else if (response.status === 404) {
      return notFound();
    }
  } catch (error) {
    console.error(`Erro ao buscar detalhes da pessoa ${personId}:`, error);
  }

  if (!person) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500">Pessoa não encontrada ou erro no servidor.</p>
      </div>
    );
  }

  // Filtrar trabalhos relevantes (onde tem poster e não são talk shows curtos)
  const castCredits = person.combined_credits?.cast
    ?.filter((item) => item.poster_path && item.vote_average > 0)
    .sort((a, b) => b.popularity - a.popularity) // Ordernar pelos mais populares
    || [];

  // Evitar duplicatas em trabalhos
  const uniqueCreditsMap = new Map();
  castCredits.forEach((item) => {
    if (!uniqueCreditsMap.has(item.id)) {
      uniqueCreditsMap.set(item.id, item);
    }
  });
  const uniqueCredits = Array.from(uniqueCreditsMap.values());

  const age = person.birthday
    ? Math.floor((new Date().getTime() - new Date(person.birthday).getTime()) / 3.15576e+10)
    : null;

  return (
    <div className="container mx-auto px-4 py-12 mt-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* LADO ESQUERDO: FOTO E INFORMAÇÕES PESSOAIS */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 space-y-6">
          <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                alt={person.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <User className="w-24 h-24 text-zinc-700" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100">Informações Pessoais</h2>
            
            <div>
              <p className="text-zinc-400 text-sm font-semibold">Conhecido(a) por</p>
              <p className="text-zinc-200">{person.known_for_department === "Acting" ? "Atuação" : person.known_for_department}</p>
            </div>
            
            {person.birthday && (
              <div>
                <p className="text-zinc-400 text-sm font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Nascimento
                </p>
                <p className="text-zinc-200">
                  {new Date(person.birthday).toLocaleDateString("pt-BR")} 
                  {age && !person.deathday && ` (${age} anos)`}
                </p>
              </div>
            )}

            {person.deathday && (
              <div>
                <p className="text-zinc-400 text-sm font-semibold">Falecimento</p>
                <p className="text-zinc-200">{new Date(person.deathday).toLocaleDateString("pt-BR")}</p>
              </div>
            )}

            {person.place_of_birth && (
              <div>
                <p className="text-zinc-400 text-sm font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Local de Nascimento
                </p>
                <p className="text-zinc-200">{person.place_of_birth}</p>
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: BIOGRAFIA E TRABALHOS */}
        <div className="flex-1 min-w-0 space-y-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-6">{person.name}</h1>
            
            {person.biography ? (
              <div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">Biografia</h3>
                <div className="text-zinc-400 leading-relaxed whitespace-pre-line space-y-4">
                  {person.biography}
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 italic">Não há biografia disponível para esta pessoa.</p>
            )}
          </div>

          {uniqueCredits.length > 0 && (
            <div>
              {/* Usamos o MovieRow reaproveitando o layout, passando os créditos */}
              <MovieRow 
                title="Conhecido(a) por" 
                movies={uniqueCredits.slice(0, 20)} // Top 20 trabalhos
                disableContainer={true}
                smallButtons={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
