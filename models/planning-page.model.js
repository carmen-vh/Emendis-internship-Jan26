import { test, expect } from '@playwright/test'
import { GeneralPage } from '../models/general.model'
import { NotePopover } from '../models/note-popover.model'
import * as dotenv from 'dotenv';

dotenv.config();

exports.PlanningPage = class PlanningPage {
    constructor(page) {
        this.page = page
        this.loadingIcon = page.locator('cap-info-table-skeleton, div.loading, p-progressspinner').nth(0) // wait for "inbox' to render"
        this.planningHeader = page.locator('[class="main-header"]')
        this.planningSidebarItem= page.locator('[data-test="planning"]')
        this.noteOnCalendar = page.locator('[class="note-section__text"]')
        this.noteCloseIcon = page.locator('.note-actions [class="fa fa-close"]')
        this.noteSidebar = page.locator('[data-pc-name="sidebar"]')
        this.noteButton = page.locator('[ng-reflect-label="Note"] button')
        this.existingNoteOnCalendar = page.locator('tbody [class="note-section__text"]')
        this.dateRangeNextWeekButton = page.locator('[class="navigation-button-container"] [class="navigation-button__next"]')
        this.dateRangePreviousWeekButton = page.locator('[class="navigation-button-container"] [class="navigation-button__back"]')
        this.currentDateRange = page.locator('cap-navigation-button [class="navigation-button__title"]')
        this.todayDateButton = page.locator('[ng-reflect-label="Today"] button')
    }

    async expectPlanningHeaderDisplayed() {
        await expect(this.planningHeader).toHaveText("Planning")
        console.log('The Planning Overview page loads correctly and is displayed to the user.')
    }

    async expectPlanningSidebarItemDisplayed() {
        await expect(this.planningSidebarItem).toBeEnabled()
        console.log('The Planning menu item is visible in the navigation.')
    }

    async clickNoteButton() {
        await this.loadingIcon.waitFor({ state: 'hidden' })

        await this.noteButton.click()
        this.noteSidebarDisplayed()        
    }

    async noteSidebarDisplayed() {
        await expect(this.noteSidebar).toBeVisible()
    }

    async clickExistingNote(noteName) {
        const note = this.existingNoteOnCalendar.getByText(noteName)
        await note.waitFor({ state: 'visible' })
        await note.click()
    }

    // TODO: This function hasn't been used to test extended date ranges
    async navigateToWeekRange(date) {
        const generalPage = new GeneralPage(this.page)
        
        while (true) {
            await this.page.waitForLoadState('networkidle')
            
            const rangeStr = await this.currentDateRange.textContent()
            const result = generalPage.isDateInRange(date, rangeStr)
            
            if (result[1]) {  // dateWithin
                break
            } else if (result[0]) {  // dateBefore
                await this.clickPreviousWeekButton()
            } else if (result[2]) {  // dateAfter
                await this.clickNextWeekButton()
            }
        }
    }

    async clickPreviousWeekButton() {
        await this.dateRangePreviousWeekButton.click()
    }

    async clickNextWeekButton() {
        await this.dateRangeNextWeekButton.click()
    }

    async expectNoteUpdateOnOverview(noteText, date) {
        const dayCell = this.page.locator(`[role="gridcell"][data-date="${date}"]`)
        const events = dayCell.locator('.fc-event')
        const noteCount = await events.count()
        let noteIndex

        // view all notes on the day
        const matchingNote = events.filter({ hasText: noteText }).first()
        await expect(matchingNote).toHaveText(noteText)
        
       // await expect(events.nth(noteIndex)).toHaveText(noteText)
        
        /* TODO:
         * expect correct starting date
         * expect correct ending date
         */

        // return noteIndex // TODO: return first occurrence of note name [in case of duplicates]
    }

    async expectNoteUpdateOnPopover(text, startDate, endDate, type) {
        this.clickExistingNote(text)
        const notePopover = new NotePopover(this.page)
        await notePopover.validateUpdatedFields(text, startDate, endDate, type)
    }

    async clickNoteDeleteIcon(noteText) {
        const note = this.existingNoteOnCalendar.getByText(noteText)
        await note.hover()
        await this.noteCloseIcon.waitFor({ state: 'visible'})
        await this.noteCloseIcon.click()
    }

    async expectDeletedNote(noteText) {
        const note = this.existingNoteOnCalendar.getByText(noteText)
        await expect(note).not.toBeVisible()
    }
}