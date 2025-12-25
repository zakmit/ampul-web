'use client'
import { useState } from 'react'

interface SignInModalProps {
  isOpen: boolean
  showBanner: boolean
  onClose: () => void
}

export default function SignInModal({ isOpen, showBanner, onClose}: SignInModalProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  if (!isOpen) return null

  const handleGoogleSignIn = () => {
    // For testing layout purposes, just show the signed-in state
    setIsSignedIn(true)
  }

  const handleClose = () => {
    setIsSignedIn(false)
    onClose()
  }

  return (
    <>
      {/* Background Blur - Click to close - extends under navbar */}
      <div
        className="fixed inset-0 top-0 bg-gray-800/30 backdrop-blur-sm z-30 transition-all duration-500"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className={`fixed right-0  z-50 w-full lg:w-auto flex justify-center lg:justify-end ${
        showBanner ? 'top-18 lg:top-20' : 'top-14'
      }`}>
        <div
          className={`relative bg-white w-full h-auto lg:w-full lg:max-w-md shadow-2xl transform origin-top transition-all duration-300 ${
            isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-4 text-gray-900 hover:text-gray-600 transition-colors z-10"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex flex-col h-full lg:w-96 lg:h-auto px-6 pb-8 pt-12 overflow-y-auto">
            {!isSignedIn ? (
              /* Sign In View */
              <>
                <div className="flex-1 flex flex-col justify-center lg:justify-start">
                  <h2 className="text-xl font-bold text-center mb-4 font-title">
                    Sign In
                  </h2>

                  <div className="border-t border-gray-500 mb-6 mx-2"></div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleGoogleSignIn}
                      className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-400 hover:border-gray-600 transition-all hover:shadow-md cursor-pointer lg:w-auto"
                    >
                      {/* Google Logo SVG */}
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-10 lg:h-10">
                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10C22.5492 10 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                        <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                        <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                      </svg>
                      <span className="text-base font-medium">Sign in with Google</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* After Sign In View */
              <>
                <div className="flex-1 flex flex-col justify-center lg:justify-start">
                  <p className="text-xl font-semibold text-center mb-9">
                    Welcome, Apollodorus
                  </p>

                  <nav className="space-y-4 ">
                    <a
                      href="#"
                      className="block text-base font-title italic hover:underline transition-all"
                    >
                      MY ORDER
                    </a>
                    <a
                      href="#"
                      className="block text-base font-title italic hover:underline transition-all"
                    >
                      MY INFORMATION
                    </a>
                  </nav>

                  <div className="mt-auto pt-8">
                    <button
                      onClick={() => setIsSignedIn(false)}
                      className="text-sm underline hover:font-bold hover:text-gray-700 cursor-pointer transition-all w-full text-center"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
