import { google } from "googleapis";

const SPREADSHEET_ID = "1M5RCNcFkoA89vJWdTv7Xr7NaUHxIdE4bzZ8gLNmMS1M";

function B2_USE_STATIC_DATA() {
  console.log("B2_STATIC_DATA_OK");
  return [
    { name: "Thư cảm ơn quý khách hàng", price: "50.000 ₫", sold: 12173 },
    { name: "MILAI Mua 7 hộp...", price: "27.731 ₫", sold: 8983 },
    { name: "Thư cảm ơn quý khách hàng", price: "99.999 ₫", sold: 8869 }
  ];
}

function B3_FILTER_TRASH(products) {
  const clean = products.filter(p => {
    const name = p.name.toLowerCase();
    return !(name.includes("thư cảm ơn") || name.includes("quà tặng"));
  });

  console.log("B3_FILTER_TRASH_OK");
  return clean;
}

async function B4_UPDATE_GOOGLE_SHEETS(products) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const today = new Date().toLocaleDateString("vi-VN");

  const values = products.map(p => [
    today,
    p.name,
    p.price,
    p.sold
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });

  console.log("B4_UPDATE_GOOGLE_SHEETS_OK");
}

const rawData = B2_USE_STATIC_DATA();
const cleanData = B3_FILTER_TRASH(rawData);

console.log("RAW:", rawData.length);
console.log("CLEAN:", cleanData.length);

await B4_UPDATE_GOOGLE_SHEETS(cleanData);
