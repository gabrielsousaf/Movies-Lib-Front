"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ListPlus, X, Check, Plus } from "lucide-react";
import Link from "next/link";

interface AddToListModalProps {
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
  buttonClassName?: string;
  iconOnly?: boolean;
}

export function AddToListModal({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  voteAverage,
  releaseDate,
  buttonClassName = "flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-6 py-3 rounded-xl font-semibold transition-colors",
  iconOnly = false
}: AddToListModalProps) {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    if (isOpen && token) {
      fetchLists();
    }
  }, [isOpen, token]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/lists/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId: string) => {
    if (!token) return;
    try {
      const payload = {
        tmdbId,
        mediaType,
        title,
        posterPath,
        backdropPath,
        voteAverage,
        releaseDate
      };

      const res = await fetch(`${apiUrl}/lists/${listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Adicionado com sucesso!");
        setIsOpen(false);
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao adicionar à lista.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  if (!user) return null; // Não mostra botão se não estiver logado

  return (
    <>
      <button onClick={handleOpen} className={buttonClassName}>
        <ListPlus className="w-5 h-5" />
        {!iconOnly && <span className="hidden sm:inline">Adicionar à Lista</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-primary-500" />
                Salvar em...
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-zinc-500">Carregando listas...</div>
              ) : lists.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <p className="text-zinc-400 text-sm mb-4">Você ainda não tem listas personalizadas.</p>
                  <Link href="/lists" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
                    <Plus className="w-4 h-4" /> Criar nova lista
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1">
                  {lists.map((list) => (
                    <li key={list.id}>
                      <button
                        onClick={() => handleAddToList(list.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 text-left transition-colors text-zinc-300 hover:text-white"
                      >
                        <span className="font-medium truncate pr-4">{list.title}</span>
                        <Plus className="w-4 h-4 opacity-50 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lists.length > 0 && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center">
                <Link href="/lists" className="text-sm text-primary-500 hover:text-primary-400 font-medium" onClick={() => setIsOpen(false)}>
                  Gerenciar minhas listas
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
