<<<<<<< HEAD
import type { JSX } from "react";

export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    logo: (
      <svg viewBox="0 0 256 256" width={size} height={size} className={className}>
        <circle cx="128" cy="128" r="124" fill="#059669"/>
=======
type IconName = "logo" | "spinner" | "discord" | "telegram" | "github" | "globe" | "email" | "x";

export default function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  const icons = {
    logo: (
      <svg viewBox="0 0 256 256" fill="none" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669"/>
            <stop offset="100%" stopColor="#047857"/>
          </linearGradient>
        </defs>
        <circle cx="128" cy="128" r="124" fill="url(#icon-bg)"/>
>>>>>>> 7c29aad (initial commit)
        <rect x="48" y="168" width="160" height="28" rx="6" fill="white" opacity="0.95"/>
        <rect x="72" y="120" width="112" height="24" rx="5" fill="white" opacity="0.85"/>
        <rect x="96" y="72" width="64" height="20" rx="4" fill="white" opacity="0.95"/>
      </svg>
    ),
<<<<<<< HEAD
    dashboard: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/>
        <rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/>
        <rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    stake: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/>
        <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    tasks: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    verify: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <path d="M1 10h22"/>
        <circle cx="18" cy="14" r="0.5" fill="currentColor"/>
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
      </svg>
    ),
    discord: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.198.024.283.088.177.128.248.348.2.562l-.573 2.723c-.042.188-.19.32-.38.375-.09.024-.18.014-.26-.024l-.008.001-.055-.024-1.516-.69c-.116-.053-.236-.01-.297.097-.053.096-.026.235.08.316l2.11 1.53c.08.06.13.16.14.27v4.46c0 .18-.1.34-.25.41-.15.07-.32.04-.44-.07l-1.98-2.38a.45.45 0 0 1-.07-.22v-4.5l.01-.01-2.1-1.52a.57.57 0 0 1-.2-.68c.05-.1.14-.16.24-.17h.06z"/>
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <ellipse cx="12" cy="12" rx="5" ry="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    bounty: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2l-1 6-6 1 6 1 1 6 1-6 6-1-6-1z"/>
        <path d="M12 12l7 7"/>
        <circle cx="17" cy="17" r="4"/>
      </svg>
    ),
    marketplace: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
=======
    spinner: (
      <svg viewBox="0 0 32 32" className={className} style={{ width: size, height: size }}>
        <circle cx="16" cy="16" r="12" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="70 30" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    ),
    discord: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.198.024.283.088.177.128.248.348.2.562l-.573 2.723c-.042.188-.19.32-.38.375-.09.024-.18.014-.26-.024l-.008.001-.055-.024-1.516-.69c-.116-.053-.236-.01-.297.097-.053.096-.026.235.08.316l2.11 1.53c.08.06.13.16.14.27v4.46c0 .18-.1.34-.25.41-.15.07-.32.04-.44-.07l-1.98-2.38a.45.45 0 0 1-.07-.22v-4.5l.01-.01-2.1-1.52a.57.57 0 0 1-.2-.68c.05-.1.14-.16.24-.17h.06z"/>
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    "globe": (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M22 4L12 13 2 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/>
>>>>>>> 7c29aad (initial commit)
      </svg>
    ),
  };
  return icons[name] || null;
<<<<<<< HEAD
}
=======
}
>>>>>>> 7c29aad (initial commit)
