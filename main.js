const INCOMPLETE_BOOKLIST = "incompleteBookList";
const COMPLETE_BOOK_LIST = "completeBookList";
const BOOK_ITEMID = "itemId";
const STORAGE_KEY = "BOOK_APPS";
let books = [];
// scriipt  
document.addEventListener("DOMContentLoaded", function(){
    const submitBook = document.getElementById("bookForm");

    submitBook.addEventListener("submit", function(event){
        event.preventDefault();
        addBook();
    });

    const searchBooks = document.getElementById("searchBook");

    searchBooks.addEventListener("submit", function(event){
        event.preventDefault();
        searchBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener("onDataSaved", () => {
    console.log("Data berhasil disimpan.");
});

document.addEventListener("onDataLoaded", () => {
    refreshDataFromBooks();
});

function changeText(){
    const checkBox = document.getElementById("bookFormIsComplete");
    const textSubmit = document.getElementById("bookFormSubmit");

    if(checkBox.checked == true){
        textSubmit.innerText = "Sudah selesai dibaca";
    } else {
        textSubmit.innerText = "Belum selesai dibaca";
    }
};

// dom

function addBook() {
    const incompleteBookList = document.getElementById(INCOMPLETE_BOOKLIST);
    const completeBookList = document.getElementById(COMPLETE_BOOK_LIST);

    const inputBookTitle = document.getElementById("bookFormTitle").value;
    const inputBookAuthor = document.getElementById("bookFormAuthor").value;
    const inputBookYear = document.getElementById("bookFormYear").value;
    const inputBookIsComplete = document.getElementById("bookFormIsComplete").checked;

    const book = makeBook(inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    const bookObject = composeBookObject(inputBookTitle, inputBookAuthor, parseFloat(inputBookYear), inputBookIsComplete);

    book[BOOK_ITEMID] = bookObject.id;
    books.push(bookObject);

    if(inputBookIsComplete == false){
        incompleteBookList.append(book);
    } else {
        completeBookList.append(book);
    }

    updateDataToStorage();
};

function makeBook(inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete) {
    const bookTitle = document.createElement("h3")
    bookTitle.setAttribute("data-testid","bookItemTitle");
    bookTitle.setAttribute("id","bookTitle" );
    bookTitle.classList.add("move");
    bookTitle.innerText = "Judul : " + inputBookTitle;

    const bookAuthor = document.createElement("p");
    bookAuthor.classList.add("p-penulis");
    bookAuthor.setAttribute("id","bookAuthor")
    bookAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookAuthor.innerText = "Penulis : " + inputBookAuthor;

    const bookYear = document.createElement("p");
    bookYear.classList.add("year");
    bookYear.setAttribute("id", "bookYear");
    bookYear.setAttribute("data-testid", "bookItemYear");
    bookYear.innerText = "Tahun : " + inputBookYear;

    const bookIsComplete = createCompleteButton();

    const bookRemove = createRemoveButton();
    bookRemove.innerText = "Hapus";

    const bookAction = document.createElement("div");
    bookAction.classList.add("action");
    if (inputBookIsComplete == true){
        bookIsComplete.innerText = "Belum selesai";
    } else {
        bookIsComplete.innerText = "Sudah selesai";
    }

    bookAction.append(bookIsComplete, bookRemove);

    const bookItem = document.createElement("div");
    bookItem.setAttribute("data-testid","bookItem");
    bookItem.setAttribute("data-bookid", makeId());
    bookItem.classList.add("book_item");
    bookItem.append(bookTitle, bookAuthor, bookYear, bookAction);

    return bookItem;
};

function createButton(ButtonTypeClass , data_testid, eventListener) {
    const button = document.createElement("button");
    button.classList.add(ButtonTypeClass);
    button.setAttribute("data-testid", data_testid);
    button.addEventListener("click", function (event) {
        eventListener(event);
    });
    return button;
};

function createCompleteButton(){
    return createButton("green", "bookItemIsCompleteButton", function(event){
        const parent = event.target.parentElement;
        addBookToCompleted(parent.parentElement);
    });
};

function removeBook(bookElement) {
    const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
    if (window.confirm("Apakah anda ingin menghapus buku ini dari rak?")){
        books.splice(bookPosition, 1);
        bookElement.remove();
    }
    updateDataToStorage();
};

function createRemoveButton(){
    return createButton("red", "bookItemDeleteButton", function(event){
        const parent = event.target.parentElement;
        removeBook(parent.parentElement);
    });
};

function addBookToCompleted(bookElement){
    const bookTitled = bookElement.querySelector(".book_item > h3").innerText;
    const bookAuthored = bookElement.querySelector(".book_item > p").innerText;
    const bookYeared = bookElement.querySelector(".year").innerText;
    const bookIsComplete = bookElement.querySelector(".green").innerText;

    if (bookIsComplete == "Sudah selesai"){
        const newBook = makeBook(bookTitled, bookAuthored, bookYeared, true)

        const book = findBook(bookElement[BOOK_ITEMID]);
        book.isComplete = true;
        newBook[BOOK_ITEMID] = book.id;

        const completeBookList = document.getElementById(COMPLETE_BOOK_LIST);
        completeBookList.append(newBook);
    } else {
        const newBook = makeBook(bookTitled, bookAuthored, bookYeared, false)

        const book = findBook(bookElement[BOOK_ITEMID]);
        book.isComplete = false;
        newBook[BOOK_ITEMID] = book.id; 

        const incompleteBookList = document.getElementById(INCOMPLETE_BOOKLIST);
        incompleteBookList.append(newBook);
    }
    bookElement.remove();

    refreshDataFromBooks();

    updateDataToStorage();
};

function refreshDataFromBooks() {
    const listUncompleted = document.getElementById(INCOMPLETE_BOOKLIST);
    const listCompleted = document.getElementById(COMPLETE_BOOK_LIST);
// mencegah duplikasi element html books
    listUncompleted.innerHTML = '';
    listCompleted.innerHTML = '';

    for(const book of books){
        const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
        newBook[BOOK_ITEMID] = book.id;

        if(book.isComplete == false){
            listUncompleted.append(newBook);
        } else {
            listCompleted.append(newBook);
        }
    }
}

function searchBook() {
    const inputSearch = document.getElementById("searchBookTitle").value;
    const moveBook = document.querySelectorAll(".move")

    for(const move of moveBook){
        if (inputSearch !== move.innerText){
            console.log(move.innerText)
            move.parentElement.remove();
        }
    }

}

// storage

function isStorageExist() {
    if(typeof(Storage) === undefined){
        alert("browser anda tidak mendukung local storage!");
        return false
    }
    return true
};

function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("onDataSaved"));
};

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if(data !== null)
        books = data;
    
    document.dispatchEvent(new Event("onDataLoaded"));
};

function updateDataToStorage() {
    if(isStorageExist())
        saveData(); 
};

function makeId() {
    let idGenerator = +new Date();

    return idGenerator;
};

function composeBookObject(title, author, year, isComplete) {
    return {
        id: makeId(),
        title,
        author,
        year,
        isComplete
    };
};

function findBook(bookId) {
    for(const book of books){
        if(book.id === bookId)
            return book;
    }
    return null;
};

function findBookIndex(bookId) {
    let index = 0;
    for (const book of books){
        if(book.id === bookId)
            return index;

        index++;
    }
    return -1;
};
