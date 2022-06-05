importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCEIhMQfM9edqjSEMx2r855apNFB0IXwg0",
    authDomain: "nextapp-4ec73.firebaseapp.com",
    projectId: "nextapp-4ec73",
    storageBucket: "nextapp-4ec73.appspot.com",
    messagingSenderId: "584371564051",
    appId: "1:584371564051:web:31bbe1f22d8c89cf4759e6"
  };

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) =>{
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

});