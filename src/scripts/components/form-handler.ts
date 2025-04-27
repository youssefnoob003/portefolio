interface FormConfig {
  endpoint: string;
  successTimeout: number;
}

export function initializeForm(config: FormConfig): void {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form') as HTMLFormElement;
    const successMessage = document.getElementById('successMessage');
    
    if (form && successMessage) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm(form)) {
          // Remove the event listener temporarily to allow form submission
          const currentSubmitHandler = form.onsubmit;
          form.onsubmit = null;
          
          // Submit the form
          setTimeout(() => {
            form.submit();
            // Restore the event listener
            form.onsubmit = currentSubmitHandler;
          }, 0);
        }
      });

      // Clear errors when user starts typing
      form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          const element = input as HTMLInputElement | HTMLTextAreaElement;
          const errorElement = document.getElementById(`${element.id}-error`);
          element.classList.remove('invalid');
          if (errorElement) {
            errorElement.style.display = 'none';
          }
        });
      });
    }
  });
}

function validateForm(form: HTMLFormElement): boolean {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  
  inputs.forEach(input => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;
    const errorElement = document.getElementById(`${element.id}-error`);
    
    if (!element.value.trim()) {
      isValid = false;
      element.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} is required`;
        errorElement.style.display = 'block';
      }
    } else if (element.type === 'email' && !isValidEmail(element.value)) {
      isValid = false;
      element.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = 'Please enter a valid email address';
        errorElement.style.display = 'block';
      }
    } else {
      element.classList.remove('invalid');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  });
  
  return isValid;
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}