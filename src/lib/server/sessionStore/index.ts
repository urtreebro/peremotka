import { randomBytes } from 'node:crypto';
import {
    deleteDbSession,
    deleteExpiredDbSessions,
    getDbSession,
    insertDbSession
} from '../db';
import type { SessionInfo, SessionInfoCache } from '../db/types';

type SessionId = string;

const sessionStore = new Map<SessionId, SessionInfoCache>();
let nextClean = Date.now() + 1000 * 60 * 60; // 1 hour

function clean() {
    const now = Date.now();
    for (const [sessionId, session] of sessionStore) {
        if (session.invalidAt < now) {
            sessionStore.delete(sessionId);
        }
    }
    deleteExpiredDbSessions(now);
    nextClean = Date.now() + 1000 * 60 * 60; // 1 hour
}

function getSessionId(): SessionId {
    return randomBytes(32).toString('hex');
}

export function createSession(username: string, role: string, maxAge: number): string {
    let sessionId: SessionId = '';

    do {
        sessionId = getSessionId();
    } while (sessionStore.has(sessionId));

    const expiresAt = Date.now() + maxAge * 1000;

    const data: SessionInfo = {
        username,
        role
    };
    insertDbSession(sessionId, data, expiresAt);

    sessionStore.set(sessionId, {
        ...data,
        invalidAt: expiresAt
    });

    if (Date.now() > nextClean) {
        setTimeout(() => {
            clean();
        }, 5000);
    }

    return sessionId;
}

export function getSession(sessionId: SessionId): SessionInfo | undefined {
    if (sessionStore.has(sessionId)) {
        return sessionStore.get(sessionId);
    } else {
        const session = getDbSession(sessionId);
        if (session) {
            sessionStore.set(sessionId, session);
            return session;
        }
    }

    console.log('session not found', sessionId);
    return undefined;
}

export function deleteSession(sessionId: string): void {
    sessionStore.delete(sessionId);
    deleteDbSession(sessionId);
}