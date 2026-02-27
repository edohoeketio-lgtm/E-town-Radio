import { RadioProvider } from '../context/RadioProvider';
import { useRadio, useAudioEngine } from '../hooks/useRadio';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Sliders, Activity, Bell, Headphones, Zap, Search, ChevronRight } from '../components/ui/Icons';
import { cn } from '../lib/utils';
import { SpotifyService, hasSpotifyClientId } from '../lib/spotify';
import { SpotifyPlaylist } from '../types/radio';

/* ═══════════════════════════════════════════════════════════════
   PREMIUM STUDIO COMPONENTS (Architectural Precision)
   ═══════════════════════════════════════════════════════════════ */

/* ─── Spectral Visualizer (Canvas Driven) ─── */
function SpectralVisualizer({ isPlaying }: { isPlaying: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            if (isPlaying) {
                ctx.beginPath();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#ff2d55';

                for (let x = 0; x < width; x += 3) {
                    const noise = Math.random() * (height * 0.4);
                    const y = height / 2 + (Math.sin(x * 0.05 + Date.now() * 0.01) * noise);
                    ctx.moveTo(x, height / 2);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Subtle Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 45, 85, 0.4)';
            } else {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying]);

    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center p-8 overflow-hidden rounded-2xl hardware-inset">
            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full opacity-60" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black" />
        </div>
    );
}

/* ─── LED Signal Level ─── */
function SignalLevel({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-baseline px-0.5">
                <span className="text-[7px] font-black tracking-[0.3em] uppercase text-white/30">{label}</span>
                <span className="text-[10px] font-mono font-medium text-white/20">{(value * 10).toFixed(1)} dB</span>
            </div>
            <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden flex gap-[2px]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        value > 0.8 ? "bg-accent" : value > 0.6 ? "bg-amber-400" : "bg-white/40"
                    )}
                />
            </div>
        </div>
    );
}

