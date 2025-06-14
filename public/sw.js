
const CACHE_NAME = 'algeria-post-exam-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline exam submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-exam') {
    event.waitUntil(
      // Handle offline exam submission
      handleOfflineExamSubmission()
    );
  }
});

async function handleOfflineExamSubmission() {
  try {
    const examData = await getStoredExamData();
    if (examData) {
      const response = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData)
      });
      
      if (response.ok) {
        // Clear stored data after successful submission
        await clearStoredExamData();
      }
    }
  } catch (error) {
    console.error('Failed to submit offline exam:', error);
  }
}

async function getStoredExamData() {
  const cache = await caches.open('exam-submissions');
  const requests = await cache.keys();
  if (requests.length > 0) {
    const response = await cache.match(requests[0]);
    return response ? await response.json() : null;
  }
  return null;
}

async function clearStoredExamData() {
  const cache = await caches.open('exam-submissions');
  const requests = await cache.keys();
  await Promise.all(requests.map(request => cache.delete(request)));
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من منصة امتحانات بريد الجزائر',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(
    self.registration.showNotification('منصة امتحانات بريد الجزائر', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
