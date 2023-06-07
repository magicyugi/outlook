const dotenv = require('dotenv').config();
const puppeteer = require('puppeteer');

const userName = 'qq232306980@qq.com';
const password = 'Hrl853815320';
// newman_vic776:Zr0gYS33:isioyenernun@outlook.com:Zr0gYS33:ad11c0c7182b730105cc2d8ead8c0f83d91ec5fe
// EmersonHar54301:V1mdSu63:obaahbouzidk@outlook.com:V1mdSu63:0e7cac170a6518e99802cf338529942b7578c944
const accounts = [
    {name:'newman_vic776',password:'Zr0gYS33', proxy: ''},
    {name:'EmersonHar54301',password:'V1mdSu63', proxy: ''},
  ]


(async () => {
  try {
    for (const account of accounts) {
      const browser = await puppeteer.launch({ headless: false,
        // args: [
        //   '--proxy-server=192.168.1.25:30000',
        // ] ,
        userDataDir: '/path/to/user/data/dir',
      });
      const page = await browser.newPage();

    

      // await page.goto("https://www.whoer.net/", {
      //   waitUntil: "networkidle0",
      // });

      // return ;
    

      // add condition to check if user name has been requested
      // review repos
      //create a new branch for the new changes

      await page.goto("https://twitter.com/home", {
        waitUntil: "networkidle0",
      });

      await page.type('input[autocomplete="username"]', userName, { delay: 100 });

      page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-ywje51 r-usiww2 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr r-13qz1uu"]');

      
      await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 50000 });

      await page.type('input[autocomplete="current-password"]', password, { delay: 100 });
      
      await Promise.all([
        page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-19yznuf r-64el8z r-1ny4l3l r-1dye5f7 r-o7ynqc r-6416eg r-lrvibr"]'),
        page.waitForNavigation(),
      ]);
      await page.waitForSelector('div[data-testid="SideNav_AccountSwitcher_Button"]', { timeout: 30000 });
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('div[data-testid="SideNav_AccountSwitcher_Button"]') !== null;
      });
      if (isLoggedIn) {
        console.log('Login successful!');
      } else {
        console.log('Login failed!');
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    // await browser.close();
  }
})();
