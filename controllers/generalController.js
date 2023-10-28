const { loadFromSheets, getStudents } = require("../utils/utils");

module.exports = {
  async handleStart(ctx) {
    ctx.reply(
      "Hello, SEF2023 student, I'm here to provide you with your photos. Could you please share your 6-digit code with me?"
    );
  },
};
