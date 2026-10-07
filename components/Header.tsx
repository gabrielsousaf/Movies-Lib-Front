"use client";

import Link from "next/link";
import { Search, Film, User, LogOut, Settings, Bookmark, ChevronDown, List } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, logout } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
  const avatarSrc = user?.avatarUrl?.startsWith("/") ? `${apiUrl}${user.avatarUrl}` : user?.avatarUrl;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        
        {/* Esquerda: Logo e Navegação Principal */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-50 hover:text-primary-500 transition-colors">
            <Film className="w-6 h-6 text-primary-500" />
            <span className="hidden sm:inline">MoviesLib</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-zinc-50 transition-colors py-4">
              Início
            </Link>

            {/* Dropdown de Filmes */}
            <div className="relative group/movies py-4">
              <Link href="/movies" className="hover:text-zinc-50 transition-colors flex items-center gap-1 cursor-pointer">
                Filmes
                <ChevronDown className="w-4 h-4 opacity-50 transition-transform duration-200 group-hover/movies:rotate-180" />
              </Link>
              
              <div className="absolute left-0 top-[calc(100%-8px)] mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover/movies:opacity-100 group-hover/movies:visible transition-all duration-200">
                <div className="flex flex-col py-2">
                  <Link href="/movies/popular" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Populares</Link>
                  <Link href="/movies/trending" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Em Alta</Link>
                  <Link href="/movies/top-rated" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Mais Avaliados</Link>
                  <Link href="/movies/now-playing" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Em Cartaz</Link>
                </div>
              </div>
            </div>

            {/* Dropdown de Séries */}
            <div className="relative group/series py-4">
              <Link href="/series" className="hover:text-zinc-50 transition-colors flex items-center gap-1 cursor-pointer">
                Séries
                <ChevronDown className="w-4 h-4 opacity-50 transition-transform duration-200 group-hover/series:rotate-180" />
              </Link>
              
              <div className="absolute left-0 top-[calc(100%-8px)] mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover/series:opacity-100 group-hover/series:visible transition-all duration-200">
                <div className="flex flex-col py-2">
                  <Link href="/series/popular" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Populares</Link>
                  <Link href="/series/trending" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Em Alta</Link>
                  <Link href="/series/top-rated" className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">Mais Avaliadas</Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Direita: Busca e Menu do Usuário */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-[250px] relative hidden sm:block">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Ícone Lupa para Mobile (Aparece quando a barra de cima some) */}
          <button className="sm:hidden text-zinc-400 hover:text-zinc-50">
            <Search className="w-5 h-5" />
          </button>

          {/* Menu de Usuário */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-zinc-300" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu (Aparece no Hover) */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="flex flex-col py-2">
                  <div className="px-4 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-sm text-zinc-100 font-medium">Olá, {user.displayName || user.username}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  <Link href="/watchlist" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <Bookmark className="w-4 h-4" />
                    Minha Lista
                  </Link>
                  <Link href="/lists" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <List className="w-4 h-4" />
                    Minhas Listas
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                  <div className="h-px bg-zinc-800 my-1" />
                  <button onClick={() => logout()} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 w-full text-left">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
