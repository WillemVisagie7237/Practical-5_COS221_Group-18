document.getElementById('contentForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const id = document.getElementById('id').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const releaseYear = document.getElementById('releaseYear').value;
  const rating = document.getElementById('rating').value;
  const genre = document.getElementById('genre').value;
  const type = document.getElementById('type').value;
  let runtime = null;
  if (type === 'movie') {
    runtime = document.getElementById('runtime').value;
  }

  const data = { id, title, description, releaseYear, rating, genre, runtime, type };

  fetch('/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Content saved successfully!');
      } else {
        alert('Error saving content.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

document.getElementById('deleteForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const id = document.getElementById('deleteId').value;
  const type = document.getElementById('contentType').value;

  fetch('/content/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, type }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Content deleted successfully!');
      } else {
        alert('Error deleting content.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});





function addOrUpdatePerson() {
  const personId = document.getElementById('personId').value;
  const role = document.getElementById('roleSelect').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const dob = document.getElementById('dob').value;

  const data = { personId, role, firstName, lastName, dob };

  let url = '/persons';
  let method = 'POST';

  if (personId) {
    // If personId exists, it's an update operation
    url += `/${personId}`; // Include personId in the URL
    method = 'PUT';
  }

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`${role} ${personId ? 'updated' : 'added'} successfully!`);
      // Refresh person list or update UI as needed
    } else {
      alert(`Error ${personId ? 'updating' : 'adding'} ${role}.`);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function deletePerson() {
  const personId = document.getElementById('personId').value;

  if (!personId) {
    alert('Please select a person to delete.');
    return;
  }

  fetch(`/persons/${personId}`, {
    method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Person deleted successfully!');
      // Refresh person list or update UI as needed
    } else {
      alert('Error deleting person.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function addProductionStudio() {
  const studioName = document.getElementById('studioName').value;
  const studioCountry = document.getElementById('studioCountry').value;
  const foundingYear = document.getElementById('foundingYear').value;
  const ceo = document.getElementById('ceo').value;
  const website = document.getElementById('website').value;

  const data = { studioName, studioCountry, foundingYear, ceo, website };

  fetch('/studios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Production studio added successfully!');
      // You may perform additional actions here, such as refreshing the studio list
      //Clearing the textboxes
      document.getElementById('studioName').value = "";
      document.getElementById('studioCountry').value = "";
      document.getElementById('foundingYear').value = "";
      document.getElementById('ceo').value = "";
      document.getElementById('website').value = "";
    } else {
      alert('Error adding production studio.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function editProductionStudio() {
  const id = document.getElementById('studioId').value;
  const studioName = document.getElementById('studioName').value;
  const studioCountry = document.getElementById('studioCountry').value;
  const foundingYear = document.getElementById('foundingYear').value;
  const ceo = document.getElementById('ceo').value;
  const website = document.getElementById('website').value;

  const data = { studioName, studioCountry, foundingYear, ceo, website };

  fetch(`/studios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Production studio updated successfully!');
      // You may perform additional actions here, such as refreshing the studio list
      document.getElementById('studioId').value = "";
      document.getElementById('studioName').value = "";
      document.getElementById('studioCountry').value = "";
      document.getElementById('foundingYear').value = "";
      document.getElementById('ceo').value = "";
      document.getElementById('website').value = "";
    } else {
      alert('Error updating production studio.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function deleteProductionStudio() {
  const id = document.getElementById('deleteStudioId').value;

  fetch(`/studios/${id}`, {
    method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Production studio deleted successfully!');
      // You may perform additional actions here, such as refreshing the studio list
      document.getElementById('deleteStudioId').value = "";
    } else {
      alert('Error deleting production studio.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}





function addOrUpdateGenre() {
  const contentId = document.getElementById('contentId').value;
  const genre = document.getElementById('genre').value;

  const data = { genre };

  let url = `/content/genre/${contentId}`;
  let method = contentId ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`Genre "${genre}" ${contentId ? 'updated' : 'added'} successfully to content ID ${contentId}.`);
      // You may perform additional actions here, such as refreshing the genre list
      document.getElementById('contentId').value = "";
      document.getElementById('genre').value = "";
    } else {
      alert('Error adding/updating genre.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}




function deleteGenre() {
  const contentId = document.getElementById('contentId').value;

  if (!contentId) {
    alert('Please enter a Content ID to delete the genre.');
    return;
  }

  fetch(`/content/genre/${contentId}`, {
    method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Genre deleted successfully!');
      // Refresh genre list or update UI as needed
    } else {
      alert('Error deleting genre.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function fetchAndDisplayContent() {
  fetch('/content')
    .then(response => response.json())
    .then(data => {
      const contentContainer = document.getElementById('content');
      contentContainer.innerHTML = ''; // Clear previous content

      data.forEach(content => {
        const contentElement = document.createElement('div');
        contentElement.classList.add('content-item');

        // Populate content details
        contentElement.innerHTML = `
        
        <a href="/ViewDetails.html?id=${content.id}" style="text-decoration: none;">
          <h2>${content.title}</h2>
          <p>Description: ${content.description}</p>
          <p>Release Year: ${content.release_year}</p>
          <p>Rating: ${content.rating}</p>
          <p>Genre: ${content.genre}</p>
          <p>Production Studio ID: ${content.studio_name}</p>
          <!-- Add more details as needed -->

          <!-- Add edit/delete buttons or links here -->
         
          </a>
        `;

        contentContainer.appendChild(contentElement);
      });
    })
    .catch(error => {
      console.error('Error fetching content:', error);
    });
}





function goToDetailsPage(contentId) {
  window.location.href = `/ViewDetails.html?id=${contentId}`;
}


function populateDropdowns() {
  fetch('/content/genres')
    .then(response => response.json())
    .then(genres => {
      const genreSelect = document.getElementById('genre');
      genreSelect.innerHTML = ''; // Clear previous options
      
      // Create a Set to store unique genres
      const uniqueGenres = new Set();
      
      // Iterate over each genre and split multi-genre entries
      genres.forEach(genreEntry => {
        const individualGenres = genreEntry.split('|');
        individualGenres.forEach(genre => uniqueGenres.add(genre.trim())); // Add trimmed individual genres to the Set
      });
      
      // Convert Set back to array and sort alphabetically
      const sortedGenres = Array.from(uniqueGenres).sort();
      
      // Create options for each genre and append them to the select element
      sortedGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching genres:', error);
    });
}

function populateStudioDropdown() {
  fetch('/content/studios')
    .then(response => response.json())
    .then(studios => {
      const studioSelect = document.getElementById('productionStudio');
      studioSelect.innerHTML = ''; // Clear previous options
      
      studios.forEach(studio => {
        const option = document.createElement('option');
        option.value = studio.id;
        option.textContent = studio.name;
        studioSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching production studios:', error);
    });
}




async function applyFilters() {
  try {
    // Retrieve selected sorting option
    const sortBy = document.getElementById('sortBy').value;

    // Retrieve release year range
    const releaseYearRange = document.getElementById('releaseYearRange').value;
    const [minReleaseYear, maxReleaseYear] = releaseYearRange.split('-').map(year => year.trim() ? parseInt(year.trim()) : null);

    // Retrieve rating range
    const ratingRange = document.getElementById('ratingRange').value;
    const [minRating, maxRating] = ratingRange.split('-').map(rating => rating.trim() ? parseFloat(rating.trim()) : null);

    // Retrieve selected genre
    const selectedGenre = document.getElementById('genre').value;

    // Retrieve selected production studio
    const selectedStudio = document.getElementById('productionStudio').value;

    // Send a request to the server to fetch filtered content
    let url = `/filtered-content?minReleaseYear=${minReleaseYear}&maxReleaseYear=${maxReleaseYear}&minRating=${minRating}&maxRating=${maxRating}&sortBy=${sortBy}&genre=${selectedGenre}&studio=${selectedStudio}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch filtered content');
    }

    // Parse the JSON response
    const filteredContent = await response.json();

    // Display filtered content
    displayContent(filteredContent);
  } catch (error) {
    console.error('Error applying filters:', error);
  }
}




// Function to display content
function displayContent(contentArray) {
  const contentContainer = document.getElementById('content');
  contentContainer.innerHTML = ''; // Clear previous content

  contentArray.forEach(content => {

    
    const contentElement = document.createElement('div');
    contentElement.classList.add('content-item');

    // Populate content details
    contentElement.innerHTML = `
    
      <h2>${content.title}</h2>
      <p>Description: ${content.description}</p>
      <p>Release Year: ${content.release_year}</p>
      <p>Rating: ${content.rating}</p>
      <p>Genre: ${content.genre}</p>
      <p>Production Studio ID: ${content.studio_name}</p>
     
    `;

    contentContainer.appendChild(contentElement);
  });
}

document.getElementById('filter-button').addEventListener('click', applyFilters);



