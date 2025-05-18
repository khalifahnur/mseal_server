
function generateOrderId() {
  const date = new Date();
  const datePrefix = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${datePrefix}-${randomSuffix}`;
}

module.exports = generateOrderId;
