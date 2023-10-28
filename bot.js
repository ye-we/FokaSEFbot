const { Telegraf } = require("telegraf");
const session = require("telegraf/session");
require("dotenv").config();

// Controllers import
const generalController = require("./controllers/generalController");

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

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
