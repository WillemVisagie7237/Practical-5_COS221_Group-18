document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');

    console.log('Content ID:', contentId); // Check if content ID is extracted correctly

    if (contentId) {
        try {
            // Fetch and display content details
            const contentResponse = await fetch(`/content/${contentId}`);
            if (contentResponse.ok) {
                const content = await contentResponse.json();
                displayContentDetails(content);
            } else {
                console.error('Content not found');
                document.getElementById('content-details').innerHTML = '<p>Content not found.</p>';
            }
        } catch (error) {
            console.error('Error fetching content details:', error);
            document.getElementById('content-details').innerHTML = '<p>Error loading content details.</p>';
        }

        try {
            // Fetch and display reviews
            const reviewsResponse = await fetch(`/reviews/${contentId}`);
            if (reviewsResponse.ok) {
                const reviews = await reviewsResponse.json();
                displayReviews(reviews);
            } else {
                console.error('No reviews found');
                document.getElementById('reviews-container').innerHTML = '<p>No reviews found.</p>';
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            document.getElementById('reviews-container').innerHTML = '<p>Error loading reviews.</p>';
        }

        // Add event listener to the "Add Review" button
        document.getElementById('add-review-button').addEventListener('click', () => {
            // Construct the URL with the Content ID as a query parameter
            const addReviewPageURL = `/AddReview.html?id=${contentId}`;
            // Redirect to the Add Review page with the Content ID in the query parameter
            window.location.href = addReviewPageURL;
        });
    } else {
        console.error('Invalid content ID');
        document.getElementById('content-details').innerHTML = '<p>Invalid content ID.</p>';
    }
});

function displayContentDetails(content) {
    const contentDetails = document.getElementById('content-details');
    contentDetails.innerHTML = `
        <h1>${content.title}</h1>
        <p><strong>Description:</strong> ${content.description}</p>
        <p><strong>Release Year:</strong> ${content.release_year}</p>
        <p><strong>Rating:</strong> ${content.rating}</p>
        <p><strong>Genre:</strong> ${content.genre}</p>
        <p><strong>Production Studio:</strong> ${content.studio_name}</p>
        ${content.runtime ? `<p><strong>Runtime:</strong> ${content.runtime} minutes</p>` : ''}
        ${content.seasons ? `<p><strong>Seasons:</strong> ${content.seasons}</p>` : ''}
    `;
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = ''; // Clear existing content
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');
        reviewElement.innerHTML = `
            <p><strong>${review.username}</strong> (${new Date(review.date).toLocaleDateString()}):</p>
            <p>${review.comment}</p>
            <p>Rating: ${review.rating}/10</p>
        `;
        reviewsContainer.appendChild(reviewElement);
    });
}
