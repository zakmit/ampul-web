'use client';
import { X } from 'lucide-react'

const INPUT_STYLE = "w-full text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
const INPUT_ERROR_STYLE = "w-full text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic";

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

export interface FieldErrors {
  name?: string;
  birthday?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: UserInfoData | null;
  onClose: () => void;
  onSave: () => void;
  onUpdateUser: (updates: Partial<UserInfoData>) => void;
  fieldErrors?: FieldErrors;
  generalError?: string | null;
  isLoading?: boolean;
}

export function EditUserModal({
  isOpen,
  user,
  onClose,
  onSave,
  onUpdateUser,
  fieldErrors = {},
  generalError = null,
  isLoading = false,
}: EditUserModalProps) {
  if (!isOpen || !user) return null;

  const getInputStyle = (fieldName: keyof FieldErrors) => {
    return fieldErrors[fieldName] ? INPUT_ERROR_STYLE : INPUT_STYLE;
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-40 transition-all duration-500 flex items-center justify-center overflow-y-auto"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="bg-white p-6 w-75 sm:w-150 max-h-dvh relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 text-gray-900 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Edit Information</h2>

        {/* General Error */}
        {generalError && (
          <div className="mb-2 px-4 py-1 text-sm bg-red-100 border border-red-500 text-red-700 text-center">
            {generalError}
          </div>
        )}

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block font-title text-base italic mb-2">Name</label>
            <input
              type="text"
              value={user.name || ''}
              onChange={(e) => onUpdateUser({ name: e.target.value })}
              disabled={isLoading}
              className={getInputStyle('name')}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block font-title text-base italic mb-2">Birthday</label>
            <input
              type="date"
              value={user.birthday || ''}
              onChange={(e) => onUpdateUser({ birthday: e.target.value })}
              disabled={isLoading}
              className={getInputStyle('birthday')}
            />
            {fieldErrors.birthday && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.birthday}</p>
            )}
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
              disabled={isLoading}
              className={getInputStyle('phone')}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block font-title text-base italic mb-3">Address</label>
            <div className="space-y-3">
              {/* Street Address */}
              <div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={user.addressLine1 || ''}
                  onChange={(e) => onUpdateUser({ addressLine1: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('addressLine1')}
                />
                {fieldErrors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.addressLine1}</p>
                )}
              </div>

              {/* Unit (Optional) */}
              <div>
                <input
                  type="text"
                  placeholder="Unit(Optional)"
                  value={user.addressLine2 || ''}
                  onChange={(e) => onUpdateUser({ addressLine2: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('addressLine2')}
                />
                {fieldErrors.addressLine2 && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.addressLine2}</p>
                )}
              </div>

              {/* City, Region, Postal Code */}
              <div className="flex flex-row gap-2 lg:gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="City"
                    value={user.city || ''}
                    onChange={(e) => onUpdateUser({ city: e.target.value })}
                    disabled={isLoading}
                    className={getInputStyle('city')}
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.city}</p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Region"
                    value={user.region || ''}
                    onChange={(e) => onUpdateUser({ region: e.target.value })}
                    disabled={isLoading}
                    className={getInputStyle('region')}
                  />
                  {fieldErrors.region && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.region}</p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={user.postalCode || ''}
                    onChange={(e) => onUpdateUser({ postalCode: e.target.value })}
                    disabled={isLoading}
                    className={getInputStyle('postalCode')}
                  />
                  {fieldErrors.postalCode && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <input
                  type="text"
                  placeholder="Country"
                  value={user.country || ''}
                  onChange={(e) => onUpdateUser({ country: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('country')}
                />
                {fieldErrors.country && (
                  <p className="mt-1 text-sm text-red-700">{fieldErrors.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-12 py-2 bg-gray-700 text-white font-semibold text-sm lg:text-base uppercase tracking-wider hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
