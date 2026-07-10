import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { useContracts } from "../hooks/useContracts";

type Tab = "browse" | "create-gig" | "create-project";

export default function Freelance() {
  const { address, isConnected, freelancerEscrowReady, freelancerEscrowAddr, freelancerEscrowABI } = useContracts();
  const { connector } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const addr = freelancerEscrowAddr as Address;

  const [tab, setTab] = useState<Tab>("browse");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");

  // ── Create Gig form ──
  const [gigTitle, setGigTitle] = useState("Web Dev");
  const [gigDesc, setGigDesc] = useState("ipfs://QmDescription");
  const [gigPrice, setGigPrice] = useState("100");
  const [gigMsDesc, setGigMsDesc] = useState("Design,Develop,Deploy");
  const [gigMsAmt, setGigMsAmt] = useState("30,40,30");
  const [gigMsDur, setGigMsDur] = useState("7,14,21");

  // ── Create Project form ──
  const [projTitle, setProjTitle] = useState("Build a DApp");
  const [projDesc, setProjDesc] = useState("ipfs://QmProjectSpec");
  const [projBudget, setProjBudget] = useState("500");
  const [projMsDesc, setProjMsDesc] = useState("Frontend,Smart Contract,Testing");
  const [projMsAmt, setProjMsAmt] = useState("200,200,100");
  const [projMsDur, setProjMsDur] = useState("14,21,7");

  function parseMilestones(descs: string, amounts: string, durs: string) {
    const d = descs.split(",").map(s => s.trim());
    const a = amounts.split(",").map(s => s.trim());
    const du = durs.split(",").map(s => s.trim());
    const n = Math.min(d.length, a.length, du.length);
    return {
      descs: d.slice(0, n),
      amounts: a.slice(0, n),
      deadlines: du.map(s => BigInt(parseInt(s) * 86400)),
    };
  }

  async function handleCreateGig() {
    if (!freelancerEscrowReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const { descs, amounts, deadlines } = parseMilestones(gigMsDesc, gigMsAmt, gigMsDur);
      const hash = await writeContractAsync({
        abi: freelancerEscrowABI, address: addr,
        functionName: "createGig",
        args: [gigTitle, gigDesc, parseUnits(gigPrice, 18), descs, amounts.map(a => parseUnits(a, 18)), deadlines],
        connector,
      } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); alert(e?.message || "Failed to create gig"); }
    finally { setBusy(false); }
  }

  async function handleCreateProject() {
    if (!freelancerEscrowReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const { descs, amounts, deadlines } = parseMilestones(projMsDesc, projMsAmt, projMsDur);
      const hash = await writeContractAsync({
        abi: freelancerEscrowABI, address: addr,
        functionName: "createProjectFixed",
        args: [projTitle, projDesc, parseUnits(projBudget, 18), descs, amounts.map(a => parseUnits(a, 18)), deadlines],
        connector,
      } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); alert(e?.message || "Failed to create project"); }
    finally { setBusy(false); }
  }

  // ── Read gigs & projects ──
  const ABI = freelancerEscrowABI;
  const { data: gigCountData } = useReadContracts({
    contracts: [{ abi: ABI, address: addr, functionName: "gigCount", args: [] }],
    query: { enabled: freelancerEscrowReady },
  } as any);
  const gigCount = Number(gigCountData?.[0]?.result || 0n);

  const { data: projCountData } = useReadContracts({
    contracts: [{ abi: ABI, address: addr, functionName: "projectCount", args: [] }],
    query: { enabled: freelancerEscrowReady },
  } as any);
  const projCount = Number(projCountData?.[0]?.result || 0n);

  const gigIds = useMemo(() => Array.from({ length: gigCount }, (_, i) => i + 1), [gigCount]);
  const projIds = useMemo(() => Array.from({ length: projCount }, (_, i) => i + 1), [projCount]);

  const gigCalls = useMemo(() => gigIds.map(id => ({ abi: ABI, address: addr, functionName: "gigs", args: [BigInt(id)] })), [gigIds, addr]);
  const projCalls = useMemo(() => projIds.map(id => ({ abi: ABI, address: addr, functionName: "projects", args: [BigInt(id)] })), [projIds, addr]);

  const { data: gigsRaw } = useReadContracts({ contracts: gigCalls as any, query: { enabled: gigCount > 0 } } as any);
  const { data: projsRaw } = useReadContracts({ contracts: projCalls as any, query: { enabled: projCount > 0 } } as any);

  const gigs = useMemo(() => {
    if (!gigsRaw) return [];
    return gigIds.map((id, i) => {
      const r = gigsRaw[i]?.result as any;
      if (!r) return null;
      return { id: BigInt(id), freelancer: r[1] as Address, title: r[2] as string, desc: r[3] as string, price: r[4] as bigint, active: r[5] as boolean };
    }).filter((g): g is NonNullable<typeof g> => g != null);
  }, [gigsRaw, gigIds]);

  const projects = useMemo(() => {
    if (!projsRaw) return [];
    return projIds.map((id, i) => {
      const r = projsRaw[i]?.result as any;
      if (!r) return null;
      return { id: BigInt(id), client: r[0] as Address, freelancer: r[1] as Address, status: Number(r[2]), totalBudget: r[3] as bigint, escrowed: r[4] as bigint, title: r[6] as string, desc: r[7] as string };
    }).filter((p): p is NonNullable<typeof p> => p != null);
  }, [projsRaw, projIds]);

  async function handleHire(gigId: bigint, price: bigint) {
    if (!freelancerEscrowReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const hash = await writeContractAsync({
        abi: ABI, address: addr, functionName: "hireGig",
        args: [gigId], value: price, connector,
      } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); alert(e?.message || "Failed to hire"); }
    finally { setBusy(false); }
  }

  const isOwner = (a: Address) => address && a.toLowerCase() === address.toLowerCase();
  const STATUS = ["Open", "In Progress", "Completed", "Cancelled", "Disputed"];

  return (
    <div className="space-y-6">
      {/* walkthrough */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
        <strong>How Freelance Works:</strong> Freelancers{" "}
        <strong>create gigs</strong> (list a service with milestone breakdown).{" "}
        Clients <strong>hire</strong> by funding the full amount — funds are released{" "}
        milestone-by-milestone as work is approved. Clients can also{" "}
        <strong>post projects</strong> with a fixed budget.
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {(["browse", "create-gig", "create-project"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
              tab === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {t === "browse" ? "Browse" : t === "create-gig" ? "Create Gig" : "Post Project"}
          </button>
        ))}
      </div>

      {txHash && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 break-all">
          Tx: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline font-mono">{txHash.slice(0, 20)}...</a>
        </div>
      )}

      {tab === "browse" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Gigs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Active Gigs ({gigs.filter(g => g.active).length})</h3>
            {gigs.filter(g => g.active).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No gigs listed yet.</p>
            ) : (
              <div className="space-y-3">
                {gigs.filter(g => g.active).map((g: any) => (
                  <div key={g.id.toString()} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{g.title}</span>
                      <span className="text-emerald-600 font-semibold">{formatUnits(g.price, 18)} MATIC</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">By {g.freelancer.slice(0, 6)}...{g.freelancer.slice(-4)}</p>
                    <button onClick={() => handleHire(g.id, g.price)} disabled={busy || isOwner(g.freelancer)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-xs font-medium rounded-lg transition">
                      {busy ? "Processing..." : isOwner(g.freelancer) ? "Your Gig" : "Hire"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Projects */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Open Projects ({projects.filter(p => p.status === 0).length})</h3>
            {projects.filter(p => p.status === 0).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No open projects yet.</p>
            ) : (
              <div className="space-y-3">
                {projects.filter(p => p.status === 0).map((p: any) => (
                  <div key={p.id.toString()} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{p.title}</span>
                      <span className="text-blue-600 font-semibold">{formatUnits(p.totalBudget, 18)} MATIC</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Client: {p.client.slice(0, 6)}...{p.client.slice(-4)}</p>
                    <p className="text-xs text-gray-400">Status: {STATUS[p.status] || "Unknown"} · Escrowed: {formatUnits(p.escrowed, 18)} MATIC</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "create-gig" && (
        <div className="max-w-lg bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Create a Gig (Freelancer)</h3>
          <p className="text-xs text-gray-500">List your service with milestone-based payments.</p>
          {[{ label: "Title", val: gigTitle, set: setGigTitle },
            { label: "Description URI (ipfs://...)", val: gigDesc, set: setGigDesc },
            { label: "Price (MATIC)", val: gigPrice, set: setGigPrice, type: "number" },
            { label: "Milestone Descriptions (comma-sep)", val: gigMsDesc, set: setGigMsDesc },
            { label: "Milestone Amounts (comma-sep)", val: gigMsAmt, set: setGigMsAmt },
            { label: "Milestone Deadlines (days, comma-sep)", val: gigMsDur, set: setGigMsDur },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} type={f.type || "text"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <button onClick={handleCreateGig} disabled={busy || !freelancerEscrowReady}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition">
            {busy ? "Creating..." : "Create Gig"}
          </button>
        </div>
      )}

      {tab === "create-project" && (
        <div className="max-w-lg bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Post a Project (Client)</h3>
          <p className="text-xs text-gray-500">Post a fixed-budget project with milestones for freelancers to apply.</p>
          {[{ label: "Title", val: projTitle, set: setProjTitle },
            { label: "Description URI (ipfs://...)", val: projDesc, set: setProjDesc },
            { label: "Total Budget (MATIC)", val: projBudget, set: setProjBudget, type: "number" },
            { label: "Milestone Descriptions (comma-sep)", val: projMsDesc, set: setProjMsDesc },
            { label: "Milestone Amounts (comma-sep)", val: projMsAmt, set: setProjMsAmt },
            { label: "Milestone Deadlines (days, comma-sep)", val: projMsDur, set: setProjMsDur },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} type={f.type || "text"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <button onClick={handleCreateProject} disabled={busy || !freelancerEscrowReady}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition">
            {busy ? "Creating..." : "Create Project"}
          </button>
        </div>
      )}
    </div>
  );
}
