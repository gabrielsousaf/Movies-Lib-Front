import { ProfileView } from "./ProfileView";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileView username={username} />
    </div>
  );
}
