// CONFIG BÁSICA
const CONFIG = {
  establishmentName: "Guete-shop",
  whatsappNumber: "5515998318168", // ex: "5511999999999"
};

// PRODUTOS GUETE
const PRODUCTS = [
  // COMBOS (GUETES)
  {
    id: 1,
    name: "Moran-Guete",
    description:
      "Guete original da casa com morango, cobertura especial e granulado crocante.",
    price: 29.9,
    category: "combos",
    icon: "🍓",
    tag: "Mais pedido",
    featured: true,
  },
  {
    id: 2,
    name: "Choco-Guete",
    description:
      "Base cremosa com muito chocolate, calda extra e finalização com raspas.",
    price: 27.9,
    category: "combos",
    icon: "🍫",
  },
  {
    id: 3,
    name: "Caramel-Guete",
    description:
      "Guete com caramelo artesanal, toque de flor de sal e crocante de açúcar.",
    price: 28.9,
    category: "combos",
    icon: "🍮",
  },
  {
    id: 4,
    name: "Blue-Guete",
    description:
      "Versão azul da Guete, sabor bubblegum/blue ice com cobertura azul clara.",
    price: 30.9,
    category: "combos",
    icon: "🔵",
  },
  {
    id: 5,
    name: "Weed-Guete",
    description:
      "Guete temática verde, sabor menta/limão, visual marcante e refrescante.",
    price: 31.9,
    category: "combos",
    icon: "🌿",
  },

  // PORÇÕES
  {
    id: 6,
    name: "Batata Guete Box",
    description:
      "Porção de batata frita crocante para acompanhar qualquer Guete.",
    price: 15.9,
    category: "porções",
    icon: "🍟",
  },
  {
    id: 7,
    name: "Guete Bites",
    description:
      "Pedacinhos crocantes para compartilhar, com mix de molhos da casa.",
    price: 19.9,
    category: "porções",
    icon: "🧆",
  },

  // BEBIDAS
  {
    id: 8,
    name: "Refrigerante Lata",
    description: "Lata 350ml – sabores variados.",
    price: 6.0,
    category: "bebidas",
    icon: "🥤",
  },
  {
    id: 9,
    name: "Milkshake Guete 500ml",
    description:
      "Milkshake cremoso nos sabores chocolate, morango ou baunilha.",
    price: 18.9,
    category: "bebidas",
    icon: "🧋",
  },

  // SOBREMESAS
  {
    id: 10,
    name: "Guete Sundae",
    description: "Taça de sorvete com calda, farofa crocante e topping extra.",
    price: 17.9,
    category: "sobremesas",
    icon: "🍨",
  },
  {
    id: 11,
    name: "Brownie Guete",
    description:
      "Brownie de chocolate denso com toque da casa e opção com sorvete.",
    price: 16.5,
    category: "sobremesas",
    icon: "🍰",
  },
];

// Estado do carrinho
let cart = {};
let currentCategory = "todos";
let lastOrderText = "";
let ordersHistory = [];

// Utils
const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const calculateCartTotals = () => {
  let itemCount = 0;
  let total = 0;

  Object.values(cart).forEach((item) => {
    itemCount += item.quantity;
    total += item.quantity * item.product.price;
  });

  return { itemCount, total };
};

const getOrderNumber = () => {
  const key = "selfCheckoutOrderNumber";
  const current = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, current);
  return String(current).padStart(3, "0");
};

