// Debug script to check form state in browser console
// Copy and paste this into the browser console while the course edit form is open

console.log('=== FORM DEBUG INFO ===');

// Check if form is rendered
const form = document.querySelector('form');
console.log('Form element found:', !!form);

// Check for success message
const successMsg = document.querySelector('.bg-green-50');
console.log('Success message visible:', !!successMsg);
if (successMsg) {
  console.log('Success message text:', successMsg.textContent);
}

// Check for error message
const errorMsg = document.querySelector('.bg-red-50');
console.log('Error message visible:', !!errorMsg);
if (errorMsg) {
  console.log('Error message text:', errorMsg.textContent);
}

// Check form inputs
const titleInput = document.querySelector('input[placeholder*="title"]');
console.log('Title input found:', !!titleInput);
if (titleInput) {
  console.log('Title input value:', titleInput.value);
}

// Check submit button state
const submitBtn = document.querySelector('button[type="submit"]');
console.log('Submit button found:', !!submitBtn);
if (submitBtn) {
  console.log('Submit button text:', submitBtn.textContent);
  console.log('Submit button disabled:', submitBtn.disabled);
}

console.log('=== END DEBUG INFO ===');
