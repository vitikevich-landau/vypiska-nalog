const {timer} = require('rxjs');
const _ = require('lodash');
const {launchDriver} = require('./app/selenium');
const {Parser} = require('./app/parser');
const {toRecord} = require('./app/utils');
const {File} = require('./app/files');
const {second} = require('./app/mixins');
const {DbInstance} = require('./app/db');

(async () => {
    /***
     *  source = []     html - с сайта
     *  records = []    смапленные данные на таблицу
     *
     *  Данные для записи в БД
     */
        // const source = [];
    const records = [];

    File.deleteStore();

    /***
     *  Вызывается на каждой итерацц перехода по ссылке
     *
     */
    const action = ({iteration, url, pageSource}) => {
        const parser = new Parser(pageSource);
        const html = parser.getHtml('.table.reee_table');
        const record = toRecord(parser, {iteration, url});
        const recordData = record.values();

        records.push(record.toSaveDb());
        // source.push(html);

        File.save(File.SOURCE, `iteration: ${iteration}|<table>${html}</table>|${url}`);
        File.save(File.INFO, recordData.join('|'));
    };

    await launchDriver(action);

    /***
     * Actions after
     *
     */
    const subscription = timer(5000)
        .subscribe(async () => {
                /***
                 * Save to Db
                 */
                await DbInstance.insertRecords(records);
                // console.log(records);
            },
            e => {
                console.log(e);
            },
            () => {
                subscription.unsubscribe();
            }
        )
})();
