import { FeedView } from "@/components/FeedView";

export const metadata = {
  title: "Meu Feed - MoviesLib",
  description: "Feed de atividades dos usuários que você segue.",
};

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-50 mb-8">Meu Feed</h1>
      <FeedView />
    </div>
  );
}
