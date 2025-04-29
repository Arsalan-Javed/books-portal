import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { AuthModel } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthFirebaseService {
  private firebaseApp = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.firebaseApp);
  private firestore = getFirestore(this.firebaseApp);
  currentUser: any;

  constructor(private router: Router,) {  }

  async register(email: string, password: string, username: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: username });
      const userRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        username: username,
        createdAt: new Date()
      });
    }
    return userCredential.user;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const userRef = doc(this.firestore, 'users', userCredential.user.uid);
    const userSnapshot = await getDoc(userRef);
    localStorage.setItem('currentUser', JSON.stringify(userSnapshot.data()))
    const auth: any = new AuthModel();
    auth.authToken = userCredential.user.uid;
    auth.refreshToken = userCredential.user.uid;
    auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
    return auth;
  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    const userCredential = await signInWithPopup(this.auth, provider);
    const user = userCredential.user;

    localStorage.setItem('currentUser', JSON.stringify(user));

    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date()
      });
    }

    const auth: any = new AuthModel();
    auth.authToken = user.uid;
    auth.refreshToken = user.refreshToken;
    auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);

    return auth;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  async getAllUsers(): Promise<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    return users;
  }
  async getUserById(userId: string): Promise<any | null> {
    const userRef = doc(this.firestore, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return {
        uid: userSnapshot.id,
        ...userSnapshot.data()
      };
    } else {
      return null;
    }
  }


}
