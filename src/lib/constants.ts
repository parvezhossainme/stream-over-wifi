export const DEFAULT_PORT = 3000
export const DEFAULT_STORAGE_PATH = process.env.STORAGE_PATH || '/storage/emulated/0'

export const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.mkv', '.webm', '.avi', '.mov', '.wmv', '.flv', '.m4v', '.ts', '.3gp'
])

export const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.avif'
])

export const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus'
])

export const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.txt', '.md', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.json', '.xml'
])

export const SUBTITLE_EXTENSIONS = new Set([
  '.srt', '.vtt', '.ass', '.ssa'
])

export const PAGE_SIZE = 50
export const THUMBNAIL_CACHE_DIR = '.thumbnails'

export const CATEGORIES = [
  { id: 'videos', label: 'Movies', icon: 'Film', paths: ['/Movies', '/DCIM/Camera'], extensions: VIDEO_EXTENSIONS },
  { id: 'images', label: 'Photos', icon: 'Image', paths: ['/DCIM/Camera', '/Pictures', '/Download'], extensions: IMAGE_EXTENSIONS },
  { id: 'audio', label: 'Music', icon: 'Music', paths: ['/Music', '/Download'], extensions: AUDIO_EXTENSIONS },
  { id: 'documents', label: 'Documents', icon: 'FileText', paths: ['/Documents', '/Download'], extensions: DOCUMENT_EXTENSIONS },
  { id: 'downloads', label: 'Downloads', icon: 'Download', paths: ['/Download'] },
] as const

export const QUICK_FOLDERS = [
  { name: 'Movies', path: '/Movies', icon: 'Film' },
  { name: 'DCIM', path: '/DCIM', icon: 'Camera' },
  { name: 'Pictures', path: '/Pictures', icon: 'Image' },
  { name: 'Music', path: '/Music', icon: 'Music' },
  { name: 'Downloads', path: '/Download', icon: 'Download' },
  { name: 'Documents', path: '/Documents', icon: 'FileText' },
]
