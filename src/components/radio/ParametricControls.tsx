import { useRadio } from '../../hooks/useRadio';
import { Card } from '../ui/Card';
import { Volume2, Sun, Zap } from '../ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

/* ─── Streamer: Mixer Deck ─── */
function MixerDeck() {
    const { state, dispatch } = useRadio();
    const { bpm, density, brightness } = state;

    // Soundboard state
    const [activeEffects, setActiveEffects] = useState<Record<string, boolean>>({});

    const triggerEffect = useCallback((name: string) => {
        setActiveEffects(prev => ({ ...prev, [name]: true }));
        dispatch({ type: 'ADD_LOG', text: `🔊 SFX: ${name}` });
        setTimeout(() => {
            setActiveEffects(prev => ({ ...prev, [name]: false }));
        }, 300);
    }, [dispatch]);

    const SOUNDBOARD = [
        { id: 'airhorn', label: 'Airhorn' },
        { id: 'drop', label: 'Drop' },
        { id: 'siren', label: 'Siren' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Broadcast Sliders */}
            <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-secondary tracking-wider uppercase">
                        <span className="flex items-center gap-2"><Volume2 size={12} /> Mic Ducking</span>
                        <span className="font-mono">{(density * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01" value={density}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAMS', payload: { density: Number(e.target.value) } })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-secondary tracking-wider uppercase">
                        <span className="flex items-center gap-2"><Zap size={12} /> Crossfade</span>
                        <span className="font-mono">{((bpm - 60) / 120 * 8 + 0.5).toFixed(1)}s</span>
                    </div>
                    <input
                        type="range" min="60" max="180" value={bpm}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAMS', payload: { bpm: Number(e.target.value) } })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-secondary tracking-wider uppercase">
                        <span className="flex items-center gap-2"><Sun size={12} /> Filter Sweep</span>
                        <span className="font-mono">{(brightness * 100).toFixed(0)}</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01" value={brightness}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAMS', payload: { brightness: Number(e.target.value) } })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>
            </div>

            {/* Soundboard */}
            <div className="h-full border-l border-card-border/50 pl-0 md:pl-8 flex flex-col justify-center">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Soundboard</h4>
                <div className="space-y-2">
                    {SOUNDBOARD.map(fx => (
                        <button
                            key={fx.id}
                            onClick={() => triggerEffect(fx.label)}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all hardware-button text-xs font-bold uppercase tracking-wider ${activeEffects[fx.label]
                                ? 'bg-accent text-white border-accent scale-[0.97] shadow-inner'
                                : 'text-primary hover:bg-accent/5'
                                }`}
                        >
                            {fx.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Listener: Social Deck ─── */
function SocialDeck() {
    const { state, dispatch } = useRadio();
    const [vibeValue, setVibeValue] = useState(0.5);
    const [activeReacts, setActiveReacts] = useState<Record<string, boolean>>({});

    const REACTS = [
        { id: 'fire', emoji: '🔥', label: 'Fire' },
        { id: 'heart', emoji: '❤️', label: 'Love' },
        { id: 'skull', emoji: '💀', label: 'Dead' },
    ];

    const sendReact = useCallback((react: typeof REACTS[number]) => {
        setActiveReacts(prev => ({ ...prev, [react.id]: true }));
        dispatch({ type: 'ADD_LOG', text: `${react.emoji} Reaction sent: ${react.label}` });
        setTimeout(() => {
            setActiveReacts(prev => ({ ...prev, [react.id]: false }));
        }, 400);
    }, [dispatch]);

    const vibeLabel = vibeValue < 0.3 ? 'Chill' : vibeValue > 0.7 ? 'Banger' : 'Vibing';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Volume + Vibe Check */}
            <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-secondary tracking-wider uppercase">
                        <span className="flex items-center gap-2"><Volume2 size={12} /> Volume</span>
                        <span className="font-mono">{(state.density * 100).toFixed(0)}</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01" value={state.density}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAMS', payload: { density: Number(e.target.value) } })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-secondary tracking-wider uppercase">
                        <span className="flex items-center gap-2"><Zap size={12} /> Vibe Check</span>
                        <span className="font-mono">{vibeLabel}</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01" value={vibeValue}
                        onChange={(e) => setVibeValue(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[9px] text-secondary/40 uppercase tracking-wider font-bold">
                        <span>Chill</span>
                        <span>Banger</span>
                    </div>
                </div>

                {/* Save to Library */}
                <button
                    onClick={() => dispatch({ type: 'ADD_LOG', text: '💾 Saved to "XTC Radio Finds" playlist' })}
                    className="w-full p-2.5 rounded-lg hardware-button text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5 transition-colors"
                >
                    ♫ Save to Library
                </button>
            </div>

            {/* Quick Reacts */}
            <div className="h-full border-l border-card-border/50 pl-0 md:pl-8 flex flex-col justify-center">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Quick React</h4>
                <div className="space-y-2">
                    {REACTS.map(react => (
                        <button
                            key={react.id}
                            onClick={() => sendReact(react)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hardware-button text-xs font-bold uppercase tracking-wider ${activeReacts[react.id]
                                ? 'bg-accent text-white border-accent scale-[0.97] shadow-inner'
                                : 'text-primary hover:bg-accent/5'
                                }`}
                        >
                            <span className="text-base">{react.emoji}</span>
                            {react.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Export ─── */
export function ParametricControls() {
    const { state } = useRadio();

    return (
        <Card
            title={state.role === 'streamer' ? 'Mixer Deck' : 'Social Deck'}
            className="col-span-12 md:col-span-6 flex flex-col justify-between h-[300px]"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={state.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                >
                    {state.role === 'streamer' ? <MixerDeck /> : <SocialDeck />}
                </motion.div>
            </AnimatePresence>
        </Card>
    );
}
