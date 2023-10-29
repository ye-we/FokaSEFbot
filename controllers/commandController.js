module.exports = {
  // Handler for when the "/start" command is executed
  async handleStart(ctx) {
    const userId = ctx.from.id;
    // Clear the session data for the user.
    ctx.session[userId] = undefined;
    ctx.reply(
      "Hello! Interested in viewing the fantastic photos captured of you during SEF2023? Please share your unique 6-digit code to access them."
    );
  },
};
