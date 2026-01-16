'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingOverlayContextType {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | undefined>(undefined)

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingOverlayContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-gray-800/20 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Simple spinner */}
              <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingOverlayContext.Provider>
  )
}

export function useLoadingOverlay() {
  const context = useContext(LoadingOverlayContext)
  if (context === undefined) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider')
  }
  return context
}
