export function sleep(mills: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, mills)
    })
}

export function lpad(str: string, padChar: string, length: number): string {
    return new Array(length - str.length).fill(padChar).join('') + str
}