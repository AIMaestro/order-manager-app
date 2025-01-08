import dotenv from 'dotenv';
import express from 'express';
import DBAdapter, { DB_ERROR_TYPE_CLIENT } from './adapters/DBAdapter.js';

const ACTION_ERROR_TYPE_CLIENT = 'ACTION_ERROR_TYPE_CLIENT';

dotenv.config({
    path: './server/.env'
});

const {
    OM_APP_HOST,
    OM_APP_PORT,
    OM_DB_HOST,
    OM_DB_PORT,
    OM_DB_NAME,
    OM_DB_USER_LOGIN,
    OM_DB_USER_PASSWORD
} = process.env;

const serverApp = express();
const dbAdapter = new DBAdapter({
    dbHost: OM_DB_HOST,
    dbPort: OM_DB_PORT,
    dbName: OM_DB_NAME,
    dbUserLogin: OM_DB_USER_LOGIN,
    dbUserPassword: OM_DB_USER_PASSWORD
});

serverApp.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
   });

// middleware - логирование запросов
serverApp.use('*', (req, res, next) => {
    console.log(
        new Date().toISOString(),
        req.method,
        req.originalUrl
    );

    next();
});

// middlewares - json parse 
serverApp.use('/api/v1/orderlists', express.json());
serverApp.use('/api/v1/orderpositions', express.json());
serverApp.use('/api/v1/items', express.json());
serverApp.use('/api/v1/appdate', express.json());
serverApp.use('/api/v1/orderlists/:orderlistID', express.json());
serverApp.use('/api/v1/orderpositions/:orderpositionID', express.json());

serverApp.get('/api/v1/orderlists', async (req, res) => {
    try {
        const [dbOrderlists, dbOrderpositions] = await Promise.all([
            dbAdapter.getOrderlists(),
            dbAdapter.getOrderpositions()
        ]);

        const orderpositions = dbOrderpositions.map(
            ({ id, item_name, amount, orderlist_id }) => ({
                orderpositionID: id,
                orderpositionItem: item_name,
                orderpositionAmount: amount,
                orderlistID: orderlist_id
            })
        );

        const orderlists = dbOrderlists.map(
            ({ id, client, order_date }) => ({
                orderlistID: id,
                orderlistClient: client,
                orderlistDate: order_date,
                orderpositions: orderpositions.filter(orderposition => orderposition.orderlistID === id)
            })
        );

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ orderlists });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get orderlists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.get('/api/v1/items', async (req, res) => {
    try {
        const [dbItems] = await Promise.all([
            dbAdapter.getItems()
        ]);

        const items = dbItems.map(
            ({ name, stock }) => ({
                itemName: name,
                itemStock: stock,
            })
        );

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ items });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get items error: ${err.error.message || err.error}`
        });
    }
});

serverApp.get('/api/v1/appdate', async (req, res) => {
    try {
        const [dbAppDate] = await Promise.all([
            dbAdapter.getDate()
        ]);

        const appDate = dbAppDate[0].appdate;

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ appDate });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get app date error: ${err.error.message || err.error}`
        });
    }
});

serverApp.patch('/api/v1/appdate', async (req, res) => {
    try {
        
        const [dbStockReduce] = await Promise.all([
            dbAdapter.getStockReduce()
        ]);

        for (let index = 0; index < dbStockReduce.length; index++) {
            const element = dbStockReduce[index];

            const [dbItemStock] = await Promise.all([
                dbAdapter.getItemStock(element.item_name)
            ]);
            
            const stock = Number(dbItemStock[0].stock);
            const newStock = stock - Number(element.amount);

            await Promise.all([
                dbAdapter.updateStock(element.item_name, newStock)
            ]);
        }

        const [dbItems] = await Promise.all([
            dbAdapter.getItems()
        ]);

        for (let index = 0; index < dbItems.length; index++) {
            const element = dbItems[index];

            await Promise.all([
                dbAdapter.updateStock(element.name, Number(element.stock) + Number((Math.random() * 100).toFixed()))
            ]);
        }

        await dbAdapter.nextDate();

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {

        res.statusCode = 500;
        res.statusMessage = 'Internal server error';

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `next app date error: ${err.error.message || err.error}`
        });
    }
});

