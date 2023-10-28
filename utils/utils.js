const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const apikeys = require("../apikeys.json");
const fs = require("fs");
const { default: axios } = require("axios");

const spreadsheetId = process.env.SPERADSHEETID;
let students = [];

async function authorize() {
  const SCOPE = ["https://www.googleapis.com/auth/drive"];
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

module.exports = {
  async loadFromSheets() {
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
  getStudents: () => students,
  setStudents: (value) => {
    students = value;
  },

  async downloadPhotos(code, ctx) {
    try {
      const client = await authorize();
      const drive = google.drive({ version: "v3", auth: client });
      const subfoldersResponse = await drive.files.list({
        q: `'${process.env.PARENT_FOLDER}' in parents and mimeType='application/vnd.google-apps.folder'`,
      });
      const subFolders = subfoldersResponse.data.files;
      const studentFolder = subFolders.find((student) =>
        student.name.startsWith(code.trim().toUpperCase())
      );
      const imagesResponse = await drive.files.list({
        q: `'${studentFolder.id}' in parents and mimeType='image/jpeg'`,
      });
      const imageFiles = imagesResponse.data.files;
      ctx.reply(`Uploading ${imageFiles.length} photos...⌛`);
      for (const imageFile of imageFiles) {
        // Download the image
        const imageContent = await drive.files.get(
          { fileId: imageFile.id, alt: "media" },
          { responseType: "stream" }
        );
        console.log(imageContent);
        // const imageUrl = imageContent.data.webContentLink;
        // console.log(imageUrl);
        // const response = await axios.get(imageUrl, { responseType: "stream" });
        // console.log(response);
        // const chatId = ctx.update.message.chat.id;
        // await ctx.telegram.sendPhoto(chatId, { source: response.data });

        const destPath = `./images/${imageFile.name}`;
        const destStream = fs.createWriteStream(destPath);
        imageContent.data.pipe(destStream);

        // Close the write stream to finish downloading the image
        await new Promise((resolve, reject) => {
          destStream.on("finish", resolve);
          destStream.on("error", reject);
        });
        const imageStream = fs.createReadStream(`./images/${imageFile.name}`);
        const chatId = ctx.update.message.chat.id;
        try {
          await ctx.telegram.sendPhoto(chatId, { source: imageStream });
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
};
