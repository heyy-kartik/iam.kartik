/* eslint-disable @next/next/no-img-element */
// components/NowPlaying.tsx
"use client";

import { useEffect, useState } from "react";

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!;
const LASTFM_USERNAME = process.env.NEXT_PUBLIC_LASTFM_USERNAME!;

interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
}

export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`,
        );
        const data = await res.json();
        const item = data.recenttracks?.track?.[0];
        if (!item) return setTrack(null);

        const isPlaying = item["@attr"]?.nowplaying === "true";
        const art =
          item.image?.find((i: { size: string }) => i.size === "large")?.[
            "#text"
          ] || "";

        setTrack({
          isPlaying,
          title: item.name,
          artist: item.artist["#text"],
          album: item.album["#text"],
          albumArt: art,
          url: item.url,
        });
      } catch {
        setTrack(null);
      } finally {
        setLoading(false);
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="np-card pl-3 pr-4 justify-start w-full">
        <div className="np-skeleton-art" />
        <div style={{ flex: 1 }}>
          <div className="np-skeleton-line" style={{ width: 80 }} />
          <div
            className="np-skeleton-line"
            style={{ width: 140, marginTop: 6 }}
          />
        </div>
      </div>
    );
  }

  if (!track) return null;

  return (
    <>
      <style>{`
        .np-card {
          display: flex; align-items: center; gap: 14px;
          background: #111; border: 1px solid #222; border-radius: 12px;
          padding: 14px 16px; max-width: 480px; font-family: monospace;
          text-decoration: none; color: inherit; transition: border-color 0.2s;
        }
        .np-card:hover { border-color: #1DB954; }
        .np-art-wrap { position: relative; flex-shrink: 0; }
        .np-art { width: 52px; height: 52px; border-radius: 6px; object-fit: cover; transition: border-radius 0.3s; }
        .np-art.playing { border-radius: 50%; animation: np-spin 8s linear infinite; }
        @keyframes np-spin { to { transform: rotate(360deg); } }
        .np-ring { position: absolute; inset: -3px; border-radius: 50%; border: 2px solid transparent; border-top-color: #e31c23; animation: np-spin 2s linear infinite; }
        .np-info { flex: 1; min-width: 0; }
        .np-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #e31c23; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .np-dot { width: 7px; height: 7px; background: #1DB954; border-radius: 50%; animation: np-pulse 1.4s ease-in-out infinite; }
        @keyframes np-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        .np-title { font-size: 14px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .np-artist { font-size: 12px; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .np-skeleton-art { width: 52px; height: 52px; border-radius: 6px; background: #222; animation: np-shimmer 1.5s infinite; }
        .np-skeleton-line { height: 11px; border-radius: 4px; background: #222; animation: np-shimmer 1.5s infinite; }
        @keyframes np-shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>

      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="np-card"
      >
        <div className="np-art-wrap">
          <img
            src={track.albumArt}
            alt={track.album}
            className={`np-art ${track.isPlaying ? "playing" : ""}`}
          />
          {track.isPlaying && <div className="np-ring" />}
        </div>
        <div className="np-info">
          <div className="np-label">
            {track.isPlaying ? (
              <>
                <span className="np-dot" /> Now Playing
              </>
            ) : (
              "Last Scrobbled"
            )}
          </div>
          <div className="np-title">{track.title}</div>
          <div className="np-artist">{track.artist}</div>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#e31c23">
          <path d="M11.452 16.935l-.668-1.817s-1.084 1.21-2.708 1.21c-1.44 0-2.463-1.25-2.463-3.251 0-2.586 1.3-3.478 2.587-3.478 1.849 0 2.438 1.197 2.938 2.738l.668 2.088c.668 2.024 1.928 3.658 5.547 3.658 2.59 0 4.35-1.41 4.35-3.608 0-2.117-1.21-3.211-3.46-3.75l-1.672-.37c-1.158-.26-1.5-.73-1.5-1.508 0-.879.696-1.397 1.832-1.397 1.244 0 1.913.464 2.014 1.571l2.579-.309C21.375 7.17 20.024 6 17.457 6c-2.373 0-4.395 1.123-4.395 3.75 0 1.786.868 2.91 3.048 3.455l1.766.44c1.353.34 1.78.87 1.78 1.695 0 1.007-.977 1.599-2.29 1.599-2.22 0-3.157-1.162-3.7-2.74l-.688-2.087C12.26 9.93 10.84 8 7.988 8 4.98 8 3 10.228 3 13.126c0 2.816 1.484 5.063 4.76 5.063 2.077 0 3.434-.98 3.692-1.254z" />
        </svg>
      </a>
    </>
  );
}
