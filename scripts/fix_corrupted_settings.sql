-- Fix corrupted encrypted values in platform_settings for disabled add-ons
-- These fields contain legacy encrypted values that cannot be decrypted with the current key
-- Since the add-ons are disabled, clearing these fields is safe

UPDATE platform_settings
SET
  s3_access_key = NULL,
  s3_secret_key = NULL,
  turnstile_secret_key = NULL
WHERE id = 1
  AND addon_s3_enabled = 0
  AND addon_turnstile_enabled = 0;
