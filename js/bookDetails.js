// Script for displaying single book search result from API call onto bookDetails.html

$(document).ready(function () {
  const apiKey = 'AIzaSyDOqNcZ9LOG5QCSKdvsn4DaVed-ej2HRek'; // Your API key
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  // Function to fetch and display book details
  function fetchBookDetails(bookId) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`;

    $.getJSON(apiUrl)
      .done(function (data) {
        const volumeInfo = data.volumeInfo;
        const imageLinks = volumeInfo.imageLinks || {};
        const thumbnail = imageLinks.thumbnail || 'path/to/default/image.jpg'; // Fallback for missing images

        const bookDetailsHtml = `
                    <div class="book-details">
                        <img src="${thumbnail}" alt="Book Cover" style="max-width: 200px;" />
                        <h3>${volumeInfo.title || 'No Title Available'}</h3>
                        <h4>${volumeInfo.subtitle || ''}</h4>
                        <p><strong>Authors:</strong> ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Authors Available'}</p>
                        <p><strong>Publisher:</strong> ${volumeInfo.publisher || 'No Publisher Available'}</p>
                        <p><strong>Published Date:</strong> ${volumeInfo.publishedDate || 'No Date Available'}</p>
                        <p><strong>Description:</strong> ${volumeInfo.description || 'No Description Available'}</p>
                        <p><strong>Page Count:</strong> ${volumeInfo.pageCount || 'N/A'}</p>
                        <p><strong>Categories:</strong> ${volumeInfo.categories ? volumeInfo.categories.join(', ') : 'No Categories Available'}</p>
                        <p><strong>Average Rating:</strong> ${volumeInfo.averageRating || 'N/A'}</p>
                        <p><strong>Price:</strong> ${volumeInfo.saleInfo && volumeInfo.saleInfo.listPrice ? volumeInfo.saleInfo.listPrice.amount + ' ' + volumeInfo.saleInfo.listPrice.currencyCode : 'Price not available'}</p>
                        <p><a href="${volumeInfo.infoLink}" target="_blank">More Info</a></p>
                    </div>
                `;
        $('#bookDetailInfo').html(bookDetailsHtml);
      })
      .fail(function () {
        $('#bookDetailInfo').html("<p>Error loading book details.</p>");
      });
  }

  // Fetch book details using the book ID
  if (bookId) {
    fetchBookDetails(bookId);
  } else {
    $('#bookDetailInfo').html("<p>No book ID provided.</p>");
  }
});
