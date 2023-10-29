module.exports = {
  async handleStart(ctx) {
    const userId = ctx.from.id;
    ctx.session[userId] = undefined;
    ctx.reply(
      "Hello! Interested in viewing the fantastic photos captured of you during SEF2023? Please share your unique 6-digit code to access them."
    );
  },
};
