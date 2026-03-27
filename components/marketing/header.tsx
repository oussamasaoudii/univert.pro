import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { HeaderClient } from "@/components/marketing/header-client";
import { listCountries } from "@/lib/countries/db";

export async function Header() {
  const [user, countries] = await Promise.all([
    getAuthenticatedRequestUser(),
    listCountries().catch(() => []),
  ]);

  const currentUser = user
      ? {
        id: user.id,
        email: user.email,
        role: user.role,
        sessionType: user.sessionType,
      }
    : null;

  return <HeaderClient currentUser={currentUser} countries={countries} />;
}
