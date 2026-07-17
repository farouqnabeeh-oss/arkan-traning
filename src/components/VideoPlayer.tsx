'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Settings } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  watermarkText: string;
  startAt?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  watermarkText,
  startAt = 0,
  onProgress,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isPlaying && showControls) {
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showControls, isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Do not trigger if typing in comments or note inputs
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setShowControls(true);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    setShowControls(true);
  };

  const adjustVolume = (amount: number) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(volume + amount, 1));
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
    setShowControls(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    if (onProgress && duration) {
      onProgress(current, duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (startAt > 0 && startAt < videoRef.current.duration - 5) {
      videoRef.current.currentTime = startAt;
      setCurrentTime(startAt);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleSpeedChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl group select-none"
    >
      {/* Video Tag */}
      <video
        ref={videoRef}
        src={videoUrl}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Floating Anti-Piracy Watermark */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-brand-white/10 text-xs md:text-sm font-inter tracking-widest pointer-events-none select-none select-none z-10 font-bold"
        style={{
          transform: `translate(${Math.sin(currentTime / 5) * 50}px, ${Math.cos(currentTime / 5) * 30}px) rotate(-15deg)`,
          transition: 'transform 0.5s ease-out',
        }}
      >
        {watermarkText} • ARKAN SECURITY
      </div>

      {/* Stylized custom controls overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-white text-xs font-inter">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full accent-brand-royal h-1 cursor-pointer bg-white/20 rounded-lg appearance-none transition-all hover:h-1.5"
          />
          <span className="text-white text-xs font-inter">{formatTime(duration)}</span>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-brand-royal transition-colors">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Skip Back */}
            <button onClick={() => skip(-10)} className="text-white/80 hover:text-brand-royal transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip Forward */}
            <button onClick={() => skip(10)} className="text-white/80 hover:text-brand-royal transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-brand-royal transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 transition-all duration-300 accent-brand-royal h-1 cursor-pointer bg-white/25 rounded-lg appearance-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Speed settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-white hover:text-brand-royal text-xs font-bold transition-colors py-1 px-2 border border-white/20 rounded"
              >
                <Settings className="w-3.5 h-3.5" />
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 left-0 bg-brand-dark/95 border border-brand-royal/20 rounded-lg overflow-hidden flex flex-col min-w-[70px] shadow-xl z-30 text-center font-inter text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-3 py-2 text-white hover:bg-brand-royal hover:text-brand-dark transition-colors ${
                        playbackRate === rate ? 'bg-brand-royal/15 text-brand-royal font-bold' : ''
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-brand-royal transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
