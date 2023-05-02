const express = require("express");
const Game = require('./model');
const authMiddleware = require("../../middleware/auth");
const base64Img = require("base64-img");

function gameController() {
  const router = new express.Router();

  router.get('/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send('ID REQUIRED');
    }

    const game = await Game.findById(id);

    return res.status(200).json(game);
  });

  router.get('/', authMiddleware, async (req, res, next) => {
    const user = req.user;
    Game.find()
      .where({ $or: [{ black: user._id }, { white: user._id }] })
      .populate('white')
      .populate('black')
      .then((games) => {
        console.log(games);
        res.status(200).json(games);
      });
  });

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const newGame = new Game(req.body);
      await newGame.save();
      res.status(201).json(newGame);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      let game = await Game.findById(id);
      game = { ...game, ...req.body };
      await game.save();
      res.status(204).send(game);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  return router;
}

module.exports = gameController;