import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const revalidate = 0;

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Missing DATABASE_URL' }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS findings (
        id              BIGSERIAL PRIMARY KEY,
        repo_full_name  TEXT NOT NULL,
        file_path       TEXT NOT NULL,
        line_number     INTEGER NOT NULL,
        secret_type     TEXT NOT NULL,
        commit_sha      TEXT NOT NULL,
        committer_email TEXT NOT NULL,
        committer_name  TEXT NOT NULL,
        detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        notified_at     TIMESTAMPTZ,
        github_issue_url TEXT,
        email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE(repo_full_name, commit_sha, file_path, line_number)
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_findings_repo ON findings(repo_full_name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_findings_detected ON findings(detected_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_findings_notified ON findings(notified_at);`;

    return NextResponse.json({ success: true, message: 'Database tables created successfully!' });
  } catch (err: any) {
    console.error('Setup Error:', err);
    return NextResponse.json({ error: 'Failed to setup database', message: err?.message || String(err) }, { status: 500 });
  }
}
