const CART_KEY = 'ventara_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

const productsEl = document.getElementById('products');
const filtersEl = document.getElementById('filters');

function renderProducts(filter='all'){
  const list = filter==='all' ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
  productsEl.innerHTML = list.map(p=>`
    <article class="product">
      <div class="product-img" data-id="${p.id}">
        ${p.tag?`<span class="product-tag">${p.tag}</span>`:''}
        ${glassesSVG(p.id)}
      </div>
      <div class="product-info">
        <div class="product-cat">${CAT_LABEL[p.cat]}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <div class="product-actions">
          <button class="btn-view" data-view="${p.id}">Ver detalhes</button>
          <button class="btn-add" data-add="${p.id}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join('');
}

filtersEl.addEventListener('click', e=>{
  const btn = e.target.closest('.filter');
  if(!btn) return;
  filtersEl.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.filter);
});

document.querySelectorAll('.cat-card').forEach(c=>{
  c.addEventListener('click', e=>{
    const f = c.dataset.filter;
    setTimeout(()=>{ document.querySelector(`.filter[data-filter="${f}"]`)?.click(); }, 50);
  });
});

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }

function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++; else cart.push({id, qty:1});
  saveCart();
  openCart();
}

function removeFromCart(id){ cart = cart.filter(x=>x.id!==id); saveCart(); }
function changeQty(id, delta){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) removeFromCart(id); else saveCart();
}

function updateCartUI(){
  document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  const itemsEl = document.getElementById('cartItems');
  if(cart.length===0){ itemsEl.innerHTML = '<p style="color:var(--muted);padding:40px 0;text-align:center">Seu carrinho está vazio.</p>'; }
  else {
    itemsEl.innerHTML = cart.map(i=>{
      const p = PRODUCTS.find(x=>x.id===i.id);
      return `<div class="cart-item">
        <div class="cart-item-img">${glassesSVG(p.id)}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
          <div class="cart-item-qty">
            <button onclick="changeQty(${p.id},-1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty(${p.id},1)">+</button>
            <button class="cart-remove" onclick="removeFromCart(${p.id})">✕</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  const total = cart.reduce((s,i)=>{ const p=PRODUCTS.find(x=>x.id===i.id); return s + p.price*i.qty; },0);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
function openCart(){ cartDrawer.classList.add('open'); overlay.classList.add('open'); }
function closeCart(){ cartDrawer.classList.remove('open'); overlay.classList.remove('open'); }
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', ()=>{ closeCart(); closeModal(); });

// modal
const modal = document.getElementById('productModal');
function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-visual">${glassesSVG(p.id).replace('class="g"','style="width:220px;height:80px"')}</div>
    <div class="modal-info">
      <div class="product-cat">${CAT_LABEL[p.cat]}</div>
      <h2>${p.name}</h2>
      <div class="price">${formatPrice(p.price)}</div>
      <p>${p.desc}</p>
      <button class="btn btn-primary" onclick="addToCart(${p.id}); closeModal();">Adicionar ao carrinho</button>
    </div>
  `;
  modal.classList.add('open'); overlay.classList.add('open');
}
function closeModal(){ modal.classList.remove('open'); overlay.classList.remove('open'); }
document.getElementById('modalClose').addEventListener('click', closeModal);

document.addEventListener('click', e=>{
  const v = e.target.closest('[data-view]');
  if(v){ openModal(+v.dataset.view); return; }
  const a = e.target.closest('[data-add]');
  if(a){ addToCart(+a.dataset.add); return; }
  const pi = e.target.closest('.product-img');
  if(pi){ openModal(+pi.dataset.id); return; }
});

document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(cart.length===0){ alert('Seu carrinho está vazio.'); return; }
  alert('Pedido enviado! Entraremos em contato via WhatsApp para finalizar. Obrigado!');
  cart = []; saveCart(); closeCart();
});

// contact form
document.getElementById('contactForm').addEventListener('submit', e=>{
  e.preventDefault();
  document.getElementById('formMsg').textContent = 'Mensagem enviada! Retornaremos em breve.';
  e.target.reset();
});

// search
document.getElementById('searchBtn').addEventListener('click', ()=>{
  const q = prompt('Buscar produto:');
  if(!q) return;
  const found = PRODUCTS.find(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  if(found) openModal(found.id); else alert('Nenhum produto encontrado.');
});

// menu toggle
document.getElementById('menuToggle').addEventListener('click', ()=> document.getElementById('nav').classList.toggle('open'));

// header scroll
window.addEventListener('scroll', ()=>{
  document.getElementById('header').classList.toggle('scrolled', window.scrollY>10);
});

renderProducts();
updateCartUI();
