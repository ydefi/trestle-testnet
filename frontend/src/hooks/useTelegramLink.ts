import { useEffect, useRef } from "react";
import { useContracts } from "./useContracts";
import { useTelegram } from "./useTelegram";
import { api } from "../lib/api";

export function useTelegramLink() {
  const { address } = useContracts();
  const { user, initData } = useTelegram();
  const linked = useRef(false);
  const loading = useRef(false);

  useEffect(() => {
    if (!address || !user || !initData) return;
    if (linked.current) return;

    loading.current = true;
    api("/api/verify/telegram", {
      method: "POST",
      body: JSON.stringify({ address, initData }),
    })
      .then(() => { linked.current = true; })
      .catch(() => {})
      .finally(() => { loading.current = false; });
  }, [address, user, initData]);
}
