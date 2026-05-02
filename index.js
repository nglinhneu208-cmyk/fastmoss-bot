import { google } from "googleapis";

const SPREADSHEET_ID = "1M5RCNcFkoA89vJWdTv7Xr7NaUHxIdE4bzZ8gLNmMS1M";

async function B1_FETCH_100_PRODUCTS() {
  console.log("START_FETCH_100");

  let allProducts = [];

  for (let page = 1; page <= 10; page++) {
    const url = `https://www.fastmoss.com/api/goods/saleRank?page=${page}&pagesize=10&order=1,2&region=VN&_time=1777696684&cnonce=53296119`;

    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "referer": "https://www.fastmoss.com/vi/e-commerce/saleslist?region=VN"
      }
    });

    const json = await res.json();

    const products = json.data.rank_list.map(p => ({
      id: p.product_id,
      name: p.title,
      price: p.real_price,
      sold: p.sold_count,
      saleAmount: p.sale_amount,
      shop: p.shop_info?.name || "",
      category: p.category_name?.join(", ") || "",
      link: p.detail_url
    }));

    console.log(`PAGE_${page}_OK:`, products.length);
    allProducts = allProducts.concat(products);
  }

  console.log("B1_FETCH_100_PRODUCTS_OK");
  console.log("TOTAL_FETCHED:", allProducts.length);

  return allProducts;
}

function B3_FILTER_TRASH(products) {
  const clean = products.filter(p => {
    const name = p.name.toLowerCase();

    return !(
      name.includes("thư cảm ơn") ||
      name.includes("cảm ơn") ||
      name.includes("quà tặng") ||
      name.includes("thank") ||
      name.includes("gift")
    );
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

  const uniqueProducts = [];
  const seen = new Set();

  for (const p of products) {
    if (seen.has(p.id)) continue;
    if (!p.link.includes("region=VN")) continue;

    seen.add(p.id);
    uniqueProducts.push(p);
  }

  const values = [
    ["date", "id", "name", "price", "sold", "saleAmount", "shop", "category", "link"],
    ...uniqueProducts.map(p => [
      today,
      p.id,
      p.name,
      p.price,
      p.sold,
      p.saleAmount,
      p.shop,
      p.category,
      p.link
    ])
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:I"
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });

  console.log("B4_UPDATE_GOOGLE_SHEETS_OK");
  console.log("FINAL_ROWS:", uniqueProducts.length);
}

const rawData = await B1_FETCH_100_PRODUCTS();
const cleanData = B3_FILTER_TRASH(rawData);

console.log("RAW:", rawData.length);
console.log("CLEAN:", cleanData.length);

await B4_UPDATE_GOOGLE_SHEETS(cleanData);
