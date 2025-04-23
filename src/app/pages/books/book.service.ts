
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book, Grade,Type } from 'src/app/parents/services/modal';


const firebaseApp = initializeApp(environment.firebaseConfig);
export const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksCollection = collection(db, 'books');
  private gradesCollection = collection(db, 'grade');
  private typesCollection = collection(db, 'type');

  constructor() { }

  addGrade(grade: Grade): Observable<string> {
    const gradeQuery = query(this.gradesCollection, where('name', '==', grade.name));
    return from(
      getDocs(gradeQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return Promise.reject(new Error('Grade with this name already exists'));
        } else {
          return addDoc(this.gradesCollection, grade).then((docRef) => docRef.id);
        }
      })
    );
  }
  getGrades(): Observable<Grade[]> {
    return from(
      getDocs(this.gradesCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Grade[]
      )
    );
  }
  deleteGrade(id: string): Observable<void> {
    const docRef = doc(db, 'grade', id);
    return from(deleteDoc(docRef));
  }
  addType(type: Type): Observable<string> {
    const gradeQuery = query(this.typesCollection, where('name', '==', type.name));
    return from(
      getDocs(gradeQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return Promise.reject(new Error('Type with this name already exists'));
        } else {
          return addDoc(this.typesCollection, type).then((docRef) => docRef.id);
        }
      })
    );
  }
  getTypes(): Observable<Type[]> {
    return from(
      getDocs(this.typesCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Type[]
      )
    );
  }
  deleteType(id: string): Observable<void> {
    const docRef = doc(db, 'type', id);
    return from(deleteDoc(docRef));
  }

  addBook(book: Book): Observable<string> {
    return from(
      addDoc(this.booksCollection, book).then((docRef) => docRef.id)
    );
  }

  getBooks(): Observable<Book[]> {
    return from(
      getDocs(this.booksCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Book[]
      )
    );
  }

  getBookById(id: string): Observable<Book | undefined> {
    const docRef = doc(db, 'books', id);
    return from(
      getDoc(docRef).then((docSnap) =>
        docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as Book)
          : undefined
      )
    );
  }

  updateBook(id: string, book: Partial<Book>): Observable<void> {
    const docRef = doc(db, 'books', id);
    return from(updateDoc(docRef, book));
  }

  deleteBook(id: string): Observable<void> {
    const docRef = doc(db, 'books', id);
    return from(deleteDoc(docRef));
  }
}
