const oracleDb = require('oracledb');
const {File} = require('./files');
const _ = require('lodash');

class Db {
    static #connectOptions = {
        user: 'PARUS',
        password: 'z123',
        connectString: '192.168.1.130/MT'
    }
    static #insertBindOptions = {
        TITLE: {type: oracleDb.STRING, maxSize: 2000},
        INN: {type: oracleDb.STRING, maxSize: 20},
        KPP: {type: oracleDb.STRING, maxSize: 20},
        OKVED_CODES: {type: oracleDb.STRING, maxSize: 2000},
        STATUS: {type: oracleDb.STRING, maxSize: 200},
        OKVED_CODES_VERSION: {type: oracleDb.STRING, maxSize: 20},
        URL_ADDRESS: {type: oracleDb.STRING, maxSize: 2000},
    }
    static #instance;

    #connection;
    #result;

    constructor() {
        this.#connection = null;
        if (!Db.#instance) {
            Db.#instance = this;
        }
        return Db.#instance;
    }

    get Result() {
        return this.#result;
    }

    /**
     *  Builder
     * @returns {Promise<Db>}
     */
    #tryCatchFinally = async action => {
        try {
            /***
             *  Connecting to Db on every request
             */
            this.#connection = await oracleDb.getConnection(Db.#connectOptions);

            await action();
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

    execute = async sql => {
        await this.#tryCatchFinally(async () => this.#result = await this.#connection.execute(sql));
        return this;
    }
    executeMany = async (sql, binds, options) => {
        await this.#tryCatchFinally(async () => await this.#connection.executeMany(sql, binds, {autoCommit: true, ...options}));
        return this;
    }

    insert = async records => await this.executeMany(
            `
            INSERT INTO 
                UDO_T_PA_VYPISKANALOG_RECODRS
                (RN, TITLE, INN, KPP, OKVED_CODES, STATUS, OKVED_CODES_VERSION, URL_ADDRESS, INSER_DATE)
            VALUES 
                (GEN_ID(), :TITLE, :INN, :KPP, :OKVED_CODES, :STATUS, :OKVED_CODES_VERSION, :URL_ADDRESS, SYSDATE)
        `,
        records,
        {bindDefs: Db.#insertBindOptions}
    );

}

/*const test = async () => {
    let connection;

    try {
        connection = await oracleDb.getConnection(options);

        const result = await connection.execute(
                `
                SELECT 
                    *
                FROM 
                    AGNLIST
                WHERE 
                    AGNTYPE = 0
                `
            /!*[103]*!/,  // bind value for :id
        );
        console.log(result.rows.length);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};*/

(async () => {
    const db = await new Db();
    // const res = await db.execute('select count(*) from agnlist where agntype = 0');
    // console.log(res.Result);


    const records_ = _.chain(File.parseInfoFile());
    const data = records_
        .take(5)
        .map(v => v.toSaveDb())
        .value()
    ;

    console.log(data);
    //
    // const res = db.insert(data);
    // //
    // console.log(res.Result);


})();



