"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { type Address } from "viem";
import { config } from "@/config/web3";
import { useContracts } from "@/hooks/useContracts";
import ErrorBanner from "@/components/ErrorBanner";
import TxStatus, { type TxState } from "@/components/TxStatus";

export default function UserProfilePage() {
  const { address } = useAccount();
  const { userProfileReady, userProfileAddr, userProfileABI, setProfile, submitReview } = useContracts();

  // My profile
  const [name, setName] = useState("");
  const [avatarURI, setAvatarURI] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");

  // Lookup
  const [lookupAddr, setLookupAddr] = useState("");
  const [lookupTarget, setLookupTarget] = useState<Address | null>(null);

  // Review
  const [reviewAddr, setReviewAddr] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState<TxState>("confirmed");
  const [error, setError] = useState("");

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

  const myProfileData = myProfile?.[0]?.result as { name: string; avatarURI: string; bio: string; github: string; website: string; location: string; skills: string; twitter: string; telegram: string } | undefined;
  const myName = myProfileData?.name;
  const myAvatar = myProfileData?.avatarURI;
  const myBio = myProfileData?.bio;
  const myGithub = myProfileData?.github;
  const myWebsite = myProfileData?.website;
  const myLocation = myProfileData?.location;
  const mySkills = myProfileData?.skills;
  const myTwitter = myProfileData?.twitter;
  const myTelegram = myProfileData?.telegram;

  const handleSetProfile = async () => {
    setError("");
    try {
      const hash = await setProfile(name.trim(), avatarURI.trim(), bio.trim(), github.trim(), website.trim(), location.trim(), skills.trim(), twitter.trim(), telegram.trim());
      setTxHash(hash); setTxStatus("pending");
      const receipt = await getPublicClient(config)!.waitForTransactionReceipt({ hash });
      setTxStatus(receipt.status === "success" ? "confirmed" : "failed");
    } catch (e: any) { console.error(e); setError(e?.shortMessage || e?.message || "Failed to save profile."); setTxStatus("failed"); }
  };

  const handleLookup = () => {
    if (!lookupAddr.trim()) return;
    setLookupTarget(lookupAddr.trim() as Address);
  };

  const handleReview = async () => {
    if (!reviewAddr.trim()) return;
    setError("");
    try {
      const hash = await submitReview(reviewAddr.trim() as Address, rating, comment.trim());
      setTxHash(hash); setTxStatus("pending");
      const receipt = await getPublicClient(config)!.waitForTransactionReceipt({ hash });
      setTxStatus(receipt.status === "success" ? "confirmed" : "failed");
      setReviewAddr(""); setRating(5); setComment("");
    } catch (e: any) { console.error(e); setError(e?.shortMessage || e?.message || "Failed to submit review."); setTxStatus("failed"); }
  };

  const lookupProfileData = lookupProfile?.[0]?.result as { name: string; avatarURI: string; bio: string; github: string; website: string; location: string; skills: string; twitter: string; telegram: string } | undefined;
  const lookupReviewCount = lookupProfile?.[1]?.result as bigint | undefined;
  const lookupReviews = lookupProfile?.[2]?.result as { rating: number; comment: string; timestamp: bigint }[] | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>

      {/* My Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">My Profile</h3>
        {myName || myGithub || myWebsite || myLocation || mySkills || myTwitter || myTelegram ? (
          <div className="space-y-1 text-sm text-gray-600">
            {myName && <p><span className="font-medium text-gray-800">Name:</span> {myName}</p>}
            {myAvatar && <p><span className="font-medium text-gray-800">Avatar:</span> <span className="break-all">{myAvatar}</span></p>}
            {myBio && <p><span className="font-medium text-gray-800">Bio:</span> {myBio}</p>}
            {myGithub && <p><span className="font-medium text-gray-800">GitHub:</span> <span className="break-all">{myGithub}</span></p>}
            {myWebsite && <p><span className="font-medium text-gray-800">Website:</span> <span className="break-all">{myWebsite}</span></p>}
            {myLocation && <p><span className="font-medium text-gray-800">Location:</span> {myLocation}</p>}
            {mySkills && <p><span className="font-medium text-gray-800">Skills:</span> {mySkills}</p>}
            {myTwitter && <p><span className="font-medium text-gray-800">Twitter/X:</span> <span className="break-all">{myTwitter}</span></p>}
            {myTelegram && <p><span className="font-medium text-gray-800">Telegram:</span> <span className="break-all">{myTelegram}</span></p>}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No profile set yet.</p>
        )}
        <div className="border-t pt-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={avatarURI} onChange={e => setAvatarURI(e.target.value)} placeholder="Avatar URI (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio (optional)" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          <input value={github} onChange={e => setGithub(e.target.value)} placeholder="GitHub (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills, comma separated (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="Twitter/X (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="Telegram (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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
            {lookupProfileData.github && <p><span className="font-medium text-gray-800">GitHub:</span> <span className="break-all">{lookupProfileData.github}</span></p>}
            {lookupProfileData.website && <p><span className="font-medium text-gray-800">Website:</span> <span className="break-all">{lookupProfileData.website}</span></p>}
            {lookupProfileData.location && <p><span className="font-medium text-gray-800">Location:</span> {lookupProfileData.location}</p>}
            {lookupProfileData.skills && <p><span className="font-medium text-gray-800">Skills:</span> {lookupProfileData.skills}</p>}
            {lookupProfileData.twitter && <p><span className="font-medium text-gray-800">Twitter/X:</span> <span className="break-all">{lookupProfileData.twitter}</span></p>}
            {lookupProfileData.telegram && <p><span className="font-medium text-gray-800">Telegram:</span> <span className="break-all">{lookupProfileData.telegram}</span></p>}
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

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {txHash && <TxStatus hash={txHash} status={txStatus} />}
    </div>
  );
}
