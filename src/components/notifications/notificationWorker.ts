import { type WorkerMessage } from '../../types';

const scheduledTimeouts = new Map<string, NodeJS.Timeout>();

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, id, delay } = e.data;

    if (type === 'SCHEDULE' && delay !== undefined) {
        // Cancel existing timeout if any
        if (scheduledTimeouts.has(id)) {
            clearTimeout(scheduledTimeouts.get(id));
        }

        // Schedule new timeout
        const timeoutId = setTimeout(() => {
            self.postMessage({ id });
            scheduledTimeouts.delete(id);
        }, delay);

        scheduledTimeouts.set(id, timeoutId);
    } else if (type === 'CANCEL') {
        if (scheduledTimeouts.has(id)) {
            clearTimeout(scheduledTimeouts.get(id));
            scheduledTimeouts.delete(id);
        }
    }
};

export {};
