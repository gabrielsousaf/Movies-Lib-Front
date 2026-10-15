import { Film } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-28 px-4">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-primary-500 animate-spin" />
        <Film className="w-6 h-6 text-primary-500 absolute" />
      </div>
      <p className="text-sm font-medium text-zinc-400 animate-pulse">
        Carregando catálogo...
      </p>
    </div>
  );
}
