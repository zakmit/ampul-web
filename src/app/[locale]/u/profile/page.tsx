'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export const INPUT_STYLE = "w-full text-base px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const [formData, setFormData] = useState({
    name: 'Apollodorus',
    birthday: '05/05/1955',
    email: 'Apollodorus@exemple.com',
    phone: '+44912345678',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
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
          <label className="block text-base font-title italic mb-3">{t('fields.name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder={t('placeholders.name')}
          />
        </div>

        {/* Birthday */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">{t('fields.birthday')}</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder={t('placeholders.birthday')}
          />
        </div>

        {/* Email Address */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">{t('fields.emailAddress')}</label>
          <div className="px-4 py-2">
            {formData.email || 'Apollodorus@exemple.com'}
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">{t('fields.phoneNumber')}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder={t('placeholders.phone')}
          />
        </div>

        {/* Address */}
        <div className="mb-7">
          <label className="block text-base font-title italic mb-3">{t('fields.address')}</label>
          <div className="space-y-4">
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder={t('placeholders.addressLine1')}
            />
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder={t('placeholders.addressLine2')}
            />
            <div className='flex flex-row gap-2 lg:gap-4'>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={INPUT_STYLE}
                placeholder={t('placeholders.city')}
              />
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={INPUT_STYLE}
                placeholder={t('placeholders.region')}
              />
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full lg:max-w-40 text-base px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                placeholder={t('placeholders.postalCode')}
              />
            </div>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={INPUT_STYLE}
              placeholder={t('placeholders.country')}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-12 py-2 bg-gray-700 text-white font-semibold text-sm lg:text-base uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
