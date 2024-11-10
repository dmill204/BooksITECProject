$(document).ready(function () {
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // My API key
  const resultsPerPage = 10; // Number of results to display per page
  let currentPage = 1; // Current page number
  let totalResults = []; // Array to store all results
  const bookshelfId = '105455315055651775681'; // My bookshelf ID
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []; // Retrieve stored search history or initialize an empty array

  // Function to save search history to localStorage and update the UI
  function updateSearchHistory(query) {
    // Check if the query already exists in the history
    if (!searchHistory.includes(query)) {
      searchHistory.unshift(query); // Add to the beginning of the array
      if (searchHistory.length > 10) {
        searchHistory.pop(); // Keep only the last 10 searches
      }
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // Store in localStorage
      displaySearchHistory(); // Update the UI
    }
  }

  // Function to display the search history
  function displaySearchHistory() {
    $('#searchHistoryList').empty(); // Clear current list

    searchHistory.forEach(query => {
      // Create an anchor element for better interaction
      const historyItem = $('<li></li>').html(`<a href="#" class="search-history-link">${query}</a>`);

      // Attach the click event to the anchor element
      historyItem.find('.search-history-link').click(function (event) {
        event.preventDefault(); // Prevent the default anchor behavior
        $('#searchInput').val(query);
        searchBooks(query); // Trigger the search when the history item is clicked
      });

      $('#searchHistoryList').append(historyItem);
    });
  }

  // Call this function to display the search history on page load
  displaySearchHistory();

  // Modify the search button click event to save the query
  $('#searchButton').click(function () {
    const query = $('#searchInput').val().trim();
    if (query) {
      updateSearchHistory(query); // Update search history
      searchBooks(query); // Perform the search
    }
  });

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


// Modified displayResults function in milestone4Script.js
  function displayResults() {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, totalResults.length);
    const paginatedResults = totalResults.slice(startIndex, endIndex);

    // Use renderBooks to respect currentView (grid as default)
    renderBooks(paginatedResults);
    updatePagination(); // Update pagination as before
  }


  // // Function to display book details
  // function displayBookDetails(book) {
  //   const volumeInfo = book.volumeInfo;
  //   const imageLinks = volumeInfo.imageLinks || {};
  //   const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images
  //
  //   const detailsHtml = `
  //     <div class="book-details">
  //         <img src="${thumbnail}" alt="Book Cover" />
  //         <h3>${volumeInfo.title || 'No Title Available'}</h3>
  //         <h4>${volumeInfo.subtitle || ''}</h4>
  //         <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
  //         <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
  //         <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
  //         <p><strong>Description:</strong> ${volumeInfo.description || 'No Description Available'}</p>
  //     </div>
  //   `;
  //
  //   $("#bookDetailsContainer").html(detailsHtml); // Display the details
  // }

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

  // Set up tab buttons to show/hide sections
  $('#viewSearchResultsBtn').click(function () {
    $('#searchResultsContent').show();
    $('#publicBookshelfContent').hide();
  });

  $('#viewPublicBookshelfBtn').click(function () {
    fetchPublicBookshelf(); // Fetch and display the public bookshelf when clicked
    $('#searchResultsContent').hide();
    $('#publicBookshelfContent').show();
  });


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
