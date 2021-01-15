const cheerio = require('cheerio');
const _ = require('lodash');
const {second} = require('./mixins');

class Parser {
    constructor(pageSource) {
        this._source = pageSource;
        this._$ = cheerio.load(pageSource);
        this._result = null;
    }

    /**
     *  Result after operations
     */
    get Result() {
        return this._result;
    }

    get Source() {
        return this._source;
    }

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
        const items = this._$(`tr.info:contains('${title}')`);
        const needed = [];

        if (items.length) {
            let elem = items.next();

            while (
                elem.length
                && elem.attr('class') !== 'info'
                && !elem.find('button').length
                ) {
                needed.push(elem);
                elem = elem.next();
            }
        }

        this._result = needed.map(v => [v.find('th').html(), v.find('td').html()]);

        return this;
    }

    /***
     * Утилитные методы
     *
     */

    /***
     *  Наименования групп в таблице
     *
     * @returns {*[]}
     */
    groupTitles = () => this.select('tr[class=info]', this._$.text);

    /***
     *
     * @param cssSelector, css-selector
     * @param fn, cheerio function
     * @returns {[]}
     */
    select = (cssSelector, fn) => {
        const items = [];
        this._$(cssSelector).each((i, v) => {
            if (fn) {
                items.push(fn(this._$(v)));
            } else {
                items.push(this._$(v));
            }
        })
        return items;
    };

    getHtml = selector => this._$(selector).html();

    /***
     *  Filters methods
     *
     */
    keys = () => {
        this._result = this._result.map(_.first);
        return this;
    };
    values = () => {
        this._result = this._result.map(second);
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

    okvedCodesOnly = () => {
        return _.chain(
            this
                .group('Коды ОКВЭД')
                .splitByCodes()
                .Result
        )
            .map(v => _.chain(v).first().first().value())
            .value()
            ;
    }
}

module.exports = {
    Parser,
};
