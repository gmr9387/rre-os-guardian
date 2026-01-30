import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManualSignalCard } from "./ManualSignalCard";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCandidate = {
  id: "test-candidate-123",
  type: "reclaim" as const,
  entryPrice: 1.12345,
  slPrice: 1.11000,
  tpPrice: 1.14000,
  rrRatio: 2.5,
  setupScore: 75,
  personalConfidence: 80,
  trustContext: "London Session",
  riskFlags: [] as string[],
  strategyTag: "Momentum",
  symbol: "EURUSD",
  side: "BUY" as const,
  rules: ["Price rejected from key level", "Session timing optimal"],
  status: "pending",
};

describe("ManualSignalCard", () => {
  const mockOnMarkExecuted = vi.fn();
  const mockOnIgnore = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders candidate information correctly", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
        onClick={mockOnClick}
      />
    );

    // Check symbol and side are displayed
    expect(screen.getByText("EURUSD")).toBeInTheDocument();
    expect(screen.getByText("BUY")).toBeInTheDocument();
    
    // Check strategy tag
    expect(screen.getByText("Momentum")).toBeInTheDocument();
    
    // Check trust context
    expect(screen.getByText("London Session")).toBeInTheDocument();
    
    // Check Manual badge
    expect(screen.getByText("Manual")).toBeInTheDocument();
  });

  it("displays trade signal prices correctly", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    // Check Entry, SL, TP labels exist
    expect(screen.getByText("Entry")).toBeInTheDocument();
    expect(screen.getByText("Stop Loss")).toBeInTheDocument();
    expect(screen.getByText("Take Profit")).toBeInTheDocument();

    // Check formatted prices
    expect(screen.getByText("1.12345")).toBeInTheDocument();
    expect(screen.getByText("1.11000")).toBeInTheDocument();
    expect(screen.getByText("1.14000")).toBeInTheDocument();
  });

  it("displays metrics correctly", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    // Check RR ratio
    expect(screen.getByText("2.5:1")).toBeInTheDocument();
    
    // Check score
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("copies entry price to clipboard when clicked", async () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    const entryButton = screen.getByText("1.12345").closest("button");
    expect(entryButton).toBeInTheDocument();
    
    if (entryButton) {
      fireEvent.click(entryButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("1.12345");
      });
    }
  });

  it("copies all signals when Copy All button is clicked", async () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    const copyAllButton = screen.getByText("Copy All");
    fireEvent.click(copyAllButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("EURUSD BUY")
      );
    });
  });

  it("calls onMarkExecuted when Mark as Executed button is clicked", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    const executeButton = screen.getByText("Mark as Executed");
    fireEvent.click(executeButton);

    expect(mockOnMarkExecuted).toHaveBeenCalledWith("test-candidate-123");
  });

  it("calls onIgnore when Ignore button is clicked", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    const ignoreButton = screen.getByText("Ignore");
    fireEvent.click(ignoreButton);

    expect(mockOnIgnore).toHaveBeenCalledWith("test-candidate-123");
  });

  it("expands rules section when clicked", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    // Rules should be hidden initially
    expect(screen.queryByText("Price rejected from key level")).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByText("Why this re-entry?");
    fireEvent.click(expandButton);

    // Rules should now be visible
    expect(screen.getByText("Price rejected from key level")).toBeInTheDocument();
    expect(screen.getByText("Session timing optimal")).toBeInTheDocument();
  });

  it("displays rank correctly with styling for rank 1", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows instruction text for manual execution", () => {
    render(
      <ManualSignalCard
        candidate={mockCandidate}
        rank={1}
        onMarkExecuted={mockOnMarkExecuted}
        onIgnore={mockOnIgnore}
      />
    );

    expect(
      screen.getByText("Execute this trade manually in your preferred broker")
    ).toBeInTheDocument();
  });
});
