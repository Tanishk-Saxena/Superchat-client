import {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // your config
  apiKey: "AIzaSyARWzUeYmnFS-l9WSIf6IWMAjLNLGZW1jA",
  authDomain: "superchat-fireship-io.firebaseapp.com",
  projectId: "superchat-fireship-io",
  storageBucket: "superchat-fireship-io.appspot.com",
  messagingSenderId: "104897166270",
  appId: "1:104897166270:web:3da7edfc0abb90401117ef",
  measurementId: "G-BW3G89T56N"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user?<ChatRoom />:<SignIn />}
      </section>
    </div>
  );

}

function SignIn () {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="warning">Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut () {

  return (
    auth.currentUser &&
    <button className="sign-out" onClick={()=>{auth.signOut()}}>Sign Out</button>
  )

}

function ChatRoom () {

  const dummy = useRef();
  
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {

    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({behavior: 'smooth'});

  }

  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit = {sendMessage}>

        <input placeholder="say something nice" type="text" value={formValue} onChange={e=>setFormValue(e.target.value)} />

        <button type="submit" disabled={formValue===''?true:false}>🕊️</button>

      </form>
    </>
  )

}

function ChatMessage (props) {

  const {text, uid, photoURL} = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://i.pinimg.com/736x/ba/92/7f/ba927ff34cd961ce2c184d47e8ead9f6.jpg'} alt={messageClass} />
      <p>{text}</p>
    </div>
  )

}

export default App;
