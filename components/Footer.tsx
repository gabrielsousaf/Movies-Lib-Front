import Link from "next/link";
import { Film, Heart, Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/90 text-zinc-400 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Coluna 1: Marca e Descrição */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-zinc-50 hover:text-primary-500 transition-colors"
            >
              <Film className="w-6 h-6 text-primary-500" />
              <span>MoviesLib</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Sua plataforma definitiva para descobrir, avaliar, acompanhar episódios, criar listas personalizadas e compartilhar sua paixão pelo cinema com a comunidade.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Pressione <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-zinc-300">Ctrl + K</kbd> a qualquer momento para busca rápida.</span>
            </div>
          </div>

          {/* Coluna 2: Explorar Catálogo */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Catálogo
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/movies" className="hover:text-primary-400 transition-colors">
                  Filmes em Destaque
                </Link>
              </li>
              <li>
                <Link href="/series" className="hover:text-primary-400 transition-colors">
                  Séries de TV
                </Link>
              </li>
              <li>
                <Link href="/movies/explore" className="hover:text-primary-400 transition-colors">
                  Explorar Filmes (Filtros)
                </Link>
              </li>
              <li>
                <Link href="/series/explore" className="hover:text-primary-400 transition-colors">
                  Explorar Séries (Filtros)
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Comunidade & Sua Conta */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Comunidade & Conta
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/feed" className="hover:text-primary-400 transition-colors">
                  Feed da Comunidade
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-primary-400 transition-colors">
                  Minha Biblioteca & Favoritos
                </Link>
              </li>
              <li>
                <Link href="/lists" className="hover:text-primary-400 transition-colors">
                  Minhas Listas
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-400 transition-colors">
                  Editar Perfil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {currentYear} <span className="text-zinc-300 font-semibold">MoviesLib</span>. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para cinéfilos · Dados fornecidos por{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-primary-400 underline underline-offset-2 transition-colors"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
