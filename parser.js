const fs = require('fs');
const {EOL} = require('os');
const axios = require('axios');
const cheerio = require('cheerio');

/***
 *
 * @param url string
 * @returns {Promise<cheerio.Cheerio|HTMLElement>|undefined}
 */
const loadInfo = async url => {
    let info;
    try {
        let {data} = await axios.get(url);
        const $ = cheerio.load(data);

        info = $('.table.reee_table');
    } catch (e) {
        /***
         *  If error, nothing to do
         */
    }

    return info;
};

/***
 *
 * @param $cheerio cheerio object
 * @param title <tr class="info">
 * @returns {[]}
 */
const getByTitle = ($cheerio, title) => {
    const item = $cheerio.find(`tr.info:contains('${title}')`);
    const needed = [];

    /***
     *  Если присутствует наименование в таблице
     */
    if (item.length) {
        let elem = item.next();
        /***
         *  Забираем нужные
         */
        while (!elem.attr('class')) {
            needed.push(elem);
            elem = elem.next();
        }
    }

    return needed;
};

/***
 *  Need codes ОКВЭД
 *
 *
 */
const getCodes = async () => {};

const logAndWrite = title => fullPath => {
    const write = writeToFile(fullPath);

    return source => {
        write(source);

        const $ = cheerio.load(source);
        const item = $(`tr.info:contains('${title}')`);
        const needed = [];

        if (item.length) {
            let elem = item.next();

            while (!elem.attr('class')) {
                needed.push(elem);
                elem = elem.next();
            }
        }

        console.log(needed.map(v => v.text()));
    }
};

const writeToFile = fullPath => source => {
    const $ = cheerio.load(source);
    const html = $('.table.reee_table').html()

    fs.appendFile(
        fullPath,
        `${html}${EOL}`,
        {encoding: 'utf-8'},
        e => {
            if (e) {
                throw e;
            }

            console.log("Асинхронная запись файла завершена...");
        }
    );
};

module.exports = {
    writeToFile,
    logAndWriteToFile: logAndWrite
};
