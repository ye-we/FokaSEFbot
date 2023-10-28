const { loadFromSheets, getStudents } = require("../utils/utils");

module.exports = {
  async handleStart(ctx) {
    ctx.reply(
      "Hello! Interested in viewing the fantastic photos captured of you during SEF2023? Please share your unique 6-digit code to access them."
    );
  },
};
