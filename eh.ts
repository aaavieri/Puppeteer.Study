import { Browser } from 'puppeteer';
import { Downloader } from './download'

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
    const pages = await this.browser.pages()
    const pageImg = pages[pages.length - 1]
    console.log(123)
    const downloader = new Downloader(this.browser)
    while (true) {
      const picUrl = await pageImg.$eval('div#i3>a>img', el => el.src)
      downloader.downloadFiles([picUrl], this.saveDir, false)
      const [nowIndex = '999', totalIndex = '999'] = await pageImg.$$eval('div#i4>div.sn>div>span', el => el.map(item => item.innerText))
      if (nowIndex == totalIndex) {
        await downloader.complete()
        break
      } else {
        await pageImg.$eval('div#i3>a', el => el.click())
      }
    }
  }
}