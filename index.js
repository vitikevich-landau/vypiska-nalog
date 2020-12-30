const {timer} = require('rxjs');
const fs = require('fs');
const _ = require('lodash');
const {startSearch} = require('./selenium');
const {Parser, info, parseInfo, groupBy, convertToSave} = require('./parser');
const {toFile} = require('./save');

(async () => {
    const sourceFile = 'source.txt';
    const infoFile = 'info.csv';
    const groupByInnKppOnce = 'group_by_inn_kpp_once.csv';
    const groupByInnKppMore = 'group_by_inn_kpp_more.csv';

    if (fs.existsSync(sourceFile)) {
        fs.unlinkSync(sourceFile);
    }
    if (fs.existsSync(infoFile)) {
        fs.unlinkSync(infoFile);
    }
    if (fs.existsSync(groupByInnKppOnce)) {
        fs.unlinkSync(groupByInnKppOnce);
    }
    if (fs.existsSync(groupByInnKppMore)) {
        fs.unlinkSync(groupByInnKppMore);
    }

    const action = ({iteration, url, pageSource}) => {
        const parser = new Parser(pageSource);
        const html = parser.getHtml('.table.reee_table');
        const information = [iteration, ...info(parser), url];


        toFile(sourceFile, `iteration: ${iteration}|<table>${html}</table>|${url}`);
        toFile(infoFile, information.join('|'));
    };

    await startSearch(action);

    /**
     *  После сбора инфы, формируем файлы
     */
    const subscription = timer(5000)
        .subscribe(
            v => {
                const info = parseInfo('info.csv');

                const byInnKpp = groupBy(info, ['inn', 'kpp']);
                /***
                 *  Save
                 */
                const byInnKppOnce = _.chain(byInnKpp)
                    .map(v => _.map(v, k => k))
                    .flatten()
                    .filter(v => v.length < 2)
                    .flatten()
                    .value()
                ;
                toFile(groupByInnKppOnce, convertToSave(byInnKppOnce).join('\n'));
                // console.log(convertToSave(byInnKppOnce));

                /***
                 *  Save
                 */
                const byInnKppMore = _.chain(byInnKpp)
                    .map(v => _.map(v, k => k))
                    .flatten()
                    .filter(v => v.length > 1)
                    .flatten()
                    .value()
                ;
                toFile(groupByInnKppMore, convertToSave(byInnKppMore).join('\n'));
                // console.log(convertToSave(byInnKppMore));

            },
            error => console.error(error),
            () => subscription.unsubscribe()
        );


})();
