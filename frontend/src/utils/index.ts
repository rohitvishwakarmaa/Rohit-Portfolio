import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'AI Ads': 'bg-orange-100 text-orange-700',
    'AI Video Editing': 'bg-purple-100 text-purple-700',
    'AI Voiceovers': 'bg-pink-100 text-pink-800',
    'AI Storytelling': 'bg-yellow-100 text-yellow-700',
    Animation: 'bg-blue-100 text-blue-700',
  }
  return map[category] || 'bg-gray-100 text-gray-700'
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
