'use client';
import { X } from 'lucide-react'

const INPUT_STYLE = "w-full text-sm px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
const INPUT_ERROR_STYLE = "w-full text-sm px-2 py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic";

export interface AddressData {
  recipientName?: string;
  recipientPhone?: string | null;
  shippingLine1?: string;
  shippingLine2?: string | null;
  shippingCity?: string;
  shippingRegion?: string | null;
  shippingPostal?: string;
  shippingCountry?: string;
}

export interface AddressFieldErrors {
  recipientName?: string;
  recipientPhone?: string;
  shippingLine1?: string;
  shippingLine2?: string;
  shippingCity?: string;
  shippingRegion?: string;
  shippingPostal?: string;
  shippingCountry?: string;
}

interface EditAddressModalProps {
  isOpen: boolean;
  address: AddressData | null;
  onClose: () => void;
  onSave: () => void;
  onUpdateAddress: (updates: Partial<AddressData>) => void;
  fieldErrors?: AddressFieldErrors;
  isLoading?: boolean;
}

export function EditAddressModal({
  isOpen,
  address,
  onClose,
  onSave,
  onUpdateAddress,
  fieldErrors = {},
  isLoading = false,
}: EditAddressModalProps) {
  if (!isOpen || !address) return null;

  const getInputStyle = (fieldName: keyof AddressFieldErrors) => {
    return fieldErrors[fieldName] ? INPUT_ERROR_STYLE : INPUT_STYLE;
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-80 transition-all duration-500 flex items-center justify-center"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="bg-white p-6 w-75 sm:w-100 mx-4 relative"
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
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Address</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-title text-base italic mb-2">Recipient Name</label>
            <input
              type="text"
              value={address.recipientName || ''}
              onChange={(e) => onUpdateAddress({ recipientName: e.target.value })}
              disabled={isLoading}
              className={getInputStyle('recipientName')}
            />
            {fieldErrors.recipientName && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.recipientName}</p>
            )}
          </div>

          <div>
            <label className="block font-title text-base italic mb-2">Phone Number</label>
            <input
              type="tel"
              value={address.recipientPhone || ''}
              onChange={(e) => onUpdateAddress({ recipientPhone: e.target.value })}
              disabled={isLoading}
              className={getInputStyle('recipientPhone')}
            />
            {fieldErrors.recipientPhone && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.recipientPhone}</p>
            )}
          </div>

          <div>
            <label className="block font-title text-base italic mb-2">Address</label>
            <div>
              <input
                type="text"
                placeholder="Street Address"
                value={address.shippingLine1 || ''}
                onChange={(e) => onUpdateAddress({ shippingLine1: e.target.value })}
                disabled={isLoading}
                className={getInputStyle('shippingLine1')}
              />
              {fieldErrors.shippingLine1 && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingLine1}</p>
              )}
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Unit(Optional)"
                value={address.shippingLine2 || ''}
                onChange={(e) => onUpdateAddress({ shippingLine2: e.target.value })}
                disabled={isLoading}
                className={getInputStyle('shippingLine2')}
              />
              {fieldErrors.shippingLine2 && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingLine2}</p>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="City"
                  value={address.shippingCity || ''}
                  onChange={(e) => onUpdateAddress({ shippingCity: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('shippingCity')}
                />
                {fieldErrors.shippingCity && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingCity}</p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Region"
                  value={address.shippingRegion || ''}
                  onChange={(e) => onUpdateAddress({ shippingRegion: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('shippingRegion')}
                />
                {fieldErrors.shippingRegion && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingRegion}</p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={address.shippingPostal || ''}
                  onChange={(e) => onUpdateAddress({ shippingPostal: e.target.value })}
                  disabled={isLoading}
                  className={getInputStyle('shippingPostal')}
                />
                {fieldErrors.shippingPostal && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingPostal}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Country"
                value={address.shippingCountry || ''}
                onChange={(e) => onUpdateAddress({ shippingCountry: e.target.value })}
                disabled={isLoading}
                className={getInputStyle('shippingCountry')}
              />
              {fieldErrors.shippingCountry && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.shippingCountry}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onSave}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white py-2 px-8 font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
