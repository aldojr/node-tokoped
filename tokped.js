const { resolve } = require('path');
const fs = require('fs-extra')
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

let page;


function checkSession() {
    return new Promise(async (resolve, reject) => {
      try {
        const cookies = JSON.parse(await fs.readFile('./cookies.json'))
        if (cookies.length !== 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch (err) {
        resolve(false)
      }
    })
  }

async function mencariLink(){
    const linknya = 'a[href^="https://tokopedia"]';
    let linkElement = await page.$(linknya);
    
    while (!linkElement){
      console.log ('Link Not Found, Lets Refresh to Find Tokped Link !')
      await page.reload();
      linkElement = await page.$(linknya);
    }
  
    return linkElement;
}

async function askQuestion(readline, question) {
    return new Promise((resolve) => {
      readline.question(question, (response) => {
        resolve(response.trim());
      });
    });
}

  async function main(){

    const webTarget = await askQuestion(readline, "Input URL Ticket WAR : ");
    readline.close();
    const browser = await puppeteer.launch({ 
      headless: false,
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      //userDataDir: '/Users/aldo/Library/Application Support/Google/Chrome/Profile 21',
      args: ["--app-shell-host-window-size=1600x1239",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      ]
    });
    page = await browser.newPage();
    const resCheckSession = await checkSession()
    
    if (resCheckSession){
        console.log('Successfully Login To Account Tokped');
        await page.setCookie(...JSON.parse(await fs.readFile('./cookies.json')))
    }

    /*await page.goto ('https://www.tokopedia.com',{ waitUntil: 'networkidle2' });
    const profileTokped = await page.$('#my-profile-header');
    if (profileTokped){
        console.log('Account Tokped Ready To Use !');
    }
    else {
        console.log('Account Tokped Not Ready, Please Login Manually')
    }*/

    await page.goto(webTarget);
    const linkElement = await mencariLink();

    if (linkElement) {
        console.log('Link Tokped Found !');
        await linkElement.click();
        await page.waitForNavigation();
    }
    await page.waitForSelector('#content');
    await page.click('[data-testid="viewTicket"]');
}

main();
