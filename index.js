// const express = require('express')
// const app = express()
// app.all('/', (req, res) => {
//     console.log("Just got a request!")
//     res.send('Yo!')
// })
// app.listen(process.env.PORT || 3000)

import application from "./application.js";
import logger from "./util/logger.js";

const { PORT = 3000 } = process.env;
const log = logger.child({ module: "server" });
const app = application(logger);

app
  .on("error", ({ message }) => log.error(message))
  .listen(PORT, () => log.info(`Server started on port ${PORT}`));
