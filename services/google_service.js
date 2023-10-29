const { google } = require("googleapis");
const fs = require("fs");
const fsPromise = require("fs").promises;
const util = require("util");
const spreadsheetId = process.env.SPERADSHEETID;
let students = [];
const sharp = require("sharp");
const { authorize, slugify, chunkArray } = require("../utils/utils");
const mkdirAsync = util.promisify(fsPromise.mkdir);

module.exports = {
  async loadFromSheets() {
    // Get authenticated using the credentials you get form google
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();
    const googleSheets = google.sheets({
      version: "v4",
      auth: client,
    });
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Graduates",
    });
    return getRows.data.values;
  },
  async downloadPhotos(code, ctx) {
    try {
      console.log(ctx.message, code);
      // Get authorized using the service credentials you got from google
      const client = await authorize();
      const drive = google.drive({ version: "v3", auth: client });

      // Get all the folders under the paren folder you provided id for
      const subfoldersResponse = await drive.files.list({
        q: `'${process.env.PARENT_FOLDER}' in parents and mimeType='application/vnd.google-apps.folder'`, // query to get all sub folders under the parent folder
      });
      const subFolders = subfoldersResponse.data.files;

      // Get the student folder based on the provided 6-digit code
      const studentFolder = subFolders.find((student) =>
        student.name.startsWith(code.trim().toUpperCase())
      );

      // Initialize the album array, which will be filled by an inputMediaPhoto
      let album = [];
      // Find all the images inside the student folder
      const imagesResponse = await drive.files.list({
        q: `'${studentFolder.id}' in parents and mimeType='image/jpeg'`,
      });
      const imageFiles = imagesResponse.data.files;
      // Create a folder to store the raw images
      await mkdirAsync(`./images/${code}`);
      // Create a folder to store resized version of the images
      await mkdirAsync(`./images/${code}/resized`);
      let i = 0;
      for (const imageFile of imageFiles) {
        // Get streamable image content
        const imageContent = await drive.files.get(
          { fileId: imageFile.id, alt: "media" },
          { responseType: "stream" }
        );
        // Download and store the raw image
        const destPath = `./images/${code}/${slugify(imageFile.name)}`;
        const destStream = fs.createWriteStream(destPath);
        await imageContent.data.pipe(destStream);

        await new Promise((resolve, reject) => {
          destStream.on("finish", resolve);
          destStream.on("error", reject);
        });

        // Resize the image
        sharp(destPath)
          .resize(4600, 4400)
          .toFile(
            `./images/${code}/resized/${slugify(imageFile.name)}`,
            async (err, info) => {
              if (err) {
                console.error("Error resizing image:", err);
              } else {
                const imageStream = fs.createReadStream(
                  `./images/${code}/resized/${slugify(imageFile.name)}`
                );

                // Push inputMediaPhoto
                album.push({
                  type: "photo",
                  media: { source: imageStream },
                  caption:
                    i == imageFiles.length - 1
                      ? `
                      🎉 Here they are! Resized a bit but, fresh like they were taken yesterday.

Click <a href='https://drive.google.com/drive/folders/${studentFolder.id}'>here</a> to get them in their original high quality version from your dedicated Photo Album.
                      
                      `
                      : "",
                  parse_mode: "HTML",
                });
                // Update the last message sent by the bot to show the progress of the image upload
                ctx.telegram.editMessageText(
                  ctx.chat.id,
                  ctx.message.message_id + 1, // +1 since ctx.message.message_id will return the message id of the last text the user send, not the bot
                  null,
                  `Uploading [${i + 1} / ${imageFiles.length}] photos...⌛`
                );
                if (i == imageFiles.length - 1) {
                  // Delete the last message of the bot after uploading the last image
                  await ctx.telegram.deleteMessage(
                    ctx.chat.id,
                    ctx.message.message_id + 1
                  );
                  const chatId = ctx.update.message.chat.id;
                  // Organize the images in a group of 10 or less
                  const groupedArray = chunkArray(album, 10);
                  for (let i = 0; i < groupedArray.length; i++) {
                    // Send each grouped images to the user
                    await ctx.telegram.sendMediaGroup(chatId, groupedArray[i]);
                  }
                  // Delete the folder and it's content created to temporarily store the student image
                  fs.rm(`./images/${code}`, { recursive: true }, (err) => {
                    if (err) {
                      console.error(`Error deleting folder: ${err}`);
                    } else {
                      console.log(`Folder and its contents deleted.`);
                    }
                  });
                }
                i += 1;
              }
            }
          );
      }
    } catch (e) {
      console.log(e);
    }
  },
};
