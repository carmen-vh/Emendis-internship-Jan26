import { test, expect } from '@playwright/test'
import { GeneralPage } from '../models/general.model'
import { DatePicker } from '../models/date-picker.model'

let startOrEndPicker

exports.NotePopover = class NotePopover {
    constructor(page) {
        this.page = page
        this.noteTextField = page.locator('input[placeholder="Text"]')
        
        this.noteStartsAtInput = page.locator('[data-test="builder-starts_at"] p-datepicker input')
        this.noteEndsAtInput = page.locator('[data-test="builder-ends_at"] p-datepicker input')
        this.noteStartsAtField = page.locator('[data-test="builder-starts_at"] p-datepicker')
        this.noteEndsAtField = page.locator('[data-test="builder-ends_at"] p-datepicker')

        this.noteTypeField = page.locator('[ng-reflect-placeholder="Planning note type"] [role="combobox"]')
        this.noteTypeFieldButton = page.locator('[ng-reflect-placeholder="Planning note type"] [aria-label="dropdown trigger"]')
        
        this.cancelButton = page.locator('p-button[ng-reflect-label="Cancel"]')                 // TODO: Implement "Cancel" button function
        this.submitButton = page.locator('p-button[ng-reflect-label="Submit"]')
        this.startDateButton = page.locator('p-datepicker[ng-reflect-name="starts_at"] button[aria-label="Choose Date"]')
        this.endDateButton = page.locator('p-datepicker[ng-reflect-name="ends_at"] button[aria-label="Choose Date"]')
    }

    async fillTextField(text) {
        await this.noteTextField.fill(text)
    }

    async fillStartAtField(startDate, createNote) {
        const generalPage = new GeneralPage(this.page)

        startOrEndPicker = "start"
        const day = startDate[0]
        const month = startDate[1]
        const year = startDate[2]

        // createNote represents whether a note is being created or edited (create == true) (edit == !(create))
        if (createNote) {  // TODO: Find way to simplify the method
            await this.noteStartsAtInput.click()
            await this.noteStartsAtInput.type(generalPage.getDMY(startDate))
            await this.startDateButton.click()
        } else { // editing note - use datepicker to change date
            await this.startDateButton.click()
            const startDatePicker = new DatePicker(this.page, startOrEndPicker)
            await startDatePicker.clickMainYearButton()
            await startDatePicker.clickDecadeYearButton(year)
            await startDatePicker.clickYearMonthButton(month)
            await startDatePicker.clickDayButton(day)
        }
    }

    async fillEndAtField(endDate, createNote) { 
        const generalPage = new GeneralPage(this.page)

        startOrEndPicker = "end"
        const day = endDate[0]
        const month = endDate[1]
        const year = endDate[2]

        // createNote represents whether a note is being created or edited (create == true) (edit == !(create))
        if (createNote) {  // TODO: Find way to simplify the method
            await this.noteEndsAtInput.click()
            await this.noteEndsAtInput.type(generalPage.getDMY(endDate))
            await this.endDateButton.click()
        } else { // editing note - use datepicker to change date
            await this.endDateButton.click()
            const endDatePicker = new DatePicker(this.page, startOrEndPicker)
            await endDatePicker.clickMainYearButton()
            await endDatePicker.clickDecadeYearButton(year)
            await endDatePicker.clickYearMonthButton(month)
            await endDatePicker.clickDayButton(day)
        }
    }

    async fillPlanningType(planningType) {
        await this.noteTypeFieldButton.click()

        // the listbox has to be visible to view the types
        const listbox = this.page.locator('[ng-reflect-placeholder="Planning note type"] [role="listbox"]')
        await expect(listbox).toBeVisible()

        const type = this.page.locator('[role="option"]')
            .filter({ hasText: planningType })
            .first()
        
        // User can't enter non-existing type - scroll until seen
        await type.scrollIntoViewIfNeeded()
        await type.click()
    }

    async clickSubmitButton() {
        await this.submitButton.click()
    }

    async getPickerDate() {
        const generalPage = new GeneralPage(this.page)

        let pickerDate
        // the locators for the date fields change depending on "Starts at" and "Ends at"
        if (startOrEndPicker == 'start') {
            pickerDate = (await this.noteStartsAtField.getAttribute('ng-reflect-model')).split(' ')
        } else if (startOrEndPicker == 'end') {
            pickerDate = (await this.noteEndsAtField.getAttribute('ng-reflect-model')).split(' ')
        }

        const day = pickerDate[2]
        const month = pickerDate[1]
        const year = pickerDate[3]

        return generalPage.getYMD([day, month, year])
    }

    async validateUpdatedFields(text, startDate, endDate, type) {
        const textField = await this.noteTextField.getAttribute('ng-reflect-model')

        // Validate text field
        await expect(textField).toBe(text)
        

        // Validate date fields
        startOrEndPicker = 'start'
        await expect(await this.getPickerDate()).toBe(startDate)

        startOrEndPicker = 'end'
        await expect(await this.getPickerDate()).toBe(endDate)

        // Validate type field
        await this.noteTypeField.waitFor({ state: 'visible' })
        await expect(this.noteTypeField).toHaveAttribute('aria-label', type)
    }

}