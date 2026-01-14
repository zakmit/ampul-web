'use client'
import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { handleSignIn, handleSignOut } from '@/app/actions/auth'

interface SignInModalProps {
  isOpen: boolean
  isAtBottom: boolean
  isNavVisible: boolean
  onClose: () => void
}

export default function AdminSignInModal({ isOpen, isAtBottom, isNavVisible, onClose }: SignInModalProps) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const user = session?.user

  if (!isOpen) return null

  const handleGoogleSignIn = () => {
    setError(null)
    startTransition(async () => {
      const callbackUrl = window.location.href
      const result = await handleSignIn('google', callbackUrl)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleSignOutClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await handleSignOut()
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const isSignedIn = !!user

  // Calculate top position based on NavBar visibility
  const getButtomPosition = () => {
    if (!isNavVisible) {
      // NavBar is hidden - modal should be at top of screen
      return 'bottom-2'
    }
    if (isAtBottom) {
      // At top with banner visible: banner (h-4/h-6) + navbar (h-14)
      return 'bottom-14'
    }
    // NavBar visible but no banner or not at top: just navbar (h-14)
    return 'bottom-12'
  }

  return (
    <>
      {/* Background Blur - Click to close - extends under navbar */}

      {/* Modal Container */}
      <div className={`fixed right-0 w-full z-10 lg:w-full flex justify-center ${getButtomPosition()}`}>
        <div className="w-full sm:flex sm:justify-end sm:w-3xl px-2">
          <div
            className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-20 transition-all duration-500 cursor-pointer`}
            onClick={handleClose}
          />
          <div
            className={`relative bg-white border z-50 border-gray-900 rounded-md w-full h-auto sm:w-96 shadow-lg transform origin-top transition-all duration-300 ${
              isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-4 text-gray-900 hover:text-gray-600 transition-colors z-10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" strokeWidth={1.5}/>
            </button>

            {/* Content */}
            <div className="flex flex-col h-full lg:w-96 lg:h-auto px-6 pb-4 pt-8 overflow-y-auto">
              {!isSignedIn ? (
                /* Sign In View */
                <>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold text-center mb-4 font-title">
                      Sign In
                    </h2>

                    <div className="border-t border-gray-500 w-full mb-6 mx-2"></div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isPending}
                        className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-400 hover:border-gray-600 transition-all hover:shadow-md cursor-pointer lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* Google Logo SVG */}
                        <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-10 lg:h-10">
                          <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10C22.5492 10 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                          <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                          <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                          <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                        </svg>
                        <span className="text-base font-medium">
                          {isPending ? 'Signing in...' : "Sign In with Google"}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 italic mt-2">Demo mode: some data will be read-only or mocked</p>
                  </div>
                </>
              ) : (
                /* After Sign In View */
                <>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-xl font-semibold text-center mb-4">
                      Hello, {user?.name || 'Apollodorus'}
                    </p>
                    <div className="">
                      <button
                        onClick={handleSignOutClick}
                        className="text-sm underline hover:font-bold hover:text-gray-700 cursor-pointer transition-all w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? 'Signing out...' : "Sign Out"}
                      </button>
                    </div>
                    {user.role === "admin" ? (<></>) : (
                      <p className="text-xs text-gray-500 italic mt-2">Demo mode: some data will be read-only or mocked</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}