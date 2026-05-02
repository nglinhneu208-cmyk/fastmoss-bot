import { google } from "googleapis";

const SPREADSHEET_ID = "1M5RCNcFkoA89vJWdTv7Xr7NaUHxIdE4bzZ8gLNmMS1M";

async function B1_FETCH_PRODUCTS() {
  console.log("START_FETCH_API");

  const res = await fetch("https://openapi.fastmoss.com/product/v1/rank/topSelling", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FASTMOSS_API_KEY}`
    },
    body: JSON.stringify({
      filter: {
        region: "VN"
      },
      orderby: [
        {
          field: "gmv",
          order: "desc"
        }
      ],
      page: 1,
      pagesize: 100
    })
  });

  const text = await res.text();
  console.log("API_STATUS:", res.status);
  console.log("API_PREVIEW:", text.slice(0, 300));

  const json = JSON.parse(text);

  const list = json.data?.list || json.data?.rank_list || [];

  const products = list.map(p => ({
    id: p.product_id || p.id || "",
    name: p.title || p.name || "",
    price: p.real_price || p.price || "",
    sold: p.sold_count || p.sales || "",
    saleAmount: p.sale_amount || p.gmv || "",
    shop: p.shop_info?.name || p.shop_name || "",
    category: Array.isArray(p.category_name) ? p.category_name.join(", ") : (p.category_name || ""),
    link: p.detail_url || p.product_url || ""
  }));

  console.log("FETCHED:", products.length);
  return products;
}

function B3_FILTER_TRASH(products) {
  const clean = products.filter(p => {
    const name = String(p.name).toLowerCase();

    return !(
      name.includes("thư cảm ơn") ||
      name.includes("cảm ơn") ||
      name.includes("quà tặng") ||
      name.includes("thank") ||
      name.includes("gift")
    );
  });

  console.log("CLEAN:", clean.length);
  return clean;
}

async function B4_UPDATE_GOOGLE_SHEETS(products) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const today = new Date().toLocaleDateString("vi-VN");

  const values = [
    ["date", "id", "name", "price", "sold", "saleAmount", "shop", "category", "link"],
    ...products.map(p => [
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

  console.log("DONE_UPDATE_SHEET");
}

const raw = await B1_FETCH_PRODUCTS();
const clean = B3_FILTER_TRASH(raw);

await B4_UPDATE_GOOGLE_SHEETS(clean);
