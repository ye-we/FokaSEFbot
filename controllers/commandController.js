module.exports = {
  // Handler for when the "/start" command is executed
  async handleStart(ctx) {
    const userId = ctx.from.id;
    // Clear the session data for the user.
    ctx.session[userId] = undefined;
    ctx.reply(
      `
      👋 Hey,

Looking to access your gorgeous photos? 

Just send me your 6-digit code, and I'll retrieve them for you right away.

Memories are waiting ...
      `
    );
  },
};
