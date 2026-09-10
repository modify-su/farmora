let cartCount = 0;

function addToCart() {
  cartCount++;
  document.getElementById("cart-count").textContent = cartCount;
}

// ตัวอย่าง: เมื่อกดปุ่มสั่งซื้อสินค้า
const buyButton = document.getElementById("buy-button");
if (buyButton) {
  buyButton.addEventListener("click", addToCart);
}
