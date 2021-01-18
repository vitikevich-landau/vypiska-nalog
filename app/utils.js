const _ = require('lodash');
const {Record} = require('./record');

/***
 *  Работа с группировками
 *
 */
const groupBy = (records, fields) => {
    let i = 0, len = fields.length - 1;

    const recursive = (rcs, i) =>
        i >= len
            ? _.groupBy(
            rcs,
            typeof fields[i] === "function"
                ? fields[i]
                : r => r[fields[i]]
            )
            : _
                .mapValues(
                    _.groupBy(
                        rcs,
                        typeof fields[i] === "function"
                            ? fields[i]
                            : r => r[fields[i]]
                    ),
                    r => recursive(r, i + 1)
                );

    return recursive(records, i);
};

/***
 *  Распаковка сгруппированного объекта
 *
 * @param obj
 * @returns {[]}
 */
const traverse = obj => {
    const items = [];
    const recursive = obj =>
        _.forIn(obj, v => {
            if (_.isArray(v)) {
                items.push(v);
            }
            if (_.isObject(v)) {
                recursive(v);
            }
        });
    recursive(obj);
    return items;
};

/***
 *  Formatting
 */

const formatBeforeSave = infoObject => _.map(infoObject, v => _.values(v).join('|'));

const toRecord = (parser, {iteration, url}) => {
    const [title] = parser.contains('Полное наименование с ОПФ').matchValues(/Полное наименование с ОПФ/).values().Result;
    const [inn] = parser.contains('ИНН').matchValues(/ИНН/).values().Result;
    const [kpp] = parser.contains('КПП').matchValues(/КПП/).values().Result;
    const codes = parser.okvedCodesOnly();
    const [status] = parser.contains('Статус организации').matchValues(/Статус организации/).values().Result;
    const [version] = parser.contains('Версия справочника ОКВЭД').matchValues(/Версия справочника ОКВЭД/).values().Result;

    return new Record(iteration, title, inn, kpp, codes, status, version, url);
};

module.exports = {
    groupBy,
    traverse,
    formatBeforeSave,
    toRecord
}