/* ─── Studio Fader ─── */
function StudioFader({ id, label, value, onDoubleClick }: { id: string; label: string; value: number; onDoubleClick: () => void }) {
    const { dispatch } = useRadio();
    const isModified = value !== 0.5;

    return (
        <div className="flex flex-col items-center gap-6 group py-4">
            <div className="flex flex-col items-center gap-1">
                <span className={cn("text-[9px] font-black tracking-[0.2em] uppercase transition-colors", isModified ? "text-accent" : "text-white/20")}>
                    {label}
                </span>
                <span className="text-[10px] font-mono font-bold text-white/10 tabular-nums">
                    {Math.round(value * 100)}%
                </span>
            </div>

            <div className="relative h-48 w-8 flex justify-center">
                {/* Visual Rail */}
                <div className="absolute inset-y-0 w-[2px] bg-white/[0.03] rounded-full" />

                {/* Level Scale */}
                <div className="absolute inset-y-0 -left-6 flex flex-col justify-between py-1 pointer-events-none opacity-10">
                    {[12, 6, 0, -6, -24, '-∞'].map(m => <span key={m.toString()} className="text-[7px] font-mono text-white">{m}</span>)}
                </div>

                <input
                    type="range" min="0" max="1" step="0.01"
                    value={value}
                    onDoubleClick={onDoubleClick}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (id === 'bpm') dispatch({ type: 'UPDATE_PARAMS', payload: { bpm: val * 120 + 60 } });
                        else dispatch({ type: 'UPDATE_PARAMS', payload: { [id]: val } });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-10 [appearance:slider-vertical]"
                />

                {/* Precision Thumb */}
                <motion.div
                    className={cn(
                        "absolute w-12 h-10 bg-[#151515] border border-white/10 rounded-sm flex flex-col items-center justify-center gap-[2px] pointer-events-none shadow-2xl",
                        isModified && "border-accent/40 bg-accent/5"
                    )}
                    style={{ bottom: `calc(${value * 100}% - 20px)` }}
                >
                    <div className="w-8 h-[1px] bg-white/5" />
                    <div className={cn("w-full h-[4px] shadow-inner", isModified ? 'bg-accent' : 'bg-white/10')} />
                    <div className="w-8 h-[1px] bg-white/5" />
                </motion.div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SOURCE LINKER MODAL
   ═══════════════════════════════════════════════════════════════ */

function SourceLinkerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { state, dispatch } = useRadio();
    const [step, setStep] = useState<'source' | 'search' | 'connecting'>('source');
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const sources = [
        { id: 'spotify', name: 'Spotify', icon: '💿' },
        { id: 'apple', name: 'Apple Music', icon: '🍎' },
        { id: 'youtube', name: 'YouTube Music', icon: '▶️' },
        { id: 'local', name: 'Local Folder', icon: '📁' }
    ];

    const handleSelectSource = async (id: string) => {
        setSelectedSource(id);

        if (id === 'spotify') {
            await SpotifyService.authorize();
        } else {
            setStep('connecting');
            setTimeout(() => setStep('search'), 1500);
        }
    };

    // Real-time search if connected
    useEffect(() => {
        if (selectedSource === 'spotify' && searchQuery.length > 2) {
            const spotifySource = state.stations.find(s => s.id === state.activeStationId)
                ?.linkedSources?.find(src => src.type === 'spotify');

            if (spotifySource?.accessToken) {
                const timeout = setTimeout(() => {
                    SpotifyService.searchPlaylists(spotifySource.accessToken!, searchQuery)
                        .then(setPlaylists)
                        .catch(console.error);
                }, 500);
                return () => clearTimeout(timeout);
            }
        }
    }, [searchQuery, selectedSource, state.stations, state.activeStationId]);

    const filteredPlaylists = playlists.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectPlaylist = (playlist: SpotifyPlaylist) => {
        dispatch({ type: 'ADD_LOG', text: `Ingested Spotify Playlist: ${playlist.name}` });
        onClose();
    };

    // Auto-fetch playlists if already connected
    useEffect(() => {
        const spotifySource = state.stations.find(s => s.id === state.activeStationId)
            ?.linkedSources?.find(src => src.type === 'spotify');

        if (spotifySource?.connected && spotifySource.accessToken && playlists.length === 0) {
            SpotifyService.fetchPlaylists(spotifySource.accessToken)
                .then(setPlaylists)
                .catch(console.error);
        }
    }, [state.stations, state.activeStationId, playlists.length]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-[#080808] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-white/40">Music Source Ingest</h2>
                                <p className="text-[8px] font-mono text-accent/60 uppercase">DDS-LINK NODE: ACTIVE</p>
                            </div>
                            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>

                        {/* Content */}
                        <div className="p-12 min-h-[400px] flex flex-col justify-center">
                            {step === 'source' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {sources.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSelectSource(s.id)}
                                            className="group flex flex-col items-start p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all text-left relative"
                                        >
                                            {s.id === 'spotify' && !hasSpotifyClientId && (
                                                <div className="absolute top-4 right-4 text-[7px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 tracking-widest uppercase">Setup Required</div>
                                            )}
                                            <span className="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white transition-colors">{s.name}</span>
                                            <span className="text-[8px] font-bold text-white/10 uppercase mt-2">Connect Account</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 'connecting' && (
                                <div className="flex flex-col items-center gap-8 py-12">
                                    <div className="w-16 h-16 rounded-full border border-accent/20 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full border-t border-accent animate-spin" />
                                        <Zap className="text-accent" size={24} />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-sm font-bold text-white uppercase tracking-widest">Handshaking with {selectedSource}...</span>
                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Establishing Secure DDS_Tunnel</span>
                                    </div>
                                </div>
                            )}

                            {step === 'search' && (
                                <div className="flex flex-col gap-8">
                                    <div className="relative">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={`SEARCH ${selectedSource?.toUpperCase()} DATABASE...`}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm font-medium text-white placeholder:text-white/10 outline-none focus:border-accent/40 transition-all"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 ml-2">
                                            {selectedSource === 'spotify' ? 'Your Library' : 'Suggested Playlists'}
                                        </span>
                                        {(selectedSource === 'spotify' ? filteredPlaylists : [
                                            { id: 'm1', name: 'High Frequency Night', tracksCount: 42 },
                                            { id: 'm2', name: 'Midnight FM Selects', tracksCount: 128 },
                                            { id: 'm3', name: 'Digital Horizon', tracksCount: 65 },
                                            { id: 'm4', name: 'Submerged Rhythms', tracksCount: 33 }
                                        ] as SpotifyPlaylist[]).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectPlaylist(p)}
                                                className="flex items-center justify-between p-5 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 font-bold text-xs uppercase">{p.name.charAt(0)}</div>
                                                    <div className="flex flex-col items-start gap-1 text-left">
                                                        <span className="text-xs font-bold text-white/60 tracking-tight group-hover:text-white transition-colors">{p.name}</span>
                                                        {p.tracksCount && <span className="text-[8px] font-mono text-white/20 uppercase">{p.tracksCount} Tracks</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex justify-between items-center text-[8px] font-mono font-bold text-white/10 uppercase tracking-[0.3em]">
                            <span>Status: API_BRIDGE_OK</span>
                            <span>Node: XTC_SECURE_EXT_v1</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

/* ─── GO LIVE COUNTDOWN ─── */
function GoLiveCountdown({ onComplete }: { onComplete: () => void }) {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [count, onComplete]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
            <motion.div
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-[12rem] font-black text-white italic tracking-tighter"
            >
                {count > 0 ? count : "LIVE"}
            </motion.div>
            <div className="mt-8 flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Establishing Satellite Uplink</span>
                <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute top-0 bottom-0 w-1/2 bg-accent"
                    />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   STUDIO PANES
   ═══════════════════════════════════════════════════════════════ */

function SidebarPane({ onOpenLinker }: { onOpenLinker: () => void }) {
    const { state, dispatch } = useRadio();
    const { initAudio, togglePlay } = useAudioEngine();

    return (
        <aside className="w-80 border-r border-white/5 flex flex-col h-full bg-[#050505]">
            <div className="p-8 border-b border-white/5 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20 mb-1">Source Repository</h2>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-[8px] font-bold text-accent/60 uppercase">System Ready</p>
                    <button
                        onClick={onOpenLinker}
                        className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-accent transition-colors"
                    >
                        [+ Ingest]
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-1.5 custom-scrollbar">
                {state.stations.map(station => {
                    const isActive = station.id === state.activeStationId;
                    return (
                        <button
                            key={station.id}
                            onClick={() => {
                                initAudio();
                                dispatch({ type: 'SWITCH_STATION', stationId: station.id });
                                if (state.status !== 'PLAYING') setTimeout(() => togglePlay(), 50);
                            }}
                            className={cn(
                                "w-full text-left py-4 px-5 rounded-lg transition-all group border",
                                isActive
                                    ? "bg-white/[0.03] border-accent/20"
                                    : "bg-transparent border-transparent hover:bg-white/[0.01]"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-xs font-medium tracking-tight truncate",
                                    isActive ? "text-white" : "text-white/30 group-hover:text-white/60"
                                )}>
                                    {isActive ? `• ${station.name}` : station.name}
                                </span>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                )}
                            </div>
                        </button>
                    );
                })}

                {/* External Linked Sources */}
                <div className="pt-8 pb-4">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 ml-5 mb-4 block">Linked External</span>
                    <button
                        onClick={onOpenLinker}
                        className="w-full py-4 border border-dashed border-white/5 rounded-lg text-[9px] font-bold text-white/20 uppercase tracking-widest hover:border-accent/40 hover:text-accent/60 transition-all flex items-center justify-center gap-3"
                    >
                        <Music size={12} />
                        Attach Source
                    </button>
                </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40">
                <SignalLevel value={state.status === 'PLAYING' ? 0.6 : 0} label="Ingest Gain" />
            </div>
        </aside>
    );
}

function MonitorPane() {
    const { state } = useRadio();
    const isPlaying = state.status === 'PLAYING';
    const isLive = state.broadcastStatus === 'LIVE';

    return (
        <main className="flex-1 relative flex flex-col p-8 bg-black">
            {/* Top HUD */}
            <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1.5">
                    <div className={cn(
                        "px-3 py-1 rounded-sm border text-[9px] font-black tracking-[0.4em] uppercase transition-all duration-700",
                        isLive ? "border-accent text-accent bg-accent/5 shadow-[0_0_20px_rgba(255,45,85,0.15)]" : "border-white/5 text-white/10"
                    )}>
                        {state.broadcastStatus}
                    </div>
                    <div className="flex items-center gap-3 mt-2 ml-1">
                        <Activity size={10} className={isPlaying ? "text-accent/60" : "text-white/10"} />
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Clock Sync: 12ms</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Master Node</span>
                    <span className="text-[12px] font-mono font-black text-white/40">UK_W2_XTC</span>
                </div>
            </div>

            {/* Core Visualizer */}
            <div className="flex-1 mt-10 mb-10 relative">
                <SpectralVisualizer isPlaying={isPlaying} />

                {/* Minimal Track Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state.nowPlaying}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[1em] text-white/10 mb-6">Current Signal</span>
                            <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none max-w-2xl px-12">
                                {state.nowPlaying || "Ingest required"}
                            </h1>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Countdown Overlay */}
                {state.broadcastStatus === 'COUNTDOWN' && (
                    <GoLiveCountdown onComplete={() => { }} />
                )}
            </div>

            {/* Bottom Interaction HUD */}
            <div className="flex justify-between items-end z-10 px-4">
                <div className="flex gap-12">
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Latency</span>
                        <span className="text-xs font-mono font-bold text-accent/80">0.02ms</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Active Listeners</span>
                        <span className="text-xs font-mono font-bold text-white/40">1,402</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="w-48">
                        <SignalLevel value={isPlaying ? 0.72 : 0} label="Master Out L/R" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function ControlPane() {
    const { state, dispatch } = useRadio();
    const triggerFX = (label: string) => dispatch({ type: 'ADD_LOG', text: `SFX: ${label}` });
    const resetParam = (id: string) => dispatch({ type: 'UPDATE_PARAMS', payload: { [id]: 0.5 } });

    return (
        <aside className="w-80 border-l border-white/5 flex flex-col h-full bg-[#050505]">
            <div className="p-8 border-b border-white/5 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20 mb-1">Master Console</h2>
                <p className="text-[8px] font-bold text-accent/60 uppercase">Hardware 4.0</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-10">
                    <StudioFader id="density" label="Gain" value={state.density} onDoubleClick={() => resetParam('density')} />
                    <StudioFader id="bpm" label="Tempo" value={(state.bpm - 60) / 120} onDoubleClick={() => resetParam('bpm')} />
                    <StudioFader id="brightness" label="EQ" value={state.brightness} onDoubleClick={() => resetParam('brightness')} />
                </div>

                <div className="mt-10 space-y-6">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">Integrated FX Pads</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        {['AIRHORN', 'REWIND', 'DROP', 'HYPE'].map(fx => (
                            <button
                                key={fx}
                                onClick={() => triggerFX(fx)}
                                className="h-16 bg-white/[0.02] border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all active:translate-y-[1px]"
                            >
                                {fx}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="w-full mt-auto py-5 border border-white/5 bg-transparent rounded-sm text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-accent hover:border-accent/40 transition-all">
                    Release Control
                </button>
            </div>
        </aside>
    );
}

function TransportBar() {
    const { state, dispatch } = useRadio();
    const { initAudio, togglePlay } = useAudioEngine();
    const isPlaying = state.status === 'PLAYING';
    const isLive = state.broadcastStatus === 'LIVE';

    const handleTransportClick = () => {
        initAudio(); // Initialize on user gesture to avoid browser blocks
        if (state.broadcastStatus === 'STANDBY') {
            dispatch({ type: 'SET_BROADCAST_STATUS', status: 'COUNTDOWN' });
            setTimeout(() => {
                dispatch({ type: 'SET_BROADCAST_STATUS', status: 'LIVE' });
                if (!isPlaying) togglePlay();
            }, 4000);
        } else {
            togglePlay();
        }
    };

    return (
        <footer className="h-32 border-t border-white/5 bg-[#050505] flex items-center px-12 gap-16">
            <div className="w-80 flex items-center gap-6">
                <div className={cn(
                    "w-16 h-16 rounded-sm border flex items-center justify-center text-xl font-black transition-all",
                    isLive ? "border-accent/40 text-accent bg-accent/5" : "border-white/5 text-white/10"
                )}>
                    {state.nowPlaying?.charAt(0) || 'Ø'}
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">XTC Engine v4</p>
                    <p className="text-sm font-bold text-white truncate uppercase tracking-tight">Main Signal Out</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center gap-16">
                <button className="text-white/20 hover:text-white transition-colors active:scale-90"><SkipBack size={32} /></button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTransportClick}
                    className={cn(
                        "w-20 h-20 rounded-full border flex items-center justify-center transition-all shadow-2xl relative",
                        isLive ? "border-accent text-accent bg-accent/10" : "border-white/10 text-white"
                    )}
                >
                    {state.broadcastStatus === 'COUNTDOWN' && (
                        <motion.div
                            layoutId="ring"
                            className="absolute -inset-2 border-2 border-accent rounded-full"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                    )}
                    {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1.5" />}
                </motion.button>
                <button className="text-white/20 hover:text-white transition-colors active:scale-90"><SkipForward size={32} /></button>
            </div>

            <div className="w-80 flex justify-end gap-10 items-center">
                <button className="group flex flex-col items-center gap-2">
                    <Headphones size={20} className="text-white/20 group-hover:text-white transition-colors" />
                    <span className="text-[8px] font-black uppercase text-white/10 tracking-[0.2em]">Monitoring</span>
                </button>
                <button className="group flex flex-col items-center gap-2">
                    <Sliders size={20} className="text-white/20 group-hover:text-white transition-colors" />
                    <span className="text-[8px] font-black uppercase text-white/10 tracking-[0.2em]">Setup</span>
                </button>
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all">
                    <Bell size={18} />
                </div>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FULL BROADCASTER STUDIO
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   STUDIO LAYOUT (Internal Component for Context Access)
   ═══════════════════════════════════════════════════════════════ */
function StudioLayout() {
    const { state, dispatch } = useRadio();
    const [isLinkerOpen, setIsLinkerOpen] = useState(false);

    // Spotify OAuth Handshake Completion
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const completeAuth = async () => {
                dispatch({ type: 'ADD_LOG', text: 'Spotify Handshake: Exchanging code...' });
                try {
                    const { token } = await SpotifyService.exchangeCode(code);
                    const playlists = await SpotifyService.fetchPlaylists(token);

                    dispatch({
                        type: 'CONNECT_SPOTIFY',
                        stationId: state.activeStationId,
                        token,
                        playlists
                    });

                    dispatch({ type: 'ADD_LOG', text: `Spotify Linked: ${playlists.length} playlists ingested.` });

                    // Clean the URL to remove the code
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (err) {
                    console.error('Spotify Auth Error:', err);
                    dispatch({ type: 'ADD_LOG', text: 'Spotify Link Failed.', level: 'error' });
                }
            };
            completeAuth();
        }
    }, [dispatch, state.activeStationId]);

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden selection:bg-accent/40 font-sans">
            {/* Global Status Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-black z-20">
                <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(255,45,85,0.8)]" />
                    <h1 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/90">Professional Studio</h1>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">Session ID</span>
                        <span className="text-[10px] font-mono font-bold text-white/40">MASTER_HOST_XTC</span>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">Uptime</span>
                        <span className="text-[10px] font-mono font-bold text-accent">00:15:42:09</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <SidebarPane onOpenLinker={() => setIsLinkerOpen(true)} />
                <MonitorPane />
                <ControlPane />
            </div>

            <TransportBar />

            {/* Modals */}
            <SourceLinkerModal isOpen={isLinkerOpen} onClose={() => setIsLinkerOpen(false)} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FULL BROADCASTER STUDIO EXPORT
   ═══════════════════════════════════════════════════════════════ */
export function StreamerApp() {
    return (
        <RadioProvider>
            <StudioLayout />
        </RadioProvider>
    );
}
