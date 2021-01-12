const fs = require('fs');
const path = require('path');
const {EOL} = require('os');
const {BASE_DIR} = require('../config');

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
}

module.exports = {
    File
};
