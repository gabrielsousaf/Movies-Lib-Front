import { ProfileView } from "./ProfileView";

export default function UserProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileView username={params.username} />
    </div>
  );
}
