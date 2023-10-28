const { getStudents, downloadPhotos } = require("../utils/utils");

module.exports = {
  async handleText(ctx) {
    const userCode = ctx.update.message.text;
    const student = getStudents().find(
      (student) => student[0] == userCode?.toUpperCase()
    );
    if (!student) {
      return ctx.reply("Please provide a valid 6 Digit Code.");
    }
    ctx.reply(`Hey there, ${student[1].split(" ")[0]}!`);
    const res = await downloadPhotos(userCode, ctx);
  },
};
