import { test, expect } from '@playwright/test'
import { GeneralPage } from '../models/general.model.js'
import { PlanningPage } from '../models/planning-page.model.js'
import { NotePopover } from '../models/note-popover.model.js'

/* Input Values ------------------------------------------------------ */

let user = 'plannerUser'

// Existing Note
let text = 'unedited'
let startDate, endDate
let type = 'Base type'

// New Note
let newText = 'edited'
let newStartDate, newEndDate // TODO: Implement extended date ranges
let newType = 'CHEEEEK'

/*-------------------------------------------------------------------- */

test('Test login as planner and redirection to Planning Overview', async ({ page }) => {
    const generalPage = new GeneralPage(page)
    await generalPage.userLogin(user)

    // Check whether planner access permissions are correct
    const planningPage = new PlanningPage(page)
    await planningPage.expectPlanningHeaderDisplayed()
    await planningPage.expectPlanningSidebarItemDisplayed()
})

test('Test adding a new note by filling all required fields', async ({ page }) => {
    const generalPage = new GeneralPage(page)
    await generalPage.userLogin(user)

    // TODO: Implement diverse date range selects
    // Currently, the test focuses on creating a note for the current system date
    const startDate = await generalPage.getCurrentDate()
    const endDate = await generalPage.getCurrentDate()

    const planningPage = new PlanningPage(page)
    await planningPage.clickNoteButton()

    // Adding new note
    const notePopover = new NotePopover(page)
    let create = true
    await notePopover.fillTextField(text)
    await notePopover.fillStartAtField(startDate, create)
    await notePopover.fillEndAtField(endDate, create)
    await notePopover.fillPlanningType(type)
    await notePopover.clickSubmitButton()

    // Viewing newly added note on Overview and Popover
    await planningPage.expectNoteUpdateOnOverview(text, generalPage.getYMD(startDate))
    await planningPage.expectNoteUpdateOnPopover(text, generalPage.getYMD(startDate), generalPage.getYMD(endDate), type)

})

test('Test editing fields of an existing note', async ({ page }) => {
    const generalPage = new GeneralPage(page)
    await generalPage.userLogin(user)

    // TODO: Implement diverse date range selects
    // Currently, the test focuses on creating a note for the current system date
    startDate = await generalPage.getCurrentDate()
    endDate = await generalPage.getCurrentDate()

    // Find existing note on the calendar
    const planningPage = new PlanningPage(page)
    await planningPage.clickExistingNote(text)
    await planningPage.noteSidebarDisplayed()

    // Edit existing note fields
    const notePopover = new NotePopover(page)
    let create = false
    await notePopover.fillTextField(newText)
    await notePopover.fillStartAtField(startDate, create)
    await notePopover.fillEndAtField(endDate, create)
    await notePopover.fillPlanningType(newType)
    await notePopover.clickSubmitButton()

    // Check if note details were edited
    await planningPage.navigateToWeekRange(startDate)
    // requires yyyy-mm-dd format to locate gridcell 
    await planningPage.expectNoteUpdateOnOverview(newText, generalPage.getYMD(startDate))
    await planningPage.expectNoteUpdateOnPopover(newText, generalPage.getYMD(startDate), generalPage.getYMD(endDate), newType) 

})

test('Test deleting a note on calendar', async ({ page }) => {
    const generalPage = new GeneralPage(page)
    await generalPage.userLogin(user)

    // Find existing note and delete
    const planningPage = new PlanningPage(page)
    await planningPage.clickNoteDeleteIcon(newText)
    await planningPage.expectDeletedNote(newText)
})
