import { test, expect } from '@playwright/test'
import { LoginPage } from '../models/login-page.model'
import * as dotenv from 'dotenv';
dotenv.config();

let username = process.env.USERNAME 
let password = process.env.PASSWORD

const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', Jun: '06', Jul: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

exports.GeneralPage = class GeneralPage {
    constructor(page) {
        this.page = page
    }

    /* Helper Functions for User Login: ------------------------------------------------------------ */
    async userLogin(user) {
        const loginPage = new LoginPage(this.page)
        await loginPage.navigateLoginPage()
        await loginPage.fillUsername(username)
        await loginPage.fillPassword(password)
        await loginPage.clickSubmitButton()
        await this.page.waitForURL('**/planning')
        await loginPage.expectCorrectUserUrl(user)
    }

    /* Helper Functions for Getting Date: ---------------------------------------------------------- */
    getCurrentDate() {
        let dateArray = Array(3)
        const date = new Date()
        dateArray[0] = String(date.getDate());
        dateArray[1] = date.toLocaleString('en-US', { month: 'short' }) 
        dateArray[2] = String(date.getFullYear())
        return dateArray
    }

    // convert to yyyy-mm-dd
    getYMD([dayStr, monthStr, yearStr]) {
        const day = dayStr.padStart(2, '0')
        const month = months[monthStr]

        return `${yearStr}-${month}-${day}`
    }

    // convert to dd-mm-yyyy
    getDMY([dayStr, monthStr, yearStr]) {
        const day = dayStr.padStart(2, '0')
        const month = months[monthStr]

        return `${day}-${month}-${yearStr}`
    }

    isDateInRange(dateArr, rangeStr) {
        const [day, month, year] = dateArr
        const targetDate = new Date(`${day} ${month} ${year}`)
        
        const match = rangeStr.match(/(\d+)\s*[–-]\s*(\d+)\s+(\w+)\s+(\d+)/)
        const [, startDay, endDay, rangeMonth, rangeYear] = match
        
        const startDate = new Date(`${startDay} ${rangeMonth} ${rangeYear}`)
        const endDate = new Date(`${endDay} ${rangeMonth} ${rangeYear}`)
        const dateResult = Array(3)
        dateResult[0] = targetDate < startDate 
        dateResult[1] = targetDate >= startDate && targetDate <= endDate
        dateResult[2] = targetDate > endDate
        
        return dateResult
    }
}