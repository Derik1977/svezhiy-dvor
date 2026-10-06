const SELLER_WHATSAPP = ""; // Укажите номер без +, например: 79001234567

const products = [
  {id:1,name:"Картофель",category:"Овощи",unit:"кг",price:65,emoji:"🥔"},
  {id:2,name:"Лук репчатый",category:"Овощи",unit:"кг",price:55,emoji:"🧅"},
  {id:3,name:"Морковь",category:"Овощи",unit:"кг",price:70,emoji:"🥕"},
  {id:4,name:"Капуста",category:"Овощи",unit:"кг",price:60,emoji:"🥬"},
  {id:5,name:"Помидоры",category:"Овощи",unit:"кг",price:220,emoji:"🍅"},
  {id:6,name:"Огурцы",category:"Овощи",unit:"кг",price:190,emoji:"🥒"},
  {id:7,name:"Перец сладкий",category:"Овощи",unit:"кг",price:280,emoji:"🫑"},
  {id:8,name:"Чеснок",category:"Овощи",unit:"100 г",price:55,emoji:"🧄"},
  {id:9,name:"Яблоки",category:"Фрукты",unit:"кг",price:140,emoji:"🍎"},
  {id:10,name:"Бананы",category:"Фрукты",unit:"кг",price:160,emoji:"🍌"},
  {id:11,name:"Апельсины",category:"Фрукты",unit:"кг",price:190,emoji:"🍊"},
  {id:12,name:"Лимоны",category:"Фрукты",unit:"кг",price:260,emoji:"🍋"},
  {id:13,name:"Укроп",category:"Зелень",unit:"пучок",price:60,emoji:"🌿"},
  {id:14,name:"Петрушка",category:"Зелень",unit:"пучок",price:60,emoji:"🌱"},
  {id:15,name:"Зелёный лук",category:"Зелень",unit:"пучок",price:70,emoji:"🌿"},
  {id:16,name:"Набор для борща",category:"Наборы",unit:"набор",price:390,emoji:"🧺",contents:["Картофель — 1 кг","Капуста — 1 кг","Свёкла — 0,7 кг","Морковь — 0,5 кг","Лук репчатый — 0,5 кг","Чеснок — 100 г"]},
  {id:17,name:"Овощной набор на неделю",category:"Наборы",unit:"набор",price:1190,emoji:"📦",contents:["Картофель — 3 кг","Лук репчатый — 1 кг","Морковь — 1 кг","Капуста — 1 кг","Помидоры — 1 кг","Огурцы — 1 кг","Перец сладкий — 0,5 кг","Чеснок — 100 г","Зелень — 2 пучка"]},
  {id:18,name:"Фруктовый набор",category:"Наборы",unit:"набор",price:990,emoji:"🍎",contents:["Яблоки — 2 кг","Бананы — 1 кг","Апельсины — 1 кг","Лимоны — 0,5 кг"]}
];

let activeCategory = "Все";
let cart = JSON.parse(localStorage.getItem("fresh-yard-cart") || "{}");

const $ = (s) => document.querySelector(s);
const rub = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

function persist(){localStorage.setItem("fresh-yard-cart",JSON.stringify(cart));renderCartBadge()}
function categories(){return ["Все",...new Set(products.map(p=>p.category))]}

function renderTabs(){
  $("#categoryTabs").innerHTML = categories().map(c=>`<button class="tab ${c===activeCategory?'active':''}" data-category="${c}">${c}</button>`).join("");
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;renderTabs();renderProducts()})
}

function renderProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const list=products.filter(p=>(activeCategory==="Все"||p.category===activeCategory)&&p.name.toLowerCase().includes(q));
  $("#productGrid").innerHTML=list.length?list.map(p=>`
    <article class="product">
      <div class="product-emoji">${p.emoji}</div>
      <h3>${p.name}</h3><div class="meta">за ${p.unit}</div>
      <div class="product-footer"><div class="price">${rub(p.price)}</div><button class="add-btn" data-add="${p.id}">+ В корзину</button></div>${p.contents?`<button class="details-btn" data-details="${p.id}">Состав набора</button>`:""}
    </article>`).join(""):`<div class="empty">Ничего не найдено</div>`;
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(+b.dataset.add));
  document.querySelectorAll("[data-details]").forEach(b=>b.onclick=()=>openSetDetails(+b.dataset.details));
}

