const _ = require('lodash');
const {second} = require('./mixins');

class Record {
    constructor(iteration, title, inn, kpp, codes, status, version, url) {
        this.iteration = iteration;
        this.title = title;
        this.inn = inn;
        this.kpp = kpp;
        this.codes = codes;
        this.status = status;
        this.version = version;
        this.url = url;
    }

    /***
     *
     * @returns {*[]}
     */
    toArray = () =>
        _.chain(this)
            .map((v, i) => typeof v !== 'function' ? [i, v] : null)
            .filter(v => !_.isNull(v))
            .value()

    /***
     *
     * @returns {boolean}
     */
    empty = () =>this.values().every(v => !v);
    /***
     *
     * @returns {*[]}
     */
    keys = () => this.toArray().map(_.first);
    /***
     *
     * @returns {*[]}
     */
    values = () => this.toArray().map(second);
    /***
     *
     * @returns {boolean}
     */
    active = () => this.status.includes('Действующая');
}

module.exports = {
    Record
};
