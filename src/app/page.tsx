'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'timeago.js'
import { Card, CardContent } from '@/components/ui/card'
import ProfileCard from '@/components/ui/profilecard'

interface Post {
  id: string
  user_id: string
  name: string
  body: string
  created_at: string
  photo_url?: string // ✅ Added photo_url field
}

export default function WallPage() {
  const [body, setBody] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [name, setName] = useState('Aldrich Aranzamendez')

  // ✅ New states for photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel('realtime:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev) => [payload.new as Post, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setPosts(data)
    }
  }

async function handleShare() {
  if (body.trim() === '' && !photoFile) return // Prevent empty posts

  let photoUrl = ''

  // ✅ Upload photo if selected
  if (photoFile) {
    const uniqueFileName = `photo-${Date.now()}-${crypto.randomUUID()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-photos')
      .upload(uniqueFileName, photoFile, { cacheControl: '3600', upsert: false })

    if (uploadError || !uploadData) {
      console.error('Photo upload failed:', uploadError)
      alert('Photo upload failed. Please try again.')
      return
    }

    // ✅ Get the public URL properly
    const { publicUrl } = supabase
      .storage
      .from('post-photos')
      .getPublicUrl(uploadData.path).data

    photoUrl = publicUrl
  }

  // ✅ Insert post to database and return the inserted row
  const { data: insertData, error: insertError } = await supabase
    .from('posts')
    .insert([{
      user_id: crypto.randomUUID(),
      name: name,
      body: body.trim(),
      photo_url: photoUrl
    }])
    .select()

if (insertError) {
  console.error('Error sharing post:', insertError)
  alert(`Post upload failed: ${insertError.message}`)
  return
}


  if (!insertData || insertData.length === 0) {
    console.error('Post insert returned no data')
    alert('Post upload failed. Please try again.')
    return
  }

  // ✅ Instead of refetching, append the new post directly
  setPosts(prev => [insertData[0], ...prev])

  setBody('')
  setPhotoFile(null)
  setPhotoPreview(null)
}



  return (
    <div className="flex justify-center p-4 min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl bg-white rounded shadow-lg p-6 space-x-6">

        {/* Left Sidebar */}
        <div className="w-1/4">
          <ProfileCard name={name} setName={setName} />
        </div>

        {/* Right Main Content */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold">{name}</h1>

          {/* Input Section */}
          <div className="flex flex-col space-y-2 border p-4 rounded-lg">
  {/* Text Input */}
  <textarea
    className="w-full border-2 border-dashed border-black rounded p-2 min-h-[80px]"
    placeholder="What's on your mind?"
    value={body}
    onChange={(e) => setBody(e.target.value)}
    maxLength={280}
  />
  <p className="text-xs text-gray-500">{280 - body.length} characters remaining</p>

  {/* Upload Photo UI */}
  <div
    onClick={() => document.getElementById('post-photo-input')?.click()}
    className="border-2 border-dashed border-gray-400 rounded p-4 text-center cursor-pointer hover:bg-gray-50"
  >
    {photoPreview ? (
      <img src={photoPreview} alt="Preview" className="w-full max-w-xs mx-auto rounded" />
    ) : (
      <div className="flex flex-col items-center justify-center text-gray-500">
        <span className="text-2xl">🖼️</span>
        <span className="mt-2">Click to add photo (optional)</span>
        <span className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</span>
      </div>
    )}
  </div>

  {/* Hidden File Input */}
  <input
    id="post-photo-input"
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (file) {
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
      }
    }}
    className="hidden"
  />

  {/* Share Button Positioned Bottom Right */}
  <div className="flex justify-end">
    <Button
      onClick={handleShare}
      className="bg-blue-600 hover:bg-blue-700 font-bold text-sm px-4 py-1"
      disabled={body.trim() === '' && !photoFile} // Disable if empty
    >
      Share
    </Button>
  </div>
</div>


          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border-t pt-4">
                {/* Name and Time Row */}
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold">{post.name}</p>
                  <p className="text-sm text-gray-500">{format(post.created_at)}</p>
                </div>

                {/* Post Body */}
                <p>{post.body}</p>

                {/* ✅ Display Photo if Exists */}
                {post.photo_url && (
                  <img src={post.photo_url} alt="Post" className="w-full max-w-xs mt-2 rounded" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
