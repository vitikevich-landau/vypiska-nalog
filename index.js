const {startSearch} = require('./selenium');
const {writeToFile, logAndWriteToFile} = require('./parser');

(async () => {

    const sources = [];

    // const action = writeToFile('data.txt');
    // const writer = logAndWriteToFile('Общие сведения');
    // const action = writer('data.txt');

    await startSearch(v => sources.push(v));
    console.log(sources);

})();
