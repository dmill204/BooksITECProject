// Script for displaying my pesonal bookshelf books onto publicBookshelf.html

$(document).ready(function () {
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // Your API key
  const resultsPerPage = 10; // Number of results to display per page
  let currentPage = 1; // Current page number
  let totalResults = []; // Array to store all results

  // Function to create HTML for a single book item
  function createBookItem(book) {
    const volumeInfo = book.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};
    const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

    return `
        <div class="book">
            <img src="${thumbnail}" alt="Book Cover" />
            <h3><a href="../html/bookDetails.html?id=${book.id}" class="book-link">${volumeInfo.title || 'No Title Available'}</a></h3>
            <h4>${volumeInfo.subtitle || ''}</h4>
            <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
            <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
            <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
            <p><strong>Description:</strong> ${volumeInfo.description || 'No Description Available'}</p>
        </div>
    `;
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
  }

  // Function to update pagination dropdown
  function updatePagination() {
    const totalPages = Math.ceil(totalResults.length / resultsPerPage);
    $("#pageSelect").empty();

    for (let i = 1; i <= totalPages; i++) {
      $("#pageSelect").append(`<option value="${i}">Page ${i}</option>`);
    }

    // Set the selected page in the dropdown
    $("#pageSelect").val(currentPage);

    $("#pageSelect").off('change').on('change', function () {
      currentPage = parseInt($(this).val());
      displayResults(); // Re-display results on the selected page
    });
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
});
