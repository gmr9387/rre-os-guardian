import { Beaker, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTestStopout } from '@/hooks/useTestStopout';

export function TestStopoutButton() {
  const { mutate, isPending } = useTestStopout();

  return (
    <div className="glass-card border-dashed border-2 border-warning/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
            <Beaker className="h-5 w-5 text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Test Mode</h3>
              <Badge variant="test" className="text-[10px]">DEV</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate synthetic stop-outs for UI testing
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-warning/50 hover:bg-warning/10"
          onClick={() => mutate()}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Beaker className="h-4 w-4" />
              Create Test Stop-out
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
