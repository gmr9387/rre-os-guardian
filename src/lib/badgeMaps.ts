// Badge variant mapping helpers for type-safe Badge usage

export type BadgeVariant = 
  | "default" 
  | "secondary" 
  | "destructive" 
  | "outline"
  | "assist" | "auto" | "safe"
  | "conservative" | "normal" | "aggressive"
  | "healthy" | "elevated" | "locked"
  | "buy" | "sell"
  | "live" | "test" | "train"
  | "reclaim" | "retest" | "ladder"
  | "warning";

export function statusToVariant(status: string): BadgeVariant {
  switch (status) {
    case 'blocked':
      return 'destructive';
    case 'executed':
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'ignored':
    case 'expired':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function modeToVariant(mode: string): BadgeVariant {
  switch (mode) {
    case 'assist':
      return 'assist';
    case 'auto':
      return 'auto';
    case 'safe':
      return 'safe';
    case 'live':
      return 'live';
    case 'test':
      return 'test';
    case 'train':
      return 'train';
    default:
      return 'secondary';
  }
}

export function riskToVariant(risk: string): BadgeVariant {
  switch (risk) {
    case 'conservative':
      return 'conservative';
    case 'normal':
      return 'normal';
    case 'aggressive':
      return 'aggressive';
    default:
      return 'normal';
  }
}

export function candidateTypeToVariant(type: string): BadgeVariant {
  switch (type) {
    case 'reclaim':
      return 'reclaim';
    case 'retest':
      return 'retest';
    case 'ladder':
      return 'ladder';
    default:
      return 'secondary';
  }
}

export function sideToVariant(side: string): BadgeVariant {
  return side.toLowerCase() === 'buy' ? 'buy' : 'sell';
}
