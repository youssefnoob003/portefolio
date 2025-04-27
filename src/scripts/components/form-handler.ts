interface FormConfig {
  endpoint: string;
  successTimeout: number;
}

export function initializeForm(config: FormConfig): void {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form') as HTMLFormElement;
    const successMessage = document.getElementById('successMessage');
    
    if (form && successMessage) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm(form)) {
          await submitForm(form, successMessage, config);
        }
      });
    }
  });
}

function validateForm(form: HTMLFormElement): boolean {
  let isValid = true;
  const inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;
    const errorElement = document.getElementById(`${element.id}-error`);
    
    if (!element.value.trim()) {
      isValid = false;
      element.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = `${element.name} is required`;
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

async function submitForm(form: HTMLFormElement, successMessage: HTMLElement, config: FormConfig): Promise<void> {
  const formData = new FormData(form);
  const body = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    _subject: 'New Portfolio Contact',
    _captcha: 'false'
  };

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      form.reset();
      successMessage.style.display = 'block';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, config.successTimeout);
    } else {
      throw new Error(`Form submission failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}