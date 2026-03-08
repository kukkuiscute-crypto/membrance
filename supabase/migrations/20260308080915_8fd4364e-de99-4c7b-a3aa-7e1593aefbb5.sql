
-- 1. Create a secure increment_points function that validates amounts
CREATE OR REPLACE FUNCTION public.increment_points(amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF amount < 1 OR amount > 50 THEN
    RAISE EXCEPTION 'Invalid points amount: must be between 1 and 50';
  END IF;

  UPDATE public.profiles
  SET
    points = points + amount,
    monthly_points = monthly_points + amount,
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- 2. Add length constraints on community content
ALTER TABLE community_messages
  ADD CONSTRAINT msg_content_length CHECK (char_length(content) <= 2000);

ALTER TABLE community_posts
  ADD CONSTRAINT post_content_length CHECK (char_length(content) <= 5000);

ALTER TABLE communities
  ADD CONSTRAINT community_name_length CHECK (char_length(name) <= 100);

ALTER TABLE communities
  ADD CONSTRAINT community_description_length CHECK (char_length(description) <= 1000);
