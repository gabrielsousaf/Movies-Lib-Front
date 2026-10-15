import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoviesLib - Sua Biblioteca de Filmes e Séries",
    short_name: "MoviesLib",
    description: "Acompanhe filmes, séries, crie listas personalizadas e compartilhe suas resenhas.",
    start_url: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#E50914",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
