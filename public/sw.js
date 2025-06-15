const CACHE_NAME = 'algeria-post-exam-v1.2.0';
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

// Enhanced fetch event with PDF worker support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle PDF.js worker requests specially
  if (url.pathname.includes('pdf.worker') || url.pathname.includes('pdfjs-dist')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // Try to return from cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Regular fetch handling
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
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

// Background sync for offline exam submissions and PDF generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-exam') {
    event.waitUntil(handleOfflineExamSubmission());
  }
  
  if (event.tag === 'generate-pdf') {
    event.waitUntil(handleOfflinePDFGeneration());
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
        await clearStoredExamData();
      }
    }
  } catch (error) {
    console.error('Failed to submit offline exam:', error);
  }
}

async function handleOfflinePDFGeneration() {
  try {
    const pendingPDFs = await getStoredPDFRequests();
    for (const pdfRequest of pendingPDFs) {
      // Generate PDF when back online
      await generateOfflinePDF(pdfRequest);
    }
    await clearStoredPDFRequests();
  } catch (error) {
    console.error('Failed to generate offline PDFs:', error);
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

async function getStoredPDFRequests() {
  const cache = await caches.open('pdf-requests');
  const requests = await cache.keys();
  const pdfRequests = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      pdfRequests.push(await response.json());
    }
  }
  
  return pdfRequests;
}

async function clearStoredExamData() {
  const cache = await caches.open('exam-submissions');
  const requests = await cache.keys();
  await Promise.all(requests.map(request => cache.delete(request)));
}

async function clearStoredPDFRequests() {
  const cache = await caches.open('pdf-requests');
  const requests = await cache.keys();
  await Promise.all(requests.map(request => cache.delete(request)));
}

async function generateOfflinePDF(pdfRequest) {
  // This would handle offline PDF generation logic
  console.log('Generating offline PDF for:', pdfRequest);
}

// Push notification handler with Arabic support
self.addEventListener('push', (event) => {
  let options = {
    body: 'إشعار جديد من منصة امتحانات بريد الجزائر',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    dir: 'rtl',
    lang: 'ar',
    actions: [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title;
  }

  event.waitUntil(
    self.registration.showNotification('منصة امتحانات بريد الجزائر', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/statistics')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
