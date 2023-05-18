import passport from "passport";
import {getGameLeaderboard, getTable} from "../db/leaderboardRepository.js"
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Router } from "express";

const gameRouter = Router()

gameRouter.get("/leaderboard", async (req, res) => {
    let gameID = req.query.gameID;
    getGameLeaderboard(gameID).then((leaderboard) => {
        res.send(JSON.stringify({
            leaderboard: leaderboard
        }))
    }).catch((err) => {
        res.status(400);
        res.send(err);
    })
});
  
gameRouter.get("/leaderboard/all", async (req, res) => {
    let gameID = req.query.gameID;
    getTable().then((table) => {
        res.send(JSON.stringify({
            table: table
        }))
    }).catch((err) => {
        res.status(400);
        res.send(err);
    })
});

export default gameRouter;