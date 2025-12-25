'use client';

import { useState } from 'react';

export const INPUT_STYLE = "w-full text-base px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Apollodorus',
    birthday: '05/05/1955',
    email: 'Apollodorus@exemple.com',
    phone: '+44912345678',
    streetAddress: '',
    unit: '',
    cityStateZip: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    // TODO: Add API call to save profile data
  };

  return (
    <div className="px-6 py-7 lg:px-16 lg:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Name */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder="Your Name"
          />
        </div>

        {/* Birthday */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder="MM/DD/YYYY"
          />
        </div>

        {/* Email Address */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">Email Address</label>
          <div className="px-4 py-2">
            {formData.email || 'Apollodorus@exemple.com'}
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Address */}
        <div className="mb-7">
          <label className="block text-base font-title italic mb-3">Address</label>
          <div className="space-y-4">
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder="Street Address"
            />
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder="Unit(Optional)"
            />
            <input
              type="text"
              name="cityStateZip"
              value={formData.cityStateZip}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder="City, State, Zip Code"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder="Country"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-12 py-2 bg-gray-700 text-white font-semibold text-sm lg:text-base uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
