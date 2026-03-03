import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, CalendarIcon, X } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEquityCurve, type EquityPoint } from '@/hooks/useEquityCurve';

type ChartMode = 'balance' | 'r';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload, label, mode }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as EquityPoint;

  if (mode === 'r') {
    const isPositive = data.cumulativeR >= 0;
    return (
      <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-sm font-mono font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{data.cumulativeR.toFixed(1)}R
        </p>
        {data.date !== 'Start' && (
          <p className={`text-xs font-mono mt-0.5 ${data.dailyR >= 0 ? 'text-success' : 'text-destructive'}`}>
            {data.dailyR >= 0 ? '+' : ''}{data.dailyR.toFixed(1)}R day
          </p>
        )}
      </div>
    );
  }

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
  const [mode, setMode] = useState<ChartMode>('balance');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const filteredPoints = useMemo(() => {
    if (!points) return undefined;
    if (!fromDate && !toDate) return points;

    return points.filter((p) => {
      if (p.date === 'Start') return !fromDate; // keep Start only if no from filter
      const d = startOfDay(parseISO(p.date));
      if (fromDate && isBefore(d, startOfDay(fromDate))) return false;
      if (toDate && isAfter(d, startOfDay(toDate))) return false;
      return true;
    });
  }, [points, fromDate, toDate]);

  if (isLoading) {
    return <Skeleton className="h-52 w-full" />;
  }

  if (!filteredPoints || filteredPoints.length <= 1) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground text-sm">
          {points && points.length > 1
            ? 'No data in the selected date range.'
            : 'No trading data yet for the equity curve.'}
        </p>
      </div>
    );
  }

  const dataKey = mode === 'balance' ? 'balance' : 'cumulativeR';
  const values = filteredPoints.map(p => p[dataKey]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const padding = range * 0.15 || (mode === 'balance' ? 500 : 1);
  const refLine = mode === 'balance' ? filteredPoints[0].balance : 0;
  const endVal = values[values.length - 1];
  const isUp = mode === 'balance' ? endVal >= filteredPoints[0].balance : endVal >= 0;

  const hasFilter = !!fromDate || !!toDate;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Equity Curve</h3>
        </div>
        <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <button
            onClick={() => setMode('balance')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              mode === 'balance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="h-3 w-3" />
            P&L
          </button>
          <button
            onClick={() => setMode('r')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              mode === 'r'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            R
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-7 text-xs gap-1", !fromDate && "text-muted-foreground")}>
              <CalendarIcon className="h-3 w-3" />
              {fromDate ? format(fromDate, 'MMM d, yyyy') : 'From'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              disabled={(date) => (toDate ? isAfter(date, toDate) : false)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <span className="text-xs text-muted-foreground">–</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-7 text-xs gap-1", !toDate && "text-muted-foreground")}>
              <CalendarIcon className="h-3 w-3" />
              {toDate ? format(toDate, 'MMM d, yyyy') : 'To'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              disabled={(date) => (fromDate ? isBefore(date, fromDate) : false)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => { setFromDate(undefined); setToDate(undefined); }}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={filteredPoints} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
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
            tickFormatter={(v) => {
              if (mode === 'r') return `${v >= 0 ? '+' : ''}${v.toFixed(1)}R`;
              if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
              return `$${v.toFixed(0)}`;
            }}
            domain={[minVal - padding, maxVal + padding]}
            tickCount={5}
            width={50}
          />
          <Tooltip content={<CustomTooltip mode={mode} />} />
          <ReferenceLine
            y={refLine}
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey={dataKey}
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