const formatDateTime = (date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} às ${time}`;
};

// RENDERIZAÇÃO DE FILTROS
const renderCategoryFilters = () => {
  const container = document.getElementById("categoryFilters");
  const categories = ["todos", ...new Set(PRODUCTS.map((p) => p.category))];

  container.innerHTML = "";
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "filter-chip" + (cat === currentCategory ? " active" : "");
    chip.dataset.category = cat;
    chip.innerHTML = `
      <span class="dot"></span>
      <span>${
        cat === "todos" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)
      }</span>
    `;
    chip.addEventListener("click", () => {
      currentCategory = cat;
      renderCategoryFilters();
      renderProducts();
    });
    container.appendChild(chip);
  });
};

// RENDERIZAÇÃO DE PRODUTOS
const renderProducts = () => {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  const productsToShow =
    currentCategory === "todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === currentCategory);

  productsToShow.forEach((product) => {
    const card = document.createElement("article");
    card.className =
      "product-card" + (product.featured ? " product-card-featured" : "");

    card.innerHTML = `
      ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ""}
      <div class="product-image">${product.icon || "🛒"}</div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
      </div>
      <div class="product-footer">
        <span class="product-price">${formatCurrency(product.price)}</span>
        <button class="product-add" type="button">
          <span>+</span>
          <span>Adicionar</span>
        </button>
      </div>
    `;

    const addButton = card.querySelector(".product-add");
    addButton.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    grid.appendChild(card);
  });
};

// CARRINHO
const addToCart = (productId) => {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  if (!cart[productId]) {
    cart[productId] = { product, quantity: 0 };
  }
  cart[productId].quantity += 1;
  renderCart();
};

const removeFromCart = (productId) => {
  if (!cart[productId]) return;

  cart[productId].quantity -= 1;
  if (cart[productId].quantity <= 0) {
    delete cart[productId];
  }
  renderCart();
};

const renderCart = () => {
  const container = document.getElementById("cartItems");
  const { itemCount, total } = calculateCartTotals();
  const itemCountEl = document.getElementById("cartItemCount");
  const totalEl = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton");

  container.innerHTML = "";

  if (itemCount === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Seu carrinho está vazio";
    container.appendChild(empty);
    checkoutButton.disabled = true;
  } else {
    Object.values(cart).forEach(({ product, quantity }) => {
      const item = document.createElement("div");
      item.className = "cart-item";

      const subtotal = product.price * quantity;

      item.innerHTML = `
        <div class="cart-item-main">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-meta">
            ${formatCurrency(product.price)} • ${quantity} un.
          </div>
          <div class="cart-item-price">Subtotal: ${formatCurrency(
            subtotal
          )}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty-controls">
            <button class="btn-circle" type="button" data-action="decrease">-</button>
            <span class="cart-qty-value">${quantity}</span>
            <button class="btn-circle" type="button" data-action="increase">+</button>
          </div>
          <div class="cart-item-total">${formatCurrency(subtotal)}</div>
        </div>
      `;

      const decreaseBtn = item.querySelector('[data-action="decrease"]');
      const increaseBtn = item.querySelector('[data-action="increase"]');

      decreaseBtn.addEventListener("click", () => removeFromCart(product.id));
      increaseBtn.addEventListener("click", () => addToCart(product.id));

      container.appendChild(item);
    });

    checkoutButton.disabled = false;
  }

  itemCountEl.textContent = itemCount;
  totalEl.textContent = formatCurrency(total);
};

// MODAL
const openCheckoutModal = () => {
  const modal = document.getElementById("checkoutModal");
  const { itemCount, total } = calculateCartTotals();

  document.getElementById("modalItemCount").textContent = itemCount;
  document.getElementById("modalTotalAmount").textContent =
    formatCurrency(total);

  // limpa campos
  document.getElementById("customerName").value = "";
  document.getElementById("orderNote").value = "";
  document.getElementById("tableNumber").value = "";
  const pickupOption = document.getElementById("pickupOption");
  const tableNumberGroup = document.getElementById("tableNumberGroup");
  pickupOption.value = "balcão";
  tableNumberGroup.style.display = "none";

  // mostra view de checkout e esconde view de sucesso
  const checkoutView = document.getElementById("checkoutView");
  const successView = document.getElementById("successView");
  checkoutView.style.display = "block";
  successView.classList.remove("active");

  modal.classList.add("open");

  const modalElement = document.querySelector(".modal");
  if (modalElement && modalElement.scrollTo) {
    modalElement.scrollTo(0, 0);
  }
};

const closeCheckoutModal = () => {
  const modal = document.getElementById("checkoutModal");
  modal.classList.remove("open");
};

// TEXTO DO PEDIDO
const generateOrderText = ({ name, note, pickupOption, tableNumber }) => {
  const { total } = calculateCartTotals();
  const orderNumber = document.getElementById("orderNumber").textContent;

  let text = `*${CONFIG.establishmentName}*%0A`;
  text += `Pedido nº *${orderNumber}*%0A`;
  text += `Cliente: *${name}*%0A`;
  text += `Retirada: *${pickupOption}`;
  if (pickupOption === "mesa" && tableNumber) {
    text += ` ${tableNumber}`;
  }
  text += `*%0A%0A`;

  text += `*Itens:*%0A`;
  Object.values(cart).forEach(({ product, quantity }) => {
    const subtotal = product.price * quantity;
    text += `- ${quantity}x ${product.name} — ${formatCurrency(subtotal)}%0A`;
  });

  text += `%0A*Total:* ${formatCurrency(total)}%0A`;

  if (note && note.trim()) {
    text += `%0A*Observações:* ${note.trim()}%0A`;
  }

  return decodeURIComponent(text);
};

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  const orderNumberEl = document.getElementById("orderNumber");
  orderNumberEl.textContent = getOrderNumber();

  renderCategoryFilters();
  renderProducts();
  renderCart();

  const checkoutButton = document.getElementById("checkoutButton");
  const cancelCheckout = document.getElementById("cancelCheckout");
  const modalBackdrop = document.getElementById("checkoutModal");
  const checkoutForm = document.getElementById("checkoutForm");
  const pickupOption = document.getElementById("pickupOption");
  const tableNumberGroup = document.getElementById("tableNumberGroup");
  const copyOrderTextButton = document.getElementById("copyOrderTextButton");
  const orderResult = document.getElementById("orderResult");
  const closeSuccess = document.getElementById("closeSuccess");
  const openOrdersButton = document.getElementById("openOrdersButton");
  const ordersModal = document.getElementById("ordersModal");
  const closeOrders = document.getElementById("closeOrders");

  checkoutButton.addEventListener("click", openCheckoutModal);
  cancelCheckout.addEventListener("click", closeCheckoutModal);

  closeSuccess.addEventListener("click", () => {
    closeCheckoutModal();
  });

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeCheckoutModal();
    }
  });

  pickupOption.addEventListener("change", (e) => {
    if (e.target.value === "mesa") {
      tableNumberGroup.style.display = "flex";
    } else {
      tableNumberGroup.style.display = "none";
    }
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const note = document.getElementById("orderNote").value.trim();
    const pickupOption = document.getElementById("pickupOption");
    const pickup = pickupOption.value;
    const tableNumber = document.getElementById("tableNumber").value.trim();

    if (!name) return;

    const { total } = calculateCartTotals();
    const orderNumber = document.getElementById("orderNumber").textContent;

    // snapshot dos itens antes de limpar carrinho
    const itemsSnapshot = Object.values(cart).map(({ product, quantity }) => ({
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
    }));

    // label bonitinho da retirada
    const pickupLabel =
      pickup === "mesa" && tableNumber
        ? `Mesa ${tableNumber}`
        : pickup.charAt(0).toUpperCase() + pickup.slice(1);

    // texto completo do pedido
    const orderText = generateOrderText({
      name,
      note,
      pickupOption: pickup,
      tableNumber,
    });
    lastOrderText = orderText;

    const orderTextArea = document.getElementById("orderText");
    orderTextArea.value = orderText;

    // preenche view de sucesso (aquela que você já tem)
    document.getElementById(
      "successOrderNumber"
    ).textContent = `#${orderNumber}`;
    document.getElementById("successCustomerName").textContent = name;
    document.getElementById("successTotal").textContent = formatCurrency(total);
    document.getElementById("successPickup").textContent = pickupLabel;

    const checkoutView = document.getElementById("checkoutView");
    const successView = document.getElementById("successView");
    checkoutView.style.display = "none";
    successView.classList.add("active");

    // salva no histórico
    ordersHistory.unshift({
      id: orderNumber,
      customerName: name,
      total,
      pickupLabel,
      note,
      datetime: new Date().toISOString(),
      items: itemsSnapshot,
      text: orderText,
    });
    renderOrdersList();

    // zera carrinho
    cart = {};
    renderCart();

    const modalElement = document.querySelector(".modal");
    if (modalElement && modalElement.scrollTo) {
      modalElement.scrollTo(0, 0);
    }

    // se quiser abrir o Whats automaticamente, descomenta:
    if (CONFIG.whatsappNumber) {
      const url = `https://wa.me/${
        CONFIG.whatsappNumber
      }?text=${encodeURIComponent(orderText)}`;
      window.open(url, "_blank");
    }
  });

  // copiar texto do pedido
  copyOrderTextButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(lastOrderText);
      copyOrderTextButton.textContent = "Copiado!";
      setTimeout(() => {
        copyOrderTextButton.textContent = "Copiar pedido";
      }, 1500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  });

  // abre modal de histórico
  openOrdersButton.addEventListener("click", () => {
    ordersModal.classList.add("open");
    renderOrdersList();
  });

  // fecha modal de histórico
  closeOrders.addEventListener("click", () => {
    ordersModal.classList.remove("open");
  });

  // clicar fora fecha modal de histórico
  ordersModal.addEventListener("click", (e) => {
    if (e.target === ordersModal) {
      ordersModal.classList.remove("open");
    }
  });
});

