import { API_URL } from "@/lib/api";
import { ProfileView } from "./ProfileView";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const apiUrl = API_URL;
  try {
    const res = await fetch(`${apiUrl}/users/${username}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: `@${username} | MoviesLib` };
    const user = await res.json();
    const title = `${user.displayName || user.username} (@${user.username}) - Perfil | MoviesLib`;
    const description = user.bio || `Confira as listas, filmes favoritos e avaliações de @${user.username} no MoviesLib.`;
    const avatarUrl = user.avatarUrl?.startsWith("/") ? `${apiUrl}${user.avatarUrl}` : user.avatarUrl;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: avatarUrl ? [{ url: avatarUrl, alt: user.username }] : [],
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: avatarUrl ? [avatarUrl] : [],
      },
    };
  } catch {
    return { title: `@${username} | MoviesLib` };
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileView username={username} />
    </div>
  );
}

