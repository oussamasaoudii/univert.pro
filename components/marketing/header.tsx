import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { HeaderClient } from "@/components/marketing/header-client";

export async function Header() {
  const user = await getAuthenticatedRequestUser();

  const currentUser = user
      ? {
        id: user.id,
        email: user.email,
        role: user.role,
        sessionType: user.sessionType,
      }
    : null;

  return <HeaderClient currentUser={currentUser} />;
}
