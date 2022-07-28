const books = [];

const RENDER_EVENT = "render";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", kirim);
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById("search-books").addEventListener("keyup", function(){
  const search = document.getElementById("search-books").value.toLowerCase();
  const list = document.getElementById("wrapper");
  const bookItem = document.querySelectorAll(".inner");
  const bname = list.getElementsByTagName("h2");

  for(let i = 0; i < bname.length; i++){
    let match = bookItem[i].getElementsByTagName('h2')[0];

    if(match){
      let textValue = match.textContent || match.innerHTML

      if(textValue.toLowerCase().indexOf(search) > -1){
        bookItem[i].parentElement.style.display = "";
      } else{
        bookItem[i].parentElement.style.display = "none";
      }
    }
  }


});

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteList = document.getElementById("read");
  const completedList = document.getElementById("completed-read");

  uncompleteList.innerHTML = "";
  completedList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = createBook(bookItem);
    if (bookItem.isCompleted == false) uncompleteList.append(bookElement);
    else completedList.append(bookElement);
  }
});

function kirim(){
  const submitForm = document.getElementById("form-input");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const textTitle = document.getElementById("judul").value;
  const textAuthor = document.getElementById("penulis").value;
  const textYear = document.getElementById("tahun").value;
  const checklist = document.getElementById("isComplete");

  const generatedID = generateId();
  if (checklist.checked == true) {
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, true);
    books.push(bookObject);
  } else {
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, false);
    books.push(bookObject);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, tittle, author, year, isCompleted) {
  return {id, tittle, author, year, isCompleted,};
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function createBook(bookObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = bookObject.tittle;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis : ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun : ${bookObject.year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow-2");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("btn-undo");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("btn-delete");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const EditButton = document.createElement("button");
    EditButton.classList.add("btn-edit");
    EditButton.addEventListener("click", function () {
      EditBook(bookObject.id);
    });

    container.append(undoButton, trashButton, EditButton);
    
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("btn-check");
    checkButton.addEventListener("click", function () {
      addBooksToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("btn-delete");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const EditButton = document.createElement("button");
    EditButton.classList.add("btn-edit");
    EditButton.addEventListener("click", function () {
      EditBook(bookObject.id);
    });

    container.append(checkButton, trashButton, EditButton);
  }

  return container;
}

function addBooksToCompleted(BookId) {
  const bookTarget = findBooks(BookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBooks(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  swal("Success", "Successfully Removed from the Book list", "success");
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function EditBook(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;

  document.getElementById("judul").value = bookTarget.tittle;
  document.getElementById("penulis").value = bookTarget.author;
  document.getElementById("tahun").value = bookTarget.year;
  document.getElementById("isComplete").checked = false;

  const bookTarget2 = findBookIndex(bookId);
  if (bookTarget2 === -1) return;
  books.splice(bookTarget2, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}