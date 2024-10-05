// Script for displaying my pesonal bookshelf books onto publicBookshelf.html
// TODO: FIND MY PERSONAL BOOK SHELF ID TO PUT INTO myBookshelf.js SOMEWHERE

$(document).ready(function () {
  const clientId = '1021327201447-cdp7o2f7fkouo8krbk3bdpve5dolqgb3.apps.googleusercontent.com'; // Your Client ID
  const redirectUri = 'https://dmill204.github.io/BooksITECProject/html/publicBookshelf.html'; // Use the GitHub Pages URL
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // Your API key
  const bookshelfId = '105455315055651775681'; // Your bookshelf ID

  // Function to get access token from URL
  function getAccessToken() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
  }

  // Function to fetch and display books from the public bookshelf
  function fetchBookshelfBooks() {
    const accessToken = getAccessToken(); // Get the access token

    // If no access token, redirect to OAuth flow
    if (!accessToken) {
      const scope = 'https://www.googleapis.com/auth/books';
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;
      window.location.href = authUrl; // Redirect for authorization
      return; // Exit the function
    }

    // Now that we have an access token, make the API request
    const apiUrl = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${bookshelfId}/volumes?key=${apiKey}&access_token=${accessToken}`;

    $.getJSON(apiUrl)
      .done(function (data) {
        const books = data.items || [];
        const bookshelfContainer = $('#bookshelfBooks');

        if (books.length > 0) {
          books.forEach(book => {
            const bookItem = createBookItem(book);
            bookshelfContainer.append(bookItem);
          });
        } else {
          bookshelfContainer.html("<p>No books found in your bookshelf.</p>");
        }
      })
      .fail(function (jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.error("Error loading bookshelf books:", err);
        $('#bookshelfBooks').html("<p>Error loading bookshelf books.</p>");
      });
  }

  // Function to create HTML for a single book item
  function createBookItem(book) {
    const volumeInfo = book.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};
    const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

    return `
            <div class="book">
                <img src="${thumbnail}" alt="Book Cover" />
                <h3><a href="../html/bookDetails.html?id=${book.id}" class="book-link">${volumeInfo.title || 'No Title Available'}</a></h3>
                <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
                <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
                <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
            </div>
        `;
  }

  // Fetch the books when the page is loaded
  fetchBookshelfBooks();
});
