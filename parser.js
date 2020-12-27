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

(async () => {
    const urls = [
        'https://vypiska-nalog.com/reestr/5408000278-ano-novosibirskiy-tsentr-mediatsii',
        'https://vypiska-nalog.com/reestr/0400010194-ano-sotsialnoe-vzaimodeystvie',
        'https://vypiska-nalog.com/reestr/7720286490-ano-umtsdo',
        'https://vypiska-nalog.com/reestr/7730184385-ano-tsipi-obshchestvo-dlya-vsekh',
        'https://vypiska-nalog.com/reestr/2221995527-ano-tszbt',
        'https://vypiska-nalog.com/reestr/7714082749-nou-vpo-rossiyskiy-novyy-universitet-nou-vpo-rosnou-7822',
        'https://vypiska-nalog.com/reestr/2221025448-akoo-rgi',
    ];

    /***
     *  Теперь нужно как то запускать запросы пачкой, например по 50 за раз
     */

    for (const url of urls) {
        const $dataTable = await loadInfo(url);

        /***
         * Если на странице существует таблица
         */
        if ($dataTable && $dataTable.length) {
            /***
             *  Save html
             *  $dataTable.html() -> to DB
             *
             */
            const data = $dataTable.html();

            fs.appendFile(
                'data.txt',
                `<table>${data}</table>${EOL}`,
                {encoding: 'utf-8'},
                e => {
                    if (e) {
                        throw e; // если возникла ошибка
                    }

                    console.log('Асинхронная запись файла завершена');
                }
            );

            /***
             *  Parse
             *
             *  Точечный поиск
             *
             */
            // const codes = getByTitle($dataTable, 'Коды ОКВЭД');
            // const name = getByTitle($dataTable, 'Наименование');
            //
            // const info = [
            //     name.map(v => {
            //         const item = v.find('td');
            //
            //         if (item.attr('itemprop')) {
            //             return item.html();
            //         }
            //
            //         return undefined;
            //     })
            //         .filter(v => v)
            //     ,
            //     codes.map(v => v.find('th').text().split(' '))
            // ];
            //
            // console.log(info)
        } else {
            console.log('title not found');
        }
    }

})();
