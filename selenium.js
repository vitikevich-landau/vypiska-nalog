require('chromedriver');
const {Builder, By} = require('selenium-webdriver');
const fs = require('fs');
const {EOL} = require('os');
const _ = require('lodash');
const {INNS} = require('./inns');
const cheerio = require('cheerio');

/***
 *
 * @param action fn, todo with founded page sorce
 * @returns {Promise<void>}
 */
const startSearch = async (action = () => {}) => {
    const driver = await new Builder().forBrowser('chrome').build();
    const searchUrl = 'https://vypiska-nalog.com/reestr/search?inn=';

    const searchHeaderCssClass = 'h1.text-center';
    // const hrefs = [];
    const errors = [];

    try {
        let i = 0;
        for (const inn of _.take(INNS, 5)) {
            ++i;
            console.log(`iteration: ${i}`);
            try {
                await driver.get(`${searchUrl}${inn}`);

                const elements = await driver.findElements(By.css(searchHeaderCssClass));
                /**
                 *  Если на странице найден заголовок с текстом "Поиск по запросу"
                 *  тогда по этому ИНН список организаций
                 */
                if (elements.length) {
                    /**
                     *  Обход списка организаций, которые были найдены, по запросу текущего ИНН
                     *
                     */
                    for (const i of elements) {
                        const text = await i.getText();
                        if (text.toLowerCase().includes('поиск по запросу')) {
                            /***
                             *  Содержимое соответствует поисковому запросу
                             */
                            const row = await driver.findElements(By.css(`${searchHeaderCssClass} + div`));
                            for (const r of row) {
                                const links = await r.findElements(By.tagName('a'));

                                const hrefs = [];
                                /***
                                 *  Получаем все ссылки и вытаскиваем href
                                 */
                                for (const link of links) {
                                    const href = await link.getAttribute('href');
                                    hrefs.push(href);
                                }

                                /***
                                 *  Идём по сслыкам
                                 */
                                for (const href of hrefs) {
                                    // console.log(href);
                                    await driver.get(href);

                                    const pageSource = await driver.getPageSource();
                                    /***
                                     *  Action with data
                                     */
                                    action(pageSource);
                                }
                            }
                        } else {
                            /***
                             *  TODO if something wrong
                             *
                             */
                            console.log(`Что то в h1.text-center по ИНН ${inn}`);
                            errors.push(inn);
                        }
                    }
                }
                /***
                 *  Иначе по текущему ИНН одна организация
                 */
                else {
                    const url = await driver.getCurrentUrl();
                    // hrefs.push(url);

                    const pageSource = await driver.getPageSource();
                    /***
                     *  Action with data
                     */
                    action(pageSource);
                }

                // await driver.wait(until.titleIs('wait titles'), 2000);
            } catch (e) {
                console.log(e);
                errors.push(e);
            }
        }

        console.log(errors);
    } finally {
        await driver.quit();
    }
};

module.exports = {
    startSearch
};
