const axios = require('axios');
const cheerio = require('cheerio');

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


const info = parser => {
    const [title] = parser.contains('Полное наименование с ОПФ').values().result;
    const [inn] = parser.contains('ИНН').values().result;
    const [kpp] = parser.contains('КПП').values().result;
    const codes = codesOnly(parser);

    return [title, inn, kpp, codes];
};

module.exports = {
    Parser,
    info
};
