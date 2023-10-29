const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const apikeys = require("../apikeys.json");
const fs = require("fs");
const { log, Console } = require("console");
const spreadsheetId = process.env.SPERADSHEETID;
let students = [];
const sharp = require("sharp");

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
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/ /g, "-") // replaces all spaces with hyphens.
    .replace(/--+/g, "-"); // collapses any consecutive hyphens into a single hyphen.
}
function chunkArray(arr, chunkSize) {
  const chunkedArray = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunkedArray.push(arr.slice(i, i + chunkSize));
  }
  return chunkedArray;
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
      let album = [];
      const imagesResponse = await drive.files.list({
        q: `'${studentFolder.id}' in parents and mimeType='image/jpeg'`,
      });
      const imageFiles = imagesResponse.data.files;
      ctx.reply(`Uploading ${imageFiles.length} photos...⌛`);
      fs.mkdir(`./images/${code}`, (err) => {
        if (err) {
          console.error(`Error creating folder: ${err}`);
        }
      });
      fs.mkdir(`./images/${code}/resized`, (err) => {
        if (err) {
          console.error(`Error creating folder: ${err}`);
        }
      });
      let i = 0;
      for (const imageFile of imageFiles) {
        const imageContent = await drive.files.get(
          { fileId: imageFile.id, alt: "media" },
          { responseType: "stream" }
        );

        const destPath = `./images/${code}/${slugify(imageFile.name)}`;
        const destStream = fs.createWriteStream(destPath);
        await imageContent.data.pipe(destStream);

        await new Promise((resolve, reject) => {
          destStream.on("finish", resolve);
          destStream.on("error", reject);
        });

        sharp(destPath)
          .resize(4600, 4400)
          .toFile(
            `./images/${code}/resized/${slugify(imageFile.name)}`,
            async (err, info) => {
              if (err) {
                console.error("Error resizing image:", err);
              } else {
                console.log("Image resized successfully.");
                const imageStream = fs.createReadStream(
                  `./images/${code}/resized/${slugify(imageFile.name)}`
                );

                album.push({
                  type: "photo",
                  media: { source: imageStream },
                  caption:
                    i == imageFiles.length - 1
                      ? `Here's your dedicated photo album on google drive: \n https://drive.google.com/drive/folders/${studentFolder.id}`
                      : "",
                });
                if (i == imageFiles.length - 1) {
                  console.log("here");
                  const chatId = ctx.update.message.chat.id;
                  const groupedArray = chunkArray(album, 10);
                  for (let i = 0; i < groupedArray.length; i++) {
                    await ctx.telegram.sendMediaGroup(chatId, groupedArray[i]);
                  }
                  fs.rmdir(`./images/${code}`, { recursive: true }, (err) => {
                    if (err) {
                      console.error(`Error deleting folder: ${err}`);
                    } else {
                      console.log(`Folder and its contents deleted.`);
                    }
                  });
                  fs.rmdir(
                    `./images/${code}/resized`,
                    { recursive: true },
                    (err) => {
                      if (err) {
                        console.error(`Error deleting folder: ${err}`);
                      } else {
                        console.log(`Folder and its contents deleted.`);
                      }
                    }
                  );
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
