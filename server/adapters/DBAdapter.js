import pg from 'pg';

const DB_ERROR_TYPE_CLIENT = 'DB_ERROR_TYPE_CLIENT';
const DB_ERROR_TYPE_INTERNAL = 'DB_ERROR_TYPE_INTERNAL';

export {
    DB_ERROR_TYPE_CLIENT,
    DB_ERROR_TYPE_INTERNAL
};

export default class DBAdapter {
    #dbHost = '';
    #dbPort = -1;
    #dbName = '';
    #dbUserLogin = '';
    #dbUserPassword = '';
    #dbClient = null;

    constructor({
        dbHost,
        dbPort,
        dbName,
        dbUserLogin,
        dbUserPassword,
    }) {
        this.#dbHost = dbHost;
        this.#dbPort = dbPort;
        this.#dbName = dbName;
        this.#dbUserLogin = dbUserLogin;
        this.#dbUserPassword = dbUserPassword;

        this.#dbClient = new pg.Client({
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName,
            user: this.#dbUserLogin,
            password: this.#dbUserPassword
        });
    }

    async connect() {
        try {
            await this.#dbClient.connect();
            console.log('db connection established');
        } catch (err) {
            console.error(`unable to connect to db: ${err}`);
            return Promise.reject(err);
        }
    }

    async disconnect() {
        await this.#dbClient.end();
        console.log('db connection closed');
    }

    async getOrderlists() {
        try {
            const orderlistsData = await this.#dbClient.query(
                'select * from orderlists order by order_date;'
            );

            return orderlistsData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get orderlists (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getOrderpositions() {
        try {
            const orderpositionsData = await this.#dbClient.query(
                'select * from orderpositions order by orderlist_id;'
            );

            return orderpositionsData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get orderpositions (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getItems() {
        try {
            const itemsData = await this.#dbClient.query(
                'select * from items;'
            );

            return itemsData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get items (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getItemAmountExlusive( orderpositionItem , orderpositionID ) {
        if(!orderpositionItem || !orderpositionID) {
            const errMsg = `DB Error: wrong parameters for getting amount exclusive (item: ${orderpositionItem}, orderpositionID: ${orderpositionID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            const itemsData = await this.#dbClient.query(
                `select SUM(amount) from orderpositions where item_name = '${orderpositionItem}' and id != '${orderpositionID}';`
            );

            return itemsData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get items (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getItemStock( orderpositionItem ) {
        if(!orderpositionItem) {
            const errMsg = `DB Error: wrong parameters for getting item stock (item: ${orderpositionItem})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            const itemsData = await this.#dbClient.query(
                `select stock from items where name = '${orderpositionItem}';`
            );

            return itemsData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get items (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getDate() {
        try {
            const dateData = await this.#dbClient.query(
                'select * from appdate;'
            );

            return dateData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get date (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async updateDate( newAppDate ) {
        if(!newAppDate) {
            const errMsg = `DB Error: wrong parameters for updating date (newAppDate: ${newAppDate})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query(`update appdate set appdate = '${newAppDate}'`);
        } catch (err) {
            console.error(`DB Error: unable to update app date (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async addOrderlist({ orderlistID, client, order_date }) {
        if(!orderlistID || !client || !order_date) {
            const errMsg = `DB Error: wrong parameters for adding orderlist (id: ${orderlistID}, clienr: ${client}, order_date: ${order_date})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query(
                'insert into orderlists (id, client, order_date) values ($1, $2, $3);',
                [orderlistID, client, order_date]
            );
        } catch (err) {
            console.error(`DB Error: unable to add orderlist (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async addOrderposition({ orderpositionID, item_name, amount, orderlistID }) {
        if(!orderpositionID || !item_name || typeof amount !== 'number' || amount < 0 || !orderlistID) {
            const errMsg = `DB Error: wrong parameters for adding orderposition (id: ${orderpositionID}, item_name: ${item_name}, amount: ${amount}, orderlist_id: ${orderlistID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query(
                'insert into orderpositions (id, item_name, amount, orderlist_id) values ($1, $2, $3, $4);',
                [orderpositionID, item_name, amount, orderlistID]
            );
        } catch (err) {
            console.error(`DB Error: unable to add orderposition (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async updateOrderlist({ orderlistID, client, order_date}) {
        if(!orderlistID || !client || !order_date) {
            const errMsg = `DB Error: wrong parameters for updating orderlist (id: ${orderlistID}, client: ${client}, order_date: ${order_date})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            const query = `update orderlists set client = '${client}', order_date = '${order_date}' where id = \'${orderlistID}\';`;

            await this.#dbClient.query(query);
        } catch (err) {
            console.error(`DB Error: unable to update orderlist (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async updateOrderposition({ orderpositionID, item_name, amount }) {
        if(!orderpositionID || !item_name || !amount ) {
            const errMsg = `DB Error: wrong parameters for updating orderposition (id: ${orderpositionID}, item_name: ${item_name}, amount: ${amount})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            const query = `update orderpositions set amount = ${amount}, item_name = '${item_name}' where id = \'${orderpositionID}\';`;

            await this.#dbClient.query(query);
        } catch (err) {
            console.error(`DB Error: unable to update orderposition (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async deleteOrderlist({ orderlistID }) {
        if(!orderlistID) {
            const errMsg = `DB Error: wrong parameters for deleting order (id: ${orderlistID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query('delete from orderpositions where orderlist_id = $1;', [orderlistID]);

            await this.#dbClient.query('delete from orderlists where id = $1;', [orderlistID]);

        } catch (err) {
            console.error(`DB Error: unable to delete orderlist (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async deleteOrderposition({ orderpositionID }) {
        if(!orderpositionID) {
            const errMsg = `DB Error: wrong parameters for deleting orderposition (id: ${orderpositionID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query('delete from orderpositions where id = $1;', [orderpositionID]);
        } catch (err) {
            console.error(`DB Error: unable to delete orderposition (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async moveOrderposition({ orderpositionID, destOrderlistID }) {
        if(!orderpositionID || !destOrderlistID) {
            const errMsg = `DB Error: wrong parameters for moving orderposition (id: ${orderpositionID}, srcOrderlistID: ${srcOrderlistID}, destOrderlistID: ${destOrderlistID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query(
                'update orderpositions set orderlist_id = $1 where id = $2;',
                [destOrderlistID, orderpositionID]
            );
        } catch (err) {
            console.error(`DB Error: unable to move orderposition (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async getStockReduce() {
        try {
            const stockReduceData = await this.#dbClient.query(`select item_name, sum(amount) as amount from orderpositions where orderlist_id in (select id from orderlists where order_date <= (select appdate from appdate)) group by item_name`);

            return stockReduceData.rows;
        } catch (err) {
            console.error(`DB Error: unable to get stock reduce (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async updateStock( itemName, newStock ) {
        if(!itemName || typeof newStock !== 'number' || newStock < 0) {
            const errMsg = `DB Error: wrong parameters for updating stock (itemName: ${itemName}, newAmount: ${newStock})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            })
        }

        try {
            await this.#dbClient.query(`update items set stock = ${newStock} where name = '${itemName}'`);
        } catch (err) {
            console.error(`DB Error: unable to update stock (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }

    async nextDate() {
        try {
            await this.#dbClient.query(
                `update appdate set appdate = (select appdate from appdate) + interval '1 day';
                delete from orderpositions where orderlist_id in (select id from orderlists where order_date < (select appdate from appdate));
                delete from orderlists where order_date < (select appdate from appdate);`
            );
        } catch (err) {
            console.error(`DB Error: unable to change to next date (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            })
        }
    }
}
