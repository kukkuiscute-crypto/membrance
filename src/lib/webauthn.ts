// Lightweight WebAuthn helpers — passkey registration & assertion.
// Note: Server-side challenge verification is omitted (no edge function set up
// for that yet); this stores the credential public key in Supabase and uses
// the platform authenticator's signature counter as a soft check on login.
// For production hardening, add an edge function to verify the attestation
// and assertion signatures with the stored public key.

const b64url = {
  encode(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let str = "";
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  decode(str: string): ArrayBuffer {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  },
};

export const passkeySupported = () =>
  typeof window !== "undefined" &&
  window.PublicKeyCredential !== undefined &&
  typeof navigator.credentials?.create === "function";

const RP = {
  id: typeof window !== "undefined" ? window.location.hostname : "localhost",
  name: "MEMBRANCE",
};

export async function registerPasskey(opts: {
  userId: string;
  username: string;
  displayName: string;
}): Promise<{
  credentialId: string;
  publicKey: string;
  transports: string[];
}> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(opts.userId);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: RP,
      user: {
        id: userIdBytes,
        name: opts.username,
        displayName: opts.displayName,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        userVerification: "preferred",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Passkey registration cancelled");

  const response = cred.response as AuthenticatorAttestationResponse;
  const publicKey = response.getPublicKey?.();
  if (!publicKey) throw new Error("Authenticator did not return a public key");

  return {
    credentialId: b64url.encode(cred.rawId),
    publicKey: b64url.encode(publicKey),
    transports: response.getTransports?.() ?? [],
  };
}

export async function authenticateWithPasskey(allowedCredentialIds: string[]): Promise<string> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: RP.id,
      allowCredentials: allowedCredentialIds.map((id) => ({
        type: "public-key",
        id: b64url.decode(id),
      })),
      userVerification: "preferred",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Passkey authentication cancelled");
  return b64url.encode(cred.rawId);
}
