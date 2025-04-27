/**
 * Environment configuration variables - allows for easy environment switching
 */

// Base environment settings
const environments = {
  development: {
    apiUrl: 'http://localhost:4321/api',
    debugMode: true,
    baseUrl: 'http://localhost:4321'
  },
  production: {
    apiUrl: 'https://your-portfolio-site.com/api',
    debugMode: false,
    baseUrl: 'https://your-portfolio-site.com'
  },
  test: {
    apiUrl: 'http://localhost:4321/api',
    debugMode: true,
    baseUrl: 'http://localhost:4321'
  }
};

// Determine current environment
const ENV = import.meta.env.MODE || 'development';

// Export the appropriate environment config
export const config = environments[ENV as keyof typeof environments];

// Helper functions
export function isProduction(): boolean {
  return ENV === 'production';
}

export function isDevelopment(): boolean {
  return ENV === 'development';
}

export function isTest(): boolean {
  return ENV === 'test';
} 