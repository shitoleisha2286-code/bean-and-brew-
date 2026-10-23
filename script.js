const drinkPrices = { Espresso:2.50, Latte:3.50, Cappuccino:3.75, Matcha:4.00, Chai:3.25 };
const sizePrices = { Small:0, Medium:0.50, Large:1.00 };
const milkPrices = { Regular:0, Oat:0.50, Almond:0.40, Soy:0.35, "No Milk":0 };
const extraPrices = { "Extra Shot":0.75, "Vanilla Syrup":0.60, "Caramel Syrup":0.60, "Whipped Cream":0.50 };
const descriptions = {
  Espresso:"Bold, rich, and beautifully simple.", Latte:"Smooth espresso wrapped in silky milk.",
  Cappuccino:"A classic with a soft, foamy finish.", Matcha:"Earthy, mellow, and a little different.", Chai:"Warm spices in a comforting cup."
};

// The current cup being customized.
const order = { drink:"Espresso", size:"Medium", milk:"Regular", extras:[] };
// Each click on Add to cart saves a separate coffee here.
let cart = [];
let nextId = 1;

const orderLines = document.querySelector("#orderLines");
const currentPrice = document.querySelector("#currentPrice");
const totalPrice = document.querySelector("#totalPrice");
const previewDrink = document.querySelector("#previewDrink");
const previewDescription = document.querySelector("#previewDescription");
const coffeeLiquid = document.querySelector("#coffeeLiquid");
const cup = document.querySelector("#cup");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const toast = document.querySelector("#toast");

function money(amount) { return "$" + amount.toFixed(2); }

function getCurrentTotal() {
  let total = drinkPrices[order.drink] + sizePrices[order.size] + milkPrices[order.milk];
  order.extras.forEach(function(extra) { total += extraPrices[extra]; });
  return total;
}

function addOrderLine(label, price) {
  const row = document.createElement("div");
  row.className = "order-line";
  const name = document.createElement("span"); name.textContent = label;
  const amount = document.createElement("span");
  amount.textContent = price === 0 ? "Included" : "+" + money(price);
  row.append(name, amount); orderLines.appendChild(row);
}

function renderCurrentOrder() {
  orderLines.innerHTML = "";
  addOrderLine(order.drink, drinkPrices[order.drink]);
  addOrderLine(order.size, sizePrices[order.size]);
  addOrderLine(order.milk + " milk", milkPrices[order.milk]);
  order.extras.forEach(function(extra) { addOrderLine(extra, extraPrices[extra]); });
  currentPrice.textContent = money(getCurrentTotal());
  previewDrink.textContent = order.drink;
  previewDescription.textContent = descriptions[order.drink];

  const drinkColors = {
    Espresso:"linear-gradient(90deg,#251008,#4b2413 48%,#1d0c06)",
    Latte:"linear-gradient(90deg,#7a4c2d,#b98558 48%,#5d351f)",
    Cappuccino:"linear-gradient(90deg,#8c5b37,#d2a779 48%,#70452a)",
    Matcha:"linear-gradient(90deg,#344b25,#708b45 48%,#26391c)",
    Chai:"linear-gradient(90deg,#6a3218,#a65b2b 48%,#4a2111)"
  };
  coffeeLiquid.style.background = drinkColors[order.drink];

  // The cup visibly shrinks/grows when the selected size changes.
  const cupScales = { Small:0.78, Medium:1, Large:1.18 };
  cup.style.setProperty("--cup-scale", cupScales[order.size]);
  document.querySelectorAll("[data-drink]").forEach(function(button) {
    button.classList.toggle("selected", button.dataset.drink === order.drink);
  });
  document.querySelectorAll("[data-size]").forEach(function(button) {
    button.classList.toggle("selected", button.dataset.size === order.size);
  });
  document.querySelectorAll(".check-choice").forEach(function(label) {
    label.style.color = label.querySelector("input").checked ? "#694631" : "#a58b7b";
  });
}

function renderCart() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart"; empty.textContent = "Your cart is waiting for something lovely ☁️";
    cartItems.appendChild(empty);
  }
  cart.forEach(function(item) {
    const card = document.createElement("div"); card.className = "cart-item";
    const info = document.createElement("div");
    const title = document.createElement("div"); title.className = "cart-item-title";
    title.textContent = item.size + " " + item.drink;
    const details = document.createElement("div"); details.className = "cart-item-details";
    details.textContent = item.milk + " milk" + (item.extras.length ? " · " + item.extras.join(", ") : "");
    info.append(title, details);
    const price = document.createElement("div"); price.className = "cart-item-price"; price.textContent = money(item.price);
    const spacer = document.createElement("div");
    const remove = document.createElement("button"); remove.className = "remove-item";
    remove.type = "button"; remove.textContent = "Remove ×";
    remove.addEventListener("click", function() {
      cart = cart.filter(function(cartItem) { return cartItem.id !== item.id; });
      renderCart(); showToast("Coffee removed from your cart.");
    });
    card.append(info, price, spacer, remove); cartItems.appendChild(card);
  });
  cartCount.textContent = cart.length + (cart.length === 1 ? " item" : " items");
  totalPrice.textContent = money(cart.reduce(function(sum, item) { return sum + item.price; }, 0));
}

// Click handlers update the selected options.
document.querySelectorAll("[data-drink]").forEach(function(button) {
  button.addEventListener("click", function() { order.drink = button.dataset.drink; renderCurrentOrder(); });
});
document.querySelectorAll("[data-size]").forEach(function(button) {
  button.addEventListener("click", function() { order.size = button.dataset.size; renderCurrentOrder(); });
});
document.querySelectorAll('input[name="milk"]').forEach(function(input) {
  input.addEventListener("change", function() { order.milk = input.value; renderCurrentOrder(); });
});
document.querySelectorAll('#extraChoices input[type="checkbox"]').forEach(function(input) {
  input.addEventListener("change", function() {
    if (input.checked) order.extras.push(input.value);
    else order.extras = order.extras.filter(function(extra) { return extra !== input.value; });
    renderCurrentOrder();
  });
});

document.querySelector("#addOrderButton").addEventListener("click", function() {
  cart.push({ id:nextId++, drink:order.drink, size:order.size, milk:order.milk, extras:[...order.extras], price:getCurrentTotal() });
  renderCart(); showToast(order.size + " " + order.drink + " added to your cart ♥");
});

document.querySelector("#placeOrderButton").addEventListener("click", function() {
  if (cart.length === 0) { showToast("Add a coffee to your cart first ☕"); return; }
  const count = cart.length;
  const amount = cart.reduce(function(sum, item) { return sum + item.price; }, 0);
  showToast("Order placed! " + count + (count === 1 ? " coffee · " : " coffees · ") + money(amount) + " ♥");
  cart = []; renderCart();
});

document.querySelector("#resetButton").addEventListener("click", function() {
  order.drink = "Espresso"; order.size = "Medium"; order.milk = "Regular"; order.extras = [];
  document.querySelectorAll('#extraChoices input[type="checkbox"]').forEach(function(input) { input.checked = false; });
  document.querySelector('input[name="milk"][value="Regular"]').checked = true;
  renderCurrentOrder(); showToast("Fresh cup, fresh start ☁️");
});

let toastTimeout;
function showToast(message) {
  toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function() { toast.classList.remove("show"); }, 2600);
}

renderCurrentOrder(); renderCart();
