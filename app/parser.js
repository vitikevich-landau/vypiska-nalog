const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('lodash');

class Parser {
    constructor(pageSource) {
        this._$ = cheerio.load(pageSource);
        this._result = null;
    }

    /**
     *  Result after operations
     */
    get result() {
        return this._result;
    } ;

    /***
     *  Search methods
     *
     */
    contains = text => {
        const lines = this._$(`tr:contains('${text}')`);

        const items = [];
        lines.each((_, e) => {
            if (!this._$(e).find('button').length) {
                const left = this._$(e).find('th');
                const right = this._$(e).find('td');
                items.push([left.html(), right.html()]);
            }
        });

        this._result = items;

        return this;
    }
    group = title => {
        const item = this._$(`tr.info:contains('${title}')`);
        const needed = [];

        if (item.length) {
            let elem = item.next();

            while (elem.attr('class') !== 'info' && !elem.find('button').length) {
                needed.push(elem);
                elem = elem.next();
            }
        }

        this._result = needed.map(v => [v.find('th').html(), v.find('td').html()]);

        return this;
    }

    /***
     *  Filters methods
     *
     */
    keys = () => {
        this._result = this._result.map(v => v[0]);
        return this;
    };
    values = () => {
        this._result = this._result.map(v => v[1]);
        return this;
    };
    matchValues = regExp => {
        this._result = this._result.filter(v => regExp.test(v[0]));
        return this;
    }
    splitBy = callback => {
        this._result = callback(this._result);
        return this;
    }

    splitByCodes = () => {
        this._result = this._result.map(v => [v[0].split(' '), v[1]]);
        return this;
    };

    getHtml = selector => this._$(selector).html();

}

const codesOnly = parser =>
    parser
        .group('Коды ОКВЭД')
        .splitByCodes()
        .result
        .map(v => v[0][0])
;

/***
 *  1 - Весь список
 *  2 - Только с дублирующими ИНН
 *  3 - Только с дублирующими ИНН, КПП
 *  4 - Только с дублирующими ИНН, КПП, Наменованием
 *  5 - Полностью дублирующиеся
 *
 */
const collectInformation = parser => {
    const [title] = parser.contains('Полное наименование с ОПФ').matchValues(/Полное наименование с ОПФ/).values().result;
    const [inn] = parser.contains('ИНН').matchValues(/ИНН/).values().result;
    const [kpp] = parser.contains('КПП').matchValues(/КПП/).values().result;
    const codes = codesOnly(parser);

    return [title, inn, kpp, codes];
};

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

const parseInfo = file => {
    const lines = fs.readFileSync(file, "utf8");

    /***
     *  Преобрзование, данных из файла
     */
    return lines
        .split('\n')
        .map(v => v.split('|'))
        .map(v => ({iteration: v[0], title: v[1], inn: v[2], kpp: v[3], codes: v[4], url: v[5]}))
        .filter(v => v.inn)
        ;
};

const formatBeforeSave = infoObject => _.map(infoObject, v => _.values(v).join('|'));

module.exports = {
    Parser,
    collectInformation,
    parseInfo,
    groupBy,
    formatBeforeSave,
    traverse
};
