'use client'

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

interface ProfileCardProps {
  name: string
  setName: (name: string) => void
}

export default function ProfileCard({ name, setName }: ProfileCardProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Editable Fields
  const [networks, setNetworks] = useState('None')
  const [city, setCity] = useState('Quezon City, PH')
  const [isEditingInfo, setIsEditingInfo] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleImageClick() {
    fileInputRef.current?.click()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 5MB limit
        alert('File size exceeds 10MB. Please choose a smaller file.')
        return
      }
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Split name to get initials
  const nameParts = name.trim().split(' ')
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : nameParts[0][0]

  return (
    <div className="space-y-4">

      {/* Profile Image or Initials - with strict max width and height */}
      <div className="relative flex justify-center items-center max-w-[200px] max-h-[200px] mx-auto">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile"
            className="w-[200px] h-[200px] rounded-lg object-cover"
          />
        ) : (
          <div className="w-[200px] h-[200px] bg-blue-500 text-white flex justify-center items-center text-4xl font-bold rounded-lg">
            {initials}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />

        {/* Edit Button */}
        <button
          onClick={handleImageClick}
          className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 p-1 rounded-full text-xs font-semibold"
          title="Change Photo"
        >
          Change
        </button>
      </div>

      {/* Information Card */}
      <div className="border border-gray-300 rounded p-2 bg-gray-50 relative">
        <h2 className="font-semibold mb-2 flex justify-between items-center">
          Information
          <button
            className="text-sm hover:underline"
            title={isEditingInfo ? 'Save' : 'Edit Info'}
            onClick={() => setIsEditingInfo(!isEditingInfo)}
          >
            {isEditingInfo ? 'Save' : '✏️'}
          </button>
        </h2>

        {isEditingInfo ? (
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Networks</label>
              <Input
                value={networks}
                onChange={(e) => setNetworks(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current City</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="mb-1"><span className="font-medium">Networks</span><br />{networks}</p>
            <p><span className="font-medium">Current City</span><br />{city}</p>
          </>
        )}
      </div>

      {/* Name Input to Edit */}
      <Input
        className="mt-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  )
}
