import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent {
  @Input() books: any[] = [];
  @Input() isAddToCart:boolean = false
  @Input() isSelect: boolean = false;
  @Output() selectedBooksEmit = new EventEmitter<any[]>();
  @Output() cartBook = new EventEmitter<any[]>();

  selectedBooks: any[] = [];
  selectAll: boolean = false;
  bookInput:any
  filteredBooks:any

  ngOnChanges() {
    this.filteredBooks = [...this.books];
  }

  toggleSelection(book: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedBooks.push(book);
    } else {
      this.selectedBooks = this.selectedBooks.filter(b => b !== book);
    }

    this.selectAll = this.selectedBooks.length === this.books.length;
  }


  toggleSelectAll(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectAll = input.checked;

    if (this.selectAll) {
      this.selectedBooks = [...this.books];
    } else {
      this.selectedBooks = [];
    }

  }

  emitSelectedBooks(): void {
    this.selectedBooksEmit.emit(this.selectedBooks);
  }
  isBookSelected(book: any): boolean {
    return this.selectedBooks.includes(book);
  }
  addBundleBook(book: any) {
    this.cartBook.emit(book);
  }

  applyFilters() {
    const name = this.bookInput;
    const lowerName = name?.toLowerCase() || '';
    this.filteredBooks = this.books.filter(s =>
      (!name || s.bookName?.toLowerCase().includes(lowerName))
    );
  }




}
