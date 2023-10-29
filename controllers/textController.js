const { getStudents, downloadPhotos } = require("../utils/utils");

module.exports = {
  async handleText(ctx) {
    const userId = ctx.from.id;
    const userText = ctx.update.message.text;
    let currentUser = ctx.session[userId];
    if (!currentUser) {
      ctx.session[userId] = {};
      ctx.session[userId].step = 1;
    }
    if (ctx.session[userId].step == 1) {
      const student = getStudents().find(
        (student) => student[0] == userText?.toUpperCase()
      );
      if (!student) {
        return ctx.reply("Please provide a valid 6 Digit Code.");
      }
      ctx.session[userId].name = student[1];
      ctx.session[userId].code = userText.toUpperCase();
      ctx.session[userId].step += 1;
      return ctx.reply(
        "Hey there, can you provide your grand father's name as written on your certificate?"
      );
    } else if (ctx.session[userId].step == 2) {
      const student = ctx.session[userId];
      if (student.name.split(" ")[2] == userText.toUpperCase()) {
        ctx.reply(
          `Getting your awesome photos, ${student.name.split(" ")[0]}!`
        );
        ctx.session[userId] = undefined;
        downloadPhotos(student.code, ctx);
      } else {
        ctx.reply(
          `That's not a matching grand father's name for the 6-digit code your provided, please try again`
        );
      }
    }
  },
};
