import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, ChevronUp, X } from 'lucide-react';

interface MoveHistoryFooterProps {
  moveHistory: string[];
}

export function MoveHistoryFooter({ moveHistory }: MoveHistoryFooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (moveHistory.length === 0) return null;

  return (
    <>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>


      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-t-2 border-gray-300 shadow-2xl overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-black text-gray-900">Move History</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {moveHistory.length} moves
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {[...moveHistory].reverse().map((move, index) => (
                    <motion.div
                      key={moveHistory.length - index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="text-sm p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                    >
                      <span className="font-bold text-indigo-600">#{moveHistory.length - index}</span>{' '}
                      <span className="text-gray-900 text-xs">{move}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="bg-white border-t-2 border-gray-300 shadow-xl">
          <div className="container mx-auto px-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <History className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Move History</p>
                  <p className="text-xs text-gray-500">
                    {moveHistory.length} {moveHistory.length === 1 ? 'move' : 'moves'} played
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">

                {moveHistory.length > 0 && (
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-500">Last move:</p>
                    <p className="text-sm font-bold text-gray-900 max-w-xs truncate">
                      {moveHistory[moveHistory.length - 1]}
                    </p>
                  </div>
                )}

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
