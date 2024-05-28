document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');

    console.log('Content ID:', contentId); // Check if content ID is extracted correctly

    if (contentId) {
        // Set the Content ID in the form
        document.getElementById('content-id').value = contentId;

        const addReviewForm = document.getElementById('add-review-form');

        // Event listener for the form submission
        addReviewForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission
            
            const formData = new FormData(addReviewForm);
            const formDataJSON = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/add-review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formDataJSON)
                });

                if (response.ok) {
                    alert('Review added successfully!');
                    addReviewForm.reset(); // Reset the form after successful submission
                } else {
                    const errorMessage = await response.json();
                    alert(`Error adding review: ${errorMessage.error}`);
                }
            } catch (error) {
                console.error('Error adding review:', error);
                alert('Error adding review. Please try again later.');
            }
        });
    } else {
        console.error('Invalid content ID');
        // You might want to handle this differently or ensure that the appropriate element exists
    }
});
