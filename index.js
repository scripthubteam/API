/* Script Hub API 1.0 */
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const { Client } = require("discord.js");
const client = new Client();
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

/* Base de Datos */
const mongoose = require("mongoose");
const BotManager = require("./lib/BotManager");
const dbBots = new BotManager();
/* Inicio del sistema */
async function init() {
  /* Base de Datos */
  console.log("[SERVER:DB] Iniciando base de datos...");
  await mongoose
    .connect(
      process.env.MONGOURI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      },
      err => {
        if (err) {
          console.error(err.toString());
        }
        console.log(
          `${
            err
              ? `${err.toString()}${
                  err.fileName
                    ? ` - ${err.fileName}:${err.lineNumber}:${err.columnNumber}`
                    : ``
                }`
              : `[SERVER:DB] Base de datos lista!`
          }`
        );
      }
    )
    .catch(err => {
      console.log("[SERVER:DB] No se pudo conectar con la base de datos.");
      console.error(err);
    });

  /* Discord.js */
  console.log("[SERVER:DISCORD.JS] Iniciando presencia en Discord...");
  client.login(process.env.TOKEN);

  client.on("ready", () => {
    if (!process.env.CARDINAL_SERVER) {
      console.log(
        "[SERVER:DISCORD.JS:CARDINAL] No se proporcionó la ID del servidor cardinal."
      );
      process.exit();
      return;
    }
    console.log(
      "[SERVER:DISCORD.JS] [" +
        client.user.tag +
        "] está en línea con [" +
        client.users.size +
        "] usuarios."
    );
    console.log(
      "\n\n>>> Servidor cardinal: " +
        client.guilds.get(process.env.CARDINAL_SERVER).name +
        "\n\n"
    );
  });

  /* Servidor web */
  console.log("[SERVER:WEBSERVER] Iniciando servidor web...");
  app.listen(PORT, () =>
    console.log("[SERVER:WEBSERVER] Escuchando en puerto " + PORT)
  );
}
// Log
function logAction({ date, route, param }) {
  if (!date || !route)
    throw new Error("[SERVER:LOG] Error al completar los párametros.");
  if (!param) {
    param = "No param";
  }
  let logChan = client.channels.get("606340576740114433");
  return logChan.send("[" + date + "] **" + route + "** > " + param);
}
// Inicialización
init();

app.set("trust proxy", 1);

// Limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

/* API */
app.use(limiter);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* index */
app.get("/", (req, res) => {
  res.send("API v1.0");
});

/* user */
app.get("/user/:userId", (req, res) => {
  //
  const userId = req.params.userId;
  logAction({
    date: new Date(),
    route: "/user/",
    param: userId
  });
  let user = {
    discordData: client.guilds
      .get(process.env.CARDINAL_SERVER)
      .members.get(userId),
    shData: "Los datos de Script Hub no están disponibles en esta versión."
  };

  if (user.discordData) {
    res.send(user);
    return;
  }
  // 404
  res
    .status(404)
    .send(
      "Este usuario no está en " +
        client.guilds.get(process.env.CARDINAL_SERVER).name +
        "."
    );
});

/* bot-get-all */
app.get("/bot/:botId", async (req, res) => {
  //
  const botId = req.params.botId;
  logAction({
    date: new Date(),
    route: "/bot/",
    param: botId
  });
  let bot = await dbBots.getBot(botId);

  if (!botId) return res.send("El párametro botId es necesario.");

  if (bot) {
    res.send(bot);
    return;
  }
  // 404
  res.status(404).send("Este bot no está en la base de datos.");
});

/* bot-is-certified */
app.get("/bot/certified/:botId", async (req, res) => {
  //
  const botId = req.params.botId;
  logAction({
    date: new Date(),
    route: "/bot/certified/",
    param: botId
  });
  if (!botId) return res.send("El párametro botId es necesario.");

  let bot = await dbBots
    .isCertified(botId)
    .catch(e => res.status(404).send("Este bot no está en la base de datos."));
  res.send(bot);
});

/* bots-no-approved-queue */
app.get("/bots/noapproved", async (req, res) => {
  let queue = await dbBots.getNoApprovedBots();
  logAction({
    date: new Date(),
    route: "/bots/"
  });
  res.send(queue);
});
