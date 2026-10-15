// Centralizador único da URL da API.
// Em produção (Vercel), configure a variável de ambiente NEXT_PUBLIC_API_URL,
// ou altere a URL diretamente abaixo em um único lugar.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  