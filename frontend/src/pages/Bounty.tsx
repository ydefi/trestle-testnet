import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { useAuth } from "../hooks/useAuth";
import { getTasks, type Task } from "../lib/reward";

export default function Bounty() {
  const { isConnected, chainName } = useContracts();
  const { displayAddress } = useAuth();
  const [bountyTasks, setBountyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [reproduction, setReproduction] = useState("");

  useEffect(() => {
    setLoading(true);
    getTasks()
      .then(tasks => setBountyTasks(tasks.filter(t => t.type === "special" && t.active)))
      .catch(() => setBountyTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!title || !description || !displayAddress) return;
    setSubmitted(true);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to submit bug bounty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Bug Bounty</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-sm">Reward Tiers</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-medium">Critical (S1)</span>
            </span>
            <span className="text-emerald-600 font-medium">100,000 hNOBT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="font-medium">High (S2)</span>
            </span>
            <span className="text-emerald-600 font-medium">50,000 hNOBT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="font-medium">Medium (S3)</span>
            </span>
            <span className="text-emerald-600 font-medium">20,000 hNOBT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-medium">Low (S4)</span>
            </span>
            <span className="text-emerald-600 font-medium">2,500 hNOBT</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-sm mb-2">In Scope</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Smart contracts (FreelancerEscrow, DigitalGoods, DigitalRWA, FeeDistributor)</li>
          <li>• Frontend (Next.js + wagmi)</li>
          <li>• Deploy scripts (Hardhat)</li>
        </ul>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-emerald-700 font-semibold">Bug report submitted!</p>
          <p className="text-xs text-emerald-600 mt-1">We will review and respond within 48 hours.</p>
          <button
            onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setReproduction(""); }}
            className="mt-3 text-xs text-emerald-600 underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Submit Bug Report</h3>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Brief description of the vulnerability"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Severity</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="critical">Critical (S1) — 100,000 hNOBT</option>
              <option value="high">High (S2) — 50,000 hNOBT</option>
              <option value="medium">Medium (S3) — 20,000 hNOBT</option>
              <option value="low">Low (S4) — 2,500 hNOBT</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24"
              placeholder="Detailed description of the vulnerability"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Steps to Reproduce</label>
            <textarea
              value={reproduction}
              onChange={e => setReproduction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20"
              placeholder={"1. Deploy contract\n2. Call function X\n3. Observe error"}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <p>Submit via Telegram: <a href="https://t.me/TrestleDeFi" className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer">@TrestleDeFi</a></p>
            <p className="mt-1">Or email: <a href="mailto:contact@trestle.website" className="text-emerald-600 underline">contact@trestle.website</a></p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title || !description || !displayAddress}
            className="w-full bg-emerald-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
          >
            Prepare Report
          </button>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
        <p>Testing on: <span className="font-medium text-gray-700">{chainName}</span></p>
        {displayAddress && <p className="mt-1">Wallet: <span className="font-mono">{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span></p>}
      </div>
    </div>
  );
}
