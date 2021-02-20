
const firebaseConfig = {
    apiKey: "AIzaSyCDOZlH5Iv3TIGj_A2VZzqQ9L6l0yV2BHk",
    authDomain: "magnet-bb393.firebaseapp.com",
    databaseURL: "https://magnet-bb393-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "magnet-bb393",
    storageBucket: "magnet-bb393.appspot.com",
    messagingSenderId: "285705083892",
    appId: "1:285705083892:web:1c70fba4633c594c82f7a1"
};

firebase.initializeApp(firebaseConfig);
const path = firebase.database().ref('/');