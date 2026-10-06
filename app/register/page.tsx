"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redireciona pro login ou faz login automático
        router.push("/login?registered=true");
      } else {
        // Tratar mensagens de erro do backend (array ou string)
        const errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        setError(errorMessage || "Erro ao fazer cadastro.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
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
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <Film className="w-8 h-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
            <span className="text-2xl font-bold text-zinc-100 uppercase tracking-wider font-sans group-hover:text-white transition-colors">
              Movies Lib
            </span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Cadastrar</h1>

        {error && (
          <div className="bg-primary-500/10 border border-primary-500/50 text-primary-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Nome de usuário (ex: seunome123)"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Senha"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        <div className="mt-6 text-zinc-400 text-sm">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-white hover:underline">
            Entre aqui.
          </Link>
        </div>
      </div>
    </div>
  );
}
