/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Play, Pause, ChevronRight, ChevronLeft, Volume2, VolumeX, ArrowUp, Zap, Globe, Sparkles } from 'lucide-react';
import { PLANETS, SPACE_MUSIC_URL, GALAXY_IMAGE, LAUNCH_SFX_URL, ENGINE_HUM_URL } from './constants';

export default function App() {
  const [pos, setPos] = useState(3); // 3 is Earth
  const [viewMode, setViewMode] = useState<'galaxy' | 'solar' | 'void'>('solar');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTime, setStoryTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const launchRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.preservesPitch = false;
    }
    if (engineRef.current) {
      engineRef.current.volume = 0.6;
    }
    if (launchRef.current) {
      launchRef.current.volume = 1.0;
    }
  }, []);

  // Story Mode Logic
  useEffect(() => {
    if (!isStoryMode || !hasStarted) return;

    const startTime = Date.now();
    const duration = 45000; // 45 seconds total

    const updateStory = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1000; // seconds
      setStoryTime(progress);

      if (elapsed < duration) {
        requestAnimationFrame(updateStory);
        
        // --- NARRATIVE CONTROL ---
        
        // 0-5s: Launch from Earth to Mercury
        if (progress < 5) {
          setViewMode('solar');
          const t = progress / 5;
          setPos(3 - t * 2); // Transition from Earth (3) to Mercury (1)
          setMousePos({ x: window.innerWidth / 2, y: window.innerHeight * (0.8 - t * 0.3) });
        }
        // 5-15s: Ascent into Galaxy
        else if (progress < 15) {
          setViewMode('galaxy');
          const t = (progress - 5) / 10;
          setMousePos({ x: window.innerWidth / 2 + Math.sin(progress) * 50, y: window.innerHeight * 0.5 - t * 200 });
        }
        // 15-20s: Galaxy Bloom
        else if (progress < 20) {
          setViewMode('galaxy');
          setMousePos({ x: window.innerWidth / 2 + Math.sin(progress) * 100, y: window.innerHeight * 0.2 });
        }
        // 20-25s: Dive back to Solar
        else if (progress < 25) {
          setViewMode('solar');
          const t = (progress - 20) / 5;
          setMousePos({ x: window.innerWidth / 2, y: window.innerHeight * (0.2 + t * 0.3) });
        }
        // 25-40s: Grand Tour
        else if (progress < 40) {
          setViewMode('solar');
          const t = (progress - 25) / 15; 
          setPos(t * (PLANETS.length - 1)); 
          setMousePos({ 
            x: window.innerWidth / 2 + Math.cos(progress * 2) * 30, 
            y: window.innerHeight * 0.5 + Math.sin(progress) * 20 
          });
        }
        // 40-45s: Descent into Void
        else {
          setViewMode('void');
          const t = (progress - 40) / 5;
          setMousePos({ x: window.innerWidth / 2, y: window.innerHeight * (0.5 + t * 0.5) });
        }
      } else {
        setIsStoryMode(false);
      }
    };

    const animId = requestAnimationFrame(updateStory);
    return () => cancelAnimationFrame(animId);
  }, [isStoryMode, hasStarted]);

  // Dynamic Audio Modulation
  useEffect(() => {
    if (!hasStarted || !engineRef.current || isAudioMuted) return;

    // Calculate intensity based on velocity (movement speed)
    const rawIntensity = (Math.abs(velocity.x) + Math.abs(velocity.y));
    const intensity = Math.min(1, rawIntensity * 0.8);
    
    // Base volume depends on view mode - ensuring it's audible even at rest
    let baseVolume = 0.4;
    if (viewMode === 'galaxy') baseVolume = 0.1;
    else if (viewMode === 'void') baseVolume = 0.2;

    // Final volume is base + movement boost
    engineRef.current.volume = Math.min(1, baseVolume + (intensity * 0.4));
    
    // Pitch modulation for engine "strain"
    engineRef.current.playbackRate = 1 + (intensity * 0.2);
    
    if (audioRef.current) {
      audioRef.current.volume = 0.6 + (intensity * 0.2);
    }
  }, [velocity, viewMode, hasStarted, isAudioMuted]);

  const currentPlanet = useMemo(() => {
    const roundedPos = Math.round(pos);
    return PLANETS.find(p => p.pos === roundedPos) || PLANETS[0];
  }, [pos]);

  const handleStart = async (story: boolean = false) => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsStoryMode(story);
    
    const playSafe = async (ref: React.RefObject<HTMLAudioElement | null>) => {
      if (ref.current) {
        try {
          ref.current.currentTime = 0;
          await ref.current.play();
        } catch (e) {
          console.warn("Audio play blocked, trying fallback:", e);
          // Retry on user interaction just in case
        }
      }
    };

    // Run sequentially to ensure browser registers interaction
    await playSafe(launchRef);
    await playSafe(audioRef);
    await playSafe(engineRef);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasStarted || isStoryMode) return;
    const { clientX, clientY, currentTarget } = e;
    const width = currentTarget.clientWidth;
    const height = currentTarget.clientHeight;
    
    // Calculate velocity for tilting
    const currentVelX = (clientX - lastMousePos.current.x) * 0.1;
    const currentVelY = (clientY - lastMousePos.current.y) * 0.1;
    setVelocity({ x: currentVelX, y: currentVelY });
    lastMousePos.current = { x: clientX, y: clientY };

    setMousePos({ x: clientX, y: clientY });

    // Vertical Navigation: Determine View Mode based on Y position
    const yPercentage = clientY / height;
    if (yPercentage < 0.2) {
      if (viewMode !== 'galaxy') setViewMode('galaxy');
    } else if (yPercentage > 0.8) {
      if (viewMode !== 'void') setViewMode('void');
    } else {
      if (viewMode !== 'solar') setViewMode('solar');
    }

    // Horizontal Navigation: Only update planet position when in Solar mode
    if (viewMode === 'solar') {
      const xPercentage = clientX / width;
      const range = PLANETS.length - 1;
      // Added padding so edges (Sun/Pluto) are easier to hit and centered
      const targetPos = (xPercentage * (range + 0.8)) - 0.4;
      setPos(Math.max(0, Math.min(range, targetPos)));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!hasStarted) return;
    if (e.deltaY < -40) {
      if (viewMode === 'solar') setViewMode('galaxy');
      else if (viewMode === 'void') setViewMode('solar');
    } else if (e.deltaY > 40) {
      if (viewMode === 'galaxy') setViewMode('solar');
      else if (viewMode === 'solar') setViewMode('void');
    }
  };

  const playWhoosh = () => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio whoosh failed", e);
    }
  };

  const togglePlay = () => {
    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);
    if (audioRef.current) {
      if (nextPlayState) audioRef.current.play();
      else audioRef.current.pause();
    }
    if (engineRef.current) {
      if (nextPlayState) engineRef.current.play();
      else engineRef.current.pause();
    }
  };

  const toggleMute = () => {
    const nextMuteState = !isAudioMuted;
    setIsAudioMuted(nextMuteState);
    if (audioRef.current) audioRef.current.muted = nextMuteState;
    if (engineRef.current) engineRef.current.muted = nextMuteState;
    if (launchRef.current) launchRef.current.muted = nextMuteState;
  };

  const moveLeft = () => {
    if (pos > 0) {
      setPos(prev => prev - 1);
      playWhoosh();
    }
  };

  const moveRight = () => {
    if (pos < PLANETS.length - 1) {
      setPos(prev => prev + 1);
      playWhoosh();
    }
  };

  const toggleGalaxy = () => {
    setViewMode(viewMode === 'galaxy' ? 'solar' : 'galaxy');
  };

  return (
    <div 
      className="relative h-screen w-full bg-[#020202] overflow-hidden select-none font-sans text-white cursor-none" 
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onClick={() => { if (!hasStarted) handleStart(); }}
    >
      <audio ref={audioRef} src={SPACE_MUSIC_URL} loop preload="auto" />
      <audio ref={launchRef} src={LAUNCH_SFX_URL} preload="auto" />
      <audio ref={engineRef} src={ENGINE_HUM_URL} loop preload="auto" />

      {/* Entry Overlay */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <Rocket size={80} className="text-orange-500 animate-bounce mb-4" />
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
              </div>
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Initialize Odyssey</h1>
                <p className="text-white/40 text-sm tracking-[0.3em] font-mono">System Status: Ready for Launch</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => handleStart(false)}
                  className="group relative px-10 py-4 bg-white/10 text-white font-black text-xs uppercase tracking-[0.5em] rounded-full hover:bg-white hover:text-black transition-all duration-500 overflow-hidden border border-white/20"
                >
                  <span className="relative z-10">Free Explore</span>
                </button>
                <button 
                  onClick={() => handleStart(true)}
                  className="group relative px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.5em] rounded-full hover:bg-orange-500 hover:text-white transition-all duration-500 overflow-hidden"
                >
                  <span className="relative z-10">Watch Cinematic Story</span>
                  <motion.div 
                    className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                  />
                </button>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-widest mt-12 animate-pulse">Click anywhere to begin</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Story Progress Indicator */}
      {isStoryMode && (
        <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[1001]">
          <motion.div 
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(storyTime / 45) * 100}%` }}
          />
        </div>
      )}

      {/* Cinematic Overlays */}
      {isStoryMode && storyTime > 40 && (
        <motion.div 
          className="fixed inset-0 bg-black z-[1005] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: (storyTime - 40) / 5 }}
        />
      )}

      <motion.div
        className="fixed z-[999] pointer-events-none"
        animate={{ 
          x: mousePos.x,
          y: mousePos.y,
          rotate: (viewMode === 'galaxy' ? -45 : viewMode === 'void' ? 45 : 0) + (velocity.x * 0.5) + (isStoryMode ? Math.sin(storyTime * 2) * 5 : 0),
          scale: 1 + Math.abs(velocity.x + velocity.y) * 0.005 + (isStoryMode ? 0.1 : 0)
        }}
        transition={{ 
          type: 'spring', 
          damping: isStoryMode ? 50 : 35, 
          stiffness: isStoryMode ? 100 : 300, 
          mass: 0.5 
        }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
           {/* Propulsion */}
           <motion.div 
            animate={{ 
              height: [30, 70, 30],
              opacity: [0.5, 0.9, 0.5],
              scaleX: [1, 1.2, 1]
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-t from-orange-600 via-orange-400 to-white rounded-full blur-sm"
          />
          <Rocket size={56} className="text-white fill-white/20 drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" />
        </div>
      </motion.div>
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute inset-0"
          animate={{
            x: -mousePos.x / 60,
            y: -mousePos.y / 60
          }}
        >
          {[...Array(200)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white transition-opacity duration-1000"
              style={{
                top: `${Math.random() * 120 - 10}%`,
                left: `${Math.random() * 120 - 10}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: viewMode === 'void' ? 0.05 : 0.3 + Math.random() * 0.4
              }}
            />
          ))}
        </motion.div>
        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ${viewMode === 'galaxy' ? 'from-purple-900/40 to-blue-900/40' : 'from-black via-black/95 to-transparent'}`} />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'galaxy' ? (
          <motion.div
            key="galaxy"
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center overflow-hidden"
          >
            <img src={GALAXY_IMAGE} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] brightness-[0.4]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

            <div className="relative z-10 space-y-10 p-12">
              <span className="text-xs uppercase tracking-[1em] text-orange-400 font-black">Andromeda Outer Layer</span>
              <h1 className="text-7xl md:text-[12rem] font-black italic tracking-tighter uppercase leading-none">
                THE MILKY WAY <br/> <span className="text-stroke">GALAXY</span>
              </h1>
              <p className="text-2xl text-gray-400 font-medium italic max-w-3xl mx-auto">“A billion stars, one destination.”</p>
            </div>
          </motion.div>
        ) : viewMode === 'void' ? (
          <motion.div
            key="void"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center"
          >
            <div className="space-y-6 text-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping mx-auto" />
              <p className="text-xs uppercase tracking-[1.2rem] text-white/30 font-black">THE GREAT VOID</p>
              <p className="text-gray-600 text-sm italic">“Deep space exploration active... signal fading...”</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="solar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-24"
          >
            {/* Orbital Paths Decoration (Vertical) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-20">
              {PLANETS.map((planet) => {
                const distance = Math.abs(planet.pos - pos);
                const isActive = distance < 0.5;
                const size = 700 + planet.pos * 200;
                return (
                  <motion.div
                    key={`orbit-${planet.id}`}
                    animate={{ 
                      scale: isActive ? 1.05 : 1,
                      opacity: isActive ? 0.6 : 0.2,
                      borderColor: isActive ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    style={{
                      width: size,
                      height: size,
                      borderWidth: '1px',
                      borderRadius: '100%',
                      position: 'absolute',
                      transform: 'rotateY(85deg) rotateX(10deg)', // Vertical perspective tilt
                      boxShadow: isActive ? '0 0 50px rgba(249, 115, 22, 0.2)' : 'none'
                    }}
                  />
                );
              })}
            </div>

            {/* Horizontal Planet Slider */}
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
              <div 
                className="flex items-center" 
                style={{ 
                  transform: `translateX(${-pos * 800 + (window.innerWidth / 2) - 400}px)`,
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {PLANETS.map((planet) => {
                  const isActive = Math.round(pos) === planet.pos;
                  const distance = Math.abs(planet.pos - pos);
                  // Scale and opacity adjustments for better visibility of all planets
                  const scale = isActive ? 1.5 : 0.7 + (1 - Math.min(1, distance * 0.2)) * 0.3;
                  const opacity = Math.max(0.2, 1 - (distance * 0.3));
                  const rotateY = (planet.pos - pos) * 15;

                  return (
                    <motion.div
                      key={planet.id}
                      animate={{ 
                        scale: scale,
                        opacity: opacity,
                        filter: isActive ? 'blur(0px)' : `blur(${Math.min(10, distance * 2)}px)`,
                        rotateY: rotateY,
                        z: isActive ? 200 : -200
                      }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative w-[800px] h-screen shrink-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ perspective: '1200px' }}
                    >
                      <div className="relative">
                        {/* Aura specifically for the planet */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${planet.color} opacity-20 blur-[150px] rounded-full scale-150 transition-opacity duration-1000 ${isActive ? 'opacity-40' : 'opacity-5'}`} />
                        
                        <div className={`relative w-[480px] h-[480px] rounded-full overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] border-2 border-white/5 ring-[1px] ring-white/10 transition-all duration-700 ${isActive ? 'scale-110 shadow-[0_0_200px_rgba(255,255,255,0.05)]' : 'scale-100'}`}>
                          {/* Animated Texture Rotation for 3D Feel */}
                          <motion.div
                            animate={{ x: isActive ? [-100, 100, -100] : 0 }}
                            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-[300%] h-full left-[-100%]"
                          >
                            <img 
                              src={planet.image} 
                              alt={planet.name}
                              className="w-full h-full object-cover brightness-[1.1] contrast-[1.2]"
                              referrerPolicy="no-referrer"
                            />
                          </motion.div>
                          
                          {/* 3D Sphere Shading */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_20%,rgba(0,0,0,0.9)_90%)] z-10" />
                          
                          {/* Saturn Rings Overlay */}
                          {planet.name === 'Saturn' && (
                            <div className="absolute inset-x-[-65%] top-1/2 h-[35%] -translate-y-1/2 pointer-events-none z-30 opacity-70">
                              <div className="w-full h-full border-[25px] border-orange-200/30 rounded-[100%] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] rotate-[-5deg]" />
                            </div>
                          )}

                          <div className={`absolute inset-0 bg-gradient-to-tr ${planet.color} mix-blend-overlay opacity-30 z-20`} />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_30%)] z-30" />
                          <div className={`absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(255,255,255,0.2)] z-40`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Global Static Info Display (Synced to Focus) */}
            <div className="absolute bottom-[18%] left-0 w-full z-50 pointer-events-none px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlanet.id}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-[12rem] md:text-[16rem] font-black italic tracking-tighter uppercase mb-[-4rem] drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] leading-none text-white overflow-hidden whitespace-nowrap">
                    {currentPlanet.name}
                  </h2>
                  
                  <div className="bg-black/80 backdrop-blur-3xl border border-white/10 p-12 rounded-[50px] max-w-2xl w-full mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden pointer-events-auto">
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentPlanet.color} opacity-10`} />
                    
                    <div className="relative z-10 grid grid-cols-2 gap-8 mb-8 text-left border-b border-white/10 pb-8">
                      <div>
                        <p className="text-[10px] text-orange-500 uppercase tracking-[0.3em] font-black mb-1">Mass</p>
                        <p className="text-xl font-bold font-mono">{currentPlanet.mass}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-orange-500 uppercase tracking-[0.3em] font-black mb-1">Orbit Period</p>
                        <p className="text-xl font-bold font-mono">{currentPlanet.period}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-orange-500 uppercase tracking-[0.3em] font-black mb-1">Surface Type</p>
                        <p className="text-xl font-bold font-mono">{currentPlanet.composition}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-orange-500 uppercase tracking-[0.3em] font-black mb-1">Temperature</p>
                        <p className="text-xl font-bold font-mono">{currentPlanet.temp}</p>
                      </div>
                    </div>

                    <p className="text-gray-200 text-lg font-medium tracking-wide leading-relaxed italic relative text-left flex items-start">
                      <Globe className="mr-4 text-orange-500 w-6 h-6 shrink-0 mt-1" />
                      {currentPlanet.fact}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation HUD */}
      <div className="absolute top-0 w-full p-12 flex justify-between items-center z-[100] mix-blend-difference">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
            <Sparkles className="text-white w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-black tracking-tighter text-3xl italic block leading-none">CELESTIAL</span>
            <span className="text-[10px] tracking-[0.5em] font-black opacity-60">ODYSSEY DRIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={toggleMute} className="p-5 bg-white/5 glass-panel rounded-full transition-all text-white border border-white/10 hover:bg-white/10">
            {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={togglePlay} className="flex items-center gap-4 px-10 py-5 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all text-sm tracking-widest shadow-2xl">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isPlaying ? 'FREEZE' : 'LAUNCH'}
          </button>
        </div>
      </div>

      {/* Planetary Line Map */}
      <motion.div 
        animate={{ opacity: viewMode === 'solar' ? 1 : 0, y: viewMode === 'solar' ? 0 : 20 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl flex justify-center items-end gap-3 md:gap-6 px-10 h-14"
      >
        {PLANETS.map((planet) => {
          const isActive = Math.round(pos) === planet.pos;
          return (
            <div 
              key={planet.id} 
              className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto min-w-[30px] md:min-w-[50px]"
              onMouseEnter={() => {
                setPos(planet.pos);
                playWhoosh();
              }}
              onClick={() => {
                setPos(planet.pos);
                playWhoosh();
              }}
            >
              <div className={`w-1.5 rounded-full transition-all duration-700 ${isActive ? 'h-10 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'h-3 bg-white/20 group-hover:bg-white/50'}`} />
              <span className={`text-[8px] md:text-[10px] font-black tracking-widest transition-all duration-700 ${isActive ? 'opacity-100 scale-110 text-orange-400' : 'opacity-40 scale-90 text-white/50'}`}>
                {planet.name.toUpperCase()}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation HUD Status */}
      <div className="absolute bottom-12 left-12 z-[100] space-y-4 font-mono text-[10px] tracking-[0.5em] uppercase font-black">
        <motion.div 
          animate={{ opacity: viewMode === 'galaxy' ? 1 : 0.1, x: viewMode === 'galaxy' ? 0 : -10 }}
          className="flex items-center gap-4 transition-all duration-700"
        >
          <div className={`w-3 h-3 rounded-full ${viewMode === 'galaxy' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-white/20'}`} />
          <span className={viewMode === 'galaxy' ? 'text-white' : 'text-white/20'}>Andromeda_Outer_Layer</span>
        </motion.div>
        
        <motion.div 
          animate={{ opacity: viewMode === 'solar' ? 1 : 0.1, x: viewMode === 'solar' ? 0 : -10 }}
          className="flex items-center gap-4 transition-all duration-700"
        >
          <div className={`w-3 h-3 rounded-full ${viewMode === 'solar' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-white/20'}`} />
          <span className={viewMode === 'solar' ? 'text-white' : 'text-white/20'}>Solar_Core_System</span>
        </motion.div>

        <motion.div 
          animate={{ opacity: viewMode === 'void' ? 1 : 0.1, x: viewMode === 'void' ? 0 : -10 }}
          className="flex items-center gap-4 transition-all duration-700"
        >
          <div className={`w-3 h-3 rounded-full ${viewMode === 'void' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-white/20'}`} />
          <span className={viewMode === 'void' ? 'text-white' : 'text-white/20'}>Deep_Void_Depths</span>
        </motion.div>
      </div>

      <div className="absolute bottom-12 right-12 z-[100] text-right pointer-events-none opacity-60">
        <p className="text-[10px] font-black tracking-[0.5em] text-white/50 uppercase mb-2">Drive Status</p>
        <p className="text-2xl font-black italic tracking-tighter text-white">
          {viewMode === 'solar' ? 'TETHERED_ORBIT' : viewMode === 'galaxy' ? 'HYPER_DRIVE' : 'STASIS_MODE'}
        </p>
      </div>

      <style>{`
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
          color: transparent;
        }
        .play-btn-shadow {
          box-shadow: 0 0 50px rgba(234, 88, 12, 0.5);
        }
      `}</style>
    </div>
  );
}
