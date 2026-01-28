import { test, expect } from '@playwright/test'
import { GeneralPage } from '../models/general.model.js'
import { LoginPage } from '../models/login-page.model'
import * as dotenv from 'dotenv';
dotenv.config();

let username = process.env.USERNAME 
let password = process.env.PASSWORD 
let user = 'plannerUser'

test('test that user logs in successfully and arrives at the correct URL ', async ({ page }) => {
    const generalPage = new GeneralPage(page)
    await generalPage.userLogin(user)
})

test('test that user cannot login with empty email address', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigateLoginPage()
    await loginPage.fillUsername('')
    await loginPage.fillPassword(password)
    await loginPage.clickSubmitButton()
    await loginPage.emptyMessageDisplayed("emailMessage", "Dit veld is verplicht")
})

test('password', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigateLoginPage()
    await loginPage.fillUsername(username)
    await loginPage.fillPassword('')
    await loginPage.clickSubmitButton()
    await loginPage.emptyMessageDisplayed("passwordMessage", "Dit veld is verplicht")
})

