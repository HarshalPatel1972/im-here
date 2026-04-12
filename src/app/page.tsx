'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalFindings: number;
  totalNotifications: number;
  findings24h: number;
  notifications24h: number;
  secretTypes: { type: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col items-center py-20 px-4 md:px-8">
      <header className="text-center mb-16">
        <h1 className="text-3xl font-medium tracking-tight">I&apos;m Here</h1>
        <p className="text-muted mt-2 text-sm">Dashboard</p>
      </header>

      <main className="w-full max-w-4xl space-y-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col justify-between">
            <span className="text-muted text-sm font-medium">Total Findings Detected</span>
            <span className="font-mono text-4xl text-primary mt-4">
              {loading ? '...' : stats?.totalFindings.toLocaleString()}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col justify-between">
            <span className="text-muted text-sm font-medium">Total Notifications Sent</span>
            <span className="font-mono text-4xl text-primary mt-4">
              {loading ? '...' : stats?.totalNotifications.toLocaleString()}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col justify-between">
            <span className="text-muted text-sm font-medium">Findings (Last 24h)</span>
            <span className="font-mono text-4xl text-accent mt-4">
              {loading ? '...' : stats?.findings24h.toLocaleString()}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col justify-between">
            <span className="text-muted text-sm font-medium">Notifications (Last 24h)</span>
            <span className="font-mono text-4xl text-accent mt-4">
              {loading ? '...' : stats?.notifications24h.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-muted mb-6">Secret Types Breakdown</h2>
          {loading ? (
            <p className="font-mono text-muted">...</p>
          ) : stats?.secretTypes.length === 0 ? (
            <p className="font-mono text-muted text-sm">No findings yet.</p>
          ) : (
            <div className="space-y-4">
              {stats?.secretTypes.map((st) => (
                <div key={st.type} className="flex justify-between items-center text-sm">
                  <span className="text-primary">{st.type}</span>
                  <span className="font-mono text-muted">{st.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-24 text-muted text-xs font-medium">
        We never display your keys. Ever.
      </footer>
    </div>
  );
}
