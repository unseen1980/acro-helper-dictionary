import express from "express";
import { STATUS_CODES } from "http";
import fs from "fs";
import cors from "cors";
import fetch from "node-fetch";
import { ChatGPTAPI } from "chatgpt";

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

  app.post("/api/categorization", express.json(), async (req, res) => {
    try {
      const rawResponse = await fetch(
        `https://language.googleapis.com/v1beta2/documents:classifyText?key=${process.env.NLP}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const response = await rawResponse.json();
      console.log("Taxonomy: ", response);
      res.status(200).json({ response });
    } catch (error) {
      res.status(400).set("Content-Type", "text/plain").send("Bad Request");
    }
  });

  app.post("/api/chatgpt", express.json(), async (req, res) => {
    try {
      const api = new ChatGPTAPI({
        apiKey: process.env.GPT,
      });

      const resp =
        await api.sendMessage(`Find the acronyms or abbreviations or technical jargon in the following text and return me a javascript array which can be parsed with the function JSON.parse(). It's element of the array should be a javascript object with the acronym property, the definition property and a small description property: 
    ${req.body.text}`);
      const findings = JSON.parse(JSON.stringify(resp.text));
      res.status(200).json({ response: JSON.parse(resp.text) });
    } catch (error) {
      console.log(error);
      res.status(400).set("Content-Type", "text/plain").send("Bad Request");
    }
  });

  app.use((error, req, res, next) => {
    // eslint-disable-line no-unused-vars
    const { message, code = 500 } = error;
    log.error(message);
    res.status(code).send(STATUS_CODES[code]);
  });

  return app;
};
