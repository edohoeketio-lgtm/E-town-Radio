export type RadioStatus = 'IDLE' | 'BUFFERING' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'ERROR';
export type LogLevel = 'info' | 'warn' | 'error';
export type UserRole = 'streamer' | 'listener';
export type BroadcastStatus = 'STANDBY' | 'COUNTDOWN' | 'LIVE';

export interface LogEntry {
    id: string;
    ts: Date;
    text: string;
    level: LogLevel;
}

export interface Station {
    id: string;
    name: string;
    description: string;
    sourceType: 'local' | 'stream';
    sourceUrls: string[];
    tags: string[];
    mockSegments: string[];
    linkedSources?: MusicSource[];
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    tracksCount: number;
    imageUrl?: string;
}

export interface MusicSource {
    id: string;
    type: 'spotify' | 'apple' | 'youtube' | 'local';
    name: string;
    connected: boolean;
    accessToken?: string;
    playlists?: SpotifyPlaylist[];
}

export interface MixOptions {
    muteBass: boolean;
    muteDrums: boolean;
    onlyBassDrums: boolean;
}

export type ProgramMode = 'Continuous Flow' | 'Pulse / Groove' | 'Golden Hour' | 'After Hours' | 'Experimental';

export interface RadioState {
    status: RadioStatus;
    broadcastStatus: BroadcastStatus;
    role: UserRole;
    apiKey: string;
    prompt: string;
    bpm: number;
    density: number;
    brightness: number;
    mixOptions: MixOptions;
    scale: string;
    programMode: ProgramMode;

    // Real Audio Props
    activeStationId: string;
    nowPlaying: string;
    stations: Station[];

    // New Broadcast Props
    listenerCounts: Record<string, number>;
    schedule: {
        current: string;
        next: string;
        later: string;
        remaining: number; // seconds
    };

    logs: LogEntry[];
    seed: number;
}

export type RadioAction =
    | { type: 'SET_STATUS'; status: RadioStatus }
    | { type: 'SET_ROLE'; role: UserRole }
    | { type: 'SET_API_KEY'; key: string }
    | { type: 'SET_PROMPT'; prompt: string }
    | { type: 'UPDATE_PARAMS'; payload: Partial<Pick<RadioState, 'bpm' | 'density' | 'brightness' | 'scale'>> }
    | { type: 'TOGGLE_MIX_OPTION'; option: keyof MixOptions }
    | { type: 'ADD_LOG'; text: string; level?: LogLevel }
    | { type: 'REGENERATE_SEED' }
    | { type: 'CLEAR_LOGS' }
    | { type: 'SWITCH_STATION'; stationId: string }
    | { type: 'UPDATE_NOW_PLAYING'; text: string }
    | { type: 'SET_PROGRAM_MODE'; mode: ProgramMode }
    | { type: 'UPDATE_LISTENERS'; counts: Record<string, number> }
    | { type: 'UPDATE_SCHEDULE'; schedule: RadioState['schedule'] }
    | { type: 'ADD_SOURCE'; stationId: string; source: MusicSource }
    | { type: 'SET_BROADCAST_STATUS'; status: BroadcastStatus }
    | { type: 'CONNECT_SPOTIFY'; stationId: string; token: string; playlists: SpotifyPlaylist[] };
