'use client'

import { useState, useEffect, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { m, AnimatePresence } from 'framer-motion'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'
import { useLoadingOverlay } from '@/components/providers/LoadingOverlayProvider'
import { getShoppingBagItems, getAvailableProductsForSample } from '@/app/actions/shoppingBag'
import { getUserAddress, createOrder, type CheckoutAddress } from '@/app/actions/checkout'
import type { ShoppingBagItemDetails } from '@/app/actions/shoppingBag'
import type { Locale } from '@/i18n/config'
import SignInForm from '@/components/modals/SignInForm'
const INPUT_STYLE = "w-full text-sm px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
const INPUT_ERROR_STYLE = "w-full text-sm px-4 py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic"

type CheckoutStep = 1 | 2 | 3

export default function CheckoutPage() {
  const t = useTranslations('Checkout')
  const tProfile = useTranslations('ProfilePage')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as Locale
  const { data: session, status } = useSession()
  const { items: bagItems, selectedSample, clearBag, setSelectedSample } = useShoppingBag()
  const { hideLoading } = useLoadingOverlay()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [items, setItems] = useState<ShoppingBagItemDetails[]>([])
  const [availableProducts, setAvailableProducts] = useState<Array<{ value: string; label: string }>>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [useProfileAddress, setUseProfileAddress] = useState(false)
  const [address, setAddress] = useState<CheckoutAddress>({
    recipientName: '',
    recipientPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Load shopping bag items and available products
  useEffect(() => {
    async function loadData() {
      try {
        const [bagItemsData, productsData] = await Promise.all([
          getShoppingBagItems(bagItems, locale),
          getAvailableProductsForSample(locale),
        ])

        setItems(bagItemsData)
        setAvailableProducts(productsData)

        // Set default sample to first product if none selected
        if (!selectedSample && productsData.length > 0) {
          setSelectedSample(productsData[0].value)
        }
      } catch (error) {
        console.error('Error loading checkout data:', error)
      } finally {
        setDataLoaded(true)
        hideLoading() // Hide global loading overlay when data is loaded
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bagItems, locale, hideLoading])

  // Load user address if logged in
  useEffect(() => {
    async function loadUserAddress() {
      if (session?.user) {
        const userAddress = await getUserAddress()
        if (userAddress) {
          setAddress(userAddress)
        }
      }
    }

    if (status === 'authenticated') {
      setCurrentStep(2) // Skip sign-in step
      loadUserAddress()
    }
  }, [session, status])

  // Redirect if bag is empty
  useEffect(() => {
    if (dataLoaded && items.length === 0) {
      router.push(`/${locale}`)
    }
  }, [items, dataLoaded, router, locale])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))

    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    setGeneralError(null)
  }

  const handleUseProfileAddress = async (checked: boolean) => {
    setUseProfileAddress(checked)
    if (checked) {
      const userAddress = await getUserAddress()
      if (userAddress) {
        setAddress(userAddress)
      }
    }
  }

  const validateAddress = () => {
    const errors: Record<string, string> = {}

    if (!address.recipientName?.trim()) {
      errors.recipientName = 'recipientNameRequired'
    }
    if (!address.addressLine1?.trim()) {
      errors.addressLine1 = 'addressLine1Required'
    }
    if (!address.city?.trim()) {
      errors.city = 'cityRequired'
    }
    if (!address.postalCode?.trim()) {
      errors.postalCode = 'postalCodeRequired'
    }
    if (!address.country?.trim()) {
      errors.country = 'countryRequired'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextFromAddress = () => {
    setGeneralError(null)
    if (validateAddress()) {
      setCurrentStep(3)
    } else {
      setGeneralError(t('errors.addressValidation'))
    }
  }

  const handlePlaceOrder = () => {
    setGeneralError(null)

    // Validate everything again
    if (!validateAddress()) {
      setGeneralError(t('errors.addressValidation'))
      setCurrentStep(2)
      return
    }

    if (items.length === 0) {
      setGeneralError(t('errors.emptyBag'))
      return
    }

    startTransition(async () => {
      const result = await createOrder(bagItems, selectedSample, address, locale)

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
        setGeneralError(t('errors.addressValidation'))
        setCurrentStep(2)
      } else if (result.error) {
        setGeneralError(result.error)
      } else if (result.success && result.orderId) {
        // Clear the shopping bag
        clearBag()
        // Redirect to success page
        router.push(`/${locale}/checkout/success?orderId=${result.orderId}`)
      }
    })
  }

  const getInputStyle = (fieldName: keyof CheckoutAddress) => {
    return fieldErrors[fieldName] ? INPUT_ERROR_STYLE : INPUT_STYLE
  }

  const renderFieldError = (fieldName: keyof CheckoutAddress) => {
    const errorKey = fieldErrors[fieldName]
    if (!errorKey) return null

    return (
      <p className="mt-1 text-sm text-red-700">
        {t(`errors.${errorKey}`)}
      </p>
    )
  }

  return (
    <div className="lg:flex lg:justify-center">
      {/* Desktop Layout: 7:3 Grid */}
      <div className="hidden lg:grid lg:grid-cols-10 w-full max-w-400">
        {/* Left Section - Checkout Form (70%) */}
        <div className="col-span-7 px-8 py-12">
          <h1 className="text-4xl font-bold font-title mb-12">{t('title')}</h1>
          <div className="px-4">
            {generalError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded">
                {generalError}
              </div>
            )}

            {/* Step 1: LOG IN */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">{t('step1')}</h2>
              <div
                className={`border-gray-500 transition-all ${currentStep === 1 ? 'border' : 'border-t'}`}
              >
                {currentStep === 1 ? (
                  <div className="p-8">
                    <SignInForm />
                  </div>
                ) : (
                  <div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: SHIPPING ADDRESS */}
              <div className={`mb-8 ${currentStep > 2 ? 'cursor-pointer' : ''}`} onClick={() => currentStep > 2 && setCurrentStep(2)}>
                <h2 className="text-2xl font-bold mb-3">{t('step2')}</h2>
                <div
                  className={`border-gray-500 overflow-hidden transition-all duration-500 ease-in-out 
                    ${currentStep === 2 ? 'border' : 'border-t'}`}>
                  <AnimatePresence initial={false}>
                    {currentStep === 2 && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="use-profile-address"
                            checked={useProfileAddress}
                            onChange={(e) => handleUseProfileAddress(e.target.checked)}
                            className="w-5 h-5 cursor-pointer accent-gray-900"
                          />
                          <label htmlFor="use-profile-address" className="text-base cursor-pointer">
                            {t('useProfileAddress')}
                          </label>
                        </div>

                      <div className="grid grid-cols-2 gap-10">
                        {/* Left Column */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-base font-title italic mb-2">{t('recipientName')}</label>
                            <input
                              type="text"
                              name="recipientName"
                              value={address.recipientName}
                              placeholder={tProfile('placeholders.name')}
                              onChange={handleAddressChange}
                              className={getInputStyle('recipientName')}
                              disabled={isPending}
                            />
                            {renderFieldError('recipientName')}
                          </div>

                          <div>
                            <label className="block text-base font-title italic mb-2">{t('phoneNumber')}</label>
                            <input
                              type="tel"
                              name="recipientPhone"
                              value={address.recipientPhone}
                              placeholder={tProfile('placeholders.phone')}
                              onChange={handleAddressChange}
                              className={INPUT_STYLE}
                              disabled={isPending}
                            />
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          <div>
                            <div className="mb-2 flex flex-row">
                              <label className="block text-base font-title italic">{t('address')}</label>
                              <span className="text-xs leading-none italic text-gray-500">{t('demoAddressNotice')}</span>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <input
                                  type="text"
                                  name="addressLine1"
                                  value={address.addressLine1}
                                  onChange={handleAddressChange}
                                  placeholder={tProfile('placeholders.addressLine1')}
                                  className={getInputStyle('addressLine1')}
                                  disabled={isPending}
                                />
                                {renderFieldError('addressLine1')}
                              </div>
                              <input
                                type="text"
                                name="addressLine2"
                                value={address.addressLine2}
                                onChange={handleAddressChange}
                                placeholder={tProfile('placeholders.addressLine2')}
                                className={INPUT_STYLE}
                                disabled={isPending}
                              />
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    placeholder={tProfile('placeholders.city')}
                                    className={getInputStyle('city')}
                                    disabled={isPending}
                                  />
                                  {renderFieldError('city')}
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    name="region"
                                    value={address.region}
                                    onChange={handleAddressChange}
                                    placeholder={tProfile('placeholders.region')}
                                    className={INPUT_STYLE}
                                    disabled={isPending}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    name="postalCode"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                    placeholder={tProfile('placeholders.postalCode')}
                                    className={getInputStyle('postalCode')}
                                    disabled={isPending}
                                  />
                                  {renderFieldError('postalCode')}
                                </div>
                              </div>
                              <div>
                                <input
                                  type="text"
                                  name="country"
                                  value={address.country}
                                  onChange={handleAddressChange}
                                  placeholder={tProfile('placeholders.country')}
                                  className={getInputStyle('country')}
                                  disabled={isPending}
                                />
                                {renderFieldError('country')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center mt-8">
                        <button
                          onClick={handleNextFromAddress}
                          disabled={isPending}
                          className="px-16 py-3 font-medium bg-gray-700 text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
                        >
                          {t('next')}
                        </button>
                      </div>
                    </div>
                    </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            {/* Step 3: REVIEW & PAYMENT */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">{t('step3')}</h2>
                <div
                  className={`border-gray-500 overflow-hidden transition-all duration-500 ease-in-out ${currentStep === 3 ? 'border' : 'border-t'}`}
                >
                <AnimatePresence initial={false}>
                  {currentStep >= 3 && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-8">
                  <div className="grid grid-cols-3 gap-8">
                    {/* Left: Product List (2/3) */}
                    <div className="col-span-2 space-y-6">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.volumeId}`} className="flex gap-4">
                          <div className="relative w-32 h-32 bg-gray-100 shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 flex justify-between">
                            <div>
                              <h3 className="text-lg font-bold">{item.productName}</h3>
                              <p className="text-sm">{item.productSubtitle}</p>
                              <p className="text-sm">{item.volumeDisplay}</p>
                            </div>
                            <div className="text-right flex flex-col justify-between">
                              <p className="text-sm mb-1">x{item.quantity}</p>
                              <p className="text-sm ">{item.price}{tCommon('currency')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Shipping & Payment (1/3) */}
                    <div className="col-span-1 space-y-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm italic">{t('freeSample')}</span>
                        <span className="text-sm italic">
                          {availableProducts.find((p) => p.value === selectedSample)?.label || t('noSample')}
                        </span>
                      </div>
                      <div className="border-b mx-2">
                        <div className="flex justify-between text-base mb-2 -mx-2">
                          <span>{t('subtotal')}</span>
                          <span>{subtotal}{tCommon('currency')}</span>
                        </div>
                        <div className="flex justify-between text-base italic font-bold mb-2 -mx-2">
                          <span className="font-title">TOTAL</span>
                          <span>{total}{tCommon('currency')}</span>
                        </div>
                      </div>

                      <div className="flex flex-row justify-between">
                        <h3 className="text-base font-bold italic mb-2">{t('shipTo')}</h3>
                        <div className="text-sm space-y-0.5">
                          <p>{address.recipientName}</p>
                          {address.recipientPhone && <p>{address.recipientPhone}</p>}
                          {(() => {
                            switch (locale) {
                              case 'tw':
                                return (
                                  <>
                                    <p>
                                      {address.postalCode} {address.region && `${address.region} `} {address.city}
                                    </p>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.country}</p>
                                  </>
                                )
                              case 'fr':
                                return (
                                  <>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>
                                      {address.postalCode} {address.city}
                                    </p>
                                    {address.region && <p>{address.region}</p>}
                                    <p>{address.country}</p>
                                  </>
                                )
                              default:
                                return (
                                  <>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>
                                      {address.city}
                                      {address.region && `, ${address.region}`} {address.postalCode}
                                    </p>
                                    <p>{address.country}</p>
                                  </>
                                )
                            }
                          })()}
                        </div>
                      </div>

                      <h3 className="text-base font-bold italic mb-4">{t('payment')}</h3>
                      <div className="space-y-3 mx-2">
                        <div className="border border-gray-500 rounded-md flex items-center gap-2 px-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          <span className="text-xs">4242 4242 4242 4242</span>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <input
                            type="text"
                            value="12 / 28"
                            disabled
                            className="w-full px-2 py-1 border border-gray-500 rounded-md text-center"
                          />
                          <input
                            type="text"
                            value="422"
                            disabled
                            className="w-full px-2 py-1 border border-gray-500 rounded-md text-center"
                          />
                        </div>
                        <p className="text-xs italic text-gray-500 text-start">{t('demoNotice')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 font-medium mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isPending}
                      className="px-12 py-3 border border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {t('back')}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPending}
                      className="px-12 py-3 bg-gray-700 text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      {isPending ? t('processing') : t('placeOrder')}
                    </button>
                  </div>
                </div>
                  </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Order Summary (30%) */}
        <div className="col-span-3 px-8 py-12 border-l border-gray-900 my-6">
          <div className="space-y-4 mb-8 -my-6">
            {items.map((item) => (
              <div key={`${item.productId}-${item.volumeId}`} className="flex gap-4">
                <div className="relative w-20 h-20 bg-gray-100 shrink-0">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold">{item.productName}</h3>
                  <p className="text-xs">{item.productSubtitle}</p>
                  <p className="text-xs">{item.volumeDisplay}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">x{item.quantity}</span>
                    <span className="text-sm font-semibold">{item.price}{tCommon('currency')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center text-sm italic">
              <span>{t('freeSample')}</span>
              <span>
                {availableProducts.find((p) => p.value === selectedSample)?.label || t('noSample')}
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-base">
              <span>{t('subtotal')}</span>
              <span>{subtotal}{tCommon('currency')}</span>
            </div>
            <div className="flex justify-between text-base italic font-bold">
              <span className="font-title">TOTAL</span>
              <span>{total}{tCommon('currency')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold font-title text-center mb-6 pb-4 border-b border-gray-500">
            {t('title')}
          </h1>

          {generalError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
              {generalError}
            </div>
          )}

          {/* Step 1: LOG IN */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">{t('step1')}</h2>

            <div
              className={`border-gray-500 transition-all ${currentStep === 1 ? 'border' : 'border-t'}`}
            >
              {currentStep === 1 ? (
                <div className="p-6">
                  <SignInForm />
                </div>
              ) : (
                <div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: SHIPPING ADDRESS */}
            <div className={`mb-6 ${currentStep > 2 ? 'cursor-pointer' : ''}`} onClick={() => currentStep > 2 && setCurrentStep(2)}>
              <h2 className="text-lg font-bold mb-3">{t('step2')}</h2>
              <div
                className={`border-gray-500 overflow-hidden transition-all duration-500 ease-in-out
                  ${currentStep === 2 ? 'border' : 'border-t'}`} >
              <AnimatePresence initial={false}>
                {currentStep === 2 && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-6">

                  <div className="flex items-center gap-2 mb-6">
                    <input
                      type="checkbox"
                      id="use-profile-address-mobile"
                      checked={useProfileAddress}
                      onChange={(e) => handleUseProfileAddress(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-gray-900"
                    />
                    <label htmlFor="use-profile-address-mobile" className="text-sm cursor-pointer">
                      {t('useProfileAddress')}
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-base italic mb-2">{t('recipientName')}</label>
                      <input
                        type="text"
                        name="recipientName"
                        value={address.recipientName}
                        onChange={handleAddressChange}
                        className={getInputStyle('recipientName')}
                        disabled={isPending}
                      />
                      {renderFieldError('recipientName')}
                    </div>

                    <div>
                      <label className="block text-base italic mb-2">{t('phoneNumber')}</label>
                      <input
                        type="tel"
                        name="recipientPhone"
                        value={address.recipientPhone}
                        onChange={handleAddressChange}
                        className={INPUT_STYLE}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <div className="mb-2">
                        <label className="block text-base italic">{t('address')}</label>
                        <span className="text-xs leading-none italic text-gray-500">{t('demoAddressNotice')}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            name="addressLine1"
                            value={address.addressLine1}
                            onChange={handleAddressChange}
                            placeholder={tProfile('placeholders.addressLine1')}
                            className={getInputStyle('addressLine1')}
                            disabled={isPending}
                          />
                          {renderFieldError('addressLine1')}
                        </div>
                        <input
                          type="text"
                          name="addressLine2"
                          value={address.addressLine2}
                          onChange={handleAddressChange}
                          placeholder={tProfile('placeholders.addressLine2')}
                          className={INPUT_STYLE}
                          disabled={isPending}
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              name="city"
                              value={address.city}
                              onChange={handleAddressChange}
                              placeholder={tProfile('placeholders.city')}
                              className={getInputStyle('city')}
                              disabled={isPending}
                            />
                            {renderFieldError('city')}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="region"
                              value={address.region}
                              onChange={handleAddressChange}
                              placeholder={tProfile('placeholders.region')}
                              className={INPUT_STYLE}
                              disabled={isPending}
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="text"
                              name="postalCode"
                              value={address.postalCode}
                              onChange={handleAddressChange}
                              placeholder={tProfile('placeholders.postalCode')}
                              className={getInputStyle('postalCode')}
                              disabled={isPending}
                            />
                            {renderFieldError('postalCode')}
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleAddressChange}
                            placeholder={tProfile('placeholders.country')}
                            className={getInputStyle('country')}
                            disabled={isPending}
                          />
                          {renderFieldError('country')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleNextFromAddress}
                      disabled={isPending}
                      className="px-16 py-3 font-medium bg-gray-700 text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      {t('next')}
                    </button>
                  </div>
                </div>
                </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 3: REVIEW & PAYMENT */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">{t('step3')}</h2>
              <div
                className={`border-gray-500 overflow-hidden transition-all duration-500 ease-in-out ${currentStep === 3 ? 'border' : 'border-t'}`}
              >
                <AnimatePresence initial={false}>
                  {currentStep >= 3 && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">

                  {/* Product List */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.volumeId}`} className="flex gap-4">
                        <div className="relative w-24 h-24 bg-gray-100 shrink-0">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex justify-between">
                          <div>
                            <h3 className="text-base font-bold">{item.productName}</h3>
                            <p className="text-xs">{item.productSubtitle}</p>
                            <p className="text-xs">{item.volumeDisplay}</p>
                          </div>
                          <div className="text-right flex flex-col justify-between">
                            <span className="text-sm">x{item.quantity}</span>
                            <span className="text-sm">{item.price}{tCommon('currency')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Free Sample */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-sm italic">
                      <span>{t('freeSample')}</span>
                      <span>
                        {availableProducts.find((p) => p.value === selectedSample)?.label || t('noSample')}
                      </span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-b mb-3 pb-3 space-y-2 mx-2">
                    <div className="flex justify-between text-base -mx-2">
                      <span>{t('subtotal')}</span>
                      <span>{subtotal}{tCommon('currency')}</span>
                    </div>
                    <div className="flex justify-between text-base italic font-bold -mx-2">
                      <span className="font-title">TOTAL</span>
                      <span>{total}{tCommon('currency')}</span>
                    </div>
                  </div>

                  {/* Ship To */}
                  <div className="mb-6 flex flex-row justify-between">
                    <h3 className="text-base font-bold italic mb-2">{t('shipTo')}</h3>
                    <div className="text-sm space-y-0.5">
                      <p>{address.recipientName}</p>
                      {address.recipientPhone && <p>{address.recipientPhone}</p>}
                      {(() => {
                        switch (locale) {
                          case 'tw':
                            return (
                              <>
                                <p>
                                  {address.postalCode} {address.region && `${address.region} `} {address.city}
                                </p>
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>{address.country}</p>
                              </>
                            )
                          case 'fr':
                            return (
                              <>
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>
                                  {address.postalCode} {address.city}
                                </p>
                                {address.region && <p>{address.region}</p>}
                                <p>{address.country}</p>
                              </>
                            )
                          default:
                            return (
                              <>
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>
                                  {address.city}
                                  {address.region && `, ${address.region}`} {address.postalCode}
                                </p>
                                <p>{address.country}</p>
                              </>
                            )
                        }
                      })()}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mb-6 flex flex-row justify-between">
                    <h3 className="text-base font-bold italic mb-2">{t('payment')}</h3>
                    <div className="space-y-3 max-w-40">
                      <div className=" border border-gray-500 rounded-md flex items-center px-2 py-1 gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span className="text-xs">4242 4242 4242 4242</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <input
                          type="text"
                          value="12 / 28"
                          disabled
                          className="w-full px-2 py-1 border border-gray-500 rounded-md text-center"
                        />
                        <input
                          type="text"
                          value="422"
                          disabled
                          className="w-full px-2 py-1 border border-gray-500 rounded-md text-center"
                        />
                      </div>
                      <p className="text-xs italic text-gray-500 text-start">{t('demoNotice')}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 text-sm font-medium">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isPending}
                      className="flex-1 py-3 border border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {t('back')}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPending}
                      className="flex-1 py-3 bg-gray-700 text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      {isPending ? t('processing') : t('placeOrder')}
                    </button>
                  </div>
                </div>
                  </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
