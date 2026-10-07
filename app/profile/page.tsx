"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User, Settings, Camera, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function ProfilePage() {
  const { user, token, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Carrega os dados iniciais do usuário
  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    setDisplayName(user.displayName || user.username);
    setBio(user.bio || "");
    // Se o avatar for uma rota relativa da nossa API, colocamos a URL base completa
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
    const currentAvatar = user.avatarUrl?.startsWith("/") 
      ? `${apiUrl}${user.avatarUrl}` 
      : (user.avatarUrl || "");
      
    setAvatarUrl(currentAvatar);
    setIsPublic(user.isPublic ?? true);
  }, [user, token, authLoading, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Foto de perfil atualizada!");
        const newAvatarUrl = data.avatarUrl?.startsWith("/") ? `${apiUrl}${data.avatarUrl}` : data.avatarUrl;
        setAvatarUrl(newAvatarUrl);
        updateUser({ avatarUrl: data.avatarUrl });
      } else {
        setErrorMsg(data.message || "Erro ao enviar a foto.");
      }
    } catch (error) {
      setErrorMsg("Erro de conexão ao enviar a foto.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const response = await fetch(`${apiUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Perfil atualizado com sucesso!");
        // Atualiza o contexto global e o localStorage
        updateUser({ displayName, bio, avatarUrl, isPublic });
      } else {
        const error = Array.isArray(data.message) ? data.message[0] : data.message;
        setErrorMsg(error || "Erro ao atualizar o perfil.");
      }
    } catch (error) {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-500" />
          Configurações do Perfil
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo - Foto de Perfil */}
        <div className="md:col-span-1 flex flex-col items-center">
          <label className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-900 group shadow-xl cursor-pointer">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={user.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                <User className="w-20 h-20" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
              <span className="absolute bottom-6 text-xs text-white font-medium">Trocar Foto</span>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={loading}
            />
          </label>
          
          <h2 className="mt-4 text-xl font-bold text-white">{user.username}</h2>
          <p className="text-zinc-500">{user.email}</p>
          
          <div className="mt-4 inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
            Membro desde {new Date(user.createdAt || Date.now()).getFullYear()}
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-lg">
          
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="Seu nome público"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Sua Biografia
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Conte um pouco sobre seus gostos cinematográficos..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 accent-primary-500 rounded bg-zinc-800 border-zinc-700"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-zinc-300 select-none cursor-pointer">
                Perfil Público
                <p className="text-xs text-zinc-500 font-normal mt-0.5">Permite que outras pessoas vejam seus favoritos e listas.</p>
              </label>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
