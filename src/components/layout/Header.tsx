import { useRadio } from '../../hooks/useRadio';
import { motion } from 'framer-motion';

export function Header() {
    const { state, dispatch } = useRadio();
    const { status, role } = state;

    const isPlaying = status === 'PLAYING';
    const isBuffering = status === 'BUFFERING';
    const isStreamer = role === 'streamer';

    const handleRoleToggle = () => {
        const newRole = isStreamer ? 'listener' : 'streamer';
        dispatch({ type: 'SET_ROLE', role: newRole });
        dispatch({ type: 'ADD_LOG', text: `Switched to ${newRole} mode` });
    };

    return (
        <header className="w-full flex items-center justify-between py-2 px-1">
            <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight text-primary">XTC Radio</h1>
                <p className="text-[10px] uppercase tracking-wider text-secondary font-medium">Model 01 / Ref 294</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Role Toggle */}
                <button
                    onClick={handleRoleToggle}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-card-border hover:border-accent/30 transition-all hardware-button text-[10px] font-bold tracking-widest uppercase"
                >
                    <span className={isStreamer ? 'text-primary' : 'text-secondary/50'}>DJ</span>
                    <div
                        className={`relative w-8 h-4 rounded-full transition-colors ${isStreamer ? 'bg-accent' : 'bg-gray-300'}`}
                    >
                        <div
                            className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isStreamer ? 'translate-x-4' : 'translate-x-0'}`}
                        />
                    </div>
                    <span className={!isStreamer ? 'text-primary' : 'text-secondary/50'}>FM</span>
                </button>

                {/* Status Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-card-border shadow-sm">
                    <div className="relative flex h-2 w-2">
                        {isPlaying && (
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50"
                            >
                            </motion.span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]' :
                            isBuffering ? 'bg-amber-400' :
                                'bg-gray-300'
                            }`}></span>
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest ${isPlaying ? 'text-accent' : 'text-gray-400'}`}>
                        {isPlaying ? (isStreamer ? 'ON AIR' : 'TUNED') : 'STANDBY'}
                    </span>
                </div>
            </div>
        </header>
    );
}
