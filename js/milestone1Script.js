// Script for displaying book search results from JSON parsing onto milestone1.html

$(document).ready(function () {
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // Your API key

  // Function to create HTML for a single book item
  function createBookItem(book) {
    const volumeInfo = book.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};
    const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

    return `
            <div class="book">
                <h3>${volumeInfo.title || 'No Title Available'}</h3>
                <h4>${volumeInfo.subtitle || ''}</h4>
                <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
                <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
                <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
                <p><strong>Description:</strong> ${volumeInfo.description || 'No Description Available'}</p>
                <img src="${thumbnail}" alt="Book Cover" />
                <p><strong>Page Count:</strong> ${volumeInfo.pageCount || 'N/A'}</p>
                <p><strong>Categories:</strong> ${volumeInfo.categories ? volumeInfo.categories.join(', ') : 'No Categories Available'}</p>
                <p><strong>Average Rating:</strong> ${volumeInfo.averageRating || 'N/A'}</p>
                <p><a href="${volumeInfo.infoLink}" target="_blank">More Info</a></p>
            </div>
        `;
  }

  // Function to load book data from the JSON files
  function loadBookData(filePath, containerId) {
    $.getJSON(filePath)
      .done(function (data) {
        console.log("Data loaded from JSON:", data); // Log loaded data
        const container = $(containerId);
        container.empty(); // Clear existing content

        // Check if 'items' is present and is an array
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(book => {
            const bookItem = createBookItem(book);
            container.append(bookItem);
          });
        } else {
          container.html("<p>No valid book data found.</p>");
        }
      })
      .fail(function (jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.error("Error loading JSON:", err); // Log error
        $(containerId).html("<p>Error loading book data: " + err + "</p>");
      });
  }

  // Function to search for books
  function searchBooks(query) {
    const searchFilePath = '../json/google-books-search.json'; // Updated path to local JSON
    const bookFilePath = '../json/google-books-book.json';   // Updated path to local JSON

    let results = [];

    // Load search results from google-books-search.json
    $.getJSON(searchFilePath)
      .done(function (data) {
        if (data.items && Array.isArray(data.items)) {
          results = results.concat(data.items.filter(book => {
            return book.volumeInfo.title.toLowerCase().includes(query.toLowerCase());
          }));
        }

        // Load additional results from google-books-book.json
        $.getJSON(bookFilePath)
          .done(function (data) {
            if (data.items && Array.isArray(data.items)) {
              results = results.concat(data.items.filter(book => {
                return book.volumeInfo.title.toLowerCase().includes(query.toLowerCase());
              }));
            }

            // If no results found, search using Google Books API
            if (results.length === 0) {
              const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&key=${apiKey}`;
              $.getJSON(apiUrl)
                .done(function (data) {
                  if (data.items) {
                    results = results.concat(data.items);
                  }

                  // Display results
                  if (results.length > 0) {
                    $("#bookInfo").empty();
                    results.forEach(book => {
                      const bookItem = createBookItem(book);
                      $("#bookInfo").append(bookItem);
                    });
                  } else {
                    $("#bookInfo").html("<p>No results found in search.</p>");
                  }
                })
                .fail(function () {
                  $("#bookInfo").html("<p>Error loading search data from Google Books API.</p>");
                });
            } else {
              // Display results from local files
              if (results.length > 0) {
                $("#bookInfo").empty();
                results.forEach(book => {
                  const bookItem = createBookItem(book);
                  $("#bookInfo").append(bookItem);
                });
              } else {
                $("#bookInfo").html("<p>No results found in search.</p>");
              }
            }
          })
          .fail(function () {
            $("#bookInfo").html("<p>Error loading additional book data.</p>");
          });
      })
      .fail(function () {
        $("#bookInfo").html("<p>Error loading search data.</p>");
      });
  }

  // Search button click event
  $("#searchButton").on("click", function () {
    const query = $("#searchInput").val().trim();
    if (query) {
      searchBooks(query);
    }
  });

  // Load initial data from the local JSON file (milestone 1)
  loadBookData('../json/google-books-book.json', '#bookInfo'); // Load initial book data
});
