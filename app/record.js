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

    toArray = () =>
        _.chain(this)
            .map((v, i) => typeof v !== 'function' ? [i, v] : null)
            .filter(v => !_.isNull(v))
            .value()

    empty = () =>this.values().every(v => !v);
    keys = () => this.toArray().map(_.first);
    values = () => this.toArray().map(second);

}

module.exports = {
    Record
};
