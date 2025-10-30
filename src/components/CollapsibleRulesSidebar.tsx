import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen } from 'lucide-react';

interface CollapsibleRulesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CollapsibleRulesSidebar({ isOpen, onClose }: CollapsibleRulesSidebarProps) {
  return (
    <>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >

            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <BookOpen className="w-6 h-6" />
                <h3 className="font-bold text-xl">Game Rules</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>


            <div className="p-6 space-y-6">

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎴</span>
                  Card Movement
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <span className="font-bold text-indigo-700 min-w-[3rem]">2-9</span>
                    <span className="text-gray-700">Move a Pawn</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-indigo-600 min-w-[3rem]">10</span>
                    <span className="text-gray-700">Move a Knight</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-indigo-600 min-w-[3rem]">A</span>
                    <span className="text-gray-700">Move a Rook</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-indigo-600 min-w-[3rem]">J</span>
                    <span className="text-gray-700">Move a Bishop</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-indigo-600 min-w-[3rem]">Q</span>
                    <span className="text-gray-700">Move the Queen</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-indigo-600 min-w-[3rem]">K</span>
                    <span className="text-gray-700">Move the King</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-300">
                    <span className="font-bold text-orange-600 min-w-[3rem]">JOKER</span>
                    <span className="text-gray-700">Move ANY piece!</span>
                  </div>
                </div>
              </div>


              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  How to Play
                </h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-green-700 min-w-[1.5rem]">1.</span>
                    <span>Click <strong>"Draw Card"</strong> to get your card</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-green-700 min-w-[1.5rem]">2.</span>
                    <span>Select a piece that matches the card</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-green-700 min-w-[1.5rem]">3.</span>
                    <span>Click a highlighted square to move</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-green-700 min-w-[1.5rem]">4.</span>
                    <span>Turn passes to the other player</span>
                  </li>
                </ol>
              </div>


              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Special Rules
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>White always draws first</span>
                  </li>
                  <li className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Game ends when a King is captured</span>
                  </li>
                  <li className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Deck reshuffles when empty</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
