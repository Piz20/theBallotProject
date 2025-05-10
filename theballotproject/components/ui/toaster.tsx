import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../hooks/useToastStore';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 flex flex-col items-end">
      <AnimatePresence>
        {toasts.map((toast) => {
          const duration = toast.duration ?? 5000;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`w-full rounded-lg shadow-lg p-4 pt-3 pb-5 relative flex items-start gap-3 ${
                toast.variant === 'success'
                  ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                  : toast.variant === 'error'
                  ? 'bg-red-100 border border-red-200 text-red-800'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                {toast.variant === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : toast.variant === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
              <div className="flex-1 ml-2">
                {toast.title && (
                  <h3 className="font-medium text-sm">{toast.title}</h3>
                )}
                {toast.message && (
                  <p className="text-sm mt-1 opacity-90">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Barre de progression */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 rounded-b ${
                  toast.variant === 'success'
                    ? 'bg-emerald-500'
                    : toast.variant === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
