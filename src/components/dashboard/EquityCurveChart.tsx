import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEquityCurve, type EquityPoint } from '@/hooks/useEquityCurve';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as EquityPoint;
  const isPositive = data.pnl >= 0;

  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-mono font-semibold text-foreground">
        {formatCurrency(data.balance)}
      </p>
      {data.date !== 'Start' && (
        <p className={`text-xs font-mono mt-0.5 ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{formatCurrency(data.pnl)} day
        </p>
      )}
    </div>
  );
}

export function EquityCurveChart() {
  const { data: points, isLoading } = useEquityCurve();

  if (isLoading) {
    return <Skeleton className="h-52 w-full" />;
  }

  if (!points || points.length <= 1) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground text-sm">No trading data yet for the equity curve.</p>
      </div>
    );
  }

  const startBalance = points[0].balance;
  const endBalance = points[points.length - 1].balance;
  const isUp = endBalance >= startBalance;
  const minBalance = Math.min(...points.map(p => p.balance));
  const maxBalance = Math.max(...points.map(p => p.balance));
  const padding = (maxBalance - minBalance) * 0.15 || 500;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Equity Curve</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isUp ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={isUp ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={[minBalance - padding, maxBalance + padding]}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={startBalance}
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={isUp ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: isUp ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
