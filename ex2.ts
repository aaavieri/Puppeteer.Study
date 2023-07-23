import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';

const toBuffer = (ab: Uint8Array, byteLength: number) => {
  const buf = new Uint8Array(byteLength);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = ab[i];
  }
  console.log(buf)
  console.log(typeof(buf))
  return buf;
}

const getFileName = (url: string) => {
  const urls = url.split('/')
  const fileNameWithParam = urls[urls.length - 1]
  const fileName = fileNameWithParam.split('?')[0]
  return fileName
}

const downloadFile = async (url: string, index: number, browser: Browser) => {
  const pageFile = await browser.newPage();
  pageFile.goto(url)

  await pageFile.exposeFunction('savefile', async (data: Uint8Array, byteLength: number) => {
    const buf = toBuffer(data, byteLength);
    await fs.writeFileSync(`./${index}-${getFileName(url)}`, buf);
    await pageFile.close()
  });

  await pageFile.evaluate(async () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', window.location.href, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(null);
    xhr.onload = async function () {
      console.log('on load')
      if (this.status === 200) {
        const blob = this.response;
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onload = async function (e) {
          const fdata = new Uint8Array(reader.result as ArrayBuffer);
          //page.exposeFunction定义的函数
          await (window as any).savefile(fdata, fdata.length);
        }
      } else {
        console.error("下载失败")
      }
    };

  });
  // await pageImg.close()
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.zhibo8.com/');
  // await page.screenshot({ path: 'zhibo8.png' });

  const pics = await page.$$eval('div.zuqiu-video>div._content>a>div.thumb-box>img', el => el.map(item => item.src))
  console.log(pics)
  pics.forEach(async (pic, index) => await downloadFile(pic, index, browser))

  // await browser.close();
})();