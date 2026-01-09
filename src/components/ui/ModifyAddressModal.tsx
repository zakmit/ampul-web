'use client';

const INPUT_STYLE = "w-full text-sm px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";

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

interface ModifyAddressModalProps {
  isOpen: boolean;
  address: AddressData | null;
  onClose: () => void;
  onSave: () => void;
  onUpdateAddress: (updates: Partial<AddressData>) => void;
}

export function ModifyAddressModal({
  isOpen,
  address,
  onClose,
  onSave,
  onUpdateAddress,
}: ModifyAddressModalProps) {
  if (!isOpen || !address) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-40 transition-all duration-500 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-md w-75 lg:w-100 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Modify Address</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-base italic mb-2">Recipient Name</label>
            <input
              type="text"
              value={address.recipientName || ''}
              onChange={(e) => onUpdateAddress({ recipientName: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          <div>
            <label className="block text-base italic mb-2">Phone Number</label>
            <input
              type="tel"
              value={address.recipientPhone || ''}
              onChange={(e) => onUpdateAddress({ recipientPhone: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          <div>
            <label className="block text-base italic mb-2">Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={address.shippingLine1 || ''}
              onChange={(e) => onUpdateAddress({ shippingLine1: e.target.value })}
              className={INPUT_STYLE + " mb-3"}
            />
            <input
              type="text"
              placeholder="Unit(Optional)"
              value={address.shippingLine2 || ''}
              onChange={(e) => onUpdateAddress({ shippingLine2: e.target.value })}
              className={INPUT_STYLE + " mb-3"}
            />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="City"
                value={address.shippingCity || ''}
                onChange={(e) => onUpdateAddress({ shippingCity: e.target.value })}
                className={INPUT_STYLE}
              />
              <input
                type="text"
                placeholder="Region"
                value={address.shippingRegion || ''}
                onChange={(e) => onUpdateAddress({ shippingRegion: e.target.value })}
                className={INPUT_STYLE}
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={address.shippingPostal || ''}
                onChange={(e) => onUpdateAddress({ shippingPostal: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
            <input
              type="text"
              placeholder="Country"
              value={address.shippingCountry || ''}
              onChange={(e) => onUpdateAddress({ shippingCountry: e.target.value })}
              className={INPUT_STYLE}
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onSave}
              className="w-full bg-gray-700 text-white py-2 px-8 font-semibold hover:bg-gray-900"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