function openSetDetails(id){
  const p=products.find(x=>x.id===id); if(!p||!p.contents)return;
  let modal=$("#setDetailsModal");
  if(!modal){
    modal=document.createElement("div"); modal.id="setDetailsModal"; modal.className="modal hidden";
    modal.innerHTML='<div class="modal-card"><div class="drawer-head"><div><h2 id="setDetailsTitle"></h2><p>Что входит в набор</p></div><button id="closeSetDetails" class="icon-btn">✕</button></div><div id="setDetailsList" class="set-list"></div><button id="addSetFromDetails" class="primary full">Добавить набор в корзину</button></div>';
    document.body.appendChild(modal);
    $("#closeSetDetails").onclick=()=>modal.classList.add("hidden");
    modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
  }
  $("#setDetailsTitle").textContent=`${p.emoji} ${p.name}`;
  $("#setDetailsList").innerHTML=p.contents.map(x=>`<div class="set-item">✓ ${x}</div>`).join("")+`<div class="set-price">Цена набора: <strong>${rub(p.price)}</strong></div>`;
  $("#addSetFromDetails").onclick=()=>{addToCart(id);modal.classList.add("hidden")};
  modal.classList.remove("hidden");
}

function openWeightPicker(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  const is100g=p.unit==="100 г";
  const presets=is100g
    ? [{v:1,l:"100 г"},{v:2,l:"200 г"},{v:3,l:"300 г"},{v:5,l:"500 г"},{v:10,l:"1 кг"}]
    : [{v:.5,l:"0,5 кг"},{v:1,l:"1 кг"},{v:1.5,l:"1,5 кг"},{v:2,l:"2 кг"},{v:3,l:"3 кг"}];
  const step=is100g?1:.5;
  const min=is100g?1:.5;
  const labelFor=q=>is100g?(q>=10&&q%10===0?`${q/10} кг`:`${Math.round(q*100)} г`):`${String(q).replace(".",",")} кг`;

  let modal=$("#weightModal");
  if(!modal){
    modal=document.createElement("div"); modal.id="weightModal"; modal.className="modal hidden";
    modal.innerHTML='<div class="modal-card weight-card"><div class="drawer-head"><div><h2 id="weightTitle"></h2><p>Выберите нужный вес</p></div><button id="closeWeight" class="icon-btn">✕</button></div><div id="weightPresets" class="weight-presets"></div><div class="weight-stepper"><button id="weightMinus">−</button><strong id="weightValue"></strong><button id="weightPlus">+</button></div><div class="weight-total">Сумма: <strong id="weightTotal"></strong></div><button id="confirmWeight" class="primary full">Добавить в корзину</button></div>';
    document.body.appendChild(modal);
    $("#closeWeight").onclick=()=>modal.classList.add("hidden");
    modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
  }

  let qty=is100g?1:1;
  $("#weightPresets").innerHTML=presets.map(x=>`<button data-weight="${x.v}">${x.l}</button>`).join("");
  const refresh=()=>{
    $("#weightValue").textContent=labelFor(qty);
    $("#weightTotal").textContent=rub(Math.round(p.price*qty));
    document.querySelectorAll("[data-weight]").forEach(b=>b.classList.toggle("active",+b.dataset.weight===qty));
  };
  $("#weightTitle").textContent=`${p.emoji} ${p.name}`;
  document.querySelectorAll("[data-weight]").forEach(b=>b.onclick=()=>{qty=+b.dataset.weight;refresh()});
  $("#weightMinus").onclick=()=>{qty=Math.max(min,Math.round((qty-step)*10)/10);refresh()};
  $("#weightPlus").onclick=()=>{qty=Math.round((qty+step)*10)/10;refresh()};
  $("#confirmWeight").onclick=()=>{
    cart[id]=Math.round(((cart[id]||0)+qty)*10)/10;
    persist();
    toast(`Добавлено: ${labelFor(qty)}`);
    modal.classList.add("hidden")
  };
  refresh(); modal.classList.remove("hidden");
}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  if(p.unit==="кг"||p.unit==="100 г"){openWeightPicker(id);return}
  cart[id]=(cart[id]||0)+1;persist();toast("Добавлено в корзину")
}
function renderCartBadge(){$("#cartCount").textContent=Object.values(cart).reduce((a,b)=>a+b,0)}
function deliveryFor(subtotal){return subtotal>=2500?0:subtotal>=1500?100:200}

