import express from "express";
import { STATUS_CODES } from "http";
import fs from "fs";
import cors from "cors";

export default (logger = console) => {
  const log = logger.child({ module: "api" });
  const app = express();

  app.use(cors());

  app.use((req, res, next) => {
    const { method, url } = req;
    log.http(`${method} ${url}`);
    next();
  });

  let dictionary = [];

  try {
    const jsonString = fs.readFileSync("./dictionary.json");
    dictionary = JSON.parse(jsonString);
  } catch (err) {
    console.log(err);
    return;
  }

  app.get("/", async (req, res) => {
    res.send("Acro Helper API");
  });

  app.get("/api/keys", async (req, res) => {
    res.status(200).json(dictionary.flatMap((el) => Object.keys(el)));
  });

  app.get("/api/dictionary", async (req, res) => {
    res.status(200).json(dictionary);
  });

  app.use((error, req, res, next) => {
    // eslint-disable-line no-unused-vars
    const { message, code = 500 } = error;
    log.error(message);
    res.status(code).send(STATUS_CODES[code]);
  });

  return app;
};
