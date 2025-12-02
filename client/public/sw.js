self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log('Push Received:', data);

    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png', // Ensure this exists or use a default
        badge: '/icons/badge-72x72.png',
        data: {
            url: data.url
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
