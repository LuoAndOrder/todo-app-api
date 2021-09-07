const express = require('express')
const cors = require('cors')
const compression = require('compression')
const bodyParser = require('body-parser')

const AWS = require('aws-sdk')

AWS.config.update({
    region: 'us-west-2'
});

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

var CUSTOM_EPOCH = 1300000000000; // artificial epoch
function generateId(shardId) {
    var ts = (new Date()).getTime() - CUSTOM_EPOCH;
    var rand = Math.floor(Math.random() * 512);
    ts = (ts * 64); // bit-shift << 6
    ts = ts + shardId;
    return (ts * 512) + rand;
}

const app = express();
const router = express.Router();

router.use(compression());

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.json({body: 'Hello, World!'});
});

router.get('/todos', async (req, res) => {
    const params = {
        TableName: 'todo-items-table', //TODO: Change to env var
    };

    var data;
    var msg;

    try {
        data = await ddb.scan(params).promise();
    } catch (err) {
        msg = err;
        res.status(502).json({
            message: msg
        });
        return;
    }

    console.log(data.Items);
    res.status(200).json(data.Items.map(item => {
        return {
            id: item.id.S,
            text: item.text.S,
            completed: item.completed.BOOL
        };
    }));
});

router.post('/todo', async (req, res) => {
    const todo = req.body;
    console.log(todo);

    const params = {
        TableName: 'todo-items-table', // TODO: Change to env var
        Item: {
            id: {S: generateId(1).toString()},
            text: {S: todo.text},
            completed: {BOOL: todo.completed ?? false}
        }
    };

    var data;
    var msg;

    try {
        data = await ddb.putItem(params).promise();
        console.log("Item entered successfully:", data);
        msg = 'Item entered successfully';
    } catch (err) {
        console.log("Error entering item:", err);
        msg = err;
        res.status(502).json({
            message: msg
        });
        return;
    }

    res.json({
        messsage: msg,
        todo: todo
    });
});

router.post('/todo/:todoId', async (req, res) => {
    const todoId = req.params.todoId;
    const { text, completed } = req.body;

    var params = {
        TableName: 'todo-items-table', // TODO: Change to env var
        Key: {
            id: {S: todoId.toString()},
        },
        ReturnValues: 'ALL_NEW'
    };
    params.UpdateExpression = 'set ';
    params.ExpressionAttributeValues = {};
    if (completed !== undefined) {
        params.UpdateExpression += 'completed = :c';
        params.ExpressionAttributeValues[':c'] = { BOOL: completed };
    }
    if (completed !== undefined && !!text) {
        params.UpdateExpression += ",";
    }
    if (!!text) {
        params.UpdateExpression += '#t = :t';
        params.ExpressionAttributeNames = {
            '#t': "text"
        };
        params.ExpressionAttributeValues[':t'] = {S: text};
    }

    var data;
    var msg;

    try {
        data = await ddb.updateItem(params).promise();
        console.log("Item updated successfully:", data);
        msg = 'Item updated successfully';
    } catch (err) {
        console.log("Error updating item:", err);
        msg = err;
        res.status(502).json({
            message: msg
        });
        return;
    }

    res.json({
        messsage: msg,
        todo: {
            id: data.Attributes.id.S,
            text: data.Attributes.text.S,
            completed: data.Attributes.completed.BOOL
        }
    });
});

app.use('/', router);

module.exports = app;