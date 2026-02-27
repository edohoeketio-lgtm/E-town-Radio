import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio } from 'lucide-react';

export function ListenerApp() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
            >
                <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
                    <Radio size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Listener App Stub</h1>
                <p className="text-white/50 tracking-tight max-w-sm mx-auto">
                    This module is currently dormant. Focus is currently locked on perfecting the Streamer Studio application.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mt-8 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                    <ArrowLeft size={14} /> Return to Gateway
                </Link>
            </motion.div>
        </div>
    );
}