function renderCart(){
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  const count=entries.reduce((a,[,q])=>a+q,0);
  $("#cartSubtitle").textContent=`${count} поз.`;
  $("#cartItems").innerHTML=entries.length?entries.map(([id,q])=>{
    const p=products.find(x=>x.id===+id);const isKg=p.unit==="кг";const is100g=p.unit==="100 г";const qLabel=isKg?`${String(q).replace(".",",")} кг`:is100g?(q>=10&&q%10===0?`${q/10} кг`:`${Math.round(q*100)} г`):q;const step=isKg?.5:1;return `<div class="cart-item"><div><h4>${p.emoji} ${p.name}</h4><div class="meta">${rub(p.price)} × ${qLabel}</div><button class="remove" data-remove="${id}">Удалить</button></div><div class="qty"><button data-minus="${id}" data-step="${step}">−</button><strong>${qLabel}</strong><button data-plus="${id}" data-step="${step}">+</button></div></div>`
  }).join(""):`<div class="empty">Корзина пока пуста</div>`;
  const subtotal=entries.reduce((sum,[id,q])=>sum+products.find(p=>p.id===+id).price*q,0);
  const delivery=entries.length?deliveryFor(subtotal):0;
  $("#subtotal").textContent=rub(subtotal);$("#deliveryCost").textContent=delivery?rub(delivery):entries.length?"Бесплатно":"0 ₽";$("#total").textContent=rub(subtotal+delivery);
  $("#checkoutButton").disabled=!entries.length;
  document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{const s=+b.dataset.step||1;cart[b.dataset.plus]=Math.round(((cart[b.dataset.plus]||0)+s)*10)/10;persist();renderCart()});
  document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{const s=+b.dataset.step||1;cart[b.dataset.minus]=Math.round(((cart[b.dataset.minus]||0)-s)*10)/10;if(cart[b.dataset.minus]<=0)delete cart[b.dataset.minus];persist();renderCart()});
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{delete cart[b.dataset.remove];persist();renderCart()});
}

function buildOrder(data){
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  const subtotal=entries.reduce((sum,[id,q])=>sum+products.find(p=>p.id===+id).price*q,0);
  const delivery=deliveryFor(subtotal); const total=subtotal+delivery;
  const lines=entries.map(([id,q])=>{const p=products.find(x=>x.id===+id);const qLabel=p.unit==="кг"?`${String(q).replace(".",",")} кг`:p.unit==="100 г"?(q>=10&&q%10===0?`${q/10} кг`:`${Math.round(q*100)} г`):q;return `• ${p.name}: ${qLabel} × ${rub(p.price)} = ${rub(Math.round(p.price*q))}`});
  return `НОВЫЙ ЗАКАЗ\n\n${lines.join("\n")}\n\nТовары: ${rub(subtotal)}\nДоставка: ${delivery?rub(delivery):"Бесплатно"}\nИТОГО: ${rub(total)}\n\nИмя: ${data.name}\nТелефон: ${data.phone}\nАдрес: ${data.address}\nВремя: ${data.slot}\nКомментарий: ${data.comment||"—"}`;
}

function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),1800)}

$("#searchInput").addEventListener("input",renderProducts);
$("#cartButton").onclick=()=>{$("#cartDrawer").classList.remove("hidden");renderCart()};
$("#closeCart").onclick=()=>$("#cartDrawer").classList.add("hidden");
$("#checkoutButton").onclick=()=>{$("#cartDrawer").classList.add("hidden");$("#checkoutModal").classList.remove("hidden")};
$("#closeCheckout").onclick=()=>$("#checkoutModal").classList.add("hidden");
$("#closeOrder").onclick=()=>$("#orderModal").classList.add("hidden");
$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const text=buildOrder(data);$("#orderText").value=text;$("#checkoutModal").classList.add("hidden");$("#orderModal").classList.remove("hidden")
});
$("#copyOrder").onclick=async()=>{await navigator.clipboard.writeText($("#orderText").value);toast("Заказ скопирован")};
$("#whatsAppOrder").onclick=()=>{
  const text=encodeURIComponent($("#orderText").value);const phone=SELLER_WHATSAPP?SELLER_WHATSAPP:"";window.open(`https://wa.me/${phone}?text=${text}`,"_blank")
};

renderTabs();renderProducts();renderCartBadge();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"))}
