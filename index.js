async function B1_FETCH_DATA_REAL() {
  console.log("START_FETCH");

  let allProducts = [];

  for (let page = 1; page <= 10; page++) {
    const url = `API_URL_CỦA_BẠN&page=${page}`;

    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    });

    const json = await res.json();

    const products = json.data.rank_list.map(p => ({
      name: p.title,
      price: p.real_price,
      sold: p.sold_count,
      link: p.detail_url
    }));

    allProducts = allProducts.concat(products);
  }

  console.log("B1_FETCH_DATA_REAL_OK");
  return allProducts;
}

// test
const data = await B1_FETCH_DATA_REAL();
console.log("TOTAL:", data.length);
function B2_USE_STATIC_DATA() {
  console.log("B2_STATIC_DATA_OK");

  const data = [
    {
      name: "Thư cảm ơn quý khách hàng",
      price: "50.000 ₫",
      sold: 12173
    },
    {
      name: "MILAI Mua 7 hộp...",
      price: "27.731 ₫",
      sold: 8983
    },
    {
      name: "Thư cảm ơn quý khách hàng",
      price: "99.999 ₫",
      sold: 8869
    }
  ];

  return data;
}
function B3_FILTER_TRASH(products) {
  const clean = products.filter(p => {
    const name = p.name.toLowerCase();

    return !(
      name.includes("thư cảm ơn") ||
      name.includes("quà tặng")
    );
  });

  console.log("B3_FILTER_TRASH_OK");
  return clean;
}
const data = B2_USE_STATIC_DATA();
const clean = B3_FILTER_TRASH(data);

console.log("RAW:", data.length);
console.log("CLEAN:", clean.length);
console.log(clean);
