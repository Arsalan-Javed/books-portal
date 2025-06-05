export interface Grade {
  id?: string;
  name: string;
  isDeleted?: boolean;
}
export interface Category {
  id?: string;
  name: string;
  isDeleted?: boolean;
}

export interface School {
  id?: string;
  name: string;
  address: string;
  representative: string;
  isDeleted?: boolean;
  phoneNumber: number | '';
  image?: string;
}

export interface Book {
  id?: string;
  bookName: string;
  image: string;
  description: string;
  quantity: number;
  price: number;
  grade: string;
  category: string;
  academicYear: number;
  isDeleted?: boolean;
}

export interface BundleBook {
  id: string;
  bookName: string;
  price: number;
  quantity: number;
}

export interface Bundle {
  id?: string;
  bundleName: string;
  image: string;
  grade: string;
  school: string;
  price: number;
  isDeleted?: boolean;
  books: BundleBook[];
}

export interface CartItem {
  id?: string;
  docId?: string;
  userId: string;
  bookId?: string;
  bundleId?: string;
  price?: number;
  quantity: number;
  isDiscount?: boolean;
}

export interface PopulatedCartItem extends CartItem {
  book?: Book;
  bundle?: Bundle;
}

export interface Order {
  id?: string;
  userId: string;
  status: string;
  paymentStatus: string;
  address?: {
    street: string;
    city: string;
  };
  school?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
}
