"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Settings, Lock, Trash2, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");

  if (authLoading) return <div className="py-24 text-center">Carregando...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPassword !== confirmPassword) {
      setPassError("As novas senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPassLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const res = await fetch(`${apiUrl}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPassSuccess("Senha alterada com sucesso!");
        toast.success("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(data.message || "Erro ao alterar a senha.");
        toast.error(data.message || "Erro ao alterar a senha.");
      }
    } catch (err) {
      setPassError("Erro de conexão.");
      toast.error("Erro de conexão ao alterar a senha.");
    } finally {
      setPassLoading(false);
      setTimeout(() => setPassSuccess(""), 4000);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmPhrase.trim().toUpperCase() !== "DELETAR") {
      toast.error("Digite 'DELETAR' para prosseguir com a exclusão.");
      return;
    }

    setDeleteError("");
    setDeleteLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const res = await fetch(`${apiUrl}/users/me`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Sua conta foi excluída com sucesso.");
        setShowDeleteModal(false);
        logout();
        router.push("/");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Erro ao excluir a conta.");
        toast.error(data.message || "Erro ao excluir a conta.");
        setDeleteLoading(false);
      }
    } catch (err) {
      setDeleteError("Erro de conexão.");
      toast.error("Erro de conexão ao excluir conta.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-500" />
          Configurações da Conta
        </h1>
      </div>

      <div className="space-y-8">
        {/* Alterar Senha */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-zinc-400" />
            Alterar Senha
          </h2>

          {passSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6 text-sm">
              {passSuccess}
            </div>
          )}

          {passError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
              {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Senha Atual</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Nova Senha</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={passLoading}
              className="mt-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {passLoading ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </form>
        </div>

        {/* Excluir Conta */}
        <div className="bg-red-950/20 border border-red-900/50 p-6 md:p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5" />
            Zona de Perigo
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            A exclusão da sua conta apagará permanentemente todos os seus dados, incluindo avaliações, listas personalizadas e seguidores. Esta ação não pode ser desfeita.
          </p>

          {deleteError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
              {deleteError}
            </div>
          )}

          <button
            onClick={() => {
              setConfirmPhrase("");
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Minha Conta
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão de Conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-red-900/50 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Excluir conta definitivamente?
            </h3>

            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
              Esta ação é <span className="text-red-400 font-semibold">permanente e irreversível</span>. Todas as suas avaliações, listas, filmes salvos e conexões serão removidos do sistema.
            </p>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 mb-5">
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Para confirmar, digite <span className="text-red-400 font-bold uppercase">DELETAR</span> abaixo:
              </label>
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="DELETAR"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-red-500 text-white px-3 py-2 rounded-md outline-none text-sm font-mono tracking-wider"
                autoFocus
              />
            </div>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={confirmPhrase.trim().toUpperCase() !== "DELETAR" || deleteLoading}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-950 disabled:text-zinc-600 text-white text-sm font-bold transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-red-950/50"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
