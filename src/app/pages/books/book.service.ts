
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
export interface Grade {
  id?: string;
  name: string;
}

export interface Book {
  id?: string;
  bookName: string;
  image: string;
  description: string;
  quantity: number;
  price: number;
  grade: string;
  academicYear: number
}

const firebaseApp = initializeApp(environment.firebaseConfig);
export const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksCollection = collection(db, 'books');
  private gradesCollection = collection(db, 'grade');

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

  getGradeById(id: string): Observable<Grade | undefined> {
    const docRef = doc(db, 'grade', id);
    return from(
      getDoc(docRef).then((docSnap) =>
        docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as Grade)
          : undefined
      )
    );
  }

  updateGrade(id: string, grade: Partial<Grade>): Observable<void> {
    const docRef = doc(db, 'grade', id);
    return from(updateDoc(docRef, grade));
  }
  deleteGrade(id: string): Observable<void> {
    const docRef = doc(db, 'grade', id);
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
