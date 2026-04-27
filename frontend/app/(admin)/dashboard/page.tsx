"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Chip } from "@heroui/react";
import { DollarSign, ShoppingBag, AlertTriangle, UserPlus, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.dashboard().then((r) => setStats(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-40"><Spinner color="primary" size="lg" /></div>;

  const tiles = [
    { label: "Total Revenue", value: `RM${stats?.total_revenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Orders Today", value: stats?.orders_today || 0, icon: ShoppingBag, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Low Stock Items", value: stats?.low_stock_count || 0, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    { label: "New Signups", value: stats?.new_signups_this_month || 0, icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-foreground/40 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiles.map((tile) => (
          <Card key={tile.label} className="bg-[#111] border border-[#222]">
            <CardBody className="p-5">
              <div className={`w-10 h-10 ${tile.bg} rounded-xl flex items-center justify-center mb-3`}>
                <tile.icon size={20} className={tile.color} />
              </div>
              <p className={`text-2xl font-black ${tile.color}`}>{tile.value}</p>
              <p className="text-foreground/40 text-xs mt-1">{tile.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Revenue Chart (simple table) */}
      <Card className="bg-[#111] border border-[#222]">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-white font-bold">Revenue — Last 7 Days</h2>
          </div>
          <div className="space-y-3">
            {stats?.revenue_chart?.map((day: any) => {
              const maxRev = Math.max(...(stats.revenue_chart.map((d: any) => d.revenue)), 1);
              const pct = (day.revenue / maxRev) * 100;
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-foreground/40 text-xs w-24 shrink-0">{new Date(day.date).toLocaleDateString("en-MY", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <div className="flex-1 bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white text-xs font-bold w-20 text-right">RM{day.revenue.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {stats?.low_stock_count > 0 && (
        <Card className="bg-warning/5 border border-warning/30 mt-4">
          <CardBody className="flex items-center gap-3 p-4">
            <AlertTriangle size={20} className="text-warning" />
            <p className="text-warning text-sm font-semibold">{stats.low_stock_count} products are running low on stock.</p>
            <a href="/products-admin" className="text-warning underline text-sm ml-auto">View Products →</a>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
