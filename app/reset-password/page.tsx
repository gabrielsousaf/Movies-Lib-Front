"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film, ArrowLeft, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenFromUrl = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("O token de recuperação é obrigatório.");
      toast.error("Token de recuperação ausente.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As novas senhas não coincidem.");
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      toast.error("Senha muito curta (mínimo 6 caracteres).");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Sua senha foi redefinida com sucesso!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || "Erro ao redefinir a senha. O token pode ter expirado.");
        toast.error(data.message || "Erro ao redefinir senha.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
      toast.error("Erro de conexão ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
      <div className="flex items-center justify-between mb-6">
        <Link href="/login" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Login
        </Link>
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-primary-500" />
          <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider">MoviesLib</span>
        </div>
      </div>

      {!success ? (
        <>
          <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 border border-primary-500/20">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Criar Nova Senha</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Digite sua nova senha abaixo para restaurar o acesso à sua conta.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Token de Recuperação
                </label>
                <input
                  type="text"
                  placeholder="Cole aqui o token recebido"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Nova Senha (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Confirmar Nova Senha
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm cursor-pointer mt-2"
            >
              {loading ? "Redefinindo..." : "Salvar Nova Senha"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Senha Alterada!</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
          </p>

          <Link
            href="/login"
            className="w-full inline-block bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer"
          >
            Ir para o Login Agora
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative">
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://assets.nflxext.com/ffe/siteui/vlv3/ca6a7616-0acb-4bc5-be25-c4deef0419a7/c5af601a-6657-4531-8f82-22e629a3795e/BR-pt-20231211-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

      <Suspense fallback={<div className="text-center text-zinc-400 py-12 relative z-10">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
