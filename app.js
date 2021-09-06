const express = require('express')
const app = express()
const port = 3001

const livereload = require('livereload')
const connectLiveReload = require('connect-livereload')

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});

app.use(connectLiveReload());

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/todos', (req, res) => {
    res.send([
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

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});