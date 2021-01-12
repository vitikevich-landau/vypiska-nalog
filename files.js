const fs = require('fs');
const {EOL} = require('os');

class File {
    /***
     *  Used file names
     * @type {string}
     */
    static SOURCE = 'source.txt';
    static INFO = 'info.csv';
    static GROUP_BY_INN_KPP_ONCE = 'group_by_inn_kpp_once.csv';
    static GROUP_BY_INN_KPP_MORE = 'group_by_inn_kpp_more.csv';
    static SAME = 'same.csv';
    static DIFFERENCE = 'difference.csv';

    static save = (fName, data) => {
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
    }

    static deleteIfExists = fName => {
        if (fs.existsSync(fName)) {
            fs.unlinkSync(fName);
        }
    }
}

module.exports = {
    File
};
