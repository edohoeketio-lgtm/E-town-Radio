import { useState, useEffect } from 'react';
import { useRadio, useAudioEngine } from '../../hooks/useRadio';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowRight } from '../ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Streamer: Queue Manager ─── */
function QueueManager() {
    const { state, dispatch } = useRadio();
    const { initAudio, togglePlay } = useAudioEngine();
    const activeStation = state.stations.find(s => s.id === state.activeStationId);

    const [queue, setQueue] = useState<string[]>(activeStation?.mockSegments || []);
    const [showSourceModal, setShowSourceModal] = useState(false);

    useEffect(() => {
        const station = state.stations.find(s => s.id === state.activeStationId);
        if (station) setQueue(station.mockSegments);
    }, [state.activeStationId, state.stations]);

    const handleGoLive = async () => {
        initAudio();
        dispatch({ type: 'SWITCH_STATION', stationId: state.activeStationId });
        dispatch({ type: 'ADD_LOG', text: `Broadcasting: ${activeStation?.name}. Queue loaded.` });

        if (state.status !== 'PLAYING') {
            setTimeout(() => togglePlay(), 50);
        }
    };

    const removeFromQueue = (index: number) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <div className="space-y-2 flex-1">
                <label className="text-[10px] uppercase font-bold text-secondary tracking-widest flex items-center gap-2">
                    Live Queue
                </label>
                <div className="flex flex-col gap-1.5 mt-2 overflow-y-auto max-h-[240px] pr-1 -mr-1 custom-scrollbar">
                    {queue.map((track, i) => (
                        <div
                            key={`${track}-${i}`}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-card-border/50 hover:border-primary/20 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-mono text-secondary/40 tabular-nums w-4">{String(i + 1).padStart(2, '0')}</span>
                                <span className="text-xs font-medium text-primary">{track}</span>
                            </div>
                            <button
                                onClick={() => removeFromQueue(i)}
                                className="text-secondary/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setShowSourceModal(!showSourceModal)}
                    className="w-full mt-2 p-3 rounded-lg border border-dashed border-card-border hover:border-primary/30 transition-colors text-xs text-secondary hover:text-primary uppercase tracking-widest font-bold"
                >
                    + Add Source
                </button>
            </div>

            {/* Source Modal */}
            <AnimatePresence>
                {showSourceModal && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {['Spotify', 'Apple Music', 'YouTube Music', 'Local Files'].map(source => (
                                <button
                                    key={source}
                                    className="p-2.5 rounded-lg hardware-button text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5 transition-colors"
                                    onClick={() => {
                                        dispatch({ type: 'ADD_LOG', text: `Source: ${source} (connect flow coming soon)` });
                                        setShowSourceModal(false);
                                    }}
                                >
                                    {source}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={handleGoLive}
                className={`w-full mt-auto h-12 hardware-button group font-medium tracking-wide ${state.status === 'PLAYING'
                    ? 'text-white border-accent bg-accent'
                    : 'text-primary'
                    }`}
            >
                <span className="mr-2">{state.status === 'PLAYING' ? '● ON AIR' : 'GO LIVE'}</span>
                {state.status !== 'PLAYING' && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 opacity-50" />}
            </Button>
        </>
    );
}

/* ─── Listener: Frequency Dial ─── */
function FrequencyDial() {
    const { state, dispatch } = useRadio();
    const { initAudio, togglePlay } = useAudioEngine();
    const [selectedId, setSelectedId] = useState(state.activeStationId);

    useEffect(() => {
        setSelectedId(state.activeStationId);
    }, [state.activeStationId]);

    const handleTuneIn = async () => {
        const targetStation = state.stations.find(s => s.id === selectedId);
        if (!targetStation) return;

        initAudio();
        dispatch({ type: 'SWITCH_STATION', stationId: selectedId });
        dispatch({ type: 'ADD_LOG', text: `Tuned into: ${targetStation.name}. Connecting stream...` });

        const nextSegment = targetStation.mockSegments[Math.floor(Math.random() * targetStation.mockSegments.length)];
        dispatch({ type: 'UPDATE_NOW_PLAYING', text: nextSegment });

        if (state.status !== 'PLAYING') {
            setTimeout(() => togglePlay(), 50);
        }
    };

    const isAlreadyActive = selectedId === state.activeStationId && state.status === 'PLAYING';

    return (
        <>
            <div className="space-y-2 flex-1">
                <label className="text-[10px] uppercase font-bold text-secondary tracking-widest flex items-center gap-2">
                    Live Frequencies
                </label>
                <div className="flex flex-col gap-2 mt-2 overflow-y-auto max-h-[280px] pr-1 -mr-1 custom-scrollbar">
                    {state.stations.map((station) => {
                        const isSelected = selectedId === station.id;
                        const isLive = station.id === state.activeStationId && state.status === 'PLAYING';
                        const count = state.listenerCounts[station.id] || 0;

                        return (
                            <button
                                key={station.id}
                                onClick={() => setSelectedId(station.id)}
                                className={`flex flex-col items-start w-full rounded-lg border px-4 py-3 text-left transition-all ${isSelected
                                    ? 'border-accent bg-accent/10 shadow-sm'
                                    : 'border-card-border hover:border-secondary/30 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {isLive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-primary'}`}>
                                        {station.name}
                                    </span>
                                    <span className="ml-auto text-[9px] font-mono text-secondary/50 tabular-nums">
                                        {count.toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-xs text-secondary truncate w-full">
                                    {station.description}
                                </span>
                                <div className="flex gap-1 mt-1.5">
                                    {station.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${isSelected
                                                ? 'bg-accent/15 text-accent'
                                                : 'bg-white/5 text-secondary'
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Button
                onClick={handleTuneIn}
                className={`w-full mt-auto h-12 hardware-button group font-medium tracking-wide ${isAlreadyActive
                    ? 'text-secondary opacity-60 pointer-events-none'
                    : 'text-primary'
                    }`}
            >
                <span className="mr-2">{isAlreadyActive ? 'TUNED IN' : 'TUNE IN'}</span>
                {!isAlreadyActive && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 opacity-50" />}
            </Button>
        </>
    );
}

/* ─── Main Export ─── */
export function ConfigurationCard() {
    const { state } = useRadio();

    return (
        <Card
            title={state.role === 'streamer' ? 'Queue Manager' : 'Station Selector'}
            className="col-span-12 lg:col-span-4 flex flex-col gap-4"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={state.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4 flex-1"
                >
                    {state.role === 'streamer' ? <QueueManager /> : <FrequencyDial />}
                </motion.div>
            </AnimatePresence>
        </Card>
    );
}
