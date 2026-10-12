-- Owner of a snippet. Nullable: snippets created before sign-in was enforced
-- have no owner and can no longer be edited or deleted through the API.
ALTER TABLE snippets
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets (user_id);
