import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, List, LogOut, Sparkles,
  Plus, Trash2, Pencil, Eye, X, CheckCircle, Film,
  Video as VideoIcon, Star, Zap, MessageSquare, Mail, User, Clock, HardDrive, Cloud, Settings as SettingsIcon, Lock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { portfolioService } from '@/services/portfolioService'
import { contactService } from '@/services/contactService'
import { formatDate, truncate, formatBytes } from '@/utils'
import type { Video, VideoCategory, VideoUploadPayload, ContactMessage } from '@/types'

const CATEGORIES: VideoCategory[] = [
  'AI Ads', 'AI Video Editing', 'AI Voiceovers', 'AI Storytelling', 'Animation',
]

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: Upload, label: 'Upload', id: 'upload' },
  { icon: List, label: 'Videos', id: 'videos' },
  { icon: MessageSquare, label: 'Messages', id: 'messages' },
  { icon: SettingsIcon, label: 'Settings', id: 'settings' },
]

// ─── OVERVIEW stats ────────────────────────────────────────────────────────
const OVERVIEW_STATS_META = [
  { label: 'Total Videos', icon: Film, color: '#F77F00', bg: '#FFF3E0' },
  { label: 'Unread Messages', icon: MessageSquare, color: '#FFD166', bg: '#FFFDE7' },
  { label: 'Categories', icon: VideoIcon, color: '#7B2CBF', bg: '#F3E5F5' },
  { label: 'Active Videos', icon: Zap, color: '#FF4D6D', bg: '#FCE4EC' },
]

