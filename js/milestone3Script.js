$(document).ready(function () {
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // My API key
  const resultsPerPage = 10; // Number of results to display per page
  let currentPage = 1; // Current page number
  let totalResults = []; // Array to store all results
  const bookshelfId = '105455315055651775681'; // My bookshelf ID

  // Function to create HTML for a single book item (limited info)
  function createBookItem(book) {
    const volumeInfo = book.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};
    const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

    return `
      <div class="book" data-book-id="${book.id}">
          <img src="${thumbnail}" alt="Book Cover" />
          <h3 class="book-title">
              <a href="#" class="book-link" data-book-id="${book.id}">${volumeInfo.title || 'No Title Available'}</a>
          </h3>
      </div>
    `;
  }

  // Function to retrieve access token (implement your own logic here)
  function getAccessToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("No access token found. Please authenticate.");
    }
    return token;
  }

  function fetchPublicBookshelf() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      $("#publicshelfResultsContainer").html("<p>Please log in to view your bookshelf.</p>");
      return;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${bookshelfId}/volumes?key=${apiKey}&access_token=${accessToken}`;

    $.getJSON(apiUrl)
      .done(function (data) {
        console.log('Bookshelf data:', data); // Log the data returned from the API
        if (data.items) {
          totalResults = data.items; // Store all results
          displayResults(); // Display the first set of results
        } else {
          $("#publicshelfResultsContainer").html("<p>No books found in your public bookshelf.</p>");
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        const errorMessage = `Error loading public bookshelf data from Google Books API: ${errorThrown}. Response: ${jqXHR.responseText}`;
        $("#publicshelfResultsContainer").html(`<p>${errorMessage}</p>`);
        console.error("API Request Failed: ", textStatus, errorThrown, jqXHR);
      });
  }


  // Function to display search results
  function displayResults() {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, totalResults.length);
    const paginatedResults = totalResults.slice(startIndex, endIndex);

    $("#resultsContainer").empty();
    paginatedResults.forEach(book => {
      const bookItem = createBookItem(book);
      $("#resultsContainer").append(bookItem);
    });

    // Update pagination
    updatePagination();

    // Add click event for each book link
    $(".book-link").on("click", function (e) {
      e.preventDefault();
      const bookId = $(this).data("book-id"); // Get the book ID from the link
      const selectedBook = totalResults.find(book => book.id === bookId); // Find the selected book
      displayBookDetails(selectedBook); // Display the details
    });
  }

  // Function to display book details
  function displayBookDetails(book) {
    const volumeInfo = book.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};
    const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

    const detailsHtml = `
      <div class="book-details">
          <img src="${thumbnail}" alt="Book Cover" />
          <h3>${volumeInfo.title || 'No Title Available'}</h3>
          <h4>${volumeInfo.subtitle || ''}</h4>
          <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
          <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
          <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
          <p><strong>Description:</strong> ${volumeInfo.description || 'No Description Available'}</p>
      </div>
    `;

    $("#bookDetailsContainer").html(detailsHtml); // Display the details
  }

  // Function to update pagination with buttons
  function updatePagination() {
    const totalPages = Math.ceil(totalResults.length / resultsPerPage);
    const pageLinksContainer = $("#pageLinks");
    pageLinksContainer.empty(); // Clear existing buttons

    for (let i = 1; i <= totalPages; i++) {
      const button = $('<button></button>')
        .text(i) // Set button text to page number
        .addClass('page-button') // Add a class for styling
        .on('click', function () {
          currentPage = i; // Update current page
          displayResults(); // Re-display results on the selected page
          updateButtonStyles(); // Update button styles to indicate the current page
        });

      // Append button to the container
      pageLinksContainer.append(button);
    }

    updateButtonStyles(); // Call initially to set correct styles on load
  }

  // Function to update button styles to indicate the current page
  function updateButtonStyles() {
    $('.page-button').removeClass('active'); // Remove active class from all buttons
    $(`.page-button:eq(${currentPage - 1})`).addClass('active'); // Add active class to current button
  }

  // Function to search for books
  function searchBooks(query) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&key=${apiKey}`;

    $.getJSON(apiUrl)
      .done(function (data) {
        if (data.items) {
          totalResults = data.items; // Store all results
          currentPage = 1; // Reset to first page on new search
          displayResults(); // Display the first set of results
        } else {
          $("#resultsContainer").html("<p>No results found.</p>");
        }
      })
      .fail(function () {
        $("#resultsContainer").html("<p>Error loading search data from Google Books API.</p>");
      });
  }

  // Search button click event
  $("#searchButton").on("click", function () {
    const query = $("#searchInput").val().trim();
    if (query) {
      searchBooks(query);
    }
  });

  // Fetch public bookshelf books when the page loads
  fetchPublicBookshelf();
});
