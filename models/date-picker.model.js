import { test, expect } from '@playwright/test'

exports.DatePicker = class DatePicker {
    constructor(page, startOrEnd) {
        this.page = page

        // Find appropriate locator for starts-at and ends-at date pickers
        if (startOrEnd == "start") {
            this.noteDatePicker = page.locator('[data-test="builder-starts_at"] [role="dialog"]')
        } else if (startOrEnd == "end") {
            this.noteDatePicker = page.locator('[data-test="builder-ends_at"] [role="dialog"]')
        }

        // Decade
        this.nextDecadeButton = page.locator('[aria-label="Next Decade"]')
        this.previousDecadeButton = page.locator('[aria-label="Previous Decade"]')
        // Year
        this.mainYearButton = page.locator('[aria-label="Choose Year"]')
        this.nextYearButton = page.locator('[aria-label="Next Year"]')
        this.previousYearButton = page.locator('[aria-label="Previous Year"]')
        // Month
        this.mainMonthButton = page.locator('[aria-label="Choose Month"]')
        this.nextMonthButton = page.locator('[aria-label="Next Month"]')
        this.previousMonthButton = page.locator('[aria-label="Previous Month"]')
        
    }

    async clickMainYearButton() {
        await this.mainYearButton.click()
    }

    async clickDecadeYearButton(year) { // Decade -> Year
        const roundedDownYear = Math.floor(parseInt(year) / 10) * 10;
    
        // search for the specified year through the decades
        while (true) {
            const yearButton = this.noteDatePicker.getByText(year, { exact: true }).locator('..')
            
            if (await yearButton.isVisible()) {
                await yearButton.click()
                break
            }
            
            if (parseInt(year) > roundedDownYear) {
                await this.nextDecadeButton.click()
            } else if (parseInt(year) < roundedDownYear) {
                await this.previousDecadeButton.click()
            } else {
                throw new Error(`Year ${year} not found in datepicker`)
                break
            }
        }
    }

    async clickYearMonthButton(month) { // Year -> Month
        // search for the specified month
        const monthButton = this.noteDatePicker.getByText(month, { exact: true }).locator('..')

        await monthButton.click()
    }

    async clickPrevYearButton() {
        await this.previousYearButton().click()
    }

    async clickNextYearButton() {
        await this.nextYearButton().click()
    }

    async clickPrevMonthButton() {
        await this.previousMonthButton().click()
    }

    async clickNextMonthButton() {
        await this.nextMonthButton().click()
    }

    async clickDayButton(day) { // Day
        const dayButton = this.noteDatePicker.getByText(day, { exact: true }).locator('..')
        await dayButton.click()
    }
}