import React from 'react';
import { Play, Pause, Volume2, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**  LIST YOUR TRACKS HERE  */
const TRACKS = [
  { id: 'lofi1',       label: 'Lo-fi 1',      icon: '🎧', src: '/sounds/lofi1.mp3' },
  { id: 'lofi2',       label: 'Lo-fi 2',      icon: '🎧', src: '/sounds/lofi2.mp3' },
  { id: 'piano',       label: 'Piano loop',   icon: '🎹', src: '/sounds/piano-loop.mp3' },
  { id: 'rainForest',  label: 'Rain – Forest',icon: '🌧️', src: '/sounds/rain-forest.mp3' },
  { id: 'rainTown',    label: 'Rain – Town',  icon: '🌧️', src: '/sounds/rain-town.mp3' },
  { id: 'waves',       label: 'Waves',        icon: '🌊',  src: '/sounds/waves.mp3' },
  { id: 'campfire',    label: 'Campfire',     icon: '🔥',  src: '/sounds/campfire.mp3' }, // add file when ready
];

export default function LofiMixer({ className = 'fixed bottom-6 right-6' }) {
    /* Audio objects are created only in the client */
    const audios = React.useRef(null);

    React.useEffect(() => {
      audios.current = Object.fromEntries(
        TRACKS.map(t => [t.id, new Audio(t.src)])
      );
    }, []);


/* auto-pause on unmount */
  React.useEffect(() => {
  return () => {
        if (!audios.current) return;
        Object.values(audios.current).forEach(a => a.pause());
      };
    }, []);

// ensure state contains an entry for every track (handles hot-reload)
React.useEffect(() => {
  setState(s => {
    const copy = { ...s };
    TRACKS.forEach(t => {
      if (!copy[t.id]) copy[t.id] = { playing: false, vol: 0.7 };
    });
    return copy;
  });
}, []);

  const [state, setState] = React.useState(
    () => Object.fromEntries(TRACKS.map(t => [t.id, { playing: false, vol: 0.7 }]))
  );
  const [open, setOpen] = React.useState(false);

  /* update volume/playback when state changes */
  React.useEffect(() => {
    if (!audios.current) return;         
      for (const id in audios.current) {
        const { playing = false, vol = 0.7 } = state[id] ?? {};
        const audio = audios.current[id];
        audio.loop   = true;
        audio.volume = vol;
        if (playing && audio.paused)  audio.play().catch(() => {/* ignore */});
        if (!playing && !audio.paused) audio.pause();
    }
  }, [state, audios]);

  /** toggle one track */
  const toggle = (id) =>
    setState(s => ({ ...s, [id]: { ...s[id], playing: !s[id]?.playing } }));

  const setVol = (id, v) =>
    setState(s => ({ ...s, [id]: { ...s[id], vol: v } }));

  /** overall circle status */
  const anyPlaying = Object.values(state).some(t => t.playing);

  return (
    <motion.div className={`${className} group`} initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>

      {/* ---- main circle ---- */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-earth-700/80
                   flex items-center justify-center shadow-lg text-white focus:outline-none"
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
      >
        {anyPlaying ? <Pause size={28} /> : <Music2 size={28} />}
      </motion.button>

      {/* ---- dropdown panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 bottom-24 w-64 bg-soft-peach rounded-xl shadow-lg p-4 space-y-3"
          >
            {TRACKS.map(track => {
              const { playing = false, vol = 0.7 } = state[track.id] ?? {};
              return (
                <div key={track.id} className="flex items-center space-x-3">
                  <span className="text-xl">{track.icon}</span>

                  {/* play / pause */}
                  <button
                    onClick={() => toggle(track.id)}
                    className="p-1 bg-accent rounded hover:bg-accent-hover"
                  >
                    {playing ? (
                      <Pause size={14} className="text-earth-900" />
                    ) : (
                      <Play size={14} className="text-earth-900 ml-0.5" />
                    )}
                  </button>

                  {/* label */}
                  <span className="flex-1 text-sm text-earth-700 truncate">{track.label}</span>

                  {/* volume */}
                  <Volume2 size={16} className="text-earth-700" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vol}
                    onChange={(e) => setVol(track.id, parseFloat(e.target.value))}
                    className="w-20 h-1 accent-earth-700 cursor-pointer"
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
