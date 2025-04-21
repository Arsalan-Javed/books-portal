import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { Book, db } from 'src/app/pages/books/book.service';
import { Bundle } from 'src/app/pages/bundle/bundle.service';

export interface CartItem {
  id?: string;
  userId: string;
  bookId?: string;
  bundleId?: string;
  quantity: number;
}

export interface PopulatedCartItem extends CartItem {
  book?: Book;
  bundle?: Bundle;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCollection = collection(db, 'cart');
  private ordersCollection = collection(db, 'orders');
  private cartChangedSubject = new BehaviorSubject<void>(undefined);
  cartChanged$ = this.cartChangedSubject.asObservable();
  constructor(private authService: AuthFirebaseService) {}

  addToCart(item: { bookId?: string; bundleId?: string }): Observable<string> {
    const userId = this.authService.getCurrentUser().uid;

    const conditions = [
      where('userId', '==', userId),
      item.bookId ? where('bookId', '==', item.bookId) : where('bundleId', '==', item.bundleId),
    ];

    const cartQuery = query(this.cartCollection, ...conditions);

    return from(
      getDocs(cartQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();
          const newQuantity = existingData.quantity + 1;

          return updateDoc(doc(this.cartCollection, existingDoc.id), {
            quantity: newQuantity,
          }).then(() => {
            this.cartChangedSubject.next();
            return existingDoc.id;
          });
        } else {
          const cartItem: CartItem = {
            ...item,
            userId,
            quantity: 1,
          };
          return addDoc(this.cartCollection, cartItem).then((docRef) => {
            this.cartChangedSubject.next();
            return docRef.id;
          });
        }
      })
    );
  }



  getCartByUser(userId: string): Observable<CartItem[]> {
    const q = query(this.cartCollection, where('userId', '==', userId));
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CartItem[]
      )
    );
  }

  getCart(userId: string): Observable<PopulatedCartItem[]> {
    const cartQuery = query(this.cartCollection, where('userId', '==', userId));
    return from(
      getDocs(cartQuery).then(async (querySnapshot) => {
        const items: CartItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CartItem[];

        const populatedItems: PopulatedCartItem[] = await Promise.all(
          items.map(async (item) => {
            let book, bundle;

            if (item.bookId) {
              const bookSnap = await getDoc(doc(db, 'books', item.bookId));
              book = bookSnap.exists() ? ({ id: bookSnap.id, ...bookSnap.data() } as Book) : undefined;
            }

            if (item.bundleId) {
              const bundleSnap = await getDoc(doc(db, 'bundles', item.bundleId));
              bundle = bundleSnap.exists() ? ({ id: bundleSnap.id, ...bundleSnap.data() } as Bundle) : undefined;
            }

            return {
              ...item,
              book,
              bundle,
            };
          })
        );

        return populatedItems;
      })
    );
  }

  removeCartItem(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'cart', id)));
  }

  clearCart(userId: string): Observable<void[]> {
    const cartQuery = query(this.cartCollection, where('userId', '==', userId));
    return from(
      getDocs(cartQuery).then((querySnapshot) => {
        const deletePromises = querySnapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, 'cart', docSnap.id))
        );
        return Promise.all(deletePromises);
      })
    );
  }

  placeOrder(userId: string, items: CartItem[]): Observable<string> {
    const totalAmountPromise = Promise.all(
      items.map(async (item) => {
        if (item.bookId) {
          const bookSnap = await getDoc(doc(db, 'books', item.bookId));
          if (bookSnap.exists()) {
            const book = bookSnap.data() as Book;
            return item.quantity * book.price;
          }
        }

        if (item.bundleId) {
          const bundleSnap = await getDoc(doc(db, 'bundles', item.bundleId));
          if (bundleSnap.exists()) {
            const bundle = bundleSnap.data() as Bundle;
            return item.quantity * bundle.books.reduce((sum, b) => sum + b.price, 0);
          }
        }

        return 0;
      })
    );

    return from(
      totalAmountPromise.then(async (prices) => {
        const totalAmount = prices.reduce((sum, price) => sum + price, 0);
        const order: Order = {
          userId,
          items,
          totalAmount,
          createdAt: new Date(),
        };

        const orderRef = await addDoc(this.ordersCollection, order);
        await this.clearCart(userId).toPromise(); // clear cart after placing order
        return orderRef.id;
      })
    );
  }

  getOrders(userId: string): Observable<Order[]> {
    const ordersQuery = query(this.ordersCollection, where('userId', '==', userId));
    return from(
      getDocs(ordersQuery).then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]
      )
    );
  }
}
