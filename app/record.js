class Record {
    constructor(title, inn, kpp, codes, url, iteration, version, status) {
        this.title = title;
        this.inn = inn;
        this.kpp = kpp;
        this.codes = codes;
        this.url = url;
        this.iteration = iteration;
        this.version = version;
        this.status = status;
    }

}

module.exports = {
    Record
};
