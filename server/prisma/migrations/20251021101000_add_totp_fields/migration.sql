-- Add TOTP (2FA) fields to users table
ALTER TABLE users ADD COLUMN totpEnabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN totpSecret TEXT;


