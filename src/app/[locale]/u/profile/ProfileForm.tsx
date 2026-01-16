'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { updateProfile } from './actions'
import type { ProfileFormData, FormErrors } from './validation'

export const INPUT_STYLE = "w-full text-base px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
export const INPUT_ERROR_STYLE = "w-full text-base px-4 py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic"

interface ProfileFormProps {
  initialData: {
    user: {
      name: string | null
      email: string | null
      birthday: string | null
      phone: string | null
    }
    address: {
      addressLine1: string
      addressLine2: string | null
      city: string
      region: string | null
      postalCode: string
      country: string
    } | null
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('ProfilePage')
  const [isPending, startTransition] = useTransition()
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData.user.name || '',
    birthday: initialData.user.birthday || '',
    phone: initialData.user.phone || '',
    addressLine1: initialData.address?.addressLine1 || '',
    addressLine2: initialData.address?.addressLine2 || '',
    city: initialData.address?.city || '',
    region: initialData.address?.region || '',
    postalCode: initialData.address?.postalCode || '',
    country: initialData.address?.country || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user types
    if (fieldErrors[name as keyof ProfileFormData]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof ProfileFormData]
        return newErrors
      })
    }
    setGeneralError(null)
    setSuccess(false)
  }

  const handleSave = () => {
    setGeneralError(null)
    setFieldErrors({})
    setSuccess(false)

    startTransition(async () => {
      const result = await updateProfile(formData)

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
        setGeneralError(t('errorMessage'))
      } else if (result.error) {
        setGeneralError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const getInputStyle = (fieldName: keyof ProfileFormData) => {
    return fieldErrors[fieldName] ? INPUT_ERROR_STYLE : INPUT_STYLE
  }

  const renderFieldError = (fieldName: keyof ProfileFormData) => {
    const errorKey = fieldErrors[fieldName]
    if (!errorKey) return null

    return (
      <p className="mt-1 text-sm text-red-700">
        {t(`errors.${errorKey}`)}
      </p>
    )
  }

  return (
    <div className="px-6 py-7 lg:px-16 lg:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-olive-100 border border-olive-200 text-olive-700 rounded">
            {t('successMessage')}
          </div>
        )}

        {/* General Error Message */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded">
            {generalError}
          </div>
        )}

        {/* Name */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">
            {t('fields.name')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={getInputStyle('name')}
            placeholder={t('placeholders.name')}
            disabled={isPending}
          />
          {renderFieldError('name')}
        </div>

        {/* Birthday */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">
            {t('fields.birthday')}
          </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder={t('placeholders.birthday')}
            disabled={isPending}
          />
        </div>

        {/* Email Address (Read-only) */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">
            {t('fields.emailAddress')}
          </label>
          <div className="px-4 py-2 text-gray-600">
            {initialData.user.email || ''}
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-8">
          <label className="block text-base font-title italic mb-3">
            {t('fields.phoneNumber')}
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className={INPUT_STYLE}
            placeholder={t('placeholders.phone')}
            disabled={isPending}
          />
        </div>

        {/* Address */}
        <div className="mb-7">
          <div className="mb-3">
            <label className="block text-base font-title italic">
              {t('fields.address')}
            </label>
            <span className="text-xs leading-none italic text-gray-500">{t('demoAddressNotice')}</span>
          </div>
          <div className="space-y-4">
            {/* Address Line 1 */}
            <div>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className={getInputStyle('addressLine1')}
                placeholder={t('placeholders.addressLine1')}
                disabled={isPending}
              />
              {renderFieldError('addressLine1')}
            </div>

            {/* Address Line 2 */}
            <div>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2 || ''}
                onChange={handleChange}
                className={getInputStyle('addressLine2')}
                placeholder={t('placeholders.addressLine2')}
                disabled={isPending}
              />
              {renderFieldError('addressLine2')}
            </div>

            {/* City, Region, Postal Code */}
            <div className='flex flex-row gap-2 lg:gap-4'>
              <div className="">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={getInputStyle('city')}
                  placeholder={t('placeholders.city')}
                  disabled={isPending}
                />
                {renderFieldError('city')}
              </div>
              <div className="">
                <input
                  type="text"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                  className={getInputStyle('region')}
                  placeholder={t('placeholders.region')}
                  disabled={isPending}
                />
                {renderFieldError('region')}
              </div>
              <div className="">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={getInputStyle('postalCode')}
                  placeholder={t('placeholders.postalCode')}
                  disabled={isPending}
                />
                {renderFieldError('postalCode')}
              </div>
            </div>

            {/* Country */}
            <div>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={getInputStyle('country')}
                placeholder={t('placeholders.country')}
                disabled={isPending}
              />
              {renderFieldError('country')}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-12 py-2 bg-gray-700 text-white font-semibold text-sm lg:text-base uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
