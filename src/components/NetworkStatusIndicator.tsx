import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const NetworkStatusIndicator: React.FC = () => {
  const { isOnline } = useAppStore();

  if (isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-green-100 text-green-800 px-3 py-2 rounded-lg shadow-lg border border-green-200 flex items-center gap-2">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">Online</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-red-100 text-red-800 px-3 py-2 rounded-lg shadow-lg border border-red-200 flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  );
};
