"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/utils/fingerprint";

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  return deviceId;
}
