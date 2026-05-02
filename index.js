function B2_USE_STATIC_DATA() {
  console.log("B2_STATIC_DATA_OK");

  return [
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
}

function B3_FILTER_TRASH(products) {
  const clean = products.filter(p => {
    const name = p.name.toLowerCase();

    return !(
      name.includes("thư cảm ơn") ||
      name.includes("quà tặng") ||
      name.includes("thank") ||
      name.includes("gift")
    );
  });

  console.log("B3_FILTER_TRASH_OK");
  return clean;
}

const rawData = B2_USE_STATIC_DATA();
const cleanData = B3_FILTER_TRASH(rawData);

console.log("RAW:", rawData.length);
console.log("CLEAN:", cleanData.length);
console.log(cleanData);