serverApp.post('/api/v1/orderlists', async (req, res) => {
    try {
        const {
            orderlistClient,
            orderlistDate
        } = req.body;
        const orderlistID = crypto.randomUUID();

        await dbAdapter.addOrderlist({
            orderlistID,
            client: orderlistClient,
            order_date: orderlistDate
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ orderlistID });
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add orderlists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.post('/api/v1/orderpositions', async (req, res) => {
    try {
        const {
            orderpositionItem,
            orderpositionAmount,
            orderlistID
        } = req.body;
        const orderpositionID = crypto.randomUUID();

        await dbAdapter.addOrderposition({
            orderpositionID,
            item_name: orderpositionItem,
            amount: orderpositionAmount,
            orderlistID
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ orderpositionID });
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add orderposition error: ${err.error.message || err.error}`
        });
    }
});

serverApp.patch('/api/v1/orderlists/:orderlistID', async (req, res) => {
    try {
        const {
            orderlistClient,
            orderlistDate
        } = req.body;
        const { orderlistID } = req.params;

        await dbAdapter.updateOrderlist({
            orderlistID,
            client: orderlistClient,
            order_date: orderlistDate
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `update orderlist error: ${err.error.message || err.error}`
        });
    }
});

serverApp.patch('/api/v1/orderpositions/:orderpositionID', async (req, res) => {
    try {
        const {
            orderpositionItem,
            orderpositionAmount
        } = req.body;

        const { orderpositionID } = req.params;

        const [itemAmount] = await Promise.all([
            dbAdapter.getItemAmountExlusive(orderpositionItem, orderpositionID)
        ]);

        const amount = Number(itemAmount[0].sum) + orderpositionAmount;

        const [itemStock] = await Promise.all([
            dbAdapter.getItemStock(orderpositionItem)
        ]);

        const stock = Number(itemStock[0].stock);

        if(amount > stock) {
            const err = {
                type: ACTION_ERROR_TYPE_CLIENT,
                error: new Error("not enough items in stock")
            };

            throw err;
        }

        await dbAdapter.updateOrderposition({
            orderpositionID,
            item_name: orderpositionItem,
            amount: orderpositionAmount
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            case ACTION_ERROR_TYPE_CLIENT:
                res.statusCode = 499;
                res.statusMessage = 'Invalid amount';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `update orderposition error: ${err.error.message || err.error}`
        });
    }
});

serverApp.delete('/api/v1/orderlists/:orderlistID', async (req, res) => {
    try {
        const { orderlistID } = req.params;

        await dbAdapter.deleteOrderlist({ orderlistID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `delete orderlist error: ${err.error.message || err.error}`
        });
    }
});

serverApp.delete('/api/v1/orderpositions/:orderpositionID', async (req, res) => {
    try {
        const { orderpositionID } = req.params;

        await dbAdapter.deleteOrderposition({ orderpositionID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `delete orderposition error: ${err.error.message || err.error}`
        });
    }
});

serverApp.patch('/api/v1/orderlists', async (req, res) => {
    try {
        const {
            orderpositionID,
            destOrderlistID
        } = req.body;

        await dbAdapter.moveOrderposition({
            orderpositionID,
            destOrderlistID
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `move orderposition error: ${err.error.message || err.error}`
        });
    }
});

serverApp.listen(Number(OM_APP_PORT), OM_APP_HOST, async () => {
    try {
        await dbAdapter.connect();
    } catch (err) {
        console.log('Order Manager app is shutting down');
        process.exit(100);
    }

    console.log(`OM App Server started (${OM_APP_HOST}:${OM_APP_PORT})`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP and DB servers');
    serverApp.close(async () => {
        await dbAdapter.disconnect();
        console.log('HTTP and DB servers closed');
    });
});

