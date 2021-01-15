const _ = require('lodash');

/***
 *  Работа с группировками
 *
 */
const groupBy = (records, fields) => {
    let i = 0, len = fields.length - 1;

    const recursive = (rcs, i) =>
        i >= len
            ? _.groupBy(rcs, r => r[fields[i]])
            : _
                .mapValues(
                    _.groupBy(rcs, r => r[fields[i]]),
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

const collectInformation = parser => {
    const [title] = parser.contains('Полное наименование с ОПФ').matchValues(/Полное наименование с ОПФ/).values().Result;
    const [inn] = parser.contains('ИНН').matchValues(/ИНН/).values().Result;
    const [kpp] = parser.contains('КПП').matchValues(/КПП/).values().Result;
    const codes = parser.okvedCodesOnly();

    return [title, inn, kpp, codes];
};

module.exports = {
    groupBy,
    traverse,
    formatBeforeSave,
    collectInformation
}
