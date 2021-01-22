const oracleDb = require('oracledb');

class Db {
    static RECORDS_TABLE = 'UDO_T_PA_VYPISKANALOG_RECODRS';
    static AGNLIST_TABLE = 'AGNLIST';

    static #connectOptions = {
        user: 'PARUS',
        password: 'z123',
        // connectString: '192.168.1.130/MT'
        connectString: '192.168.1.125/ONEDB'
    }
    static #recordsBindOptions = {
        TITLE: {type: oracleDb.STRING, maxSize: 2000},
        SHORT_TITLE: {type: oracleDb.STRING, maxSize: 1000},
        INN: {type: oracleDb.STRING, maxSize: 20},
        KPP: {type: oracleDb.STRING, maxSize: 20},
        OKVED_CODES: {type: oracleDb.STRING, maxSize: 4000},
        STATUS: {type: oracleDb.STRING, maxSize: 200},
        OKVED_CODES_VERSION: {type: oracleDb.STRING, maxSize: 20},
        URL_ADDRESS: {type: oracleDb.STRING, maxSize: 2000},
    }

    static #instance;

    #connection;

    constructor() {
        this.#connection = null;
        if (!Db.#instance) {
            Db.#instance = this;
        }
        return Db.#instance;
    }

    /**
     *  Builder
     * @returns {Promise<Db>}
     */
    #tryCatchFinally = async executor => {
        try {
            /***
             *  Connecting to Db on every request
             */
            this.#connection = await oracleDb.getConnection(Db.#connectOptions);

            return await executor();
        } catch (err) {
            /***
             *  TODO if something wrong
             */
            console.error(err);
        } finally {
            if (this.#connection) {
                try {
                    await this.#connection.close();
                } catch (err) {
                    /***
                     *  LOG if can't close connection
                     */
                    console.error(err);
                }
            }
        }
    }

    execute = async sql =>
        await this.#tryCatchFinally(
            async () => await this.#connection.execute(sql)
        );
    executeMany = async (sql, binds = [], options = {}) =>
        await this.#tryCatchFinally(
            async () => await this.#connection.executeMany(
                sql, binds, {autoCommit: true, ...options}
            )
        );

    insertRecords = async records => await this.executeMany(
        `
            insert into 
                ${Db.RECORDS_TABLE}
                (RN, TITLE, SHORT_TITLE, INN, KPP, OKVED_CODES, STATUS, OKVED_CODES_VERSION, URL_ADDRESS, INSER_DATE)
            values 
                (GEN_ID(), :TITLE, :SHORT_TITLE, :INN, :KPP, :OKVED_CODES, :STATUS, :OKVED_CODES_VERSION, :URL_ADDRESS, SYSDATE)
        `,
        records,
        {bindDefs: Db.#recordsBindOptions}
    );
    selectINNs = async () => await this.execute(
    `
            select
                A.AGNIDNUMB
            from
                (
                    select
                        min(A.RN) over(
                            partition by A.AGNIDNUMB
                        ) FIRST_RN,
                        A.*
                    from
                        ${Db.AGNLIST_TABLE} A
                    where
                        A.AGNIDNUMB is not null
                ) A
            where
                A.RN = A.FIRST_RN
                and LENGTH(A.AGNIDNUMB) > 3
                and REGEXP_INSTR(TRIM(A.AGNIDNUMB),'[^[[:digit:]]]*') = 0
    `
    );
}

module.exports = {
    DbInstance: new Db()
};




