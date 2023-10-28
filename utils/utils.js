const { google } = require("googleapis");
const spreadsheetId = process.env.SPERADSHEETID;
let students = [];

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
};
