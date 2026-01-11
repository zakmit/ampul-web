'use client';
import { X } from 'lucide-react'

const INPUT_STYLE = "w-full text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";

export interface UserInfoData {
  name: string;
  email: string;
  birthday?: string | null;
  phone?: string | null;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  region?: string | null;
  postalCode?: string;
  country?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: UserInfoData | null;
  onClose: () => void;
  onSave: () => void;
  onUpdateUser: (updates: Partial<UserInfoData>) => void;
}

export function EditUserModal({
  isOpen,
  user,
  onClose,
  onSave,
  onUpdateUser,
}: EditUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-40 transition-all duration-500 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 w-75 sm:w-150 max-h-dvh relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-900 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Edit Information</h2>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block font-title text-base italic mb-2">Name</label>
            <input
              type="text"
              value={user.name || ''}
              onChange={(e) => onUpdateUser({ name: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block font-title text-base italic mb-2">Birthday</label>
            <input
              type="date"
              value={user.birthday || ''}
              onChange={(e) => onUpdateUser({ birthday: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          {/* Email Address (Read-only) */}
          <div>
            <label className="block font-title text-base italic mb-2">Email Address</label>
            <div className="px-2">
              {user.email}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-title text-base italic mb-2">Phone Number</label>
            <input
              type="tel"
              value={user.phone || ''}
              onChange={(e) => onUpdateUser({ phone: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-title text-base italic mb-3">Address</label>
            <div className="space-y-3">
              {/* Street Address */}
              <input
                type="text"
                placeholder="Street Address"
                value={user.addressLine1 || ''}
                onChange={(e) => onUpdateUser({ addressLine1: e.target.value })}
                className={INPUT_STYLE}
              />

              {/* Unit (Optional) */}
              <input
                type="text"
                placeholder="Unit(Optional)"
                value={user.addressLine2 || ''}
                onChange={(e) => onUpdateUser({ addressLine2: e.target.value })}
                className={INPUT_STYLE}
              />

              {/* City, Region, Postal Code */}
              <div className="flex flex-row gap-2 lg:gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={user.city || ''}
                  onChange={(e) => onUpdateUser({ city: e.target.value })}
                  className={INPUT_STYLE}
                />
                <input
                  type="text"
                  placeholder="Region"
                  value={user.region || ''}
                  onChange={(e) => onUpdateUser({ region: e.target.value })}
                  className={INPUT_STYLE}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={user.postalCode || ''}
                  onChange={(e) => onUpdateUser({ postalCode: e.target.value })}
                  className={INPUT_STYLE}
                />
              </div>

              {/* Country */}
              <input
                type="text"
                placeholder="Country"
                value={user.country || ''}
                onChange={(e) => onUpdateUser({ country: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onSave}
              className="px-12 py-2 bg-gray-700 text-white font-semibold text-sm lg:text-base uppercase tracking-wider hover:bg-gray-900"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
