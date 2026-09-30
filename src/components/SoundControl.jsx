import { useEffect, useRef, useState } from "react";
import { Music2, Pause, SlidersHorizontal, Volume2, X } from "lucide-react";

export default function SoundControl({ onCredits }) {
  const audio = useRef(null);
  const container = useRef(null);
  const settingsButton = useRef(null);
  const resumeWhenVisible = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.22);
  const [settings, setSettings] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    audio.current.volume = volume;
  }, [volume]);
  useEffect(() => {
    const player = audio.current;
    const visibility = () => {
      if (document.hidden) {
        resumeWhenVisible.current = !player.paused;
        player.pause();
      } else if (resumeWhenVisible.current) {
        resumeWhenVisible.current = false;
        player.play().catch(() => setPlaying(false));
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      player.pause();
    };
  }, []);
  useEffect(() => {
    if (!settings) return;
    const outside = (event) => {
      if (!container.current.contains(event.target)) setSettings(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setSettings(false);
        settingsButton.current.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [settings]);

  const toggle = async () => {
    const player = audio.current;
    resumeWhenVisible.current = false;
    setError("");
    if (!player.paused) {
      player.pause();
      return;
    }
    setLoading(true);
    try {
      if (player.error) player.load();
      await player.play();
    } catch {
      setPlaying(false);
      setError("The music could not start. Please try Play jazz again.");
      setSettings(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sound-control" ref={container}>
      <audio
        ref={audio}
        src="/audio/jazz-brunch-kevin-macleod.mp3"
        preload="none"
        loop
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError("The music could not load. Please try again.");
        }}
      />
      <button
        className={`jazz-toggle ${playing ? "selected" : ""}`}
        onClick={toggle}
        disabled={loading}
        aria-pressed={playing}
        aria-label={playing ? "Pause jazz" : "Play jazz"}
        title={playing ? "Pause jazz" : "Play jazz"}
      >
        {playing ? (
          <span className="jazz-levels" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <Music2 size={15} />
        )}
        <span>{loading ? "Loading…" : playing ? "Jazz on" : "Play jazz"}</span>
      </button>
      <button
        className="sound-settings-trigger"
        ref={settingsButton}
        onClick={() => setSettings(!settings)}
        aria-label="Music volume and credits"
        aria-expanded={settings}
        aria-controls="sound-settings"
      >
        <SlidersHorizontal size={14} />
      </button>
      {settings && (
        <div
          className="sound-settings"
          id="sound-settings"
          role="region"
          aria-label="Jazz settings"
        >
          <div className="sound-settings-heading">
            <span>A LITTLE ATMOSPHERE</span>
            <button
              aria-label="Close jazz settings"
              onClick={() => {
                setSettings(false);
                settingsButton.current.focus();
              }}
            >
              <X size={15} />
            </button>
          </div>
          <strong>Jazz Brunch</strong>
          <p>Kevin MacLeod</p>
          <label className="music-volume">
            <Volume2 size={16} />
            <span className="sr-only">Music volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
            />
            <output>{Math.round(volume * 100)}%</output>
          </label>
          <div className="sound-settings-footer">
            <button onClick={toggle} disabled={loading}>
              {playing ? <Pause size={13} /> : <Music2 size={13} />}
              {playing ? "Pause music" : "Play music"}
            </button>
            <button
              onClick={() => {
                setSettings(false);
                onCredits();
              }}
            >
              Music credits ↗
            </button>
          </div>
          {error && (
            <p className="sound-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
      <span className="sr-only" role="status">
        {playing ? "Jazz music playing" : "Jazz music paused"}
      </span>
    </div>
  );
}
