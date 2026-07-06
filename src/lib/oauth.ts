// Lightweight OAuth 2.0 authorization-code flow helpers for Google & GitHub.
// No external OAuth library — both providers expose plain REST token/userinfo
// endpoints, so a couple of fetch calls is enough and keeps this in sync with
// the project's existing custom-JWT session architecture (src/lib/auth.ts).

export type OAuthProvider = "google" | "github";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface OAuthProfile {
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

function redirectUri(provider: OAuthProvider) {
  return `${APP_URL}/api/auth/oauth/${provider}/callback`;
}

export function getAuthorizeUrl(provider: OAuthProvider, state: string): string {
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: redirectUri("google"),
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: redirectUri("github"),
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeGoogleCode(code: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri("google"),
    }),
  });
  if (!tokenRes.ok) throw new Error("Gagal menukar kode otorisasi Google");
  const tokenData = await tokenRes.json();

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileRes.ok) throw new Error("Gagal mengambil profil Google");
  const profile = await profileRes.json();

  if (!profile.email) throw new Error("Akun Google tidak memiliki email");

  return {
    providerId: profile.sub,
    email: profile.email,
    fullName: profile.name || profile.email.split("@")[0],
    avatarUrl: profile.picture || null,
    emailVerified: !!profile.email_verified,
  };
}

async function exchangeGithubCode(code: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || "",
      client_secret: process.env.GITHUB_CLIENT_SECRET || "",
      code,
      redirect_uri: redirectUri("github"),
    }),
  });
  if (!tokenRes.ok) throw new Error("Gagal menukar kode otorisasi GitHub");
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("GitHub tidak mengembalikan access token");

  const headers = {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github+json",
  };

  const profileRes = await fetch("https://api.github.com/user", { headers });
  if (!profileRes.ok) throw new Error("Gagal mengambil profil GitHub");
  const profile = await profileRes.json();

  let email: string | null = profile.email;
  let emailVerified = false;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails: { email: string; primary: boolean; verified: boolean }[] = await emailsRes.json();
      const primary = emails.find((e) => e.primary) || emails[0];
      email = primary?.email || null;
      emailVerified = !!primary?.verified;
    }
  }
  if (!email) throw new Error("Akun GitHub tidak memiliki email publik. Tambahkan email di pengaturan GitHub.");

  return {
    providerId: String(profile.id),
    email,
    fullName: profile.name || profile.login,
    avatarUrl: profile.avatar_url || null,
    emailVerified,
  };
}

export async function exchangeCodeForProfile(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
  return provider === "google" ? exchangeGoogleCode(code) : exchangeGithubCode(code);
}
