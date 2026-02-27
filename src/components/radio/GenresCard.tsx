import { useRadio } from '../../hooks/useRadio';
import { type Station, type ProgramMode } from '../../types/radio';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from '../ui/Icons';
import { useState, useCallback } from 'react';

/* ─── Helpers ─── */
const STATION_GROUPS = {
    MOOD: ['feel-good-1', 'ambient-1', 'lofi-1'],
    RHYTHM: ['afro-1', 'techno-1', 'jazz-1'],
    FUTURE: ['synth-1']
};

function getEnergyLabel(mode: ProgramMode): string {
    switch (mode) {
        case 'After Hours':
        case 'Continuous Flow': return 'Low';
        case 'Pulse / Groove':
        case 'Experimental': return 'High';
        case 'Golden Hour':
        default: return 'Med';
    }
}

/* ─── Streamer: Soundboard Card ─── */
function SoundboardCard() {
    const { dispatch } = useRadio();
    const [activeEffects, setActiveEffects] = useState<Record<string, boolean>>({});

    const EFFECTS = [
        { id: 'airhorn', label: '📢 Airhorn' },
        { id: 'rewind', label: '⏪ Rewind' },
        { id: 'drop', label: '💥 Bass Drop' },
        { id: 'hype', label: '🎤 Hype' },
        { id: 'vinyl', label: '💿 Vinyl Scratch' },
        { id: 'custom', label: '✦ Custom Drop' },
    ];

    const triggerEffect = useCallback((fx: typeof EFFECTS[number]) => {
        setActiveEffects(prev => ({ ...prev, [fx.id]: true }));
        dispatch({ type: 'ADD_LOG', text: `🔊 Triggered: ${fx.label}` });
        setTimeout(() => {
            setActiveEffects(prev => ({ ...prev, [fx.id]: false }));
        }, 300);
    }, [dispatch]);

    return (
        <>
            <p className="text-xs text-primary/60 mb-4">Tap to trigger live sound effects to your audience.</p>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px]">
                {EFFECTS.map(fx => (
                    <motion.button
                        key={fx.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => triggerEffect(fx)}
                        className={`p-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all hardware-button ${activeEffects[fx.id]
                            ? 'bg-accent text-white border-accent shadow-inner'
                            : 'text-primary hover:bg-accent/5'
                            }`}
                    >
                        {fx.label}
                    </motion.button>
                ))}
            </div>
        </>
    );
}

