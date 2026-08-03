import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { verifyTelegram, linkWallet, lookupByTelegram } from "../lib/reward";

export function useAuth() {
  const { address } = useAccount();
  const [telegramUser, setTelegramUser] = useState<{ id: number; username: string } | null>(null);
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tg?.id) {
        setTelegramUser({ id: tg.id, username: tg.username || `user_${tg.id}` });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!telegramUser?.id) return;
    setLoading(true);
    lookupByTelegram(telegramUser.id)
      .then(data => setLinkedAddress(data?.address || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [telegramUser?.id]);

  const isFullyLinked = !!telegramUser?.id && !!linkedAddress && !!address;

  const verifyAndLink = async () => {
    if (!telegramUser?.id || !address) return;
    setLoading(true);
    try {
      await verifyTelegram(telegramUser.id, telegramUser.username);
      await linkWallet(telegramUser.id, address);
      setLinkedAddress(address);
    } finally {
      setLoading(false);
    }
  };

  return {
    telegramUser,
    linkedAddress,
    displayAddress: linkedAddress || address || null,
    isFullyLinked,
    loading,
    verifyAndLink,
  };
}
