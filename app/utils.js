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

module.exports = {
    groupBy,
    traverse
}