const renderOrdersList = () => {
  const listEl = document.getElementById("ordersList");
  const detailEl = document.getElementById("ordersDetail");
  if (!listEl || !detailEl) return;

  listEl.innerHTML = "";

  if (ordersHistory.length === 0) {
    listEl.innerHTML =
      '<p class="orders-empty">Nenhum pedido registrado ainda.</p>';
    detailEl.innerHTML =
      '<p class="orders-empty">Selecione um pedido para ver o resumo.</p>';
    return;
  }

  ordersHistory.forEach((order, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "order-row";
    btn.innerHTML = `
      <div class="order-row-main">
        <span class="order-row-id">#${order.id}</span>
        <span class="order-row-name">${order.customerName}</span>
      </div>
      <div class="order-row-meta">
        <span>${formatDateTime(order.datetime)}</span>
        <span>${formatCurrency(order.total)}</span>
      </div>
    `;
    btn.addEventListener("click", () => showOrderDetail(order));
    listEl.appendChild(btn);

    // seleciona o primeiro por padrão
    if (index === 0) {
      showOrderDetail(order);
    }
  });
};

const showOrderDetail = (order) => {
  const detailEl = document.getElementById("ordersDetail");
  if (!detailEl) return;

  const itemsHtml =
    order.items && order.items.length
      ? `<ul>${order.items
          .map(
            (item) =>
              `<li>${item.quantity}x ${item.name} — ${formatCurrency(
                item.subtotal
              )}</li>`
          )
          .join("")}</ul>`
      : '<p class="orders-empty">Sem itens registrados.</p>';

  detailEl.innerHTML = `
    <h3>Resumo do pedido</h3>
    <div class="success-summary">
      <div class="success-row">
        <span>Pedido:</span>
        <span>#${order.id}</span>
      </div>
      <div class="success-row">
        <span>Cliente:</span>
        <span>${order.customerName}</span>
      </div>
      <div class="success-row">
        <span>Total:</span>
        <span>${formatCurrency(order.total)}</span>
      </div>
      <div class="success-row">
        <span>Retirada:</span>
        <span>${order.pickupLabel}</span>
      </div>
    </div>

    <div class="orders-items">
      <h4>Itens</h4>
      ${itemsHtml}
    </div>

    <div class="modal-actions" style="margin-top:10px;justify-content:flex-start;">
      <button type="button" class="btn-outline" id="copyOrderFromHistory">
        Copiar pedido
      </button>
    </div>
  `;

  const copyBtn = document.getElementById("copyOrderFromHistory");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(order.text);
        copyBtn.textContent = "Copiado!";
        setTimeout(() => {
          copyBtn.textContent = "Copiar pedido";
        }, 1500);
      } catch (err) {
        console.error("Erro ao copiar:", err);
      }
    });
  }
};
