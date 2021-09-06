const express = require('express')
const livereload = require('livereload')
const cors = require('cors')
const compression = require('compression')
const bodyParser = require('body-parser')

const connectLiveReload = require('connect-livereload')

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});

const app = express();
const router = express.Router();

router.use(compression());

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.json({body: 'Hello, World!'});
});

router.get('/todos', (req, res) => {
    res.json([
        {
            id: 1,
            text: 'Learn React',
            completed: true
        },
        {
            id: 2,
            text: 'Learn Node',
            completed: false
        },
        {
            id: 3,
            text: 'Learn Express',
            completed: false
        },
        {
            id: 4,
            text: 'Learn Next.js',
            completed: false
        }
    ]);
});

app.use('/', router);

module.exports = app;