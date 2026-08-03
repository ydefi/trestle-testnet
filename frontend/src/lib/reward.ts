import { useState } from "react";
import { REWARD_API } from "../config/contracts";

export interface Task {
  id: number;
  title: string;
  desc: string;
  reward: string;
  type: string;
  frequency: string;
  verification_type: string;
  active: boolean;
}

export interface UserStats {
  address: string;
  total_earned: string;
  streak: number;
  tasks_completed: number;
  last_claim: string | null;
}

export interface GlobalStats {
  total_users: number;
  total_rewards_distributed: string;
  active_tasks: number;
}

export async function getTasks(): Promise<Task[]> {
  const r = await fetch(`${REWARD_API}/api/tasks`);
  if (!r.ok) throw new Error("Failed to fetch tasks");
  return r.json();
}

export async function getUserStats(address: string): Promise<UserStats> {
  const r = await fetch(`${REWARD_API}/api/users/${address}`);
  if (!r.ok) throw new Error("Failed to fetch user stats");
  return r.json();
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const r = await fetch(`${REWARD_API}/api/stats`);
  if (!r.ok) throw new Error("Failed to fetch global stats");
  return r.json();
}

export async function computeReward(address: string): Promise<{ amount: string }> {
  const r = await fetch(`${REWARD_API}/api/users/${address}/compute-reward`);
  if (!r.ok) throw new Error("Failed to compute reward");
  return r.json();
}

export async function claimReward(address: string): Promise<any> {
  const r = await fetch(`${REWARD_API}/api/users/${address}/claim`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to claim reward");
  return r.json();
}

export async function completeTask(address: string, taskId: number): Promise<any> {
  const r = await fetch(`${REWARD_API}/api/users/${address}/complete-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

export async function getLeaderboard(): Promise<any[]> {
  const r = await fetch(`${REWARD_API}/api/leaderboard`);
  if (!r.ok) throw new Error("Failed to fetch leaderboard");
  return r.json();
}

export async function verifyTelegram(telegramId: number, username: string): Promise<any> {
  const r = await fetch(`${REWARD_API}/api/telegram/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId, username }),
  });
  if (!r.ok) throw new Error("Failed to verify telegram");
  return r.json();
}

export async function linkWallet(telegramId: number, address: string): Promise<any> {
  const r = await fetch(`${REWARD_API}/api/telegram/link-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId, address }),
  });
  if (!r.ok) throw new Error("Failed to link wallet");
  return r.json();
}

export async function lookupByTelegram(telegramId: number): Promise<any> {
  const r = await fetch(`${REWARD_API}/api/telegram/lookup/${telegramId}`);
  if (!r.ok) throw new Error("Failed to lookup telegram");
  return r.json();
}
