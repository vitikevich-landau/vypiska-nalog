const fs = require('fs');
const {EOL} = require('os');

const toFile = (fullPath, source) => {
    fs.appendFile(
        fullPath,
        `${source}${EOL}`,
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
    toFile
};
