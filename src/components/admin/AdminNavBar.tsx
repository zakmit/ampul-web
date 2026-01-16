'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import AdminSignInModal from "./AdminSigninModal"

export default function AdminNavBar() {
    const [isNavVisible, setIsNavVisible] = useState(true)
    const [isAtBottom, setIsAtBottom] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [showProductsMenu, setShowProductsMenu] = useState(false)
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

    useEffect(() => {
      const controlNavbar = () => {
        const currentScrollY = window.scrollY
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        const isCurrentlyAtBottom = currentScrollY + clientHeight >= scrollHeight - 10

        setIsAtBottom(isCurrentlyAtBottom)
          if (isCurrentlyAtBottom) {
          setIsNavVisible(true)
        } else {
          // Detect scroll direction
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // scroll down -> hide NavBar
            setIsNavVisible(false)
          } else if (currentScrollY < lastScrollY) {
            // scroll up -> show NavBar
            setIsNavVisible(true)
          }
        }

        setLastScrollY(currentScrollY)
      }

      window.addEventListener('scroll', controlNavbar)
      return () => window.removeEventListener('scroll', controlNavbar)
    }, [lastScrollY])
  
      const getNavPosition = () => {
          if (!isNavVisible) {  // hide -> translate up
            return 'translate-y-11'
          }
          return 'translate-y-0'
      }
  
      const getNavBottomPosition = () => {
          if (isAtBottom) {
            return 'relative'
          }
          return 'fixed'
      }
  
  return(
    <div className="left-0 right-0 flex w-full h-13 items-center justify-center">
      <nav className={`w-full max-w-3xl px-2 bottom-2 z-20 transition-all duration-300 ease-in-out ${getNavPosition()} ${getNavBottomPosition()}`}>
        <div className="bg-white p-1 text-sm text-center items-center rounded-full border border-gray-900 shadow-lg grid grid-cols-10 md:grid-cols-9 h-9 z-10">
          <Link href="/admin" className="col-span-3 md:col-span-2 text-bold h-full flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-gray-100 transition">
            <h3>Dashboard</h3>
          </Link>

          <div
            className="col-span-2 group text-bold h-full flex items-center justify-center relative hover:bg-gray-700 rounded-full"
            onMouseEnter={() => setShowProductsMenu(true)}
            onMouseLeave={() => setShowProductsMenu(false)}
          >
            <h3 className="cursor-pointer group-hover:text-gray-100 transition">Products</h3>
            {showProductsMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 sm:w-41">
                <div className="bg-white border border-gray-900 rounded-lg shadow-lg py-1 px-1">
                  <ul className="flex flex-col gap-1 text-left">
                    <li>
                      <Link
                        href="/admin/p"
                        className="block px-3 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors"
                      >
                        Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/c"
                        className="block px-3 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors"
                      >
                        Collections
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/props"
                        className="block px-3 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors"
                      >
                        Properties
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Link href="/admin/o" className="col-span-2 text-bold h-full flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-gray-100 transition">
            <h3>Orders</h3>
          </Link>
          <Link href="/admin/u" className="col-span-2 text-bold h-full flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-gray-100 transition">
            <h3>Users</h3>
          </Link>
          <button
            type="button"
            onClick={() => setIsSignInModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md cols-span-1 text-gray-900"
          >
            <span className="sr-only">User</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={16} stroke="currentColor" className="size-6" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                <g transform="matrix(0.0742212,0,0,0.0755272,0.866816,-2.29218)">
                <circle cx="150" cy="130" r="50" style={{fill: 'none', strokeWidth:'11.8px'}}/>
                </g>
                <g transform="matrix(0.0706869,0,0,0.0706869,1.40202,1.87141)">
                <path d="M40,260C40,260 34.706,186.727 40,180C79.181,130.216 225.826,130.522 260,180C264.973,187.2 260,260 260,260L40,260Z" style={{fill: 'none', strokeWidth: '12.5px' }}/>
                </g>
            </svg>
          </button>
        </div>
      </nav>

      {/* Admin Sign In Modal */}
      <AdminSignInModal
        isOpen={isSignInModalOpen}
        isAtBottom={isAtBottom}
        isNavVisible={isNavVisible}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
}