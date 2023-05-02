const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const authController = require('./modules/auth/controller');
const userController = require('./modules/user/controller');
const gameController = require("./modules/game/controller");
const gameService = require("./modules/game/service");

const db = require("./config/database");
const path = require("path");
const base64Img = require("base64-img");

class App {
  constructor() {
    db();

    this.app = express();
    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: true,
      limit: '50mb'
    }));
    this.app.use(cors({ origin: '*' }));
    this.app.use((req, res, next) => {
      next();
    });
    this.app.use(express.static(path.join(__dirname, '../build')));

    this.apiRouter = new express.Router();
    this.app.use('/api', this.apiRouter);

    authController(this.apiRouter);
    userController(this.apiRouter);
    this.apiRouter.use('/games', gameController());

    this.apiRouter.post('/upload/:gameId', async (req, res, next) => {
      const { image } = req.body;
      const { gameId } = req.params;
      const game = await gameService.getGameById(gameId);

      base64Img.img(image, './server/public', gameId, async function (err, filepath) {
        game._image = filepath;
        await game.save();
        res.status(200).send(filepath);
      })
    });
  }
}

module.exports = App;