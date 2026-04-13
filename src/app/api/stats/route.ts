import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const revalidate = 0;

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "DATABASE_URL environment variable is missing on Vercel.",
        },
        { status: 500 },
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. Total findings detected (all time)
    const totalFindingsRes = await sql`SELECT COUNT(*) FROM findings`;
    const totalFindings = parseInt(totalFindingsRes[0].count, 10);

    // 2. Total notifications sent (all time)
    const totalNotifRes =
      await sql`SELECT COUNT(*) FROM findings WHERE email_sent = true OR github_issue_url IS NOT NULL`;
    const totalNotifications = parseInt(totalNotifRes[0].count, 10);

    // 3. Findings in last 24h
    const findings24hRes =
      await sql`SELECT COUNT(*) FROM findings WHERE detected_at > NOW() - INTERVAL '24 hours'`;
    const findings24h = parseInt(findings24hRes[0].count, 10);

    // 4. Notifications sent in last 24h
    const notif24hRes =
      await sql`SELECT COUNT(*) FROM findings WHERE notified_at > NOW() - INTERVAL '24 hours'`;
    const notifications24h = parseInt(notif24hRes[0].count, 10);

    // 5. Secret types breakdown
    const breakdownRes = await sql`
      SELECT secret_type, COUNT(*) as count 
      FROM findings 
      GROUP BY secret_type 
      ORDER BY count DESC
    `;
    const secretTypes = breakdownRes.map((row: any) => ({
      type: row.secret_type,
      count: parseInt(row.count, 10),
    }));

    return NextResponse.json({
      totalFindings,
      totalNotifications,
      findings24h,
      notifications24h,
      secretTypes,
    });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch stats. Please check server logs." },
      { status: 500 },
    );
  }
}
