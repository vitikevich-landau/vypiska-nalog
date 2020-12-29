const fs = require('fs');
const {startSearch} = require('./selenium');
const {Parser, info} = require('./parser');
const {toFile} = require('./save');

(async () => {
    const sourceFile = 'source.txt';
    const infoFile = 'info.csv';

    if (fs.existsSync(sourceFile)) {
        fs.unlinkSync(sourceFile);
    }
    if (fs.existsSync(infoFile)) {
        fs.unlinkSync(infoFile);
    }


    const action = ({iteration, url, pageSource}) => {
        const parser = new Parser(pageSource);
        const html = parser.getHtml('.table.reee_table');
        const information = [iteration, ...info(parser), url];



        toFile(sourceFile, `iteration: ${iteration}|<table>${html}</table>|${url}`);
        toFile(infoFile, information.join('|'));
    };

    await startSearch(action);

})();
