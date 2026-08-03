"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";
import { type Address } from "viem";
import { useContracts } from "@/hooks/useContracts";

export default function UserProfilePage() {
  const { address } = useAccount();
  const { userProfileReady, userProfileAddr, userProfileABI, setProfile, submitReview } = useContracts();

  // My profile
  const [name, setName] = useState("");
  const [avatarURI, setAvatarURI] = useState("");
  const [bio, setBio] = useState("");

  // Lookup
  const [lookupAddr, setLookupAddr] = useState("");
  const [lookupTarget, setLookupTarget] = useState<Address | null>(null);

  // Review
  const [reviewAddr, setReviewAddr] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [txHash, setTxHash] = useState("");

  // Read my profile
  const { data: myProfile } = useReadContracts({
    contracts: address && userProfileReady ? [
      { abi: userProfileABI, address: userProfileAddr, functionName: "getProfile", args: [address] },
    ] : [],
    query: { enabled: !!address && userProfileReady },
  });

  // Read looked-up profile
  const { data: lookupProfile } = useReadContracts({
    contracts: lookupTarget && userProfileReady ? [
      { abi: userProfileABI, address: userProfileAddr, functionName: "getProfile", args: [lookupTarget] },
      { abi: userProfileABI, address: userProfileAddr, functionName: "getReviewCount", args: [lookupTarget] },
      { abi: userProfileABI, address: userProfileAddr, functionName: "getReviews", args: [lookupTarget, BigInt(0), BigInt(10)] },
    ] : [],
    query: { enabled: !!lookupTarget && userProfileReady },
  });

  const myProfileData = myProfile?.[0]?.result as { name: string; avatarURI: string; bio: string } | undefined;
  const myName = myProfileData?.name;
  const myAvatar = myProfileData?.avatarURI;
  const myBio = myProfileData?.bio;

  const handleSetProfile = async () => {
    if (!name.trim()) return;
    try {
      const hash = await setProfile(name.trim(), avatarURI.trim(), bio.trim());
      setTxHash(hash);
    } catch (e) { console.error(e); }
  };

  const handleLookup = () => {
    if (!lookupAddr.trim()) return;
    setLookupTarget(lookupAddr.trim() as Address);
  };

  const handleReview = async () => {
    if (!reviewAddr.trim()) return;
    try {
      const hash = await submitReview(reviewAddr.trim() as Address, rating, comment.trim());
      setTxHash(hash);
      setReviewAddr(""); setRating(5); setComment("");
    } catch (e) { console.error(e); }
  };

  const lookupProfileData = lookupProfile?.[0]?.result as { name: string; avatarURI: string; bio: string } | undefined;
  const lookupReviewCount = lookupProfile?.[1]?.result as bigint | undefined;
  const lookupReviews = lookupProfile?.[2]?.result as { rating: number; comment: string; timestamp: bigint }[] | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>

      {/* My Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">My Profile</h3>
        {myName ? (
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">Name:</span> {myName}</p>
            {myAvatar && <p><span className="font-medium text-gray-800">Avatar:</span> <span className="break-all">{myAvatar}</span></p>}
            {myBio && <p><span className="font-medium text-gray-800">Bio:</span> {myBio}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No profile set yet.</p>
        )}
        <div className="border-t pt-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={avatarURI} onChange={e => setAvatarURI(e.target.value)} placeholder="Avatar URI (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio (optional)" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          <button onClick={handleSetProfile} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
            Save Profile
          </button>
        </div>
      </section>

      {/* Lookup */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Look Up User</h3>
        <div className="flex gap-2">
          <input value={lookupAddr} onChange={e => setLookupAddr(e.target.value)} placeholder="0x..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />
          <button onClick={handleLookup} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Search</button>
        </div>
        {lookupProfileData && (
          <div className="text-sm text-gray-600 space-y-2 pt-2 border-t">
            <p><span className="font-medium text-gray-800">Name:</span> {lookupProfileData.name || <span className="italic text-gray-400">not set</span>}</p>
            {lookupProfileData.avatarURI && <p><span className="font-medium text-gray-800">Avatar:</span> <span className="break-all">{lookupProfileData.avatarURI}</span></p>}
            {lookupProfileData.bio && <p><span className="font-medium text-gray-800">Bio:</span> {lookupProfileData.bio}</p>}
            <p><span className="font-medium text-gray-800">Reviews:</span> {lookupReviewCount?.toString() || "0"}</p>
            {lookupReviews && lookupReviews.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="font-medium text-gray-800 text-xs uppercase tracking-wider">Recent Reviews</p>
                {lookupReviews.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1 text-amber-500 text-sm">{Array.from({ length: Number(r.rating) }, (_, j) => <span key={j}>★</span>)}</div>
                    {r.comment && <p className="text-xs text-gray-600 mt-1">{r.comment}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(Number(r.timestamp) * 1000).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            {(!lookupReviews || lookupReviews.length === 0) && <p className="text-xs text-gray-400 italic">No reviews yet.</p>}
          </div>
        )}
      </section>

      {/* Submit Review */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Submit Review</h3>
        <input value={reviewAddr} onChange={e => setReviewAddr(e.target.value)} placeholder="User address 0x..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rating:</span>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment (optional)" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
        <button onClick={handleReview} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors">
          Submit Review
        </button>
      </section>

      {txHash && <p className="text-xs text-gray-500 break-all">Tx: {txHash}</p>}
    </div>
  );
}
