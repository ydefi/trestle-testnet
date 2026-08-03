import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

export function useTransactions() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_BLOCKSCOUT_API_AMOY;
        const apiKey = import.meta.env.VITE_BLOCKSCOUT_API_KEY;
        if (!baseUrl || !apiKey) {
          throw new Error("Blockscout API configuration missing");
        }

        const url = `${baseUrl}/api?module=account&action=txlist&address=${address}&apikey=${apiKey}&page=1&offset=10&sort=desc`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status === "1" && data.message === "OK") {
          setTransactions(data.result);
        } else {
          // If no transactions or error in response
          setTransactions([]);
        }
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError(err.message || "Unknown error");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  return { transactions, loading, error };
}