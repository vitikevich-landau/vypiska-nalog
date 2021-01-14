const fs = require('fs');
const path = require('path');
const {EOL} = require('os');
const {BASE_DIR} = require('../config');
const {Record} = require('./record');

/***
 *  File storage
 */
class File {
    static SOURCE = path.join(BASE_DIR, 'source.txt');
    static INFO = path.join(BASE_DIR, 'info.csv');
    static GROUP_BY_INN_KPP_ONCE = path.join(BASE_DIR, 'group_by_inn_kpp_once.csv');
    static GROUP_BY_INN_KPP_MORE = path.join(BASE_DIR, 'group_by_inn_kpp_more.csv');
    static SAME = path.join(BASE_DIR, 'same.csv');
    static DIFFERENCE = path.join(BASE_DIR, 'difference.csv');

    static save = (fName, data) =>
        fs.appendFile(
            fName,
            `${data}${EOL}`,
            {encoding: 'utf-8'},
            e => {
                if (e) {
                    throw e;
                }

                console.log(`Асинхронная запись, в файл ${fName}, завершена... Записано ${data.length} байт`);
            }
        );

    static deleteIfExists = fName => {
        if (fs.existsSync(fName)) {
            fs.unlinkSync(fName);
        }
    }

    static deleteStore = () => {
        File.deleteIfExists(File.SOURCE);
        File.deleteIfExists(File.INFO);
        File.deleteIfExists(File.GROUP_BY_INN_KPP_ONCE);
        File.deleteIfExists(File.GROUP_BY_INN_KPP_MORE);
        File.deleteIfExists(File.SAME);
        File.deleteIfExists(File.DIFFERENCE);
    }

    static formatBeforeSave = infoObject => _.map(infoObject, v => _.values(v).join('|'));

    static parseInfoFile = () => {
        const lines = fs.readFileSync(File.INFO, "utf8");

        /***
         *  Преобрзование, данных из файла
         */
        return lines
            .split('\n')
            .map(v => v.split('|'))
            .map(v => {
                const [iteration, title, inn, kpp, codes, url] = v;
                return new Record(title, inn, kpp, codes, url, iteration);
            })
            // .filter(v => v.inn)
            ;
    };

}

module.exports = {
    File
};
