import { useState, useRef } from 'react';
import { FaMusic } from 'react-icons/fa/index.js'

export default function LofiCircle() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState({
    piano: false,
    rainTown: false,
    rainForest: false,
    waves: false,
    lofi2: false,
  });

  const audioRefs = {
    piano: useRef(),
    rainTown: useRef(),
    rainForest: useRef(),
    waves: useRef(),
    lofi2: useRef(),
  };

  const toggleAudio = (key) => {
    const isNowPlaying = !playing[key];
    setPlaying((prev) => ({ ...prev, [key]: isNowPlaying }));
    const audio = audioRefs[key].current;

    if (audio) {
      if (isNowPlaying) audio.play();
      else audio.pause();
    }
  };

  const changeVolume = (key, value) => {
    const audio = audioRefs[key].current;
    if (audio) audio.volume = parseFloat(value);
  };

  const soundOptions = [
    { key: 'piano', label: 'Lofi Piano', src: '/sounds/piano-loop.mp3' },
    { key: 'rainTown', label: 'Rain – Town', src: '/sounds/rain-town.mp3' },
    { key: 'rainForest', label: 'Rain – Forest', src: '/sounds/rain-forest.mp3' },
    { key: 'waves', label: 'Waves', src: '/sounds/waves.mp3' },
    { key: 'lofi2', label: 'Lofi Loop 2', src: '/sounds/lofi2.mp3' },
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#e7d3c0] text-[#3d2c1a] rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:scale-105 transition-all"
      >
        <FaMusic className="text-xl" />
      </button>

      {open && (
        <div className="mt-2 p-4 bg-white rounded-xl shadow-xl space-y-3 w-64">
          {soundOptions.map(({ key, label, src }) => (
            <div key={key} className="space-y-1">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={playing[key]}
                  onChange={() => toggleAudio(key)}
                />
                {label}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue={key === 'piano' ? 0.5 : 0.3}
                onChange={(e) => changeVolume(key, e.target.value)}
                className="w-full"
              />
              <audio ref={audioRefs[key]} src={src} loop />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
