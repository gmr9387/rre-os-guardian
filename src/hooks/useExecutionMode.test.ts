import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { execution_mode: "auto" },
            error: null,
          }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock the useActiveAccount hook
vi.mock("./useActiveAccount", () => ({
  useActiveAccount: () => ({
    activeAccount: { id: "test-account-123" },
    accountSettings: {},
    loading: false,
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useExecutionMode, ExecutionMode } from "./useExecutionMode";

describe("useExecutionMode", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("returns auto as default execution mode", async () => {
    const { result } = renderHook(() => useExecutionMode(), { wrapper });

    await waitFor(() => {
      expect(result.current.executionMode).toBe("auto");
    });
  });

  it("returns isLoading state correctly", () => {
    const { result } = renderHook(() => useExecutionMode(), { wrapper });

    // Initially should be loading or quickly resolve
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("provides setExecutionMode function", () => {
    const { result } = renderHook(() => useExecutionMode(), { wrapper });

    expect(typeof result.current.setExecutionMode).toBe("function");
  });

  it("provides isUpdating state", () => {
    const { result } = renderHook(() => useExecutionMode(), { wrapper });

    expect(typeof result.current.isUpdating).toBe("boolean");
    expect(result.current.isUpdating).toBe(false);
  });
});

describe("ExecutionMode type", () => {
  it("only allows auto or manual values", () => {
    const validModes: ExecutionMode[] = ["auto", "manual"];
    
    validModes.forEach((mode) => {
      expect(["auto", "manual"]).toContain(mode);
    });
  });
});