/* ─── Listener: Tip Card ─── */
function TipCard() {
    const { dispatch } = useRadio();
    const [tokenBalance, setTokenBalance] = useState(25);
    const [activeTips, setActiveTips] = useState<Record<string, boolean>>({});

    const TIPS = [
        { id: 'vinyl', label: '💿 Vinyl', cost: 1 },
        { id: 'spark', label: '✨ Spark', cost: 2 },
        { id: 'fire', label: '🔥 Fire', cost: 5 },
        { id: 'diamond', label: '💎 Diamond', cost: 10 },
    ];

    const sendTip = useCallback((tip: typeof TIPS[number]) => {
        if (tokenBalance < tip.cost) {
            dispatch({ type: 'ADD_LOG', text: `Not enough tokens for ${tip.label}` });
            return;
        }
        setTokenBalance(prev => prev - tip.cost);
        setActiveTips(prev => ({ ...prev, [tip.id]: true }));
        dispatch({ type: 'ADD_LOG', text: `🎁 Sent ${tip.label} (${tip.cost} tokens)` });
        setTimeout(() => {
            setActiveTips(prev => ({ ...prev, [tip.id]: false }));
        }, 500);
    }, [dispatch, tokenBalance]);

    return (
        <>
            {/* Token Balance */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg hardware-inset">
                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">Token Balance</span>
                <span className="text-lg font-mono font-semibold text-primary tabular-nums">{tokenBalance}</span>
            </div>

            <p className="text-xs text-primary/60 mb-3">Send a gift to the streamer. Each gift triggers a live animation.</p>

            <div className="grid grid-cols-2 gap-2">
                {TIPS.map(tip => (
                    <motion.button
                        key={tip.id}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => sendTip(tip)}
                        className={`p-3 rounded-lg border text-xs font-bold transition-all hardware-button flex flex-col items-center gap-1 ${activeTips[tip.id]
                            ? 'bg-accent text-white border-accent shadow-inner'
                            : tokenBalance < tip.cost
                                ? 'text-secondary/30 pointer-events-none opacity-50'
                                : 'text-primary hover:bg-accent/5'
                            }`}
                    >
                        <span className="text-lg">{tip.label.split(' ')[0]}</span>
                        <span className="tracking-wider uppercase">{tip.label.split(' ')[1]}</span>
                        <span className="text-[9px] font-mono text-secondary/50 mt-0.5">{tip.cost} tokens</span>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={() => {
                    setTokenBalance(prev => prev + 25);
                    dispatch({ type: 'ADD_LOG', text: '💰 Purchased 25 tokens' });
                }}
                className="w-full mt-3 p-2.5 rounded-lg hardware-button text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5 transition-colors"
            >
                + Buy Tokens
            </button>
        </>
    );
}

/* ─── Listener: Station Programming (original behavior) ─── */
function StationProgramming() {
    const { state, dispatch } = useRadio();
    const { stations, activeStationId, programMode } = state;

    const handleSelect = (station: Station) => {
        if (station.id === activeStationId) return;
        dispatch({ type: 'SWITCH_STATION', stationId: station.id });
        dispatch({ type: 'SET_STATUS', status: 'PLAYING' });
        const nextSegment = station.mockSegments[Math.floor(Math.random() * station.mockSegments.length)];
        dispatch({ type: 'UPDATE_NOW_PLAYING', text: nextSegment });
    };

    const { listenerCounts } = state;
    const energy = getEnergyLabel(programMode);

    const renderGroup = (title: string, stationIds: string[]) => {
        const groupStations = stations.filter(s => stationIds.includes(s.id));
        if (groupStations.length === 0) return null;

        return (
            <div key={title} className="mb-4 last:mb-0">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-2 opacity-60 ml-1">{title}</h4>
                <div className="grid grid-cols-1 gap-2">
                    {groupStations.map(station => {
                        const isActive = station.id === activeStationId;
                        const count = listenerCounts[station.id] || 0;

                        return (
                            <motion.button
                                key={station.id}
                                onClick={() => handleSelect(station)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`relative flex items-center justify-between p-2 rounded-lg border transition-all group ${isActive
                                    ? 'bg-accent text-white border-accent shadow-md'
                                    : 'bg-card text-primary border-card-border hover:border-secondary/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-secondary/30'}`} />
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-semibold leading-none mb-0.5">{station.name}</span>
                                        <span className={`text-[9px] ${isActive ? 'text-white/60' : 'text-primary/40'}`}>
                                            LIVE • {count.toLocaleString()} tuned in
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${isActive ? 'bg-white/10 text-white/90' : 'bg-white/5 text-secondary'}`}>
                                    <Zap size={8} fill="currentColor" />
                                    {energy}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <p className="text-xs text-primary/60 mb-4">Tuning changes global programming for all listeners.</p>
            <div className="overflow-y-auto max-h-[300px] pr-1 -mr-1 custom-scrollbar">
                {renderGroup('MOOD', STATION_GROUPS.MOOD)}
                {renderGroup('RHYTHM', STATION_GROUPS.RHYTHM)}
                {renderGroup('FUTURE', STATION_GROUPS.FUTURE)}
            </div>
        </>
    );
}

/* ─── Main Export ─── */
export function GenresCard() {
    const { state } = useRadio();

    return (
        <Card
            title={state.role === 'streamer' ? 'Soundboard' : 'Tips & Tokens'}
            className="col-span-12 md:col-span-3"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={state.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                >
                    {state.role === 'streamer' ? <SoundboardCard /> : <TipCard />}
                </motion.div>
            </AnimatePresence>
        </Card>
    );
}