// ─── Upload form initial state ─────────────────────────────────────────────
const EMPTY_FORM: VideoUploadPayload = {
  title: '',
  description: '',
  tags: [],
  category: 'AI Ads',
  client_name: '',
  is_featured: false,
  source_type: 'cloudinary',
  youtube_url: '',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'videos' | 'messages' | 'settings'>('overview')
  const [videos, setVideos] = useState<Video[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [form, setForm] = useState<VideoUploadPayload>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [editForm, setEditForm] = useState<VideoUploadPayload>(EMPTY_FORM)
  const [editTagInput, setEditTagInput] = useState('')
  const [editPreviewThumbnail, setEditPreviewThumbnail] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  const [overviewActiveCount, setOverviewActiveCount] = useState<number | null>(null)
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null)
  const [cloudinaryStats, setCloudinaryStats] = useState<any>(null)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    const init = async () => {
      // Fetch each piece of data independently to show UI as fast as possible
      adminService.getVideos().then(v => {
        setVideos(v)
        setIsLoadingVideos(false)
      })

      adminService.getOverview().then(overview => {
        if (overview) {
          setOverviewActiveCount(overview.ads?.active ?? null)
          setUnreadCount(overview.contacts?.unread || 0)
          if (overview.cloudinary) setCloudinaryStats(overview.cloudinary)
        }
      })

      contactService.getMessages(1, 100).then(msgRes => {
        setMessages(msgRes.data)
      })

      adminService.getNotificationEmail().then(email => {
        setNotifyEmail(email)
      })
    }

    init()
  }, [])

  const overviewStats = [
    { ...OVERVIEW_STATS_META[0], value: String(videos.length) },
    { ...OVERVIEW_STATS_META[1], value: String(unreadCount) },
    { ...OVERVIEW_STATS_META[2], value: String(new Set(videos.map((v) => v.category)).size) },
    {
      ...OVERVIEW_STATS_META[3],
      value: String(
        overviewActiveCount !== null ? overviewActiveCount : videos.length
      ),
    },
  ]

  const onLogout = () => { handleLogout(); navigate('/admin/login') }

  const handleFormChange = (field: keyof VideoUploadPayload, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !(form.tags || []).includes(t)) {
      setForm((f) => ({ ...f, tags: [...(f.tags || []), t] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: (f.tags || []).filter((t: string) => t !== tag) }))
  }

  const openEditModal = (video: Video) => {
    setEditVideo(video)
    setEditForm({
      title: video.title,
      description: video.description || '',
      category: video.category,
      client_name: video.client_name || '',
      tags: video.tags || [],
      is_featured: video.is_featured,
      source_type: video.source_type,
      youtube_url: video.source_type === 'youtube' ? video.youtube_id : '',
    })
    setEditTagInput('')
    setEditPreviewThumbnail(video.thumbnail || null)
  }

  const addEditTag = () => {
    const t = editTagInput.trim()
    if (t && !(editForm.tags || []).includes(t)) {
      setEditForm((f) => ({ ...f, tags: [...(f.tags || []), t] }))
      setEditTagInput('')
    }
  }

  const removeEditTag = (tag: string) => {
    setEditForm((f) => ({ ...f, tags: (f.tags || []).filter((t) => t !== tag) }))
  }

  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditForm((f) => ({ ...f, thumbnail_file: file }))
      setEditPreviewThumbnail(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFormChange('video_file', file)
      setPreviewFile(URL.createObjectURL(file))
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFormChange('thumbnail_file', file)
      setPreviewThumbnail(URL.createObjectURL(file))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)
    try {
      if (form.source_type === 'cloudinary' && !form.video_file) {
        throw new Error('Please select a video file first.')
      }
      if (form.source_type === 'youtube' && !form.youtube_url) {
        throw new Error('Please enter a YouTube URL.')
      }

      // Pre-check file size (600MB limit for Cloudinary direct upload)
      if (form.video_file && form.video_file.size > 600 * 1024 * 1024) {
        throw new Error(`Video file is too large (${(form.video_file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 600MB. Please compress your video.`)
      }

      setUploadProgress(0)
      const newVideo = await adminService.uploadVideo(form, (p) => setUploadProgress(p))
      setVideos((v) => [newVideo, ...v])

      setForm(EMPTY_FORM)
      setPreviewFile(null)
      setPreviewThumbnail(null)
      setTagInput('')
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      setUploadProgress(0)
      setActiveTab('videos')
    } catch (err: any) {
      console.error('Upload error:', err)
      
      let errorMsg = 'Something went wrong during upload.'
      
      if (err.response?.status === 413) {
        errorMsg = 'The video file is too large for the server (Max 100MB). Please compress it and try again.'
      } else if (err.response?.data?.error?.message) {
        errorMsg = err.response.data.error.message
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail)
      } else {
        errorMsg = err.message || errorMsg
      }
      
      setError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await adminService.deleteVideo(id)
    setVideos((v) => v.filter((vid) => vid.id !== id))
    setDeleteId(null)
  }

  const handleUpdateNotifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      await adminService.updateNotificationEmail(notifyEmail)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update email')
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-sm leading-none">Rohit</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === id ? { background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7B2CBF, #FF4D6D)' }}>
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Rohit'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 capitalize">{activeTab}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
               {activeTab === 'overview' && 'Your portfolio at a glance'}
              {activeTab === 'upload' && 'Add a new video project'}
              {activeTab === 'videos' && `${videos.length} total videos`}
              {activeTab === 'messages' && `${messages.length} contact messages`}
              {activeTab === 'settings' && 'Manage your dashboard preferences'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveTab('upload')}
          >
            Upload New
          </Button>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {overviewStats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p className="font-display font-black text-3xl text-gray-900 mb-1">{value}</p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </div>
              ))}
            </div>
            
            {/* Cloudinary Usage Section */}
            {cloudinaryStats && cloudinaryStats.storage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Cloudinary Storage</h3>
                        <p className="text-[10px] text-gray-400">Plan: {cloudinaryStats.plan || 'Free'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{cloudinaryStats.storage.used_percent?.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      className="h-full bg-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(cloudinaryStats.storage.used_percent || 0, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{formatBytes(cloudinaryStats.storage.used || 0)} used</span>
                    <span>{formatBytes(cloudinaryStats.storage.limit || 0)} total</span>
                  </div>
                </div>

                {cloudinaryStats.credits && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">Monthly Credits</h3>
                          <p className="text-[10px] text-gray-400">Transformations & Bandwidth</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{cloudinaryStats.credits.used_percent?.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden mb-2">
                      <motion.div 
                        className="h-full bg-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(cloudinaryStats.credits.used_percent || 0, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{cloudinaryStats.credits.used?.toLocaleString()} used</span>
                      <span>{cloudinaryStats.credits.limit?.toLocaleString()} total</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent videos table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Videos</h2>
                <button onClick={() => setActiveTab('videos')} className="text-brand-orange text-sm font-medium">See all →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <img src={video.thumbnail || ''} alt={video.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                      <p className="text-gray-400 text-xs">{video.client_name || 'N/A'}</p>
                    </div>
                    <Badge label={video.category} variant="category" />
                    {video.is_featured && <Badge label="Featured" variant="featured" />}
                    <p className="text-gray-400 text-xs hidden sm:block">{formatDate(video.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── UPLOAD ── */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium text-sm">Video uploaded successfully!</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              >
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">!</div>
                <p className="text-red-700 font-medium text-sm">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Project title"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => handleFormChange('client_name', e.target.value)}
                    placeholder="Client company"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value as VideoCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {(form.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="Add tag and press Enter"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
                  </div>
                </div>

                {/* Featured */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-orange"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Mark as Featured
                  </label>
                </div>

                {/* Featured Image (Thumbnail) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                    <span className="ml-1 text-xs text-gray-400 font-normal">(thumbnail)</span>
                  </label>
                  <div
                    className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-purple transition-colors cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                  >
                    {previewThumbnail ? (
                      <div className="relative group">
                        <img
                          src={previewThumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm">Click to upload featured image</p>
                        <p className="text-gray-300 text-xs mt-1">JPG, PNG, WebP (recommended: 1280×720)</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>

              </div>

              {/* Video Source Selection */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Video Source</label>
                  <div className="flex p-1 bg-gray-200 rounded-xl max-w-[300px] mx-auto">
                    {(['cloudinary', 'youtube'] as const).map((source) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => handleFormChange('source_type', source)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 capitalize ${
                          form.source_type === source
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                {form.source_type === 'youtube' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="sm:col-span-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                    <input
                      type="url"
                      required={form.source_type === 'youtube'}
                      value={form.youtube_url}
                      onChange={(e) => handleFormChange('youtube_url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                    />
                    <p className="mt-2 text-[10px] text-gray-400">Supported: Standard, Short, and Embed URLs</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="sm:col-span-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
                    <div
                      className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-orange transition-colors cursor-pointer"
                      onClick={() => document.getElementById('video-upload')?.click()}
                    >
                      {previewFile ? (
                        <video src={previewFile} controls className="w-full rounded-xl max-h-48 object-cover" />
                      ) : (
                        <div className="p-8 text-center">
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Click to upload video file</p>
                          <p className="text-orange-400 text-[10px] mt-1 font-medium">Direct Cloudinary Upload: Max 600MB</p>
                          <p className="text-gray-300 text-[10px] mt-0.5">MP4, MOV, WebM</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/mp4,video/x-m4v,video/*"
                      required={form.source_type === 'cloudinary'}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                {isUploading && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-orange" 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
                <Button type="submit" variant="primary" loading={isUploading} className="flex-1 justify-center">
                  {isUploading ? (uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Starting…') : 'Upload Video'}
                </Button>

                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY_FORM)}>
                  Reset
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── VIDEOS TABLE ── */}
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Video</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Client</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={video.thumbnail || ''}
                              alt={video.title}
                              className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{truncate(video.title, 40)}</p>
                              <div className="flex gap-1 mt-0.5">
                                {(video.tags || []).slice(0, 2).map((t) => (
                                  <span key={t} className="text-xs text-gray-400">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge label={video.category} variant="category" />
                        </td>
                        <td className="p-4 text-gray-500 hidden lg:table-cell">{video.client_name || 'N/A'}</td>
                        <td className="p-4 text-gray-400 text-xs hidden sm:table-cell">{formatDate(video.created_at)}</td>
                        <td className="p-4">
                          {video.is_featured ? (
                            <Badge label="Featured" variant="featured" />
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Regular</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/portfolio/${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(video)}
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(video.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {/* ── MESSAGES ── */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-sm">
                   <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Sender</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Message Preview</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <tr key={msg.id} className={`hover:bg-gray-50 transition-colors ${!msg.is_read ? 'bg-orange-50/30' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {msg.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{msg.name}</p>
                                <p className="text-xs text-gray-400">{msg.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">
                            {truncate(msg.message, 60)}
                          </td>
                          <td className="p-4 text-gray-400 text-xs">
                            {formatDate(msg.created_at)}
                          </td>
                          <td className="p-4">
                            {msg.is_read ? (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Read</span>
                            ) : (
                               <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full font-bold animate-pulse">New</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                             <button 
                               onClick={() => {
                                 setViewMessage(msg)
                                 if (!msg.is_read) {
                                   contactService.markAsRead(msg.id)
                                   setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_read: true} : m))
                                   setUnreadCount(prev => Math.max(0, prev - 1))
                                 }
                               }}
                               className="p-2 rounded-lg text-brand-orange hover:bg-orange-50 transition-colors"
                             >
                                <Eye className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-gray-400">
                          No messages yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
               </div>
            </div>
          </motion.div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium text-sm">Settings saved successfully!</p>
              </motion.div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Notification Preferences</h3>
                <p className="text-sm text-gray-400">Configure where you receive notifications from your portfolio.</p>
              </div>

              <form onSubmit={handleUpdateNotifyEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Notification Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">
                    Contact form submissions will be forwarded to this address in real-time.
                  </p>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={isSavingSettings}
                  >
                    Save Preferences
                  </Button>
                </div>
              </form>

              <div className="pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-brand-orange">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Security</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  2FA (OTP via Email) is currently <span className="text-green-600 font-bold uppercase">Enabled</span> for your account to ensure maximum security.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ─── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-xl mb-2">Delete Video?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The video will be permanently removed.</p>
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1 justify-center" onClick={() => handleDelete(deleteId)}>
                Delete
              </Button>
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── EDIT MODAL (simplified) ─────────────────────────────────────── */}
      {editVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-gray-900 text-xl">Edit Video</h3>
              <div className="flex p-1 bg-gray-100 rounded-xl">
                 {(['cloudinary', 'youtube'] as const).map((source) => (
                   <button
                     key={source}
                     type="button"
                     onClick={() => setEditForm(prev => ({...prev, source_type: source}))}
                     className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 capitalize ${
                       editForm.source_type === source
                         ? 'bg-white text-gray-900 shadow-sm'
                         : 'text-gray-500'
                     }`}
                   >
                     {source}
                   </button>
                 ))}
              </div>
              <button onClick={() => { setEditVideo(null); setEditForm(EMPTY_FORM); setEditPreviewThumbnail(null) }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {editForm.source_type === 'youtube' && (
              <div className="mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <label className="block text-xs font-bold text-orange-700 mb-2 uppercase">YouTube Video ID / URL</label>
                <input
                  type="text"
                  value={editForm.youtube_url || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="Paste YouTube Link"
                  className="w-full px-4 py-2 rounded-lg border border-orange-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as VideoCategory }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={editForm.client_name || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, client_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(editForm.tags || []).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => removeEditTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditTag() } }}
                    placeholder="Add tag"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addEditTag}>Add</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional)</label>
                <div
                  className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-purple transition-colors cursor-pointer overflow-hidden"
                  onClick={() => document.getElementById('edit-thumbnail-upload')?.click()}
                >
                  {editPreviewThumbnail ? (
                    <img src={editPreviewThumbnail} alt="Thumbnail preview" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">Click to upload thumbnail</div>
                  )}
                </div>
                <input
                  id="edit-thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleEditThumbnailChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand-orange"
                />
                <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700">Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={async () => {
                  const updated = await adminService.updateVideo(editVideo.id, editForm)
                  setVideos((v) => v.map((vid) => (vid.id === editVideo.id ? updated : vid)))
                  setEditVideo(null)
                  setEditForm(EMPTY_FORM)
                  setEditPreviewThumbnail(null)
                }}
              >
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => { setEditVideo(null); setEditForm(EMPTY_FORM); setEditPreviewThumbnail(null) }}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── MESSAGE VIEW MODAL ─────────────────────────────────────────── */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-xl">Message Details</h3>
                  <p className="text-xs text-gray-400">Received on {formatDate(viewMessage.created_at)}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewMessage(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">From</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{viewMessage.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 break-all">{viewMessage.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[150px]">
                <div className="flex items-center gap-2 text-gray-400 mb-3">
                   <Clock className="w-3.5 h-3.5" />
                   <p className="text-[10px] font-bold uppercase tracking-wider">Project Brief / Message</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {viewMessage.message}
                </p>
              </div>

              <div className="flex gap-3">
                <a 
                  href={`mailto:${viewMessage.email}?subject=Re: Inquiry from ${viewMessage.name}`}
                  className="flex-1 btn-primary justify-center py-4"
                >
                  Reply via Email
                </a>
                <Button 
                  variant="secondary" 
                  className="px-6"
                  onClick={() => setViewMessage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
