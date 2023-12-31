const { Telegraf } = require("telegraf");
const session = require("telegraf/session");
require("dotenv").config();
// Controllers import
const generalController = require("./controllers/commandController");
const { setStudents } = require("./utils/utils");
const textController = require("./controllers/textController");
const { loadFromSheets } = require("./services/google_service");
const bot = new Telegraf(process.env.TOKEN);
// Middlewares
bot.use(session());

bot.catch((error, ctx) => {
  console.error(`Error encountered in update ${ctx.update.update_id}:`, error);
  ctx.reply("Oops! Something went wrong. Please try again later.");
});

// Commands
bot.start((ctx) => generalController.handleStart(ctx));
bot.on("text", (ctx) => textController.handleText(ctx));

bot
  .launch()
  .then(async () => {
    // When the bot first launches, fetch the student data from google-sheets and save it in memory
    const data = await loadFromSheets();
    setStudents(data);
    // ["328577765", "329828705"].forEach((chatId) => {
    //   bot.telegram.sendMessage(
    //     chatId,
    //     `
    //   👋 Your team photos are ready. Click  <a href="https://drive.google.com/drive/folders/16ZZaUhGDCRsNhrMM7awRJSW8218_vqHB?usp=drive_link">here</a> to view them now.
    //   `,
    //     { parse_mode: "HTML" }
    //   );
    // });
  })
  .catch((err) => {
    console.log(err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
