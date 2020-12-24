const chrome = require('chromedriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const {ids} = require('./ids');

(async function example() {
    const driver = await new Builder().forBrowser('chrome').build();
    const url = 'https://vypiska-nalog.com/reestr/';

    const dataTableCssClass = 'table reee_table';
    const findCodesLinesRegex = /^[0-9]/;
    const findOnlyCodesInLine = /[0-9]+\.[0-9]+/;

    try {
        for (const id of ids) {
            try {
                await driver.get(`${url}${id}`);
                const rows = await driver.findElements(By.className(dataTableCssClass));

                for (let r of rows) {
                    console.log('-----------------------------------------');
                    const text = await r.getText();
                    const lines = text.split('\n');
                    const linesWithCodes = lines.filter(v => findCodesLinesRegex.test(v));

                    const codesOnly = linesWithCodes.map(v => v.match(findOnlyCodesInLine));

                    console.log(`${id}: ${codesOnly}`);
                }

                // await driver.wait(until.titleIs(''), 2000);
            } catch (e) {
                console.log(e);
            }
        }
    } finally {
        await driver.quit();
    }
})();
