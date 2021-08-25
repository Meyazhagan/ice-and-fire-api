function constructBook(book, index) {
  document.querySelector(".books").innerHTML += ` <div class="book-container">
  <div class="head">Book Details</div>
  <div class="book-info">
    <div class="info">
      <span class="label">Name </span>:<span class="detail"
        >${book.name}</span
      >
    </div>
    <div class="info">
      <span class="label">ISBN </span>:<span class="detail"
        >${book.isbn}</span
      >
    </div>
    <div class="info">
      <spna class="label">Number of Pages </spna>:<span class="detail"
        >${book.numberOfPages}</span
      >
    </div>
    <div class="info">
      <span class="label">Authors</span>:<span class="detail"
        >${book.authors[0]}</span
      >
    </div>
    <div class="info">
      <span class="label">Publisher Name</span>:<span class="detail"
        >${book.publisher}</span
      >
    </div>
    <div class="info">
      <span class="label">Released Date </span>:<span class="detail"
        >${new Date(book.released).toDateString()}</span
      >
    </div>
    <div class="btn-info">
    <div class="btn-inner">
      <button class="btn" id="${index}" onclick=more('${index}', )>More info</button>
      <div class="overlay">
        <div class="book-info">
          <div class="info">
            <span class="label">Media Type </span>:<span class="detail"
              >${book.mediaType}</span
            >
          </div>
          <div class="info">
      <span class="label">Country </span>:<span class="detail"
        >${book.country}</span
      >
    </div>
        </div>
      </div>
    </div>
    </div>
  </div>
  <div class="head">Charaters Details</div>
  <div class="charater-container" id="key${index}"></div>
</div>`;
}

function constructCharater(character, index) {
  document.querySelector(
    `#key${index}`
  ).innerHTML += `<div class="charater-info">
      <div class="info">
        <span class="label">Name </span>:<span class="detail"
          >${character.name}</span
        >
      </div>
      <div class="info">
      <span class="label">Gender </span>:<span class="detail"
        >${character.gender}</span
      >
    </div>
      <div class="info">
          <span class="label">Culture </span>:<span class="detail"
            >${character.culture}</span
          >
        </div>
        <div class="btn-info info">
          <div class="btn-inner">
            <button class="btn" id="${character.url}" onclick=more('${character.url}')>More info</button>
            <div class="overlay">
            <div class="book-info">
            <div class="info">
              <span class="label">Born </span>:<span class="detail"
                >${character.born}</span
              >
            </div>
          </div>
            </div>
          </div>
        </div>

      </div>`;
}

const baseurl = "https://www.anapioficeandfire.com/api/";

getBooks();

async function getBooks() {
  try {
    let books;
    let local = await JSON.parse(window.localStorage.getItem("books"));
    if (local && local.length !== 0) {
      console.log("from local storage");
      books = local;
    } else {
      console.log("fetching from server...");
      books = await fetchBook();
    }
    books.forEach(async (book, index) => {
      constructBook(book, index);
      book.characters.forEach((char) => {
        constructCharater(char, index);
      });
    });
    window.localStorage.setItem("books", JSON.stringify(books));
    console.log(books);
  } catch (err) {
    console.log(err);
  }
}

function getCharaters(url, charObj) {
  let num = 0;
  let chars = [];
  for (let i = 0; i < url.length; i++) {
    const char = charObj[url[i]];
    if (num === 5) {
      break;
    }
    if (char.name !== "" && char.gender !== "" && char.culture !== "") {
      chars.push(char);
      num++;
    }
  }
  return chars;
}

async function fetchBook() {
  try {
    let charobj = await fetchCharactersAll();
    const books = await getData(baseurl + "books?pageSize=50");

    books.forEach(async (book) => {
      book.characters = await getCharaters(book.characters, charobj);
    });
    return books;
  } catch (err) {
    console.log(err);
  }
}

async function fetchCharacters() {
  let page = 1;
  let pagesize = 50;
  let limit = 5;
  const charObj = {};
  while (page <= limit) {
    const characters = await getData(
      baseurl + `characters?page=${page}&pageSize=${pagesize}`
    );
    characters.forEach((char) => {
      charObj[char.url] = char;
    });
    page++;
  }
  return charObj;
}

async function fetchCharactersAll() {
  let page = 1;
  let pagesize = 50;
  let limit = 15;
  const charObj = {};
  let urls = [];
  while (page <= limit) {
    urls.push(baseurl + `characters?page=${page}&pageSize=${pagesize}`);
    page++;
  }
  try {
    let results = await Promise.all(urls.map((url) => fetch(url)));

    results.forEach((result) => {
      result
        .json()
        .then((characters) => {
          characters.forEach((char) => {
            charObj[char.url] = char;
          });
        })
        .catch((err) => console.log(err));
    });
  } catch (err) {
    console.log(err);
  }
  console.log(charObj);
  return charObj;
}

async function getData(URL) {
  const res = await fetch(URL);
  const data = await res.json();
  return data;
}
