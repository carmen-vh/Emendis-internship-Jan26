import { expect } from '@playwright/test'

exports.LoginPage = class LoginPage {
    constructor(page) {
        this.page = page
        this.loginURL = page.goto('/auth/login')
        // Interactive Elements
        this.usernameField = page.locator('[data-test="email"] input')
        this.passwordField = page.locator('[ng-reflect-type="password"] input')
        this.submitButton = page.getByRole('button', { name: 'Inloggen' })
        this.reminderToggle = page.locator('[data-test="login-button"]')
        this.forgotPasswordLink = page.locator(['[data-test="forgot-password-link"]'])
        // Validation Messages:
        this.emailMessage = page.locator('[ng-reflect-custom-name="E-mailadres"]')
        this.passwordMessage = page.locator('//div[2]/cap-password/div/cap-validator/div/span/span') // using XPATH
        this.invalidLoginDetailsMessage = page.locator('[data-test="login-alert"]')
        
        // Correct URLs for respective users
        
    }

    async navigateLoginPage() {
        await this.loginURL
    }

    async fillUsername(username) {
        await this.usernameField.fill(username)
    }

    async fillPassword(password) {
        await this.passwordField.fill(password)
    }

    async clickSubmitButton() {
        await this.submitButton.click()
    }

    async emptyMessageDisplayed(locator, validationMessage) {
        await expect(this[locator]).toHaveText(validationMessage)
    }

    async enableReminderToggle() {
        await this.reminderToggle.click()
    }

    async clickForgotPasswordLink() {
        await this.forgotPasswordLink.click()
    }

    async expectCorrectUserUrl(user) {
        await expect(this.page).toHaveURL(this[user])
    }
}