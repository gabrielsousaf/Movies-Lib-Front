"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Aceita apenas números

    const newCodeDigits = [...codeDigits];
    
    // Pega apenas o último caractere digitado (para lidar com o usuário digitando sem apagar)
    newCodeDigits[index] = value.slice(-1);
    setCodeDigits(newCodeDigits);

    // Auto-focus no próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: limpa e foca no anterior
    if (e.key === 'Backspace') {
      if (!codeDigits[index] && index > 0) {
        const prevInput = document.getElementById(`digit-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else {
        const newCodeDigits = [...codeDigits];
        newCodeDigits[index] = "";
        setCodeDigits(newCodeDigits);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newCodeDigits = [...codeDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newCodeDigits[i] = pastedData[i];
    }
    setCodeDigits(newCodeDigits);

    // Foca no último input preenchido
    const nextIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`digit-${nextIndex === 6 ? 5 : nextIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const finalCode = codeDigits.join("");

    if (finalCode.length !== 6) {
      setError("O código deve conter 6 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333";
      const response = await fetch(`${apiUrl}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Conta verificada com sucesso! Redirecionando...");
        // Auto login
        setTimeout(() => {
          login(data.accessToken, data.user);
          router.push("/");
        }, 1500);
      } else {
        setError(data.message || "Código inválido ou expirado.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <Film className="w-8 h-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
          <span className="text-2xl font-bold text-zinc-100 uppercase tracking-wider font-sans group-hover:text-white transition-colors">
            Movies Lib
          </span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Verifique seu E-mail</h1>
      <p className="text-zinc-400 mb-6 text-sm">
        Enviamos um código de 6 dígitos para o seu e-mail. Digite-o abaixo para ativar sua conta.
      </p>

      {error && (
        <div className="bg-primary-500/10 border border-primary-500/50 text-primary-500 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors opacity-70"
            readOnly={!!searchParams.get("email")}
          />
        </div>
        
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {codeDigits.map((digit, index) => (
            <input
              key={index}
              id={`digit-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-zinc-900/50 border border-zinc-700 text-white text-center text-2xl font-bold rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !!successMsg || codeDigits.some(d => d === "")}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? "Verificando..." : "Verificar e Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative">
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/ca6a7616-0acb-4bc5-be25-c4deef0419a7/c5af601a-6657-4531-8f82-22e629a3795e/BR-pt-20231211-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      
      <Suspense fallback={<div className="z-10 text-white">Carregando...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
