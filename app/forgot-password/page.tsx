"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, ArrowLeft, Mail, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        toast.success("Instruções de redefinição preparadas com sucesso!");
      } else {
        setError(data.message || "Erro ao solicitar redefinição de senha.");
        toast.error(data.message || "Erro ao solicitar redefinição.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
      toast.error("Erro de conexão ao solicitar redefinição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative">
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/ca6a7616-0acb-4bc5-be25-c4deef0419a7/c5af601a-6657-4531-8f82-22e629a3795e/BR-pt-20231211-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

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
              <KeyRound className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Informe o endereço de e-mail associado à sua conta para receber as instruções e o link de redefinição de senha.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Processando..." : "Enviar Instruções"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Instruções Prontas!</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Se o e-mail <span className="text-zinc-200 font-semibold">{email}</span> estiver cadastrado, o token de segurança foi emitido com validade de 1 hora.
            </p>

            {resetToken && (
              <div className="mb-6">
                <Link
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-primary-600/20 cursor-pointer"
                >
                  Redefinir Minha Senha Agora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Voltar para a tela de login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
