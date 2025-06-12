document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('#star-rating .star');
  const feedbackText = document.getElementById('feedback-text');
  const submitButton = document.getElementById('submit-feedback');
  const feedbackMessage = document.getElementById('feedback-message');
  let selectedRating = 0;

  // Use only the filename without path and extension as key suffix
  const pathParts = window.location.pathname.split('/');
  const filename = pathParts[pathParts.length - 1] || 'index.html';
  const pageKey = filename.split('.')[0];
  const storageKey = 'feedback_' + pageKey;

  function updateStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.textContent = '★';
        star.setAttribute('aria-checked', 'true');
      } else {
        star.textContent = '☆';
        star.setAttribute('aria-checked', 'false');
      }
    });
  }

  function loadFeedback() {
    // Check if feedback was just submitted
    const feedbackSubmitted = sessionStorage.getItem('feedback_submitted');
    if (feedbackSubmitted) {
      // Reset flag and UI but keep saved feedback for sending
      sessionStorage.removeItem('feedback_submitted');
      selectedRating = 0;
      updateStars(selectedRating);
      if (feedbackText) {
        feedbackText.value = '';
      }
      return;
    }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        selectedRating = data.rating || 0;
        updateStars(selectedRating);
        if (feedbackText) {
          feedbackText.value = data.text || '';
        }
      } catch (e) {
        console.error('Failed to parse saved feedback', e);
      }
    }
  }

  function saveFeedback() {
    const newFeedback = {
      rating: selectedRating,
      text: feedbackText ? feedbackText.value.trim() : ''
    };
    // Load existing feedback array or initialize empty array
    let feedbackArray = [];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        feedbackArray = JSON.parse(saved);
        if (!Array.isArray(feedbackArray)) {
          feedbackArray = [];
        }
      } catch (e) {
        console.error('Failed to parse saved feedback array', e);
        feedbackArray = [];
      }
    }
    // Append new feedback
    feedbackArray.push(newFeedback);
    // Save updated array back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(feedbackArray));
  }

  if (stars && stars.length > 0) {
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        updateStars(selectedRating);
      });
      star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectedRating = index + 1;
          updateStars(selectedRating);
          star.focus();
        }
        if (e.key === 'ArrowRight' && index < stars.length - 1) {
          stars[index + 1].focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
          stars[index - 1].focus();
        }
      });
    });
  }

  if (submitButton) {
    submitButton.addEventListener('click', () => {
      if (selectedRating === 0) {
        if (feedbackMessage) {
          feedbackMessage.textContent = 'Por favor, selecione uma avaliação por estrelas.';
          feedbackMessage.style.color = 'red';
        }
        return;
      }
      if (feedbackText && feedbackText.value.trim() === '') {
        if (feedbackMessage) {
          feedbackMessage.textContent = 'Por favor, escreva seu feedback.';
          feedbackMessage.style.color = 'red';
        }
        return;
      }
      saveFeedback();
      // Do not clear saved feedback to allow sending
      // localStorage.removeItem(storageKey);
      // Set flag to indicate feedback was submitted
      sessionStorage.setItem('feedback_submitted', 'true');
      if (feedbackMessage) {
        feedbackMessage.textContent = 'Obrigado pelo seu feedback!';
        feedbackMessage.style.color = '#2e7d32';
      }
      // Reset rating and feedback text for new evaluation
      selectedRating = 0;
      updateStars(selectedRating);
      if (feedbackText) {
        feedbackText.value = '';
      }
    });
  }

  loadFeedback();

  // Clear saved feedback on page unload or reload
  // window.addEventListener('beforeunload', () => {
  //   localStorage.removeItem(storageKey);
  // });
});
