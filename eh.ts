import { Browser } from 'puppeteer';
import { Downloader } from './download'
import { lpad } from './util';
import fs from 'fs/promises'

export class EhDownloader {

  private url: string

  private saveDir: string

  private browser: Browser

  public constructor(url: string, browser: Browser, saveDir: string = './target') {
    this.url = url
    this.saveDir = saveDir
    this.browser = browser
  }

  public async download() {
    const page = await this.browser.newPage();
    await page.goto(this.url);
    
    // const firstPicUrl = await page.$eval('div#gdt>div.gdtm:first-child>div>a', el => el.href)
    // const pageImg = await this.browser.newPage()
    // pageImg.goto(firstPicUrl)
    await page.click('div#gdt>div.gdtm:first-child>div>a')
    await page.waitForSelector('div#i3>a>img')
    await this.downloadFromPage(page.url())
    // while (true) {
    //   const picUrl = await page.$eval('div#i3>a>img', el => el.src)
    //   const downloader = new Downloader(this.browser)
    //   await downloader.downloadFiles([picUrl], this.saveDir, false)
    //   const [nowIndex = '999', totalIndex = '999'] = await page.$$eval('div#i4>div.sn>div>span', el => el.map(item => item.innerText))
    //   await downloader.complete()
    //   if (nowIndex == totalIndex) {
    //     break
    //   } else {
    //     await page.$eval('div#i4>div.sn>a#next', el => el.click())
    //     await sleep(3000)
    //     await page.waitForSelector('div#i3>a>img')
    //     console.log(page.url())
    //   }
    // }
  }

  public async downloadFromPage(url: string) {
    const page = await this.browser.newPage();
    await page.goto(url);
    
    // const firstPicUrl = await page.$eval('div#gdt>div.gdtm:first-child>div>a', el => el.href)
    // const pageImg = await this.browser.newPage()
    // pageImg.goto(firstPicUrl)
    await page.waitForSelector('div#i3>a>img')
    let index = 0
    while (true) {
      const picUrl = await page.$eval('div#i3>a>img', el => el.src)
      const downloader = new Downloader(this.browser)
      const [{fileName, filePath}] = await downloader.downloadFiles([picUrl], this.saveDir, false)
      await fs.rename(filePath, `${this.saveDir}/${lpad((index++).toString(), '0', 3)}-${fileName}`)
      const [nowIndex = '999', totalIndex = '999'] = await page.$$eval('div#i4>div.sn>div>span', el => el.map(item => item.innerText))
      await downloader.complete()
      if (nowIndex == totalIndex) {
        break
      } else {
        // await page.$eval('div#i4>div.sn>a#next', el => el.click())
        await Promise.all([
          // page.waitForNavigation(),
          page.click('div#i4>div.sn>a#next')
        ]);
        await page.waitForResponse(response => {
          const result = response.url().endsWith('.jpg') && response.status() === 200
          if (response.url().endsWith('.jpg')) {
            console.log(response.url())
          }
          if (result) {
            console.log(true)
          }
          return result
        })
        // await sleep(5000)
        await page.waitForSelector('div#i3>a>img')
        console.log(page.url())
      }
    }
  }
}