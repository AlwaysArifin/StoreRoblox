// script-firebase.js
// Handles product rendering and order submission to Firebase Firestore
document.addEventListener('DOMContentLoaded', () => {
  const productList = document.getElementById('product-list');
  const scrollProducts = document.getElementById('scrollProducts');

  // Modal elements
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal" id="orderModal" aria-hidden="true">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="orderTitle">
        <button class="modal-close" id="closeModal" aria-label="Close">&times;</button>
        <h4 id="orderTitle">Place Order</h4>
        <form id="orderForm" novalidate>
          <input type="hidden" id="productId" name="productId" />
          <div class="form-row">
            <label for="productName">Product</label>
            <input id="productName" name="productName" type="text" readonly />
          </div>
          <div class="form-row">
            <label for="quantity">Quantity</label>
            <input id="quantity" name="quantity" type="number" min="1" value="1" required />
          </div>
          <div class="form-row">
            <label for="method">Payment Method</label>
            <select id="method" name="method" required>
              <option value="">Choose</option>
              <option value="Dana">Dana</option>
              <option value="Gopay">Gopay</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>
          <div class="form-row">
            <label for="buyer">Your Name</label>
            <input id="buyer" name="buyer" type="text" required />
          </div>
          <div class="form-row">
            <label for="note">Note (optional)</label>
            <input id="note" name="note" type="text" />
          </div>
          <div class="form-row">
            <div class="total">Total: <span id="totalPrice">$0.00</span></div>
          </div>
          <div class="form-actions">
            <button type="submit">Submit Order</button>
          </div>
          <div id="formMsg" class="form-msg" role="status" aria-live="polite"></div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const orderModal = document.getElementById('orderModal');
  const closeModal = document.getElementById('closeModal');
  const orderForm = document.getElementById('orderForm');
  const productIdInput = document.getElementById('productId');
  const productNameInput = document.getElementById('productName');
  const quantityInput = document.getElementById('quantity');
  const methodSelect = document.getElementById('method');
  const buyerInput = document.getElementById('buyer');
  const noteInput = document.getElementById('note');
  const totalPriceEl = document.getElementById('totalPrice');
  const formMsg = document.getElementById('formMsg');

  // Sample products
  const products = [
    { id:1, name:'Golden Dragon', price:50, img:'assets/golden-dragon.svg' },
    { id:2, name:'Crystal Unicorn', price:65, img:'assets/crystal-unicorn.svg' },
    { id:3, name:'Shadow Wolf', price:80, img:'assets/shadow-wolf.svg' },
    { id:4, name:'Emerald Fox', price:40, img:'assets/emerald-fox.svg' }
  ];

  function money(n){ return '$' + Number(n).toFixed(2); }

  function renderProducts(){
    productList.innerHTML = '';
    products.forEach(p => {
      const el = document.createElement('div');
      el.className = 'product-card';
      el.innerHTML = `
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <h4>${p.name}</h4>
        <p>${money(p.price)}</p>
        <div style="margin-top:10px">
          <button data-id="${p.id}" class="orderBtn">Order</button>
        </div>
      `;
      productList.appendChild(el);
    });
  }

  renderProducts();

  // Scroll to products
  scrollProducts && scrollProducts.addEventListener('click', () => {
    document.getElementById('products').scrollIntoView({behavior:'smooth'});
  });

  // Open modal when clicking Order
  productList.addEventListener('click', (e) => {
    const btn = e.target.closest('.orderBtn');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    const p = products.find(x => x.id === id);
    if(!p) return;
    productIdInput.value = p.id;
    productNameInput.value = p.name;
    quantityInput.value = 1;
    methodSelect.value = '';
    buyerInput.value = '';
    noteInput.value = '';
    updateTotal();
    openModal();
  });

  function openModal(){ orderModal.setAttribute('aria-hidden','false'); }
  function closeModalFn(){ orderModal.setAttribute('aria-hidden','true'); formMsg.textContent = ''; }
  closeModal.addEventListener('click', closeModalFn);
  orderModal.addEventListener('click', (e) => { if(e.target === orderModal) closeModalFn(); });

  // Update total when quantity changes
  quantityInput.addEventListener('input', updateTotal);
  function updateTotal(){
    const qty = Math.max(1, Number(quantityInput.value) || 1);
    const pid = Number(productIdInput.value);
    const p = products.find(x => x.id === pid) || {price:0};
    totalPriceEl.textContent = money(p.price * qty);
  }

  // Submit order: save to Firestore and open WhatsApp
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const qty = Math.max(1, Number(quantityInput.value) || 1);
    const method = methodSelect.value.trim();
    const buyer = buyerInput.value.trim();

    if(!method){
      formMsg.style.color = 'crimson';
      formMsg.textContent = 'Please choose a payment method.';
      return;
    }
    if(!buyer){
      formMsg.style.color = 'crimson';
      formMsg.textContent = 'Please enter your name.';
      return;
    }

    const pid = Number(productIdInput.value);
    const p = products.find(x=>x.id===pid) || {price:0};

    const order = {
      productId: pid,
      productName: productNameInput.value,
      quantity: qty,
      method,
      buyer,
      note: noteInput.value || '',
      total: qty * p.price,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Firestore: collection "orders"
      await db.collection('orders').add(order);

      formMsg.style.color = 'green';
      formMsg.textContent = 'Order saved to database! Redirecting to WhatsApp...';

      const waText = encodeURIComponent(`Hi, I ordered ${order.quantity} x ${order.productName} (Total: $${order.total}). Name: ${order.buyer}. Method: ${order.method}. Note: ${order.note}`);
      const waUrl = 'https://wa.me/628123456789?text=' + waText;
      setTimeout(()=>{ window.open(waUrl, '_blank'); closeModalFn(); }, 1100);
    } catch (err) {
      console.error('Firestore error', err);
      formMsg.style.color = 'crimson';
      formMsg.textContent = 'Failed to save order. Check Firebase config & Firestore rules.';
    }
  });
});
