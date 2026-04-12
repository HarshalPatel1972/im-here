import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const revalidate = 0;

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // 1. Total findings detected (all time)
    const totalFindingsRes = await client.query('SELECT COUNT(*) FROM findings');
    const totalFindings = parseInt(totalFindingsRes.rows[0].count, 10);

    // 2. Total notifications sent (all time)
    const totalNotifRes = await client.query(
      'SELECT COUNT(*) FROM findings WHERE email_sent = true OR github_issue_url IS NOT NULL'
    );
    const totalNotifications = parseInt(totalNotifRes.rows[0].count, 10);

    // 3. Findings in last 24h
    const findings24hRes = await client.query(
      "SELECT COUNT(*) FROM findings WHERE detected_at > NOW() - INTERVAL '24 hours'"
    );
    const findings24h = parseInt(findings24hRes.rows[0].count, 10);

    // 4. Notifications sent in last 24h
    const notif24hRes = await client.query(
      "SELECT COUNT(*) FROM findings WHERE notified_at > NOW() - INTERVAL '24 hours'"
    );
    const notifications24h = parseInt(notif24hRes.rows[0].count, 10);

    // 5. Secret types breakdown
    const breakdownRes = await client.query(`
      SELECT secret_type, COUNT(*) as count 
      FROM findings 
      GROUP BY secret_type 
      ORDER BY count DESC
    `);
    const secretTypes = breakdownRes.rows.map(row => ({
      type: row.secret_type,
      count: parseInt(row.count, 10)
    }));

    await client.end();

    return NextResponse.json({
      totalFindings,
      totalNotifications,
      findings24h,
      notifications24h,
      secretTypes
    });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
