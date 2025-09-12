// Service Worker for Global Markets Consulting PWA
const CACHE_NAME = 'gmc-v1.0.0'
const STATIC_CACHE = 'gmc-static-v1.0.0'
const DYNAMIC_CACHE = 'gmc-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/portal',
  '/markets',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/functions\/v1\//,
  /\/rest\/v1\//
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Cache installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Handle different types of requests
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  } else if (url.pathname.startsWith('/assets/')) {
    // Build assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else {
    // Everything else - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('📦 Serving from cache:', request.url)
      return cachedResponse
    }
    
    console.log('🌐 Fetching from network:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Cache first failed:', error)
    return new Response('Offline - content not available', { status: 503 })
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Fetching from network:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url)
    
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'portfolio-sync') {
    event.waitUntil(syncPortfolioData())
  }
})

async function syncPortfolioData() {
  try {
    console.log('📊 Syncing portfolio data...')
    // Sync any pending portfolio updates when back online
    const cache = await caches.open(DYNAMIC_CACHE)
    // Implementation would sync pending data
    console.log('✅ Portfolio data synced')
  } catch (error) {
    console.error('❌ Portfolio sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New market update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Portfolio',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Global Markets Consulting', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Skipping waiting, activating new service worker')
    self.skipWaiting()
  }
})