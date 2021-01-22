require('chromedriver');
const {Builder, By} = require('selenium-webdriver');
const _ = require('lodash');
const {DbInstance} = require('./db');

/***
 *
 * @param action fn, todo with founded page source
 * @returns {Promise<void>}
 */
const launchDriver = async action => {
    const driver = await new Builder().forBrowser('chrome').build();
    const searchUrl = 'https://vypiska-nalog.com/reestr/search?inn=';

    const searchHeaderCssClass = 'h1.text-center';
    // const hrefs = [];
    const errors = [];

    const querySet = await DbInstance.selectINNs();
    const inns = querySet.rows.map(v => v[0]);

    try {
        let iteration = 0;
        for (const inn of inns/*_.take(inns, 75)*/) {
            ++iteration;
            console.log(`iteration: ${iteration}, ИНН: ${inn}`);
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
                                    action({iteration, url: href, pageSource});
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
                    action({iteration, url, pageSource});
                }

                // await driver.wait(until.titleIs('wait titles'), 2000);
            } catch (e) {
                // console.log(e);
                errors.push(e);
            }
        }

        if (errors.length) {
            errors.unshift(`************************${new Date()}***********************`);
            File.save('selenium_errors.txt', errors.join('\n'));
        }

        console.log('Errors: ', errors);
    } finally {
        await driver.quit();
    }
};

module.exports = {
    launchDriver
};
