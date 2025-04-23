export interface Grade {
  id?: string;
  name: string;
}
export interface Type {
  id?: string;
  name: string;
}

export interface School {
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
  type: string;
  academicYear: number
}

export interface BundleBook {
  id: string;
  bookName: string;
  price: number;
}

export interface Bundle {
  id?: string;
  bundleName: string;
  image:string;
  grade: string;
  school: string;
  books: BundleBook[];
}

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
