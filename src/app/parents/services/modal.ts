export interface Grade {
  id?: string;
  name: string;
}
export interface Category {
  id?: string;
  name: string;
}

export interface School {
  id?: string;
  name: string;
  representative:string;
  phoneNumber:number | ''
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
  academicYear: number
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
  image:string;
  grade: string;
  school: string;
  price:number;
  books: BundleBook[];
}

export interface CartItem {
  id?: string;
  userId: string;
  bookId?: string;
  bundleId?: string;
  price?:number;
  quantity: number;
  isDiscount?:boolean
}

export interface PopulatedCartItem extends CartItem {
  book?: Book;
  bundle?: Bundle;
}

export interface Order {
  id?: string;
  userId: string;
  status:string;
  paymentStatus:string;
  address?:string,
  school?:string,
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
}
