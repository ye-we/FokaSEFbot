const { google } = require("googleapis");
const apikeys = require("../apikeys.json");
let students = [];

module.exports = {
  async authorize() {
    const SCOPE = ["https://www.googleapis.com/auth/drive"];
    const jwtClient = new google.auth.JWT(
      apikeys.client_email,
      null,
      apikeys.private_key,
      SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
  },
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/ /g, "-") // replaces all spaces with hyphens.
      .replace(/--+/g, "-"); // collapses any consecutive hyphens into a single hyphen.
  },
  chunkArray(arr, chunkSize) {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunkedArray.push(arr.slice(i, i + chunkSize));
    }
    return chunkedArray;
  },
  getStudents: () => students,
  setStudents: (value) => {
    students = value;
  },
};
