import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user registration and login flow', async ({ page }) => {
    // Navigate to registration page
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.selectOption('[data-testid="role-select"]', 'owner');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
    await expect(page.locator('[data-testid="user-role"]')).toContainText('owner');
  });

  test('user login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-link"]');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    
    // Submit login
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-email"]')).toContainText('existing@example.com');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-link"]');

    // Fill login form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    
    // Submit login
    await page.click('[data-testid="login-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('biometric authentication flow', async ({ page }) => {
    // Mock biometric availability
    await page.addInitScript(() => {
      window.navigator.credentials = {
        create: async () => ({ id: 'mock-credential-id' }),
        get: async () => ({ id: 'mock-credential-id' })
      };
    });

    // Navigate to login page
    await page.click('[data-testid="login-link"]');

    // Click biometric login button
    await page.click('[data-testid="biometric-login-button"]');

    // Verify biometric prompt
    await expect(page.locator('[data-testid="biometric-prompt"])).toBeVisible();

    // Simulate successful biometric authentication
    await page.click('[data-testid="biometric-success"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('password reset flow', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-link"]');

    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]');
    await expect(page).toHaveURL(/.*reset-password/);

    // Fill email for password reset
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="reset-password-button"]');

    // Verify reset email sent message
    await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible();
  });

  test('logout functionality', async ({ page }) => {
    // First login
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');

    // Verify logged in
    await expect(page).toHaveURL(/.*dashboard/);

    // Click logout
    await page.click('[data-testid="logout-button"]');

    // Verify logged out and redirected to home
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('session persistence after page refresh', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');

    // Verify logged in
    await expect(page).toHaveURL(/.*dashboard/);

    // Refresh page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
  });

  test('quantum security indicators', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-link"]');

    // Verify quantum security indicators are visible
    await expect(page.locator('[data-testid="quantum-encryption-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="military-grade-security"]')).toBeVisible();

    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');

    // Verify quantum security is active after login
    await expect(page.locator('[data-testid="quantum-token-active"]')).toBeVisible();
    await expect(page.locator('[data-testid="quantum-encryption-active"]')).toBeVisible();
  });

  test('form validation', async ({ page }) => {
    // Navigate to registration page
    await page.click('[data-testid="register-link"]');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Fill invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');

    // Verify email validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');

    // Fill weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');

    // Verify password validation error
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password too weak');
  });

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to login page
    await page.click('[data-testid="login-link"]');

    // Verify mobile-friendly layout
    await expect(page.locator('[data-testid="mobile-login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-login-button"]')).toBeVisible();

    // Fill and submit form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="mobile-login-button"]');

    // Verify successful login on mobile
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
  });
});
