import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { getPatrolCurrent, postPatrolPings } from "@/lib/api/patrol";
import type { PatrolSessionInfo } from "@/lib/api/types/domain";

/** Minimum seconds between GPS pings — one ping per minute unless the session asks for a slower rate. */
const PING_INTERVAL_SECONDS = 60;

function logPatrolPing(message: string, err?: unknown) {
  if (__DEV__) {
    console.warn(`[PatrolPing] ${message}`, err ?? "");
  }
}

/**
 * While GET /patrol/sessions/current reports an active session (RMP), reads GPS
 * and POSTs to `/patrol/pings`.
 *
 * Uses **getPatrolCurrent**, not bootstrap `activePatrolSession`, because many
 * backends omit the latter; the Patrol screen already proves current works.
 *
 * On web, geolocation needs HTTPS or localhost; the browser shows the prompt
 * when we read the position.
 *
 * Ping cadence: **at most one ping per minute** (60s), or slower if
 * `session.intervalSeconds` from the server is larger.
 */
export function PatrolPingLoop() {
  const auth = useAuth();
  const [patrolSession, setPatrolSession] = useState<PatrolSessionInfo | null>(
    null,
  );
  const pointSeq = useRef(0);
  const authRef = useRef(auth);
  authRef.current = auth;

  // Poll current session — same contract as the Patrol screen (bootstrap may not include it).
  useEffect(() => {
    if (auth.status !== "signedIn" || auth.user?.role !== "RMP") {
      setPatrolSession(null);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await getPatrolCurrent(authRef.current.getApiDeps());
        if (!cancelled) {
          setPatrolSession(res.session ?? null);
        }
      } catch (e) {
        logPatrolPing("getPatrolCurrent failed", e);
        if (!cancelled) {
          setPatrolSession(null);
        }
      }
    };
    void poll();
    const id = setInterval(() => {
      void poll();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [auth.status, auth.user?.role]);

  useEffect(() => {
    if (auth.status !== "signedIn" || auth.user?.role !== "RMP") {
      return;
    }
    if (!patrolSession?.sessionId) {
      return;
    }

    const sessionId = patrolSession.sessionId;
    const intervalSec = Math.max(
      PING_INTERVAL_SECONDS,
      patrolSession.intervalSeconds ?? PING_INTERVAL_SECONDS,
    );

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const sendPing = async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy:
            Platform.OS === "web"
              ? Location.Accuracy.Low
              : Location.Accuracy.Balanced,
        });
        if (cancelled) {
          return;
        }
        pointSeq.current += 1;
        await postPatrolPings(
          {
            sessionId,
            points: [
              {
                clientPointId: `pt-${sessionId}-${pointSeq.current}-${Date.now()}`,
                recordedAt: new Date().toISOString(),
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracyMeters:
                  loc.coords.accuracy != null
                    ? Math.max(0, loc.coords.accuracy)
                    : undefined,
                source: "INTERVAL",
              },
            ],
          },
          authRef.current.getApiDeps(),
        );
      } catch (e) {
        logPatrolPing("ping failed (permission, GPS, or API)", e);
      }
    };

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) {
        return;
      }
      if (status !== "granted") {
        logPatrolPing(
          `location permission not granted (status=${status}). Allow location in the browser or OS settings.`,
        );
        return;
      }

      await sendPing();
      if (cancelled) {
        return;
      }
      intervalId = setInterval(() => {
        void sendPing();
      }, intervalSec * 1000);
    };

    void start();

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [
    auth.status,
    auth.user?.role,
    patrolSession?.sessionId,
    patrolSession?.intervalSeconds,
  ]);

  return null;
}
