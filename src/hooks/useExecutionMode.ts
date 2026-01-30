import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "./useActiveAccount";
import { toast } from "sonner";

export type ExecutionMode = "auto" | "manual";

export function useExecutionMode() {
  const { activeAccount } = useActiveAccount();
  const queryClient = useQueryClient();

  const { data: executionMode, isLoading } = useQuery({
    queryKey: ["execution_mode", activeAccount?.id],
    queryFn: async (): Promise<ExecutionMode> => {
      if (!activeAccount) return "auto";

      const { data, error } = await supabase
        .from("account_settings")
        .select("execution_mode")
        .eq("account_id", activeAccount.id)
        .maybeSingle();

      if (error) throw error;
      return (data?.execution_mode as ExecutionMode) || "auto";
    },
    enabled: !!activeAccount,
  });

  const setExecutionModeMutation = useMutation({
    mutationFn: async (mode: ExecutionMode) => {
      if (!activeAccount) throw new Error("No account selected");

      const { error } = await supabase
        .from("account_settings")
        .update({ execution_mode: mode })
        .eq("account_id", activeAccount.id);

      if (error) throw error;
      return mode;
    },
    onSuccess: (mode) => {
      toast.success(
        mode === "auto"
          ? "Switched to Auto (Alpaca) mode"
          : "Switched to Manual Signals mode"
      );
      queryClient.invalidateQueries({ queryKey: ["execution_mode"] });
      queryClient.invalidateQueries({ queryKey: ["account_settings"] });
    },
    onError: (error) => {
      toast.error("Failed to update execution mode: " + error.message);
    },
  });

  return {
    executionMode: executionMode || "auto",
    isLoading,
    setExecutionMode: setExecutionModeMutation.mutateAsync,
    isUpdating: setExecutionModeMutation.isPending,
  };
}
