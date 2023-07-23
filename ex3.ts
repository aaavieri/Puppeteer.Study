import puppeteer from 'puppeteer';
import { Downloader } from './download'

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.zhibo8.com/');
    // await page.screenshot({ path: 'zhibo8.png' });
  
    let pics = await page.$$eval('div.zuqiu-video>div._content>a>div.thumb-box>img', el => el.map(item => item.src))
    console.log(pics)
    const downloader = new Downloader(browser)
    await downloader.downloadFiles(pics, './zuqiu')
    pics = await page.$$eval('div.lanqiu-video>div._content>a>div.thumb-box>img', el => el.map(item => item.src))
    await downloader.downloadFiles(pics, './lanqiu')
    await downloader.complete()

    // pics.forEach(async (pic, index) => await downloadFile(pic, index, browser))
  
    await browser.close();
  })();