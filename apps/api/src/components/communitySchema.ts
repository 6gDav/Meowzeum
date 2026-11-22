import type { Database } from 'bun:sqlite'

export function initializeCommunitySchema(database: Database) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cat_posts (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cat_posts_created_at
      ON cat_posts (created_at DESC, id DESC);

    CREATE TABLE IF NOT EXISTS cat_post_likes (
      post_id TEXT NOT NULL REFERENCES cat_posts(id) ON DELETE CASCADE,
      visitor_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, visitor_id)
    );
  `)
}
