document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('feedbackForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('userEmail');
    const feedback = document.getElementById('feedback');
    const alertContainer = document.getElementById('alert-container');
    const charCount = document.getElementById('charCount'); // counter element

    // Function to show Bootstrap alert
    function showAlert(message, type = 'danger') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        alertContainer.innerHTML = '';

        let valid = true;

        // Name validation
        if (firstName.value.trim() === '' || lastName.value.trim() === '') {
            valid = false;
            showAlert('Please enter your first and last name.');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            valid = false;
            showAlert('Please enter a valid email address.');
        }

        // Feedback validation
        if (feedback.value.trim() === '' || feedback.value.length > 250) {
            valid = false;
            showAlert('Feedback must be between 1 and 250 characters.');
        }

        if (valid) {
            showAlert(`Thank you, ${firstName.value} ${lastName.value}! Your feedback has been submitted.`, 'success');
            form.reset();
            charCount.textContent = '(0/250)'; // reset counter
            charCount.classList.remove('text-danger');
            charCount.classList.add('text-muted');
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    });

    // Live character counter with color change
    feedback.addEventListener('input', function () {
        if (feedback.value.length > 250) {
            feedback.value = feedback.value.slice(0, 250);
        }
        charCount.textContent = `(${feedback.value.length}/250)`;

        if (feedback.value.length === 250) {
            charCount.classList.remove('text-muted');
            charCount.classList.add('text-danger'); // red
        } else {
            charCount.classList.remove('text-danger');
            charCount.classList.add('text-muted'); // gray
        }
    });
});
