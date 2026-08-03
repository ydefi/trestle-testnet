import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { useAuth } from "../hooks/useAuth";
import { getTasks, getUserStats, completeTask, type Task, type UserStats } from "../lib/reward";

const TYPE_COLORS: Record<string, string> = {
  forum: "bg-blue-100 text-blue-700",
  social: "bg-green-100 text-green-700",
  testnet: "bg-amber-100 text-amber-700",
  special: "bg-pink-100 text-pink-700",
  mainnet: "bg-purple-100 text-purple-700",
};

const FREQUENCY_COLORS: Record<string, string> = {
  daily: "bg-blue-100 text-blue-700",
  weekly: "bg-green-100 text-green-700",
  once: "bg-amber-100 text-amber-700",
  special: "bg-purple-100 text-purple-700",
};

export default function Tasks() {
  const { isConnected } = useContracts();
  const { displayAddress } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTasks()
      .then(t => setTasks(t.filter(task => task.active)))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!displayAddress) return;
    getUserStats(displayAddress)
      .then(setUserStats)
      .catch(() => {});
  }, [displayAddress]);

  const handleComplete = async (taskId: number) => {
    if (!displayAddress || completing !== null) return;
    setCompleting(taskId);
    setError(null);
    try {
      await completeTask(displayAddress, taskId);
      setCompletedIds(prev => [...prev, taskId]);
    } catch (e: any) {
      setError(e.message || "Failed to complete task");
    }
    setCompleting(null);
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        {userStats && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            Streak: {userStats.streak}
          </span>
        )}
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
          Connect wallet to complete tasks and earn rewards
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All" },
          { id: "social", label: "Social" },
          { id: "forum", label: "Forum" },
          { id: "testnet", label: "Testnet" },
          { id: "mainnet", label: "Mainnet" },
          { id: "special", label: "Special" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
          <p className="text-sm">No tasks available in this section</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const done = completedIds.includes(task.id);
            return (
              <div key={task.id} className={`bg-white rounded-xl border p-4 ${done ? "border-emerald-200 opacity-60" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[task.type] || "bg-gray-100 text-gray-500"}`}>
                        {task.type}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${FREQUENCY_COLORS[task.frequency] || "bg-gray-100 text-gray-500"}`}>
                        {task.frequency}
                      </span>
                      {task.verification_type && task.verification_type !== "none" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          {task.verification_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{task.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600">{task.reward} hNOBT</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-medium">+{task.reward} hNOBT</span>
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={done || completing === task.id || !isConnected}
                    className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
                      done
                        ? "bg-gray-100 text-gray-400 cursor-default"
                        : !isConnected
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : completing === task.id
                            ? "bg-emerald-400 text-white"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {done ? "Completed" : completing === task.id ? "Completing..." : "Complete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
