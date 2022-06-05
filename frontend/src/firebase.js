import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import store from './store';
import { notify } from '@kyvg/vue3-notification';

const firebaseConfig = {
    apiKey: "AIzaSyCEIhMQfM9edqjSEMx2r855apNFB0IXwg0",
    authDomain: "nextapp-4ec73.firebaseapp.com",
    projectId: "nextapp-4ec73",
    storageBucket: "nextapp-4ec73.appspot.com",
    messagingSenderId: "584371564051",
    appId: "1:584371564051:web:31bbe1f22d8c89cf4759e6"
  };


const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const getCurrentToken = () => {
    return getToken(messaging, {vapidKey: 'BPO4k1KaYL6NZY38CYW4Gkn212LOSAYxBAIqJk_0ed5vev6buMo--LhaRgGOIemYZLHhGPvMfusmHNuNfjYtFZs'}).then((currentToken) => {
      if (currentToken) {
        console.log('current token for client: ', currentToken);
        store.commit("setMessagingToken", currentToken)
      } else {
        console.log('No registration token available. Request permission to generate one.');
        // shows on the UI that permission is required 
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
  }


  export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
      //console.log("message received: ", payload)
      notify({
        title: payload.notification.title,
        text: payload.notification.body,
      })
    });
});