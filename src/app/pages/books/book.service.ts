
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
import { Book, Grade,Category } from 'src/app/parents/services/modal';


const firebaseApp = initializeApp(environment.firebaseConfig);
export const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksCollection = collection(db, 'books');
  private gradesCollection = collection(db, 'grade');
  private categoriesCollection = collection(db, 'category');

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
  addType(category: Category): Observable<string> {
    const gradeQuery = query(this.categoriesCollection, where('name', '==', category.name));
    return from(
      getDocs(gradeQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return Promise.reject(new Error('Category with this name already exists'));
        } else {
          return addDoc(this.categoriesCollection, category).then((docRef) => docRef.id);
        }
      })
    );
  }
  getCategories(): Observable<Category[]> {
    return from(
      getDocs(this.categoriesCollection).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
      )
    );
  }
  deleteCategory(id: string): Observable<void> {
    const docRef = doc(db, 'category', id);
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
