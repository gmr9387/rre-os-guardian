import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { toast } from "sonner";

export type BrokerEnvironment = "paper" | "live";
export type BrokerStatus = "disconnected" | "connected" | "error";

export interface BrokerConnection {
  id: string;
  account_id: string;
  broker: string;
  environment: string;
  status: string;
  last_checked_at: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useBrokerConnection() {
  const { activeAccount } = useActiveAccount();
  const queryClient = useQueryClient();

  const { data: brokerConnection, isLoading } = useQuery({
    queryKey: ["broker_connection", activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from("broker_connections")
        .select("*")
        .eq("account_id", activeAccount.id)
        .maybeSingle();

      if (error) throw error;

      // Create if missing
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("broker_connections")
          .insert({
            account_id: activeAccount.id,
            broker: "alpaca",
            environment: "paper",
            status: "disconnected",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as BrokerConnection;
      }

      return data as BrokerConnection;
    },
    enabled: !!activeAccount,
  });

  const setEnvironmentMutation = useMutation({
    mutationFn: async (environment: BrokerEnvironment) => {
      if (!activeAccount || !brokerConnection) throw new Error("No account");

      const { error } = await supabase
        .from("broker_connections")
        .update({
          environment,
          status: "disconnected", // Reset status when switching environment
        })
        .eq("account_id", activeAccount.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Environment updated");
      queryClient.invalidateQueries({ queryKey: ["broker_connection"] });
    },
    onError: (e) => toast.error("Failed to update: " + e.message),
  });

  const runCheckMutation = useMutation({
    mutationFn: async () => {
      if (!activeAccount || !brokerConnection) throw new Error("No account");

      const environment = brokerConnection.environment;
      const hasBrokerAccountId = !!(brokerConnection.meta as Record<string, unknown>)?.broker_account_id;

      // For MVP: simulate connection check
      // Paper mode always "succeeds", live mode needs broker_account_id
      let newStatus: BrokerStatus;
      if (environment === "paper") {
        newStatus = "connected";
      } else {
        newStatus = hasBrokerAccountId ? "connected" : "disconnected";
      }

      const { error } = await supabase
        .from("broker_connections")
        .update({
          status: newStatus,
          last_checked_at: new Date().toISOString(),
          meta: {
            ...(brokerConnection.meta as Record<string, unknown>),
            simulated: true,
            note: "Keys will be handled via n8n",
            last_check_result: newStatus === "connected" ? "success" : "no_credentials",
          },
        })
        .eq("account_id", activeAccount.id);

      if (error) throw error;

      return newStatus;
    },
    onSuccess: (status) => {
      if (status === "connected") {
        toast.success("Broker connection verified");
      } else {
        toast.warning("Connection check failed - credentials required for live mode");
      }
      queryClient.invalidateQueries({ queryKey: ["broker_connection"] });
    },
    onError: (e) => toast.error("Connection check failed: " + e.message),
  });

  return {
    brokerConnection,
    loading: isLoading,
    setEnvironment: (env: BrokerEnvironment) => setEnvironmentMutation.mutate(env),
    runCheck: () => runCheckMutation.mutate(),
    isUpdating: setEnvironmentMutation.isPending,
    isChecking: runCheckMutation.isPending,
  };
}
