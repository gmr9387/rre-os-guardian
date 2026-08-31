// src/pages/guardian/index.tsx

import React, { useState } from "react";
import { useGuardian } from "../../hooks/useGuardian";

type ClaimFormState = {
  claimId: string;
  payload: string;
};

export default function GuardianPage() {
  const [form, setForm] = useState<ClaimFormState>({
    claimId: "",
    payload: "{}",
  });

  const {
    loading,
    error,
    risk,
    rules,
    scoring,
    killSwitch,
    health,
