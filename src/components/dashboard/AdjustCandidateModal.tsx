import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdjustCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { entryPrice: number; slPrice: number; tpPrice: number }) => void;
  initialValues: {
    entryPrice: number;
    slPrice: number;
    tpPrice: number;
  };
  symbol: string;
}

export function AdjustCandidateModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
  symbol,
}: AdjustCandidateModalProps) {
  const [entryPrice, setEntryPrice] = useState(initialValues.entryPrice.toString());
  const [slPrice, setSlPrice] = useState(initialValues.slPrice.toString());
  const [tpPrice, setTpPrice] = useState(initialValues.tpPrice.toString());

  const handleSave = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);
    const tp = parseFloat(tpPrice);

    if (isNaN(entry) || isNaN(sl) || isNaN(tp)) {
      return;
    }

    onSave({ entryPrice: entry, slPrice: sl, tpPrice: tp });
    onClose();
  };

  const calculateRR = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);
    const tp = parseFloat(tpPrice);

    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) {
      return 'N/A';
    }

    const rr = Math.abs((tp - entry) / (entry - sl));
    return rr.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card-elevated">
        <DialogHeader>
          <DialogTitle>Adjust Candidate</DialogTitle>
          <DialogDescription>
            Modify the entry, stop loss, and take profit for {symbol}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entry">Entry Price</Label>
            <Input
              id="entry"
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sl">Stop Loss</Label>
            <Input
              id="sl"
              type="number"
              step="any"
              value={slPrice}
              onChange={(e) => setSlPrice(e.target.value)}
              className="font-mono text-danger"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tp">Take Profit</Label>
            <Input
              id="tp"
              type="number"
              step="any"
              value={tpPrice}
              onChange={(e) => setTpPrice(e.target.value)}
              className="font-mono text-success"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Calculated RR: <span className="font-mono font-bold text-foreground">{calculateRR()}</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="execute" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
