const chrome = require('chromedriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require('fs');
const {EOL} = require('os');
const {INNS} = require('./inns');
const {collectInformation, getCompanyTitle, getCodes, getCode} = require('./selenium_parser');

// console.log(INNS.length);

// return;



(async function main() {
    const driver = await new Builder().forBrowser('chrome').build();
    const searchUrl = 'https://vypiska-nalog.com/reestr/search?inn=';

    const searchHeaderCssClass = 'h1.text-center';
    const toFile = [];
    const hrefs = [];
    const errors = [];

    try {
        // let line = 0;
        for (const inn of INNS) {
            // ++line;
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
                    // console.log(elements.length);
                    for (const i of elements) {
                        const text = await i.getText();
                        if (text.toLowerCase().includes('поиск по запросу')) {
                            /***
                             *  Содержимое соответствует поисковому запросу
                             */
                            const row = await driver.findElements(By.css(`${searchHeaderCssClass} + div`));
                            // console.log(await row.tagName());
                            for (const r of row) {
                                console.log('-----------------------------------------');
                                // console.log(await r.getText());
                                const links = await r.findElements(By.tagName('a'));
                                // console.log('-----------------------------------------');
                                // console.log(links.length);

                                /***
                                 *  Получаем все ссылки и вытаскиваем href
                                 */

                                for (const link of links) {
                                    // console.log('-----------------------------------------');
                                    const href = await link.getAttribute('href');
                                    console.log(href);
                                    hrefs.push(href);
                                }

                                /***
                                 *  Идём по сслыкам
                                 */
                                // for (const href of hrefs) {
                                //     // console.log(href);
                                //     await driver.get(href);
                                //
                                //     /***
                                //      *  Поиск элемента на странице и
                                //      *  получение данных из таблицы в разметке
                                //      *
                                //      */
                                //     const info = await collectInformation(driver);
                                //     const title = getCompanyTitle(info);
                                //     const codes = getCodes(info);
                                //     const kpp = getCode(info, 'КПП');
                                //
                                //     const str = `${title}; ${inn}; ${kpp}; ${codes}; ${href}`;
                                //
                                //     console.log(str);
                                //
                                //     toFile.push(str);
                                // }
                            }
                        } else {
                            console.log(`Что то в h1.text-center по ИНН ${inn}`);
                            errors.push(inn);
                        }
                    }
                }
                /***
                 *  Иначе по текущему ИНН одна организация
                 */
                else {
                    const url =  await driver.getCurrentUrl();
                    hrefs.push(url);
                    /***
                     *  Вытаскиваем инфу из таблицы
                     */
                    // const info = await collectInformation(driver);
                    // const title = getCompanyTitle(info);
                    // const codes = getCodes(info);
                    // const kpp = getCode(info, 'КПП');
                    //
                    // const str = `${title}; ${inn}; ${kpp}; ${codes}; ${searchUrl}${inn}`;
                    //
                    // console.log(str);
                    //
                    // toFile.push(str);
                }

                // await driver.wait(until.titleIs('wait titles'), 2000);
            } catch (e) {
                console.log(e);
                errors.push(e);
                // fewOrganizations.push(id);
                // console.log(`***********${e.message}***********`);
            }
        }

        // toFile.unshift(`Наименование; ИНН; КПП; Коды ОКВЭД; URL`);

        fs.writeFile(
            // 'info.csv',
            'links.txt',
            // toFile.join(EOL),
            hrefs.join(EOL),
            {encoding: 'utf-8'},
            e => {
                if (e) {
                    throw e; // если возникла ошибка
                }

                console.log("Асинхронная запись файла завершена. Содержимое файла:");
                // let data = fs.readFileSync("hello.txt", "utf8");
                // console.log(data);  // выводим считанные данные
            }
        );

        console.log(errors);

    } finally {
        await driver.quit();
    }
})();
