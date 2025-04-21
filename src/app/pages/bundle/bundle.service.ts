import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { getFirestore } from 'firebase/firestore';

const firebaseApp = initializeApp(environment.firebaseConfig);
export const db = getFirestore(firebaseApp);
export interface BundleBook {
  id: string;
  bookName: string;
  price: number;
}

export interface Bundle {
  id?: string;
  bundleName: string;
  image:string;
  books: BundleBook[];
}
@Injectable({
  providedIn: 'root',
})
export class BundleService {
  private bundleCollection = collection(db, 'bundles');

  constructor() {}

  addBundle(bundle: Bundle): Observable<string> {
    return from(
      addDoc(this.bundleCollection, bundle).then((docRef) => docRef.id)
    );
  }

  getBundles(): Observable<Bundle[]> {
    return from(
      getDocs(this.bundleCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Bundle[]
      )
    );
  }

  getBundleById(id: string): Observable<Bundle | undefined> {
    const docRef = doc(db, 'bundles', id);
    return from(
      getDoc(docRef).then((docSnap) =>
        docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as Bundle)
          : undefined
      )
    );
  }

  updateBundle(id: string, bundle: Partial<Bundle>): Observable<void> {
    const docRef = doc(db, 'bundles', id);
    return from(updateDoc(docRef, bundle));
  }

  deleteBundle(id: string): Observable<void> {
    const docRef = doc(db, 'bundles', id);
    return from(deleteDoc(docRef));
  }
}
