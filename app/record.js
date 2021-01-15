const _ = require('lodash');

class Record {
    static STATUS_ACTIVE = 'Действующая';

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

    empty = () =>
        _.chain(this)
            .map(v => typeof v !== 'function' ? v : undefined)
            .every(v => !v)
            .value()

    toArray = () => [
        this.iteration,
        this.title,
        this.inn,
        this.kpp,
        this.codes,
        this.status,
        this.version,
        this.url
    ]
}

module.exports = {
    Record
};
