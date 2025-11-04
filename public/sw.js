// Service Worker pour G-Survey PWA
const CACHE_NAME = 'g-survey-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/images/logolight.png'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Cloner la réponse
        const responseToCache = response.clone()

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache)
          })

        return response
      })
      .catch(() => {
        // Si la requête échoue, chercher dans le cache
        return caches.match(event.request)
      })
  )
})

