import { Browser, Page } from 'puppeteer';
import fs from 'fs';

export class Downloader {

    private browser: Browser

    private pageFile: Page | undefined

    public constructor(browser: Browser) {
        this.browser = browser
    }

    public async downloadFiles(urls: Array<string>, saveDir: string = './', needIndex: boolean = true): Promise<Array<string>> {
        const saveFilePaths: Array<string> = []
        if (this.pageFile == undefined) {
            this.pageFile = await this.browser.newPage()
        }
        const instance = this
        fs.mkdirSync(saveDir, {recursive: true})
        let index = 0
        await this.pageFile.exposeFunction('savefile', async (url: string, data: Uint8Array, byteLength: number) => {
            const buf = instance.toBuffer(data, byteLength);
            let filePath = `${saveDir}/${index}-${instance.getFileName(url)}`
            if (!needIndex) {
                filePath = `${saveDir}/${instance.getFileName(url)}`
            }
            await fs.writeFileSync(filePath, buf);
        });

        for (let i = 0; i < urls.length; i++) {
            index = i
            const url = urls[i]
            await this.pageFile.goto(url)
            await this.pageFile.evaluate(async (): Promise<void> => {
                const promise = new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest()
                    xhr.open('GET', window.location.href, true);
                    xhr.responseType = "blob";
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.send(null);
                    xhr.onload = async function () {
                        if (this.status === 200) {
                            const blob = this.response;
                            const reader = new FileReader();
                            reader.readAsArrayBuffer(blob);
                            reader.onload = async function (e) {
                                const fdata = new Uint8Array(reader.result as ArrayBuffer);
                                //page.exposeFunction定义的函数
                                await (window as any).savefile(window.location.href, fdata, fdata.length);
                                resolve()
                            }
                        } else {
                            reject(new Error("下载失败"))
                        }
                    };
                })
                return promise
            });
            saveFilePaths.push(`${saveDir}/${instance.getFileName(url)}`)
            await this.sleep(1000)
        }
        return saveFilePaths
    }

    public async complete() {
        if (this.pageFile) {
            await this.pageFile.close()
        }
    }

    private async sleep(mills: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, mills)
        })
    }

    private toBuffer(ab: Uint8Array, byteLength: number): Uint8Array {
        const buf = new Uint8Array(byteLength);
        for (let i = 0; i < buf.length; ++i) {
          buf[i] = ab[i];
        }
        console.log(buf)
        console.log(typeof(buf))
        return buf;
      }
      
      private getFileName(url: string): string {
        const urls = url.split('/')
        const fileNameWithParam = urls[urls.length - 1]
        const fileName = fileNameWithParam.split('?')[0]
        return fileName
      }
}