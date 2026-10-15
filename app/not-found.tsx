import Link from "next/link";
import { Film, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-6 shadow-xl shadow-primary-500/10">
        <Film className="w-10 h-10 text-primary-500" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full mb-4">
        Erro 404 · Cena Cortada na Edição
      </span>

      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
        Página não encontrada
      </h1>

      <p className="text-zinc-400 max-w-md mx-auto text-sm md:text-base mb-8 leading-relaxed">
        Parece que o filme, série ou perfil que você está procurando saiu de cartaz ou não existe neste endereço.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm transition-colors shadow-lg shadow-primary-600/20"
        >
          <Home className="w-4 h-4" />
          Voltar ao Início
        </Link>

        <Link
          href="/movies/explore"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-semibold text-sm transition-colors"
        >
          <Compass className="w-4 h-4" />
          Explorar Catálogo
        </Link>
      </div>
    </div>
  );
}
