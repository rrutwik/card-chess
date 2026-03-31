import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '../utils/logger';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface AppState {
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  showRules: boolean;

  // Error states
  error: string | null;

  // Notifications
  notifications: Notification[];

  // Network status
  isOnline: boolean;

  // Actions
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  setShowRules: (show: boolean) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setOnlineStatus: (online: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isLoading: false,
        loadingMessage: undefined,
        error: null,
        showRules: false,
        notifications: [],
        isOnline: navigator.onLine,

        // Actions
        setLoading: (loading: boolean, message?: string) => {
          logger.debug(`AppStore: setLoading ${loading}`, { message });
          set({ isLoading: loading, loadingMessage: message }, false, 'setLoading');
        },
        setShowRules: (show: boolean) => {
          logger.debug(`AppStore: setShowRules ${show}`);
          set({ showRules: show }, false, 'setShowRules');
        },
        setError: (error: string | null) => {
          if (error) logger.error(`AppStore: Error set`, { error });
          set({ error }, false, 'setError');
        },

        addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
          const id = crypto.randomUUID();
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
          };

          logger.info(`AppStore: Notification added`, { type: notification.type, title: notification.title });

          set(
            (state) => ({
              notifications: [...state.notifications, newNotification],
            }),
            false,
            'addNotification'
          );

          // Auto-remove notification after duration (default 5 seconds)
          const duration = notification.duration || 5000;
          if (duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }
        },

        removeNotification: (id: string) => {
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'removeNotification'
          );
        },

        clearNotifications: () => {
          set({ notifications: [] }, false, 'clearNotifications');
        },

        setOnlineStatus: (online: boolean) => {
          logger.info(`AppStore: Online status changed: ${online ? 'Online' : 'Offline'}`);
          set({ isOnline: online }, false, 'setOnlineStatus');

          // Show notification when coming back online
          if (online) {
            get().addNotification({
              type: 'success',
              title: 'Connection restored',
              message: 'You are back online',
              duration: 3000,
            });
          } else {
            get().addNotification({
              type: 'warning',
              title: 'Connection lost',
              message: 'You are currently offline',
              duration: 0, // Don't auto-dismiss offline notifications
            });
          }
        },
      }),
      {
        name: 'card-chess-app-state',
        partialize: (state) => ({
          // Only persist certain parts of state
          notifications: state.notifications.filter(n => n.duration === 0), // Persist permanent notifications
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Network status monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setOnlineStatus(true));
  window.addEventListener('offline', () => useAppStore.getState().setOnlineStatus(false));
}
