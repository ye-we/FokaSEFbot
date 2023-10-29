const { downloadPhotos } = require("../services/google_service");
const { getStudents } = require("../utils/utils");

module.exports = {
  // Handler for when any text is sent to the bot
  async handleText(ctx) {
    const userId = ctx.from.id;
    const userText = ctx.update.message.text;
    let currentUser = ctx.session[userId];
    if (!currentUser) {
      // Store the user in the session
      ctx.session[userId] = {};
      ctx.session[userId].step = 1;
    }
    // If the user only provided their code
    if (ctx.session[userId].step == 1) {
      // Check whether or not the 6-digit code the user sent is valid (checked against the student data loaded from google-sheets)
      const student = getStudents().find(
        (student) => student[0] == userText?.toUpperCase()
      );
      if (!student) {
        return ctx.reply("Please provide a valid 6 Digit Code.");
      }
      // Store the Fullname and the 6-digit code in the users session
      ctx.session[userId].name = student[1];
      ctx.session[userId].code = userText.toUpperCase();
      ctx.session[userId].step += 1;
      return ctx.reply(
        "Hey there, can you provide your grand father's name as written on your certificate?"
      );
    }
    // If the user has provided their code and grand father's name
    else if (ctx.session[userId].step == 2) {
      const student = ctx.session[userId];
      // Check if the provided grand father name is valid (checked against the student data loaded from google-sheets)
      if (student.name.split(" ")[2] == userText.toUpperCase()) {
        ctx.reply(
          `Getting your awesome photos, ${student.name.split(" ")[0]}!`
        );
        // Clear the session for the user
        ctx.session[userId] = undefined;
        // Call the asynchronous(non-blocking) function to download and upload the photos
        downloadPhotos(student.code, ctx);
      } else {
        ctx.reply(
          `That's not a matching grand father's name for the 6-digit code your provided, please try again`
        );
      }
    }
  },
};
