// DashCourier Service Worker
const CACHE_NAME = 'dashcourier-v1';
const STATIC_CACHE = 'dashcourier-static-v1';
const DYNAMIC_CACHE = 'dashcourier-dynamic-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/services.html',
  '/contact.html',
  '/blog.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle different request types
  if (request.method === 'GET') {
    // Handle static assets
    if (STATIC_ASSETS.some(asset => url.pathname === new URL(asset, self.location.origin).pathname)) {
      event.respondWith(
        caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Serving from cache', request.url);
              return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(request)
              .then(networkResponse => {
                // Cache the response for future use
                if (networkResponse.ok) {
                  const responseClone = networkResponse.clone();
                  caches.open(STATIC_CACHE)
                    .then(cache => {
                      cache.put(request, responseClone);
                    });
                }
                return networkResponse;
              })
              .catch(() => {
                // Network failed, try to serve from cache
                console.log('Service Worker: Network failed, trying cache fallback');
                return caches.match(request);
              });
          })
      );
    } 
    // Handle API requests (tracking, pricing, etc.)
    else if (url.pathname.includes('/api/') || url.searchParams.has('api')) {
      event.respondWith(
        fetch(request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, try to serve from cache
            return caches.match(request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  console.log('Service Worker: Serving API response from cache');
                  return cachedResponse;
                }
                
                // Return offline fallback for API requests
                return new Response(
                  JSON.stringify({
                    error: 'Offline - Please check your internet connection',
                    offline: true
                  }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                );
              });
          })
      );
    }
    // Handle other requests with cache-first strategy
    else {
      event.respondWith(
        caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Serving from cache', request.url);
              return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  const responseClone = networkResponse.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                      cache.put(request, responseClone);
                    });
                }
                return networkResponse;
              })
              .catch(() => {
                // Network failed, return offline page for navigation requests
                if (request.mode === 'navigate') {
                  console.log('Service Worker: Serving offline page');
                  return caches.match('/');
                }
                
                // Return error for other requests
                return new Response('Offline - Please check your internet connection', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
          })
      );
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending offline actions
      handleOfflineActions()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification from DashCourier',
    icon: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%23FF6B35\'/><text x=\'50\' y=\'65\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'>🚚</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%23FF6B35\'/><text x=\'50\' y=\'65\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'>🚚</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Track Package',
        icon: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%2300A8CC\'/><text x=\'50\' y=\'65\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'>📦</text></svg>'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%23ef4444\'/><text x=\'50\' y=\'65\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'>✕</text></svg>'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('DashCourier', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#tracking')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle offline actions
async function handleOfflineActions() {
  try {
    // Get all pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        // Retry the action
        await fetch(action.url, action.options);
        
        // Remove successful action from pending list
        await removePendingAction(action.id);
        
        console.log('Service Worker: Offline action completed successfully', action.id);
      } catch (error) {
        console.error('Service Worker: Failed to complete offline action', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error handling offline actions', error);
  }
}

// IndexedDB helpers for offline actions
async function getPendingActions() {
  // In a real implementation, this would interact with IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingAction(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Service Worker: Removing pending action', actionId);
}

// Cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Force cache update
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      });
  }
});
