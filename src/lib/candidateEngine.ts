/**
 * RRE OS - Re-Entry Candidate Engine
 * 
 * This module contains types and utilities for the candidate generation system.
 * The actual generation logic runs server-side via edge functions.
 */

export type CandidateType = "reclaim" | "retest" | "ladder";

export interface CandidateTypeInfo {
  type: CandidateType;
  label: string;
  description: string;
  riskLevel: "conservative" | "normal" | "aggressive";
  color: string;
}

// Display information for each candidate type
export const CANDIDATE_TYPE_INFO: Record<CandidateType, CandidateTypeInfo> = {
  reclaim: {
    type: "reclaim",
    label: "Best Re-Entry",
    description: "Optimal entry point with balanced risk/reward",
    riskLevel: "normal",
    color: "primary",
  },
  retest: {
    type: "retest",
    label: "Safer Re-Entry",
    description: "Conservative entry with tighter stops",
    riskLevel: "conservative",
    color: "success",
  },
  ladder: {
    type: "ladder",
    label: "Aggressive Re-Entry",
    description: "Extended target with higher risk tolerance",
    riskLevel: "aggressive",
    color: "warning",
  },
};

// Get friendly label for candidate type
export function getCandidateTypeLabel(type: CandidateType): string {
  return CANDIDATE_TYPE_INFO[type]?.label || type;
}

// Get description for candidate type
export function getCandidateTypeDescription(type: CandidateType): string {
  return CANDIDATE_TYPE_INFO[type]?.description || "";
}

// Score interpretation
export function getScoreInterpretation(score: number): {
  label: string;
  color: string;
  recommendation: string;
} {
  if (score >= 85) {
    return {
      label: "Excellent",
      color: "text-success",
      recommendation: "High confidence opportunity. Consider executing.",
    };
  }
  if (score >= 70) {
    return {
      label: "Good",
      color: "text-primary",
      recommendation: "Solid setup. Review and consider executing.",
    };
  }
  if (score >= 55) {
    return {
      label: "Fair",
      color: "text-warning",
      recommendation: "Proceed with caution. Review risk factors.",
    };
  }
  return {
    label: "Low",
    color: "text-danger",
    recommendation: "Consider ignoring or wait for better setup.",
  };
}

// RR interpretation
export function getRRInterpretation(rr: number): {
  label: string;
  color: string;
} {
  if (rr >= 3) {
    return { label: "Excellent", color: "text-success" };
  }
  if (rr >= 2) {
    return { label: "Good", color: "text-primary" };
  }
  if (rr >= 1.5) {
    return { label: "Acceptable", color: "text-warning" };
  }
  return { label: "Poor", color: "text-danger" };
}

// Confidence level interpretation
export function getConfidenceLevel(confidence: number): {
  label: string;
  emoji: string;
} {
  if (confidence >= 80) {
    return { label: "Very High", emoji: "🔥" };
  }
  if (confidence >= 65) {
    return { label: "High", emoji: "✨" };
  }
  if (confidence >= 50) {
    return { label: "Moderate", emoji: "👍" };
  }
  if (confidence >= 35) {
    return { label: "Low", emoji: "⚠️" };
  }
  return { label: "Very Low", emoji: "❌" };
}
