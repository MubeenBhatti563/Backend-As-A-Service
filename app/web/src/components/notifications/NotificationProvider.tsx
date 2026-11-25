"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Notification, type NotificationAction, type NotificationVariant } from "./Notification";

export interface NotifyOptions {
  action?: NotificationAction;
  /** Auto-dismiss delay in ms. Pass 0 or null to keep it until closed. */
  duration?: number | null;
}

interface Item extends NotifyOptions {
  id: string;
  variant: NotificationVariant;
  message: ReactNode;
}

/** Success and info clear themselves; errors and warnings stay until dismissed. */
const DEFAULT_DURATION: Record<NotificationVariant, number | null> = {
  success: 5000,
  info: 8000,
  warning: null,
  error: null,
};

const MAX_VISIBLE = 5;

export interface NotificationsApi {
  notify: (variant: NotificationVariant, message: ReactNode, options?: NotifyOptions) => string;
  success: (message: ReactNode, options?: NotifyOptions) => string;
  error: (message: ReactNode, options?: NotifyOptions) => string;
  warning: (message: ReactNode, options?: NotifyOptions) => string;
  info: (message: ReactNode, options?: NotifyOptions) => string;
  dismiss: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsApi | null>(null);

function NotificationItem({ item, onDismiss }: { item: Item; onDismiss: (id: string) => void }) {
  const duration = item.duration === undefined ? DEFAULT_DURATION[item.variant] : item.duration;

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(timer);
  }, [duration, item.id, onDismiss]);

  return (
    <Notification
      variant={item.variant}
      message={item.message}
      action={item.action}
      onClose={() => onDismiss(item.id)}
    />
  );
}

/**
 * Mount once, inside your ThemeProvider (e.g. in ThemeRegistry):
 *   <NotificationProvider>{children}</NotificationProvider>
 * Then anywhere below it:
 *   const { success, error } = useNotifications();
 *   success("Table created successfully.");
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const notify = useCallback<NotificationsApi["notify"]>((variant, message, options) => {
    const id = `notification-${++counter.current}`;
    setItems((prev) => [...prev, { id, variant, message, ...options }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const api = useMemo<NotificationsApi>(
    () => ({
      notify,
      dismiss,
      success: (m, o) => notify("success", m, o),
      error: (m, o) => notify("error", m, o),
      warning: (m, o) => notify("warning", m, o),
      info: (m, o) => notify("info", m, o),
    }),
    [notify, dismiss],
  );

  return (
    <NotificationsContext.Provider value={api}>
      {children}

      {/* Top-right, just below the 64px top bar. Change top/right here to move the stack. */}
      <Stack
        role="region"
        aria-label="Notifications"
        spacing={4}
        useFlexGap
        sx={{
          position: "fixed",
          top: 80,
          right: 24,
          zIndex: (theme: Theme) => theme.zIndex.snackbar,
          width: 560,
          maxWidth: "calc(100vw - 32px)",
          pointerEvents: "none",
          "& > *": { pointerEvents: "auto" },
        }}
      >
        {items.map((item) => (
          <NotificationItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </Stack>
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsApi {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>.");
  return ctx;
}
