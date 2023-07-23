import puppeteer from 'puppeteer';
import { EhDownloader } from './eh'

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const ehDownloader = new EhDownloader('https://e-hentai.org/g/2177583/6c4f935f80/', browser, './target')
    await ehDownloader.download()
    await browser.close();
  })();