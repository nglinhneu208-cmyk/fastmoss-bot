import { google } from "googleapis";

const SPREADSHEET_ID = "1M5RCNcFkoA89vJWdTv7Xr7NaUHxIdE4bzZ8gLNmMS1M";

async function B1_FETCH_PRODUCTS() {
  console.log("START_FETCH_API");

  const res = await fetch("https://developers.fastmoss.com/product/v1/rank/topSelling", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FASTMOSS_API_KEY}`
    },
    body: JSON.stringify({
      page: 1,
      pagesize: 100
    })
  });

  const json = await res.json();

  const products = json.data.list.map(p => ({
    id: p.product_id,
    name: p.title,
    price: p.price,
    sold: p.sold_count,
    shop: p.shop_name || "",
    link: p.detail_url
  }));

  console.log("FETCHED:", products.length);

  return products;
}

function B3_FILTER_TRASH(products) {
  return products.filter(p => {
    const name = p.name.toLowerCase();

    return !(
      name.includes("thư cảm ơn") ||
      name.includes("quà tặng") ||
      name.includes("gift")
    );
  });
}

async function B4_UPDATE_GOOGLE_SHEETS(products) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const today = new Date().toLocaleDateString("vi-VN");

  const values = [
    ["date", "id", "name", "price", "sold", "shop", "link"],
    ...products.map(p => [
      today,
      p.id,
      p.name,
      p.price,
      p.sold,
      p.shop,
      p.link
    ])
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:G"
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });

  console.log("DONE_UPDATE_SHEET");
}

const raw = await B1_FETCH_PRODUCTS();
const clean = B3_FILTER_TRASH(raw);

await B4_UPDATE_GOOGLE_SHEETS(clean);
