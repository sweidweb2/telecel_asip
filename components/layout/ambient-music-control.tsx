"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Volume2Icon, VolumeXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";

const MUSIC_SRC = "/music/atlasaudio-ambient-574024.mp3";
const STORAGE_KEY = "asip-ambient-music-muted";
const TARGET_VOLUME = 0.28;
const FADE_MS = 1200;

type MutedListener = () => void;
const mutedListeners = new Set<MutedListener>();

function subscribeMutedPreference(listener: MutedListener) {
  mutedListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    mutedListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getMutedPreferenceSnapshot() {
  return readMutedPreference();
}

function getMutedPreferenceServerSnapshot() {
  return true;
}

function setMutedPreference(muted: boolean) {
  writeMutedPreference(muted);
  mutedListeners.forEach((listener) => listener());
}

const LABELS = {
  en: {
    mute: "Mute background music",
    unmute: "Unmute background music",
  },
  fr: {
    mute: "Couper la musique d’ambiance",
    unmute: "Activer la musique d’ambiance",
  },
} as const;

function localeFromPath(pathname: string | null): Locale {
  const segment = pathname?.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : "en";
}

function readMutedPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Missing key → muted (do not download the track until the user unmutes).
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

function writeMutedPreference(muted: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

function scheduleAfterPageReady(task: () => void): () => void {
  let idleId: number | undefined;
  let timeoutId: number | undefined;
  let cancelled = false;

  const run = () => {
    if (cancelled) return;

    const start = () => {
      if (cancelled) return;
      task();
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 3500 });
      return;
    }

    timeoutId = window.setTimeout(start, 1800);
  };

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (
      idleId !== undefined &&
      typeof window.cancelIdleCallback === "function"
    ) {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  };
}

function fadeVolume(
  audio: HTMLAudioElement,
  to: number,
  durationMs: number,
): () => void {
  const from = audio.volume;
  const startedAt = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    // Clamp — float drift can land slightly outside [0, 1] and throw IndexSizeError
    audio.volume = Math.min(1, Math.max(0, from + (to - from) * progress));
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
    }
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/**
 * Fixed mute control + ambient loop for public marketing pages.
 * Default is muted; the ~5MB track is fetched only after the user unmutes.
 */
export function AmbientMusicControl() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const labels = LABELS[locale];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeCancelRef = useRef<(() => void) | null>(null);
  const unlockCleanupRef = useRef<(() => void) | null>(null);
  const mutedRef = useRef(true);
  const srcLoadedRef = useRef(false);

  const muted = useSyncExternalStore(
    subscribeMutedPreference,
    getMutedPreferenceSnapshot,
    getMutedPreferenceServerSnapshot,
  );

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    let cancelled = false;

    mutedRef.current = readMutedPreference();

    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audioRef.current = audio;

    const ensureSrc = () => {
      if (srcLoadedRef.current || !audioRef.current) return;
      audioRef.current.src = MUSIC_SRC;
      audioRef.current.preload = "auto";
      srcLoadedRef.current = true;
      audioRef.current.load();
    };

    const tryPlay = async () => {
      if (cancelled || mutedRef.current || !audioRef.current) return;
      ensureSrc();

      try {
        await audio.play();
        fadeCancelRef.current?.();
        fadeCancelRef.current = fadeVolume(audio, TARGET_VOLUME, FADE_MS);
        unlockCleanupRef.current?.();
        unlockCleanupRef.current = null;
      } catch {
        if (unlockCleanupRef.current) return;

        const unlock = () => {
          void tryPlay();
        };

        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        unlockCleanupRef.current = () => {
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
      }
    };

    // If the visitor previously unmuted, load + play after idle.
    const cancelSchedule = scheduleAfterPageReady(() => {
      if (cancelled || mutedRef.current) return;
      ensureSrc();
      void tryPlay();
    });

    const onVisibility = () => {
      if (!audioRef.current || mutedRef.current) return;
      if (document.hidden) {
        audio.pause();
      } else {
        void tryPlay();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    const removeVisibility = () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };

    return () => {
      cancelled = true;
      cancelSchedule();
      removeVisibility();
      unlockCleanupRef.current?.();
      unlockCleanupRef.current = null;
      fadeCancelRef.current?.();
      fadeCancelRef.current = null;

      const current = audioRef.current;
      if (current) {
        current.pause();
        current.removeAttribute("src");
        current.load();
        audioRef.current = null;
      }
      srcLoadedRef.current = false;
    };
  }, []);

  const toggleMuted = () => {
    const nextMuted = !muted;
    mutedRef.current = nextMuted;
    setMutedPreference(nextMuted);

    const audio = audioRef.current;
    if (!audio) return;

    fadeCancelRef.current?.();
    fadeCancelRef.current = null;

    if (nextMuted) {
      audio.pause();
      audio.volume = 0;
      return;
    }

    if (!srcLoadedRef.current) {
      audio.src = MUSIC_SRC;
      audio.preload = "auto";
      srcLoadedRef.current = true;
      audio.load();
    }

    audio.volume = 0;
    void audio.play().then(
      () => {
        fadeCancelRef.current = fadeVolume(audio, TARGET_VOLUME, FADE_MS);
      },
      () => {
        // Autoplay still blocked — unmute click usually counts as a gesture.
      },
    );
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(1rem+var(--pathway-bar-offset,0px))] z-40 transition-[bottom] duration-300 sm:right-6 sm:bottom-6">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-pressed={muted}
        aria-label={muted ? labels.unmute : labels.mute}
        onClick={toggleMuted}
        className={cn(
          "pointer-events-auto size-11 min-h-11 min-w-11 rounded-full border-border/80 bg-background/90 shadow-md backdrop-blur-sm",
          "hover:bg-background",
        )}
      >
        {muted ? (
          <VolumeXIcon className="size-5" aria-hidden />
        ) : (
          <Volume2Icon className="size-5" aria-hidden />
        )}
      </Button>
    </div>
  );
}
