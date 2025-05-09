import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { getFirestore } from 'firebase/firestore';
import { Bundle, School } from 'src/app/parents/services/modal';

const firebaseApp = initializeApp(environment.firebaseConfig);
export const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class BundleService {
  private bundleCollection = collection(db, 'bundles');
  private schoolCollection = collection(db, 'school');
  constructor() {}

  addSchool(school: School): Observable<string> {
    const gradeQuery = query(this.schoolCollection, where('name', '==', school.name));
    return from(
      getDocs(gradeQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return Promise.reject(new Error('School with this name already exists'));
        } else {
          return addDoc(this.schoolCollection, school).then((docRef) => docRef.id);
        }
      })
    );
  }
  updateSchool(id: string, school: Partial<School>): Observable<void> {
    const docRef = doc(db, 'school', id);
    return from(updateDoc(docRef, school));
  }
  getSchoolById(id: string): Observable<School> {
    const docRef = doc(this.schoolCollection, id);
    return from(
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as School;
        } else {
          return Promise.reject(new Error('School not found'));
        }
      })
    );
  }


  getSchool(): Observable<School[]> {
    return from(
      getDocs(this.schoolCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as School[]
      )
    );
  }
  deleteSchool(id: string): Observable<void> {
    const docRef = doc(db, 'school', id);
    return from(deleteDoc(docRef));
  }

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
