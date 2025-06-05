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
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import {  BookService, db } from 'src/app/pages/books/book.service';
import { Book, Bundle, CartItem, Order, PopulatedCartItem } from './modal';



@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCollection = collection(db, 'cart');
  private ordersCollection = collection(db, 'orders');
  private cartChangedSubject = new BehaviorSubject<void>(undefined);
  cartChanged$ = this.cartChangedSubject.asObservable();
  private booksCollection = collection(db, 'books');
  constructor(private authService: AuthFirebaseService,private bookService:BookService) {}

  addToCart(item: any): Observable<string> {
    if (!this.authService.getCurrentUser()) {
      return throwError(() => new Error('Please Login First'));
    }
    const userId = this.authService.getCurrentUser().uid;
    const conditions = [
      where('userId', '==', userId),
      item.bookId ? where('bookId', '==', item.bookId) : where('bundleId', '==', item.bundleId),
    ];

    if (item.hasOwnProperty('isDiscount')) {
      conditions.push(where('isDiscount', '==', item.isDiscount));
    }

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
            quantity: item.isDiscount ? (item.quantity) : 1,
            isDiscount: item.isDiscount ?? item.isDiscount ?? false,
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
          docId: doc.id,
          ...doc.data()
        })) as CartItem[];

        const populatedItems: any[] = await Promise.all(
          items.map(async (item) => {
            let book, bundle;

            if (item.bookId) {
              book = item
              // const bookSnap = await getDoc(doc(db, 'books', item.bookId));
              // book = bookSnap.exists() ? ({ id: bookSnap.id,price:item.price ,...bookSnap.data() } as Book) : undefined;
            }

            if (item.bundleId) {
              bundle = item
              // const bundleSnap = await getDoc(doc(db, 'bundles', item.bundleId));
              // bundle = bundleSnap.exists() ? ({ id: bundleSnap.id,price:item.price, ...bundleSnap.data() } as Bundle) : undefined;
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
  updateCartItem(id: string, data: Partial<CartItem>): Observable<void> {
    const itemRef = doc(this.cartCollection, id);
    return from(updateDoc(itemRef, data));
  }

  removeCartItem(id: string): Observable<void> {
    this.cartChangedSubject.next()
    const cartDocRef = doc(this.cartCollection, id);
    return from(deleteDoc(cartDocRef));
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

  placeOrder(
    userId: string,
    items: any[],
    school?: string,
    address?: any
  ): Observable<string> {
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const sanitizedItems = items.map((item) => {
      const sanitizedItem: any = {};
      Object.keys(item).forEach((key) => {
        const value = item[key];
        if (value !== undefined && value !== null) {
          sanitizedItem[key] = value;
        }
      });
      return sanitizedItem;
    });

    const order: Order = {
      userId,
      status: 'placed',
      paymentStatus: 'unpaid',
      address: address,
      school,
      items: sanitizedItems,
      totalAmount,
      createdAt: new Date(),
    };

    return from(
      addDoc(this.ordersCollection, order).then(async (orderRef) => {
        const bookQuantityMap: Record<string, number> = {};

        for (const item of items) {
          if (item.type === 'book') {
            bookQuantityMap[item.id] = (bookQuantityMap[item.id] || 0) + item.quantity;
          } else if (item.type === 'bundle' && Array.isArray(item.books)) {
            for (const book of item.books) {
              const bundleQty = item.quantity || 1;
              if (book?.id && typeof book.quantity === 'number') {
                const totalBookQty = book.quantity * bundleQty;
                bookQuantityMap[book.id] = (bookQuantityMap[book.id] || 0) + totalBookQty;
              }
            }
          }
        }

        const updatePromises = Object.entries(bookQuantityMap).map(([bookId, qty]) =>
          this.decreaseBookQuantity(bookId, qty)
        );

        await Promise.all(updatePromises);

        // ✅ STEP 3: Clear cart and notify listeners
        await this.clearCart(userId).toPromise();
        this.cartChangedSubject.next();

        return orderRef.id;
      })
    );
  }



  decreaseBookQuantity(bookId: string, orderedQty: number): Promise<void> {
    const docRef = doc(db, 'books', bookId);

    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const book = docSnap.data();
        const currentQty = book.quantity ?? 0;
        const newQty = Math.max(currentQty - orderedQty, 0); // Prevent negative quantity

        return this.bookService.updateBook(bookId, { quantity: newQty }).toPromise();
      } else {
        return Promise.reject(`Book with ID ${bookId} not found`);
      }
    });
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
  getOrderById(orderId: string): Observable<Order | undefined> {
    const orderDoc = doc(this.ordersCollection, orderId);
    return from(
      getDoc(orderDoc).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as Order;
        } else {
          return undefined;
        }
      })
    );
  }
  getAllOrders(): Observable<Order[]> {
    const ordersCol = this.ordersCollection;
    return from(
      getDocs(ordersCol).then((querySnapshot) => {
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
      })
    );
  }
  updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    const orderRef = doc(this.ordersCollection, orderId);
    return updateDoc(orderRef, data);
  }

}
