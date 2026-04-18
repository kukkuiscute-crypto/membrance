-- Multi-account Google hub
CREATE TABLE public.google_account_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  google_sub text NOT NULL,
  google_email text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, google_sub)
);

CREATE INDEX idx_gal_google_sub ON public.google_account_links(google_sub);
CREATE INDEX idx_gal_google_email ON public.google_account_links(google_email);

ALTER TABLE public.google_account_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view links by google identity"
  ON public.google_account_links FOR SELECT
  USING (true);

CREATE POLICY "Users link their own accounts"
  ON public.google_account_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own links"
  ON public.google_account_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own links"
  ON public.google_account_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Passkey (WebAuthn) credentials
CREATE TABLE public.passkey_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  device_label text,
  transports text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX idx_pk_user ON public.passkey_credentials(user_id);

ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own passkeys"
  ON public.passkey_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users register own passkeys"
  ON public.passkey_credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own passkeys"
  ON public.passkey_credentials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own passkeys"
  ON public.passkey_credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);