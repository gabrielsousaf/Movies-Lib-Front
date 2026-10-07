"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { List, Plus, Trash2, Edit2, Lock, Globe } from "lucide-react";

interface CustomList {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
}

export default function ListsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Criação
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.push("/login");
      return;
    }
    fetchLists();
  }, [user, token, authLoading]);

  const fetchLists = async () => {
    try {
      const res = await fetch(`${apiUrl}/lists/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, isPublic })
      });

      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setIsPublic(true);
        fetchLists();
      } else {
        alert("Erro ao criar lista.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) return;
    try {
      const res = await fetch(`${apiUrl}/lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchLists();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <List className="w-8 h-8 text-primary-500" />
            Minhas Listas
          </h1>
          <p className="text-zinc-400 mt-2">Crie listas personalizadas para organizar seus filmes e séries.</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Lista
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <List className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">Nenhuma lista criada</h2>
          <p className="text-zinc-500 max-w-md mx-auto">Você ainda não criou nenhuma lista personalizada. Clique no botão "Nova Lista" acima para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <div key={list.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/list/${list.id}`} className="text-xl font-bold text-zinc-100 hover:text-primary-400 transition-colors line-clamp-1">
                  {list.title}
                </Link>
                <button 
                  onClick={() => handleDelete(list.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">
                {list.description || "Sem descrição."}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  {list.isPublic ? (
                    <><Globe className="w-3.5 h-3.5" /> Público</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" /> Privado</>
                  )}
                </div>
                <Link href={`/list/${list.id}`} className="text-sm font-medium text-primary-500 hover:text-primary-400">
                  Ver lista
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Lista */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Criar Nova Lista</h2>
            </div>
            <form onSubmit={handleCreateList} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Título</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Filmes de Terror para o Halloween"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Descrição (opcional)</label>
                <textarea
                  maxLength={300}
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Uma breve descrição sobre a lista..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <input
                  type="checkbox"
                  id="listPublic"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary-500 rounded bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="listPublic" className="text-sm text-zinc-300 cursor-pointer select-none">
                  <strong className="block text-zinc-200">Lista Pública</strong>
                  <span className="text-zinc-500 text-xs">Permite que outros usuários vejam sua lista.</span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Criando..." : "Criar Lista"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
