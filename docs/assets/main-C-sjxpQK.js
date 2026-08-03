import{g as h,p as A,c as Je,a as Ye,i as We,d as Z,b as S}from"./api-tUMZY5rs.js";const O=[{id:"dashboard",label:"Dashboard",icon:"dashboard",mvp:!0},{id:"kasir",label:"Kasir",icon:"cart",mvp:!0},{id:"produk",label:"Produk",icon:"package",mvp:!0},{id:"kategori",label:"Kategori",icon:"tag",mvp:!0},{id:"pelanggan",label:"Pelanggan",icon:"users",mvp:!0},{id:"transaksi",label:"Transaksi",icon:"receipt",mvp:!0},{id:"retur",label:"Retur",icon:"undo",mvp:!0},{id:"stok",label:"Stok",icon:"boxes",mvp:!0},{id:"laporan",label:"Laporan",icon:"chart",mvp:!0},{id:"pengaturan",label:"Pengaturan",icon:"settings",mvp:!0}],_=["dashboard","kasir","produk","kategori","pelanggan","transaksi","retur","stok","laporan"],r={currentUser:null,appSettings:{storeName:"Kasir Cafe",storeAddress:"",storePhone:"",receiptFooter:"Terima kasih atas kunjungan Anda!",defaultTaxPercent:0,lowStockThreshold:15,menuAccess:Object.fromEntries(_.map(e=>[e,!0]))},products:[],categories:[],customers:[],activeView:"dashboard"};function Ze(e){const t=r.appSettings.menuAccess||{};if(e&&e.menuAccessOverride){const a={...t};return _.forEach(n=>{e.menuAccessOverride[n]!=null&&(a[n]=!!e.menuAccessOverride[n])}),a}return t}function q(e){const t=r.currentUser;return!t||t.role==="admin"||e==="pengaturan"?!0:Ze(t)[e]!==!1}function we(){const e=O.find(t=>q(t.id));return e?e.id:"pengaturan"}async function Xe(){const e=await h("/api/me");return e.user?(r.currentUser=e.user,e.user):(window.location.href="./login.html",null)}function et(e){document.getElementById("userName").textContent=e.name,document.getElementById("userRole").textContent=e.role==="admin"?"Admin":"Kasir",document.getElementById("userAvatar").textContent=e.name.charAt(0).toUpperCase()}function tt(){document.getElementById("logoutBtn").addEventListener("click",async()=>{await A("/api/logout",{}),Je(),window.location.href="./login.html"})}function d(e,t){const a=document.getElementById("toastHolder"),n=document.createElement("div");n.className="toast"+(t?" "+t:""),n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),2600)}const X=new Map;function at(e){X.set(e.id,e)}function nt(e){e.insertAdjacentHTML("beforeend",[...X.values()].map(t=>t.template).join(`
`))}function st(){for(const e of X.values())typeof e.init=="function"&&e.init()}function C(e){var n,s;if(e!=="comingsoon"&&!q(e)){d("Anda tidak memiliki akses ke menu ini","error");return}(n=document.getElementById("sidebar"))==null||n.classList.remove("mobile-open"),(s=document.getElementById("sidebarBackdrop"))==null||s.classList.remove("active"),r.activeView=e,document.querySelectorAll(".view").forEach(i=>i.classList.remove("active"));const t=document.getElementById("view-"+e);t&&t.classList.add("active"),document.querySelectorAll(".nav-item").forEach(i=>i.classList.toggle("active",i.dataset.id===e));const a=X.get(e);a&&typeof a.load=="function"&&a.load()}const xe={dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',package:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',tag:'<path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l5.59-5.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1.2"/>',users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',receipt:'<path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>',undo:'<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>',boxes:'<path d="M2 8l10-5 10 5-10 5-10-5z"/><path d="M2 8v9l10 5 10-5V8"/><path d="M12 13v9"/>',chart:'<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',award:'<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>',alert:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',trendUp:'<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',check:'<polyline points="20 6 9 17 4 12"/>',plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',minus:'<path d="M5 12h14"/>',chevronLeft:'<polyline points="15 18 9 12 15 6"/>',chevronRight:'<polyline points="9 18 15 12 9 6"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',ban:'<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'};function l(e,t){return`<svg class="icon ${t||""}" viewBox="0 0 24 24">${xe[e]||""}</svg>`}const se=["#2563EB","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6","#64748B"],$e=new EventTarget;function x(e,t){$e.addEventListener(e,t)}function $(e,t){$e.dispatchEvent(new CustomEvent(e,{detail:t}))}function Se(){const e=document.getElementById("sidebarNav"),t=O.filter(a=>q(a.id));e.innerHTML=t.map(a=>`
    <div class="nav-item" data-id="${a.id}">
      ${l(a.icon)}
      <span class="nav-label">${a.label}</span>
      ${a.mvp?"":'<span class="soon-badge">SOON</span>'}
    </div>
  `).join(""),e.querySelectorAll(".nav-item").forEach(a=>{a.addEventListener("click",()=>{const n=O.find(s=>s.id===a.dataset.id);n.mvp?C(n.id):(document.getElementById("comingSoonTitle").textContent=n.label+" — Segera Hadir",C("comingsoon"),d(`Fitur "${n.label}" akan hadir di iterasi berikutnya`))})})}function it(){const e=document.getElementById("sidebar"),t=document.getElementById("collapseLabel");localStorage.getItem("sidebarCollapsed")==="1"&&(e.classList.add("collapsed"),t.textContent=""),document.getElementById("collapseBtn").addEventListener("click",()=>{const n=e.classList.toggle("collapsed");localStorage.setItem("sidebarCollapsed",n?"1":"0"),t.textContent=n?"":"Ciutkan Menu"})}function dt(){document.getElementById("sidebar").classList.add("mobile-open"),document.getElementById("sidebarBackdrop").classList.add("active")}function Te(){document.getElementById("sidebar").classList.remove("mobile-open"),document.getElementById("sidebarBackdrop").classList.remove("active")}function ot(){document.getElementById("mobileMenuBtn").addEventListener("click",dt),document.getElementById("sidebarBackdrop").addEventListener("click",Te)}function rt(){document.addEventListener("keydown",e=>{e.ctrlKey&&e.key.toLowerCase()==="f"?(e.preventDefault(),C("kasir"),$("shortcut:focus-search")):e.key==="F2"?(e.preventDefault(),r.activeView==="kasir"&&$("shortcut:checkout")):e.key==="F3"?(e.preventDefault(),r.activeView==="kasir"&&$("shortcut:hold-order")):e.key==="Escape"&&(document.getElementById("receiptModal").innerHTML?document.getElementById("receiptModal").innerHTML="":document.getElementById("stockAdjustModal").innerHTML?document.getElementById("stockAdjustModal").innerHTML="":document.getElementById("heldOrdersModal").innerHTML?document.getElementById("heldOrdersModal").innerHTML="":document.getElementById("cartModal")&&document.getElementById("cartModal").style.display!=="none"?$("shortcut:close-cart-modal"):document.getElementById("sidebar").classList.contains("mobile-open")?Te():r.activeView==="kasir"&&$("shortcut:cancel-order"))})}function lt(){Se(),it(),ot(),rt()}function p(e){return"Rp "+Number(e||0).toLocaleString("id-ID")}function ct(e){return e=Number(e||0),e>=1e6?"Rp "+(e/1e6).toLocaleString("id-ID",{maximumFractionDigits:1})+"jt":e>=1e3?"Rp "+(e/1e3).toLocaleString("id-ID",{maximumFractionDigits:0})+"rb":p(e)}function Le(e){if(!e)return"-";const t=Date.now()-new Date(e).getTime(),a=Math.floor(t/6e4);if(a<1)return"baru saja";if(a<60)return`${a} menit lalu`;const n=Math.floor(a/60);return n<24?`${n} jam lalu`:`${Math.floor(n/24)} hari lalu`}function G(e){return e.toISOString().slice(0,10)}function ut(e,t){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}}function U(e){return`<div style="color:var(--text-secondary); font-size:12.5px; text-align:center; padding:14px 0;">${e}</div>`}function be(e,t){t=t||"#2563EB";const a=Math.max(...e.map(I=>I.value),1),n=320,s=150,i=26,o=24,m=8,u=s-i-o,g=s-o,v=e.length||1,f=10,T=Math.max(8,(n-m*2-f*(v-1))/v),F=Math.min(6,T/2),Ve=e.map((I,Qe)=>{const ee=m+Qe*(T+f),te=ee+T/2;if(!I.value||I.value<=0)return`
        <rect x="${ee}" y="${g-3}" width="${T}" height="3" rx="${3/2}" fill="#E2E8F0"></rect>
        <text x="${te}" y="${s-6}" font-size="10" fill="#94A3B8" text-anchor="middle">${I.label}</text>
      `;const ve=Math.max(6,I.value/a*u),ge=g-ve,ye=I.value===a;return`
      <rect x="${ee}" y="${ge}" width="${T}" height="${ve}" rx="${F}" fill="${t}" opacity="${ye?1:.78}">
        <title>${I.label}: ${p(I.value)}</title>
      </rect>
      ${ye?`<text x="${te}" y="${Math.max(11,ge-7)}" font-size="10" font-weight="700" fill="${t}" text-anchor="middle">${ct(I.value)}</text>`:""}
      <text x="${te}" y="${s-6}" font-size="10" fill="#64748B" text-anchor="middle">${I.label}</text>
    `}).join("");return`<svg class="mini-chart" viewBox="0 0 ${n} ${s}" style="aspect-ratio:${n}/${s}" role="img" aria-label="Grafik penjualan">
    <line x1="${m}" y1="${g}" x2="${n-m}" y2="${g}" stroke="#E2E8F0" stroke-width="1"></line>
    ${Ve}
  </svg>`}const mt=`
<section class="view active" id="view-dashboard">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle" id="todayDateLabel">Ringkasan operasional hari ini</div>
      </div>
    </div>

    <div class="stat-grid" id="statGrid">
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
    </div>

    <div class="dash-grid">
      <div class="card card-pad">
        <div class="card-title-row"><h3>Penjualan 7 Hari Terakhir</h3></div>
        <div class="chart-wrap" id="dailyChart"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Penjualan Mingguan</h3></div>
        <div class="chart-wrap" id="weeklyChart"></div>
      </div>
    </div>

    <div class="widget-grid">
      <div class="card card-pad">
        <div class="card-title-row"><h3>Produk Terlaris</h3></div>
        <div class="mini-list" id="topProductsList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Kasir Teraktif Hari Ini</h3></div>
        <div class="mini-list" id="cashierActivityList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Produk Hampir Habis</h3></div>
        <div class="mini-list" id="lowStockList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Aktivitas Terbaru</h3></div>
        <div class="mini-list" id="recentActivityList"></div>
      </div>
    </div>
  </div>
</section>
`;async function pt(){document.getElementById("todayDateLabel").textContent="Ringkasan operasional "+new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});const e=await Ye("/api/reports/dashboard",1e4);document.getElementById("statGrid").innerHTML=`
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${l("receipt")}</div></div>
      <div class="stat-label">Total Penjualan</div>
      <div class="stat-value">${p(e.today.revenue)}</div>
      <span class="stat-trend up">${l("trendUp","icon-sm")} Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${l("cart")}</div></div>
      <div class="stat-label">Total Transaksi</div>
      <div class="stat-value">${e.today.transactions}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${l("package")}</div></div>
      <div class="stat-label">Produk Terjual</div>
      <div class="stat-value">${e.today.itemsSold}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon red">${l("award")}</div></div>
      <div class="stat-label">Pendapatan Rata-rata/Transaksi</div>
      <div class="stat-value">${p(e.today.transactions?e.today.revenue/e.today.transactions:0)}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
  `,document.getElementById("dailyChart").innerHTML=be(e.dailySales.map(t=>({label:t.label,value:t.revenue}))),document.getElementById("weeklyChart").innerHTML=be(e.weeklySales.map(t=>({label:t.label,value:t.revenue})),"#22C55E"),document.getElementById("topProductsList").innerHTML=e.topProducts.length?e.topProducts.map((t,a)=>{const n=e.topProducts[0].qty||1;return`<div class="mini-row-wrap"><div class="mini-row"><div class="rank">${a+1}</div><div class="name">${t.name}</div><div class="val">${t.qty} terjual</div></div><div class="progress-track"><div class="progress-fill" style="width:${t.qty/n*100}%;"></div></div></div>`}).join(""):U("Belum ada data penjualan"),document.getElementById("cashierActivityList").innerHTML=e.cashierActivity.length?e.cashierActivity.map((t,a)=>`
    <div class="mini-row"><div class="rank">${a+1}</div><div class="name">${t.name}</div><div class="val">${p(t.revenue)}</div></div>
  `).join(""):U("Belum ada transaksi hari ini"),document.getElementById("lowStockList").innerHTML=e.lowStock.length?e.lowStock.map(t=>`
    <div class="mini-row">${l("alert","icon-sm")} <div class="name">${t.name}</div><span class="badge amber">${t.stock} tersisa</span></div>
  `).join(""):U("Semua stok aman"),document.getElementById("recentActivityList").innerHTML=e.recentActivity.length?e.recentActivity.map(t=>`
    <div class="mini-row">${l("clock","icon-sm")} <div class="name">#${t.id} oleh ${t.cashierName} (${t.itemCount} item)</div><span class="val">${p(t.total)}</span></div>
  `).join(""):U("Belum ada aktivitas")}const vt={id:"dashboard",template:mt,load:pt};async function Me(){return r.products=await h("/api/products"),$("catalog:products-changed"),r.products}async function Pe(){return r.categories=await h("/api/categories"),$("catalog:categories-changed"),r.categories}async function V(e){const t=e?"?search="+encodeURIComponent(e):"";return r.customers=await h("/api/customers"+t),$("catalog:customers-changed"),r.customers}async function E(e){if(We("/api/"+e),e==="products")return Me();if(e==="categories")return Pe();if(e==="customers")return V()}const gt=`
<section class="view" id="view-kasir">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Kasir</div>
        <div class="page-subtitle">Pilih produk, atur keranjang, lalu proses pembayaran</div>
      </div>
    </div>

    <div class="pos-grid">
      <div class="pos-products">
        <div class="pos-toolbar">
          <div class="search-box">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input type="text" id="posSearch" placeholder="Cari produk atau scan barcode... (Enter untuk tambah)">
          </div>
        </div>
        <div class="category-pills" id="categoryTabs"></div>

        <button class="held-orders-banner" id="heldOrdersBtn" style="display:none;">
          <span class="hob-left">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>Ada <span id="heldCountNum">0</span> pesanan tertahan</span>
          </span>
          <span class="hob-right">
            Lihat
            <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </button>

        <button class="cart-bar" id="cartBarBtn">
          <span class="cart-bar-left">
            <span class="cart-bar-icon">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </span>
            <span class="cart-bar-customer" id="cartBarCustomer">Pelanggan Umum</span>
            <span class="badge blue" id="cartBarCount">0 item</span>
          </span>
          <span class="cart-bar-right">
            <span class="cart-bar-total" id="cartBarTotal">Rp 0</span>
            <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </span>
        </button>

        <div class="product-grid" id="productGrid"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="cartModal" style="display:none;">
      <div class="card cart-panel">
        <div class="cart-head">
          <h3>Keranjang</h3>
          <div class="cart-head-right">
            <span class="badge blue" id="cartCountBadge">0 item</span>
            <button class="btn-icon-sm" id="closeCartModalBtn" title="Tutup">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div class="cart-body" id="cartItems">
          <div class="cart-empty">
            <svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <div>Keranjang masih kosong</div>
            <div style="font-size:11.5px;">Klik produk di sebelah kiri untuk mulai</div>
          </div>
        </div>
        <div class="cart-summary">
          <div class="form-field customer-select-wrap">
            <label>Pelanggan</label>
            <div class="customer-select-box" id="customerSelectBox">
              <svg class="icon-sm" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span id="customerSelectLabel">Pelanggan Umum</span>
            </div>
            <div class="customer-dropdown" id="customerDropdown" style="display:none;"></div>
          </div>
          <div class="form-field" id="ordererNameRow">
            <label>Nama Pemesan <span style="color:var(--color-danger);">*</span></label>
            <input type="text" id="ordererName" placeholder="mis. Budi" maxlength="60">
          </div>
          <div class="form-row-2">
            <div class="form-field">
              <label>Tipe Pesanan</label>
              <select id="orderType">
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>
            <div class="form-field" id="tableNumberRow">
              <label>Nomor Meja</label>
              <input type="text" id="tableNumber" placeholder="mis. 5">
            </div>
          </div>
          <div class="sum-row"><span>Subtotal</span><span id="sumSubtotal">Rp 0</span></div>
          <div class="form-row-2">
            <div class="form-field">
              <label>Diskon (Rp)</label>
              <input type="number" id="discountInput" placeholder="0" value="0">
            </div>
            <div class="form-field">
              <label>Pajak (%)</label>
              <input type="number" id="taxPercentInput" placeholder="0" value="0">
            </div>
          </div>
          <div class="sum-row grand"><span>Grand Total</span><span id="sumTotal">Rp 0</span></div>

          <div class="form-row-2">
            <div class="form-field">
              <label>Metode Pembayaran</label>
              <select id="paymentMethod">
                <option value="cash">Tunai</option>
                <option value="qris">QRIS</option>
                <option value="debit">Kartu Debit</option>
              </select>
            </div>
            <div class="form-field" id="cashGivenRow">
              <label>Uang Diterima</label>
              <input type="number" id="cashGiven" placeholder="0">
            </div>
          </div>
          <div class="sum-row" id="changeRow" style="display:none;"><span>Kembalian</span><span id="changeAmount" style="font-weight:800;color:var(--color-success);">Rp 0</span></div>

          <div class="cart-actions">
            <button class="btn btn-warning" id="holdBtn" title="F3">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Hold
            </button>
            <button class="btn btn-danger" id="cancelBtn" title="Esc">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              Batal
            </button>
            <button class="btn btn-primary btn-cta" id="checkoutBtn" title="F2">Bayar Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;let L="",b=null,y=[],w=[];function ae(){const e=r.categories.length?r.categories.map(a=>a.name):[...new Set(r.products.map(a=>a.category))];L&&!e.includes(L)&&(L="");const t=document.getElementById("categoryTabs");t.innerHTML=`<span class="pill ${L===""?"active":""}" data-cat="">Semua</span>`+e.map(a=>`<span class="pill ${L===a?"active":""}" data-cat="${a}">${a}</span>`).join(""),t.querySelectorAll(".pill").forEach(a=>a.addEventListener("click",()=>{L=a.dataset.cat,ae(),D()}))}function D(){const e=document.getElementById("posSearch").value.toLowerCase(),t=document.getElementById("productGrid");let a=r.products.filter(n=>n.name.toLowerCase().includes(e)&&(!L||n.category===L));if(a=a.slice().sort((n,s)=>(s.favorite===!0)-(n.favorite===!0)),!a.length){t.innerHTML=`<div class="empty-state" style="grid-column:1/-1;">${l("package","icon-lg")}<div class="es-title">Produk tidak ditemukan</div><div>Coba kata kunci atau kategori lain</div></div>`;return}t.innerHTML=a.map(n=>`
    <div class="product-card ${n.stock<=0?"out":""}" data-id="${n.id}">
      ${n.favorite?`<span class="fav-star">${l("star","icon-sm")}</span>`:""}
      <div class="product-thumb">${n.image?`<img src="${n.image}" alt="${n.name}">`:l("package","icon-lg")}</div>
      <div class="p-name">${n.name}</div>
      <div class="p-cat">${n.category}</div>
      <div class="p-price">${p(n.price)}</div>
      <div class="p-stock ${n.stock<=15?"low":""}">Stok: ${n.stock}</div>
    </div>
  `).join(""),t.querySelectorAll(".product-card").forEach(n=>n.addEventListener("click",()=>Ce(Number(n.dataset.id))))}function yt(){const e=document.getElementById("customerSelectBox"),t=document.getElementById("customerDropdown");e.addEventListener("click",async()=>{if(t.style.display!=="none"){t.style.display="none";return}await E("customers"),bt(""),t.style.display="block"}),document.addEventListener("click",a=>{a.target.closest(".customer-select-wrap")||(t.style.display="none")})}function bt(e){const t=document.getElementById("customerDropdown");t.innerHTML=`
    <input type="text" id="customerSearchInline" placeholder="Cari pelanggan..." value="">
    <div id="customerOptionsList"></div>
    <div class="customer-option add-new" data-act="new">${l("plus","icon-sm")}&nbsp; Tambah Pelanggan Baru</div>
  `;const a=t.querySelector("#customerSearchInline");a.addEventListener("input",s=>he(s.target.value)),a.addEventListener("click",s=>s.stopPropagation());const n=t.querySelector('[data-act="new"]');n&&n.addEventListener("click",()=>{t.style.display="none",C("pelanggan"),document.getElementById("openAddCustomerBtn").click(),d("Tambahkan pelanggan baru, lalu kembali ke Kasir untuk memilihnya")}),he(e)}function he(e){const t=document.getElementById("customerDropdown"),a=(e||"").toLowerCase(),n=r.customers.filter(i=>i.name.toLowerCase().includes(a)||(i.phone||"").includes(a)),s=document.getElementById("customerOptionsList");s.innerHTML=`
    <div class="customer-option" data-id="">${l("users","icon-sm")}&nbsp; Pelanggan Umum (walk-in)</div>
    ${n.map(i=>`<div class="customer-option" data-id="${i.id}"><span>${i.name}</span><span class="cust-phone">${i.phone||""}</span></div>`).join("")}
  `,s.querySelectorAll(".customer-option[data-id]").forEach(i=>{i.addEventListener("click",()=>{const o=i.dataset.id;if(!o)b=null;else{const m=r.customers.find(u=>u.id===Number(o));b=m?{id:m.id,name:m.name}:null}document.getElementById("customerSelectLabel").textContent=b?b.name:"Pelanggan Umum",b&&(document.getElementById("ordererName").value=""),K(),Q(),t.style.display="none"})})}function K(){const e=document.getElementById("ordererNameRow");e&&(e.style.display=b?"none":"")}function Ce(e){const t=r.products.find(n=>n.id===e);if(!t||t.stock<=0){d("Stok produk habis","error");return}const a=y.find(n=>n.productId===e);if(a){if(a.qty>=t.stock){d("Stok tidak cukup","error");return}a.qty++}else y.push({productId:e,name:t.name,price:t.price,qty:1,stock:t.stock});M()}function M(){const e=document.getElementById("cartItems");document.getElementById("cartCountBadge").textContent=y.reduce((t,a)=>t+a.qty,0)+" item",y.length===0?e.innerHTML=`<div class="cart-empty"><svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;">${xe.cart}</svg><div>Keranjang masih kosong</div><div style="font-size:11.5px;">Klik produk di sebelah kiri untuk mulai</div></div>`:(e.innerHTML=y.map((t,a)=>`
      <div class="cart-row" data-i="${a}">
        <div class="ci-info">
          <div class="ci-name">${t.name}</div>
          <div class="ci-price">${p(t.price)}</div>
        </div>
        <div class="qty-stepper">
          <button data-act="dec" data-i="${a}">−</button>
          <span class="qv">${t.qty}</span>
          <button data-act="inc" data-i="${a}">+</button>
        </div>
        <div class="ci-subtotal">${p(t.price*t.qty)}</div>
        <div class="ci-remove" data-act="remove" data-i="${a}">${l("trash","icon-sm")}</div>
      </div>
    `).join(""),e.querySelectorAll("[data-act]").forEach(t=>{t.addEventListener("click",()=>{const a=Number(t.dataset.i),n=t.dataset.act;if(n==="inc")y[a].qty<y[a].stock?y[a].qty++:d("Stok tidak cukup","error"),M();else if(n==="dec")y[a].qty--,y[a].qty<=0&&y.splice(a,1),M();else if(n==="remove"){const s=e.querySelector(`.cart-row[data-i="${a}"]`);s&&s.classList.add("removing");const i=y[a];setTimeout(()=>{y.splice(a,1),M()},180),d(`${i.name} dihapus`)}})})),N()}function N(){const e=y.reduce((m,u)=>m+u.price*u.qty,0),t=Number(document.getElementById("discountInput").value||0),a=Number(document.getElementById("taxPercentInput").value||0),n=Math.max(0,e-t)*(a/100),s=Math.max(0,e-t+n);document.getElementById("sumSubtotal").textContent=p(e),document.getElementById("sumTotal").textContent=p(s);const i=document.getElementById("paymentMethod").value,o=document.getElementById("changeRow");if(i==="cash"&&y.length){const m=Number(document.getElementById("cashGiven").value||0);o.style.display="",document.getElementById("changeAmount").textContent=p(Math.max(0,m-s))}else o.style.display="none";return Q(),{subtotal:e,discount:t,taxAmount:n,total:s}}function Q(){const e=y.reduce((m,u)=>m+u.price*u.qty,0),t=Number(document.getElementById("discountInput").value||0),a=Number(document.getElementById("taxPercentInput").value||0),n=Math.max(0,e-t)*(a/100),s=Math.max(0,e-t+n),i=y.reduce((m,u)=>m+u.qty,0);document.getElementById("cartBarCount").textContent=i+" item";const o=document.getElementById("ordererName").value.trim();document.getElementById("cartBarCustomer").textContent=b?b.name:o||"Pelanggan Umum",document.getElementById("cartBarTotal").textContent=p(s)}function Ae(){document.getElementById("cartModal").style.display=""}function R(){document.getElementById("cartModal").style.display="none"}function fe(){y.length&&confirm("Batalkan pesanan ini? Keranjang akan dikosongkan.")&&(y=[],document.getElementById("discountInput").value=0,document.getElementById("taxPercentInput").value=r.appSettings.defaultTaxPercent||0,document.getElementById("cashGiven").value="",document.getElementById("ordererName").value="",M(),R(),d("Pesanan dibatalkan"))}function Be(){if(!y.length){d("Keranjang masih kosong","error");return}w.push({id:Date.now(),cart:[...y],customer:b?{...b}:null,ordererName:document.getElementById("ordererName").value.trim(),discount:Number(document.getElementById("discountInput").value||0),taxPercent:Number(document.getElementById("taxPercentInput").value||0),orderType:document.getElementById("orderType").value,tableNumber:document.getElementById("tableNumber").value,time:new Date().toISOString()}),y=[],b=null,document.getElementById("customerSelectLabel").textContent="Pelanggan Umum",document.getElementById("ordererName").value="",K(),document.getElementById("discountInput").value=0,document.getElementById("taxPercentInput").value=r.appSettings.defaultTaxPercent||0,document.getElementById("tableNumber").value="",M(),ie(),R(),d(`Pesanan ditahan (${w.length} pesanan ditahan)`)}function ie(){const e=document.getElementById("heldOrdersBtn");e&&(w.length?(e.style.display="",document.getElementById("heldCountNum").textContent=w.length):e.style.display="none")}function Ne(){const e=document.getElementById("heldOrdersModal");if(!w.length){e.innerHTML="";return}e.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Pesanan Tertahan</h3>
        <div class="held-order-list">
          ${w.map(t=>{const a=t.cart.reduce((o,m)=>o+m.price*m.qty,0),n=Math.max(0,a-t.discount)*(t.taxPercent/100),s=Math.max(0,a-t.discount+n),i=t.cart.reduce((o,m)=>o+m.qty,0);return`
              <div class="held-order-row">
                <div class="ho-info">
                  <div class="ho-title">${t.customer?t.customer.name:t.ordererName||"Pelanggan Umum"} · ${i} item</div>
                  <div class="ho-sub">${t.orderType==="dine-in"?"Dine-in"+(t.tableNumber?" · Meja "+t.tableNumber:""):"Takeaway"} · ${Le(t.time)}</div>
                </div>
                <div class="ho-total">${p(s)}</div>
                <div class="ho-actions">
                  <button class="btn btn-primary btn-sm" data-act="resume" data-id="${t.id}">Lanjutkan</button>
                  <button class="btn-icon-sm danger" data-act="delete" data-id="${t.id}" title="Hapus">${l("ban","icon-sm")}</button>
                </div>
              </div>
            `}).join("")}
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeHeldOrdersBtn">Tutup</button>
        </div>
      </div>
    </div>
  `,document.getElementById("closeHeldOrdersBtn").addEventListener("click",()=>{e.innerHTML=""}),e.querySelectorAll('[data-act="resume"]').forEach(t=>{t.addEventListener("click",()=>ht(Number(t.dataset.id)))}),e.querySelectorAll('[data-act="delete"]').forEach(t=>{t.addEventListener("click",()=>ft(Number(t.dataset.id)))})}function ht(e){const t=w.findIndex(n=>n.id===e);if(t===-1||y.length&&!confirm("Keranjang saat ini akan diganti dengan pesanan tertahan ini. Lanjutkan?"))return;const a=w[t];y=[...a.cart],b=a.customer?{...a.customer}:null,document.getElementById("customerSelectLabel").textContent=b?b.name:"Pelanggan Umum",document.getElementById("ordererName").value=a.ordererName||"",K(),document.getElementById("discountInput").value=a.discount,document.getElementById("taxPercentInput").value=a.taxPercent,document.getElementById("orderType").value=a.orderType,document.getElementById("tableNumberRow").style.display=a.orderType==="dine-in"?"":"none",document.getElementById("tableNumber").value=a.tableNumber||"",w.splice(t,1),document.getElementById("heldOrdersModal").innerHTML="",C("kasir"),M(),ie(),Ae(),d("Pesanan tertahan dilanjutkan","success")}function ft(e){confirm("Hapus pesanan tertahan ini secara permanen?")&&(w=w.filter(t=>t.id!==e),ie(),Ne())}async function ke(){if(y.length===0){d("Keranjang masih kosong","error");return}const e=document.getElementById("ordererName").value.trim();if(!b&&!e){d("Nama pemesan wajib diisi untuk pelanggan umum","error"),document.getElementById("ordererName").focus();return}const{discount:t,taxAmount:a,total:n}=N(),s=document.getElementById("paymentMethod").value,i=Number(document.getElementById("cashGiven").value||0);if(s==="cash"&&i<n){d("Uang diterima kurang dari total","error");return}const o=document.getElementById("orderType").value,m=document.getElementById("tableNumber").value,u=document.getElementById("checkoutBtn");u.disabled=!0,u.textContent="Memproses...";try{const g=await A("/api/transactions",{items:y.map(v=>({productId:v.productId,qty:v.qty})),paymentMethod:s,cashGiven:i,orderType:o,tableNumber:m,discount:t,tax:a,customerId:b?b.id:null,customerName:b?null:e});y=[],b=null,document.getElementById("customerSelectLabel").textContent="Pelanggan Umum",document.getElementById("ordererName").value="",K(),document.getElementById("cashGiven").value="",document.getElementById("tableNumber").value="",document.getElementById("discountInput").value=0,document.getElementById("taxPercentInput").value=r.appSettings.defaultTaxPercent||0,M(),await E("products"),R(),Re(g),d("Transaksi berhasil","success")}catch(g){d(g.message,"error")}finally{u.disabled=!1,u.textContent="Bayar Sekarang"}}function Re(e){const t=document.getElementById("receiptModal"),a=r.appSettings,n=e.items.map(s=>`<div class="r-line"><span>${s.name} x${s.qty}</span><span>${p(s.subtotal)}</span></div>`).join("");t.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-box">
        <div class="receipt">
          <h2>${a.storeName||"Kasir Cafe"}</h2>
          ${a.storeAddress?`<div class="r-sub">${a.storeAddress}</div>`:""}
          ${a.storePhone?`<div class="r-sub">${a.storePhone}</div>`:""}
          <div class="r-sub">Struk Transaksi #${e.id}${e.status==="void"?" (DIBATALKAN)":""}</div>
          <div class="r-sub">${new Date(e.createdAt).toLocaleString("id-ID")}</div>
          <div class="r-sub">Kasir: ${e.cashierName} | ${e.orderType}${e.tableNumber?" | Meja "+e.tableNumber:""}</div>
          <div class="r-sub">Pelanggan: ${e.customerName||"Pelanggan Umum"}</div>
          <hr>${n}<hr>
          <div class="r-line"><span>Subtotal</span><span>${p(e.subtotal)}</span></div>
          ${e.discount?`<div class="r-line"><span>Diskon</span><span>-${p(e.discount)}</span></div>`:""}
          ${e.tax?`<div class="r-line"><span>Pajak</span><span>${p(e.tax)}</span></div>`:""}
          <div class="r-line"><b>Total</b><b>${p(e.total)}</b></div>
          <div class="r-line"><span>Bayar (${e.paymentMethod})</span><span>${p(e.cashGiven||e.total)}</span></div>
          ${e.paymentMethod==="cash"?`<div class="r-line"><span>Kembalian</span><span>${p(e.change)}</span></div>`:""}
          <hr><div class="r-sub">${a.receiptFooter||"Terima kasih atas kunjungan Anda!"}</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReceiptBtn">Tutup</button>
          <button class="btn btn-primary" id="printReceiptBtn">${l("receipt","icon-sm")} Cetak</button>
        </div>
      </div>
    </div>
  `,document.getElementById("closeReceiptBtn").addEventListener("click",()=>t.innerHTML=""),document.getElementById("printReceiptBtn").addEventListener("click",()=>window.print())}function Bt(){document.getElementById("posSearch").addEventListener("input",D),document.getElementById("posSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){const t=e.target.value.toLowerCase(),a=r.products.find(n=>n.name.toLowerCase().includes(t)&&n.stock>0);a&&(Ce(a.id),e.target.value="",D())}}),document.getElementById("orderType").addEventListener("change",e=>{document.getElementById("tableNumberRow").style.display=e.target.value==="dine-in"?"":"none"}),document.getElementById("paymentMethod").addEventListener("change",e=>{document.getElementById("cashGivenRow").style.display=e.target.value==="cash"?"":"none",N()}),document.getElementById("cashGiven").addEventListener("input",N),document.getElementById("discountInput").addEventListener("input",N),document.getElementById("taxPercentInput").addEventListener("input",N),document.getElementById("checkoutBtn").addEventListener("click",ke),document.getElementById("holdBtn").addEventListener("click",Be),document.getElementById("cancelBtn").addEventListener("click",fe),document.getElementById("heldOrdersBtn").addEventListener("click",Ne),document.getElementById("ordererName").addEventListener("input",Q),document.getElementById("cartBarBtn").addEventListener("click",Ae),document.getElementById("closeCartModalBtn").addEventListener("click",R),document.getElementById("cartModal").addEventListener("click",e=>{e.target.id==="cartModal"&&R()}),K(),Q(),x("shortcut:focus-search",()=>document.getElementById("posSearch").focus()),x("shortcut:checkout",()=>ke()),x("shortcut:hold-order",()=>Be()),x("shortcut:close-cart-modal",()=>R()),x("shortcut:cancel-order",()=>fe()),x("catalog:products-changed",()=>{ae(),D()}),x("catalog:categories-changed",()=>ae())}async function kt(){await Me(),document.getElementById("taxPercentInput").value=r.appSettings.defaultTaxPercent||0}function Et(){Bt(),yt()}const It={id:"kasir",template:gt,init:Et,load:kt},wt=`
<section class="view" id="view-produk">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Produk</div>
        <div class="page-subtitle">Kelola daftar produk dan stok</div>
      </div>
      <button class="btn btn-primary" id="openAddProductBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Tambah Produk
      </button>
    </div>

    <div class="card card-pad" id="productFormCard" style="display:none; margin-bottom:16px;">
      <h3 id="productFormTitle" style="font-size:14.5px; margin-bottom:14px;">Tambah Produk</h3>
      <form id="productForm">
        <input type="hidden" id="productId">
        <div class="form-field" style="margin-bottom:14px;">
          <label>Gambar Produk</label>
          <div class="image-upload-row">
            <div class="image-preview-box" id="pImagePreviewBox">
              <img id="pImagePreview" style="display:none;" alt="Preview produk">
              <span id="pImagePlaceholder"><svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg></span>
            </div>
            <div class="image-upload-actions">
              <input type="file" id="pImageInput" accept="image/*" style="display:none;">
              <button type="button" class="btn btn-ghost btn-sm" id="pImageUploadBtn">Pilih Gambar</button>
              <button type="button" class="btn btn-ghost btn-sm" id="pImageRemoveBtn" style="display:none;">Hapus Gambar</button>
              <span class="field-hint">Format JPG/PNG, otomatis dikompres agar hemat penyimpanan.</span>
            </div>
          </div>
          <input type="hidden" id="pImageData">
        </div>
        <div class="form-grid-4">
          <div class="form-field"><label>Nama Produk</label><input type="text" id="pName" required></div>
          <div class="form-field"><label>Kategori</label><select id="pCategory"></select></div>
          <div class="form-field"><label>Harga (Rp)</label><input type="number" id="pPrice" required></div>
          <div class="form-field"><label>Stok</label><input type="number" id="pStock" required></div>
        </div>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:14px;">
          <input type="checkbox" id="pFavorite" style="width:16px;height:16px;"> Tandai sebagai produk favorit (tampil di atas halaman Kasir)
        </label>
        <div style="display:flex; gap:8px;">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-ghost" id="cancelProductForm">Batal</button>
        </div>
      </form>
    </div>

    <div class="pos-toolbar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="productSearch" placeholder="Cari produk...">
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table tbl-produk">
        <thead><tr><th>Gambar</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Favorit</th><th>Aksi</th></tr></thead>
        <tbody id="productTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;function de(){const e=document.getElementById("pCategory");if(!e)return;const t=e.value;e.innerHTML=r.categories.map(a=>`<option value="${a.name}">${a.name}</option>`).join(""),t&&r.categories.some(a=>a.name===t)&&(e.value=t)}function J(e){document.getElementById("pImageData").value=e||"";const t=document.getElementById("pImagePreview"),a=document.getElementById("pImagePlaceholder"),n=document.getElementById("pImageRemoveBtn");e?(t.src=e,t.style.display="block",a.style.display="none",n.style.display=""):(t.src="",t.style.display="none",a.style.display="",n.style.display="none")}function xt(e,t,a){return new Promise((n,s)=>{const i=new FileReader;i.onload=o=>{const m=o.target.result,u=new Image;u.onload=()=>{try{let g=u.width,v=u.height;(g>t||v>t)&&(g>v?(v=Math.round(v*t/g),g=t):(g=Math.round(g*t/v),v=t));const f=document.createElement("canvas");f.width=g,f.height=v;const T=f.getContext("2d");if(!T){n(m);return}T.drawImage(u,0,0,g,v);const F=f.toDataURL("image/jpeg",a);n(F&&F.length>20?F:m)}catch{n(m)}},u.onerror=()=>n(m),u.src=m},i.onerror=s,i.readAsDataURL(e)})}function $t(){document.getElementById("productId").value="",document.getElementById("pName").value="",de(),document.getElementById("pPrice").value="",document.getElementById("pStock").value="",document.getElementById("pFavorite").checked=!1,J(""),document.getElementById("productFormTitle").textContent="Tambah Produk"}function Y(){const e=(document.getElementById("productSearch").value||"").toLowerCase(),t=r.products.filter(n=>n.name.toLowerCase().includes(e)),a=document.getElementById("productTableBody");if(!t.length){a.innerHTML=`<tr><td colspan="7"><div class="empty-state">${l("package","icon-lg")}<div class="es-title">Belum ada produk</div></div></td></tr>`;return}a.innerHTML=t.map(n=>`
    <tr>
      <td>${n.image?`<img class="table-thumb" src="${n.image}" alt="${n.name}">`:`<div class="table-thumb-placeholder">${l("package","icon-sm")}</div>`}</td>
      <td><b>${n.name}</b></td>
      <td><span class="badge gray">${n.category}</span></td>
      <td>${p(n.price)}</td>
      <td>${n.stock<=15?`<span class="badge amber">${n.stock}</span>`:n.stock}</td>
      <td>${n.favorite?`<span class="badge blue">${l("star","icon-sm")} Favorit</span>`:"-"}</td>
      <td>
        <span class="link-action" data-act="edit" data-id="${n.id}">Edit</span>
        <span class="link-action danger" data-act="delete" data-id="${n.id}">Hapus</span>
      </td>
    </tr>
  `).join(""),a.querySelectorAll("[data-act]").forEach(n=>{n.addEventListener("click",async()=>{const s=Number(n.dataset.id),i=r.products.find(o=>o.id===s);if(n.dataset.act==="edit")document.getElementById("productId").value=i.id,document.getElementById("pName").value=i.name,de(),document.getElementById("pCategory").value=i.category,document.getElementById("pPrice").value=i.price,document.getElementById("pStock").value=i.stock,document.getElementById("pFavorite").checked=!!i.favorite,J(i.image||""),document.getElementById("productFormTitle").textContent="Edit Produk",document.getElementById("productFormCard").style.display="block",document.getElementById("productFormCard").scrollIntoView({behavior:"smooth"});else if(n.dataset.act==="delete"){if(!confirm(`Hapus produk "${i.name}"?`))return;await Z("/api/products/"+s),d("Produk dihapus","success"),await E("products"),Y()}})})}function St(){document.getElementById("openAddProductBtn").addEventListener("click",()=>{$t(),document.getElementById("productFormCard").style.display="block"}),document.getElementById("cancelProductForm").addEventListener("click",()=>{document.getElementById("productFormCard").style.display="none"}),document.getElementById("pImageUploadBtn").addEventListener("click",()=>document.getElementById("pImageInput").click()),document.getElementById("pImageRemoveBtn").addEventListener("click",()=>J("")),document.getElementById("pImageInput").addEventListener("change",async e=>{const t=e.target.files[0];if(t){if(!t.type.startsWith("image/")){d("File harus berupa gambar","error");return}try{const a=await xt(t,480,.8);J(a)}catch{d("Gagal memproses gambar","error")}e.target.value=""}}),document.getElementById("productForm").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("productId").value,a={name:document.getElementById("pName").value,category:document.getElementById("pCategory").value,price:Number(document.getElementById("pPrice").value),stock:Number(document.getElementById("pStock").value),favorite:document.getElementById("pFavorite").checked,image:document.getElementById("pImageData").value};try{t?(await S("/api/products/"+t,a),d("Produk diperbarui","success")):(await A("/api/products",a),d("Produk ditambahkan","success")),document.getElementById("productFormCard").style.display="none",await E("products"),Y()}catch(n){d(n.message,"error")}}),document.getElementById("productSearch").addEventListener("input",Y),x("catalog:categories-changed",de)}async function Tt(){Y()}function Lt(){St()}const Mt={id:"produk",template:wt,init:Lt,load:Tt},Pt=`
<section class="view" id="view-kategori">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Kategori</div>
        <div class="page-subtitle">Kelola kategori produk</div>
      </div>
      <button class="btn btn-primary" id="openAddCategoryBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Tambah Kategori
      </button>
    </div>

    <div class="card card-pad" id="categoryFormCard" style="display:none; margin-bottom:16px;">
      <h3 id="categoryFormTitle" style="font-size:14.5px; margin-bottom:14px;">Tambah Kategori</h3>
      <form id="categoryForm">
        <input type="hidden" id="categoryId">
        <div class="form-field" style="max-width:320px;"><label>Nama Kategori</label><input type="text" id="catName" required></div>
        <label style="display:block; font-size:12px; color:var(--text-secondary); margin-bottom:6px; font-weight:500;">Warna</label>
        <div class="color-picker" id="colorPicker"></div>
        <div style="display:flex; gap:8px;">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-ghost" id="cancelCategoryForm">Batal</button>
        </div>
      </form>
    </div>

    <div class="category-grid" id="categoryGrid"></div>
  </div>
</section>
`;let H=se[0];function oe(){const e=document.getElementById("colorPicker");e.innerHTML=se.map(t=>`
    <div class="color-dot ${t===H?"selected":""}" data-color="${t}" style="background:${t};">
      ${t===H?l("check","icon-sm"):""}
    </div>
  `).join(""),e.querySelectorAll(".color-dot").forEach(t=>{t.addEventListener("click",()=>{H=t.dataset.color,oe()})})}function Ct(){document.getElementById("categoryId").value="",document.getElementById("catName").value="",H=se[0],oe(),document.getElementById("categoryFormTitle").textContent="Tambah Kategori"}function re(){const e=document.getElementById("categoryGrid"),t=r.categories;if(!t.length){e.innerHTML=`<div class="empty-state" style="grid-column:1/-1;">${l("tag","icon-lg")}<div class="es-title">Belum ada kategori</div></div>`;return}e.innerHTML=t.map(a=>`
    <div class="card category-card">
      <div class="cat-top-row">
        <div class="cat-swatch" style="background:${a.color};"></div>
        <div>
          <div class="cat-name">${a.name}</div>
          <div class="cat-count">${a.productCount} produk</div>
        </div>
      </div>
      <div class="cat-actions">
        <button class="btn btn-secondary btn-sm" data-act="edit" data-id="${a.id}">Edit</button>
        ${a.name!=="Umum"?`<button class="btn btn-ghost btn-sm" data-act="delete" data-id="${a.id}" style="color:var(--color-danger);">Hapus</button>`:""}
      </div>
    </div>
  `).join(""),e.querySelectorAll("[data-act]").forEach(a=>{a.addEventListener("click",async()=>{const n=Number(a.dataset.id),s=t.find(i=>i.id===n);if(a.dataset.act==="edit")document.getElementById("categoryId").value=s.id,document.getElementById("catName").value=s.name,H=s.color,oe(),document.getElementById("categoryFormTitle").textContent="Edit Kategori",document.getElementById("categoryFormCard").style.display="block",document.getElementById("categoryFormCard").scrollIntoView({behavior:"smooth"});else if(a.dataset.act==="delete"){if(!confirm(`Hapus kategori "${s.name}"? Produk di kategori ini akan dipindahkan ke "Umum".`))return;try{await Z("/api/categories/"+n),d("Kategori dihapus, produk dipindahkan ke Umum","success"),await E("categories"),await E("products"),re()}catch(i){d(i.message,"error")}}})})}function At(){document.getElementById("openAddCategoryBtn").addEventListener("click",()=>{Ct(),document.getElementById("categoryFormCard").style.display="block"}),document.getElementById("cancelCategoryForm").addEventListener("click",()=>{document.getElementById("categoryFormCard").style.display="none"}),document.getElementById("categoryForm").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("categoryId").value,a={name:document.getElementById("catName").value,color:H};try{t?(await S("/api/categories/"+t,a),d("Kategori diperbarui","success")):(await A("/api/categories",a),d("Kategori ditambahkan","success")),document.getElementById("categoryFormCard").style.display="none",await E("categories"),await E("products"),re()}catch(n){d(n.message,"error")}})}async function Nt(){await Pe(),re()}function Rt(){At()}const Ht={id:"kategori",template:Pt,init:Rt,load:Nt},Ft=`
<section class="view" id="view-pelanggan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Pelanggan</div>
        <div class="page-subtitle">Kelola data pelanggan dan riwayat belanja</div>
      </div>
      <button class="btn btn-primary" id="openAddCustomerBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Tambah Pelanggan
      </button>
    </div>

    <div class="stat-grid stat-grid-3" id="customerStatGrid"></div>

    <div class="card card-pad" id="customerFormCard" style="display:none; margin-bottom:16px;">
      <h3 id="customerFormTitle" style="font-size:14.5px; margin-bottom:14px;">Tambah Pelanggan</h3>
      <form id="customerForm">
        <input type="hidden" id="customerId">
        <div class="form-grid-2">
          <div class="form-field"><label>Nama</label><input type="text" id="cName" required></div>
          <div class="form-field"><label>Telepon</label><input type="text" id="cPhone" placeholder="08xxxxxxxxxx"></div>
          <div class="form-field"><label>Email</label><input type="email" id="cEmail"></div>
          <div class="form-field"><label>Alamat</label><input type="text" id="cAddress"></div>
        </div>
        <div class="form-field"><label>Catatan</label><input type="text" id="cNote" placeholder="mis. preferensi, alergi, dll"></div>
        <div style="display:flex; gap:8px;">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-ghost" id="cancelCustomerForm">Batal</button>
        </div>
      </form>
    </div>

    <div class="pos-toolbar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="customerSearch" placeholder="Cari nama atau nomor telepon...">
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table tbl-pelanggan">
        <thead><tr><th>Pelanggan</th><th>Telepon</th><th>Total Transaksi</th><th>Total Belanja</th><th>Kunjungan Terakhir</th><th>Aksi</th></tr></thead>
        <tbody id="customerTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;function jt(){document.getElementById("customerId").value="",document.getElementById("cName").value="",document.getElementById("cPhone").value="",document.getElementById("cEmail").value="",document.getElementById("cAddress").value="",document.getElementById("cNote").value="",document.getElementById("customerFormTitle").textContent="Tambah Pelanggan"}function He(){const e=document.getElementById("customerTableBody"),t=r.customers;if(!t.length){e.innerHTML=`<tr><td colspan="6"><div class="empty-state">${l("users","icon-lg")}<div class="es-title">Belum ada pelanggan</div></div></td></tr>`;return}e.innerHTML=t.map(a=>`
    <tr>
      <td>
        <div class="cust-name-cell">
          <div class="customer-avatar">${a.name.charAt(0).toUpperCase()}</div>
          <div><b>${a.name}</b>${a.email?`<div style="font-size:11px;color:var(--text-secondary);">${a.email}</div>`:""}</div>
        </div>
      </td>
      <td>${a.phone||"-"}</td>
      <td>${a.transactionCount}</td>
      <td>${p(a.totalSpend)}</td>
      <td>${Le(a.lastVisit)}</td>
      <td>
        <span class="link-action" data-act="edit" data-id="${a.id}">Edit</span>
        <span class="link-action danger" data-act="delete" data-id="${a.id}">Hapus</span>
      </td>
    </tr>
  `).join(""),e.querySelectorAll("[data-act]").forEach(a=>{a.addEventListener("click",async()=>{const n=Number(a.dataset.id),s=t.find(i=>i.id===n);if(a.dataset.act==="edit")document.getElementById("customerId").value=s.id,document.getElementById("cName").value=s.name,document.getElementById("cPhone").value=s.phone,document.getElementById("cEmail").value=s.email,document.getElementById("cAddress").value=s.address,document.getElementById("cNote").value=s.note,document.getElementById("customerFormTitle").textContent="Edit Pelanggan",document.getElementById("customerFormCard").style.display="block",document.getElementById("customerFormCard").scrollIntoView({behavior:"smooth"});else if(a.dataset.act==="delete"){if(!confirm(`Hapus pelanggan "${s.name}"?`))return;try{await Z("/api/customers/"+n),d("Pelanggan dihapus","success"),await E("customers"),le()}catch(i){d(i.message,"error")}}})})}function le(){const e=r.customers,t=e.length,a=new Date().toISOString().slice(0,7),n=e.filter(i=>(i.createdAt||"").slice(0,7)===a).length,s=e.slice().sort((i,o)=>o.transactionCount-i.transactionCount)[0];document.getElementById("customerStatGrid").innerHTML=`
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${l("users")}</div></div>
      <div class="stat-label">Total Pelanggan</div>
      <div class="stat-value">${t}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${l("trendUp")}</div></div>
      <div class="stat-label">Pelanggan Baru Bulan Ini</div>
      <div class="stat-value">${n}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${l("award")}</div></div>
      <div class="stat-label">Pelanggan Teraktif</div>
      <div class="stat-value" style="font-size:16px;">${s&&s.transactionCount?s.name:"-"}</div>
    </div>
  `,He()}function Dt(){document.getElementById("openAddCustomerBtn").addEventListener("click",()=>{jt(),document.getElementById("customerFormCard").style.display="block"}),document.getElementById("cancelCustomerForm").addEventListener("click",()=>{document.getElementById("customerFormCard").style.display="none"}),document.getElementById("customerForm").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("customerId").value,a={name:document.getElementById("cName").value,phone:document.getElementById("cPhone").value,email:document.getElementById("cEmail").value,address:document.getElementById("cAddress").value,note:document.getElementById("cNote").value};try{t?(await S("/api/customers/"+t,a),d("Pelanggan diperbarui","success")):(await A("/api/customers",a),d("Pelanggan ditambahkan","success")),document.getElementById("customerFormCard").style.display="none",await V(document.getElementById("customerSearch").value),le()}catch(n){d(n.message,"error")}}),document.getElementById("customerSearch").addEventListener("input",async e=>{await V(e.target.value),He()})}async function qt(){await V(),le()}function Kt(){Dt()}const Ut={id:"pelanggan",template:Ft,init:Kt,load:qt},zt=`
<section class="view" id="view-transaksi">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Transaksi</div>
        <div class="page-subtitle">Riwayat seluruh transaksi penjualan</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" id="exportCsvBtn">
          <svg class="icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
        <button class="btn btn-secondary" id="printTxBtn">
          <svg class="icon-sm" viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak / Simpan PDF
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="txSearch" placeholder="Cari invoice, kasir, atau pelanggan...">
      </div>
      <div class="form-field"><label>Dari Tanggal</label><input type="date" id="txFrom"></div>
      <div class="form-field"><label>Sampai Tanggal</label><input type="date" id="txTo"></div>
      <div class="form-field">
        <label>Metode Bayar</label>
        <select id="txPaymentFilter">
          <option value="">Semua</option>
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="debit">Kartu Debit</option>
        </select>
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="txStatusFilter">
          <option value="">Semua</option>
          <option value="paid">Lunas</option>
          <option value="void">Dibatalkan</option>
        </select>
      </div>
      <button class="btn btn-ghost" id="txResetFilterBtn">Reset</button>
    </div>

    <div class="table-wrap" id="txTableWrap">
      <table class="data-table" id="txTable">
        <thead>
          <tr>
            <th>No</th>
            <th class="th-sort" data-sort="id">Invoice</th>
            <th class="th-sort" data-sort="createdAt">Tanggal</th>
            <th>Kasir</th>
            <th>Pelanggan</th>
            <th class="th-sort" data-sort="itemCount">Jumlah Item</th>
            <th class="th-sort" data-sort="total">Grand Total</th>
            <th>Metode Bayar</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="txTableBody"></tbody>
      </table>
    </div>
    <div class="pagination-bar">
      <div class="pagination-info" id="txPaginationInfo"></div>
      <div class="pagination-controls" id="txPaginationControls"></div>
    </div>
  </div>
</section>
`;let c={search:"",from:"",to:"",paymentMethod:"",status:"",sortBy:"createdAt",sortDir:"desc",page:1,pageSize:10},Fe=[];const je={cash:"Tunai",qris:"QRIS",debit:"Kartu Debit"};async function k(){const e=new URLSearchParams;c.search&&e.set("search",c.search),c.from&&e.set("from",c.from),c.to&&e.set("to",c.to),c.paymentMethod&&e.set("paymentMethod",c.paymentMethod),c.status&&e.set("status",c.status),e.set("sortBy",c.sortBy),e.set("sortDir",c.sortDir),e.set("page",c.page),e.set("pageSize",c.pageSize);const t=await h("/api/transactions/search?"+e.toString());Fe=t.data,Ot(t),_t(t)}function Ot(e){const t=document.getElementById("txTableBody");if(!e.data.length){t.innerHTML=`<tr><td colspan="10"><div class="empty-state">${l("receipt","icon-lg")}<div class="es-title">Tidak ada transaksi ditemukan</div></div></td></tr>`;return}t.innerHTML=e.data.map((a,n)=>{const s=a.items.reduce((o,m)=>o+m.qty,0),i=a.status==="void";return`
    <tr>
      <td>${(e.page-1)*e.pageSize+n+1}</td>
      <td><b>#INV-${String(a.id).padStart(4,"0")}</b></td>
      <td>${new Date(a.createdAt).toLocaleString("id-ID")}</td>
      <td>${a.cashierName}</td>
      <td>${a.customerName||"Pelanggan Umum"}</td>
      <td>${s}</td>
      <td>${p(a.total)}</td>
      <td><span class="badge gray">${je[a.paymentMethod]||a.paymentMethod}</span></td>
      <td>${i?'<span class="badge red">Dibatalkan</span>':'<span class="badge green">Lunas</span>'}</td>
      <td>
        <span class="link-action" data-act="view" data-id="${a.id}">Lihat</span>
        ${!i&&q("retur")?`<span class="link-action" data-act="retur" data-id="${a.id}">Retur</span>`:""}
        ${!i&&r.currentUser.role==="admin"?`<span class="link-action danger" data-act="void" data-id="${a.id}">Batalkan</span>`:""}
      </td>
    </tr>
  `}).join(""),t.querySelectorAll("[data-act]").forEach(a=>{a.addEventListener("click",async()=>{const n=Number(a.dataset.id),s=Fe.find(i=>i.id===n);if(a.dataset.act==="view")Re(s);else if(a.dataset.act==="retur")$("transaksi:go-return",n);else if(a.dataset.act==="void"){if(!confirm(`Batalkan transaksi #INV-${String(n).padStart(4,"0")}? Stok produk akan dikembalikan.`))return;try{await S(`/api/transactions/${n}/void`),d("Transaksi dibatalkan, stok dikembalikan","success"),await k(),await E("products")}catch(i){d(i.message,"error")}}})}),document.querySelectorAll("#txTable .th-sort").forEach(a=>{a.textContent=a.textContent.replace(/ ▲| ▼/,""),a.dataset.sort===c.sortBy&&(a.textContent+=c.sortDir==="asc"?" ▲":" ▼")})}function _t(e){document.getElementById("txPaginationInfo").textContent=`Menampilkan ${e.data.length?(e.page-1)*e.pageSize+1:0}–${Math.min(e.page*e.pageSize,e.total)} dari ${e.total} transaksi`;const t=document.getElementById("txPaginationControls");let a=`<button class="page-btn" id="txPrevBtn" ${e.page<=1?"disabled":""}>${l("chevronLeft","icon-sm")}</button>`;for(let i=1;i<=e.totalPages;i++){if(e.totalPages>7&&Math.abs(i-e.page)>2&&i!==1&&i!==e.totalPages){(i===2||i===e.totalPages-1)&&(a+='<span style="padding:0 4px;">…</span>');continue}a+=`<button class="page-btn ${i===e.page?"active":""}" data-page="${i}">${i}</button>`}a+=`<button class="page-btn" id="txNextBtn" ${e.page>=e.totalPages?"disabled":""}>${l("chevronRight","icon-sm")}</button>`,t.innerHTML=a,t.querySelectorAll("[data-page]").forEach(i=>i.addEventListener("click",()=>{c.page=Number(i.dataset.page),k()}));const n=document.getElementById("txPrevBtn");n&&n.addEventListener("click",()=>{c.page>1&&(c.page--,k())});const s=document.getElementById("txNextBtn");s&&s.addEventListener("click",()=>{c.page<e.totalPages&&(c.page++,k())})}async function Gt(){const e=new URLSearchParams;c.search&&e.set("search",c.search),c.from&&e.set("from",c.from),c.to&&e.set("to",c.to),c.paymentMethod&&e.set("paymentMethod",c.paymentMethod),c.status&&e.set("status",c.status),e.set("sortBy",c.sortBy),e.set("sortDir",c.sortDir),e.set("pageSize",1e5),e.set("page",1);const t=await h("/api/transactions/search?"+e.toString()),a=["No","Invoice","Tanggal","Kasir","Pelanggan","Jumlah Item","Subtotal","Diskon","Pajak","Grand Total","Metode Bayar","Status"],n=t.data.map((u,g)=>[g+1,`INV-${String(u.id).padStart(4,"0")}`,new Date(u.createdAt).toLocaleString("id-ID"),u.cashierName,u.customerName||"Pelanggan Umum",u.items.reduce((v,f)=>v+f.qty,0),u.subtotal,u.discount,u.tax,u.total,je[u.paymentMethod]||u.paymentMethod,u.status==="void"?"Dibatalkan":"Lunas"]),s=[a,...n].map(u=>u.map(g=>`"${String(g).replace(/"/g,'""')}"`).join(",")).join(`
`),i=new Blob([s],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(i),m=document.createElement("a");m.href=o,m.download=`transaksi-${new Date().toISOString().slice(0,10)}.csv`,m.click(),URL.revokeObjectURL(o),d(`${t.data.length} transaksi diekspor ke CSV`,"success")}function Vt(){document.body.classList.add("print-table-mode"),window.print(),setTimeout(()=>document.body.classList.remove("print-table-mode"),500)}function Qt(){document.getElementById("txSearch").addEventListener("input",ut(e=>{c.search=e.target.value,c.page=1,k()},300)),document.getElementById("txFrom").addEventListener("change",e=>{c.from=e.target.value,c.page=1,k()}),document.getElementById("txTo").addEventListener("change",e=>{c.to=e.target.value,c.page=1,k()}),document.getElementById("txPaymentFilter").addEventListener("change",e=>{c.paymentMethod=e.target.value,c.page=1,k()}),document.getElementById("txStatusFilter").addEventListener("change",e=>{c.status=e.target.value,c.page=1,k()}),document.getElementById("txResetFilterBtn").addEventListener("click",()=>{c={search:"",from:"",to:"",paymentMethod:"",status:"",sortBy:"createdAt",sortDir:"desc",page:1,pageSize:10},document.getElementById("txSearch").value="",document.getElementById("txFrom").value="",document.getElementById("txTo").value="",document.getElementById("txPaymentFilter").value="",document.getElementById("txStatusFilter").value="",k()}),document.querySelectorAll("#txTable .th-sort").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.sort;c.sortBy===t?c.sortDir=c.sortDir==="asc"?"desc":"asc":(c.sortBy=t,c.sortDir="desc"),k()})}),document.getElementById("exportCsvBtn").addEventListener("click",Gt),document.getElementById("printTxBtn").addEventListener("click",Vt),x("retur:transaction-voided-or-returned",()=>k())}async function Jt(){await k()}function Yt(){Qt()}const Wt={id:"transaksi",template:zt,init:Yt,load:Jt},Zt=`
<section class="view" id="view-stok">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Stok</div>
        <div class="page-subtitle">Pantau dan sesuaikan stok produk</div>
      </div>
    </div>

    <div class="stat-grid" id="stockStatGrid"></div>

    <div class="card-title-row" style="margin-top:8px;"><h3 style="font-size:15px;">Daftar Stok Produk</h3></div>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table class="data-table tbl-stok">
        <thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody id="stockTableBody"></tbody>
      </table>
    </div>

    <div class="card-title-row"><h3 style="font-size:15px;">Riwayat Mutasi Stok</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-mutasi">
        <thead><tr><th>Tanggal</th><th>Produk</th><th>Jenis</th><th>Jumlah</th><th>Stok Sebelum</th><th>Stok Sesudah</th><th>Alasan</th><th>Oleh</th></tr></thead>
        <tbody id="mutationTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;let j="in";async function De(){const e=await h("/api/stock/overview");document.getElementById("stockStatGrid").innerHTML=`
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${l("boxes")}</div></div>
      <div class="stat-label">Total Produk</div>
      <div class="stat-value">${e.summary.totalProducts}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${l("alert")}</div></div>
      <div class="stat-label">Stok Menipis</div>
      <div class="stat-value">${e.summary.lowStockCount}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon red">${l("ban")}</div></div>
      <div class="stat-label">Stok Habis</div>
      <div class="stat-value">${e.summary.outOfStockCount}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${l("award")}</div></div>
      <div class="stat-label">Total Nilai Stok</div>
      <div class="stat-value" style="font-size:18px;">${p(e.summary.totalStockValue)}</div>
    </div>
  `;const t=document.getElementById("stockTableBody");t.innerHTML=e.products.map(a=>`
    <tr>
      <td><b>${a.name}</b></td>
      <td><span class="badge gray">${a.category}</span></td>
      <td>${p(a.price)}</td>
      <td>${a.stock}</td>
      <td><span class="status-pill ${a.status}">${a.status==="aman"?"Aman":a.status==="menipis"?"Menipis":"Habis"}</span></td>
      <td><span class="link-action" data-id="${a.id}">Sesuaikan Stok</span></td>
    </tr>
  `).join(""),t.querySelectorAll("[data-id]").forEach(a=>{a.addEventListener("click",()=>{const n=e.products.find(s=>s.id===Number(a.dataset.id));Xt(n)})})}async function qe(){const e=await h("/api/stock/mutations"),t=document.getElementById("mutationTableBody");if(!e.length){t.innerHTML=`<tr><td colspan="8"><div class="empty-state">${l("boxes","icon-lg")}<div class="es-title">Belum ada mutasi stok</div></div></td></tr>`;return}t.innerHTML=e.map(a=>`
    <tr>
      <td>${new Date(a.createdAt).toLocaleString("id-ID")}</td>
      <td><b>${a.productName}</b></td>
      <td><span class="mutation-type ${a.type}">${a.type==="in"?l("plus","icon-sm")+" Masuk":l("minus","icon-sm")+" Keluar"}</span></td>
      <td>${a.qty}</td>
      <td>${a.stockBefore}</td>
      <td>${a.stockAfter}</td>
      <td>${a.reason}</td>
      <td>${a.userName}</td>
    </tr>
  `).join("")}function Xt(e){j="in";const t=document.getElementById("stockAdjustModal");t.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Sesuaikan Stok — ${e.name}</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-top:-8px; margin-bottom:14px;">Stok saat ini: <b>${e.stock}</b></p>
        <div class="radio-toggle">
          <label class="checked-in" id="typeInLabel"><input type="radio" name="stockType" value="in" checked> Stok Masuk</label>
          <label id="typeOutLabel"><input type="radio" name="stockType" value="out"> Stok Keluar</label>
        </div>
        <div class="form-field"><label>Jumlah</label><input type="number" id="adjustQty" min="1" required></div>
        <div class="form-field">
          <label>Alasan</label>
          <select id="adjustReason">
            <option value="Restock">Restock</option>
            <option value="Koreksi Stok">Koreksi Stok</option>
            <option value="Barang Rusak">Barang Rusak</option>
            <option value="Kadaluarsa">Kadaluarsa</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeAdjustBtn">Batal</button>
          <button class="btn btn-primary" id="submitAdjustBtn">Simpan</button>
        </div>
      </div>
    </div>
  `,t.querySelectorAll('input[name="stockType"]').forEach(a=>{a.addEventListener("change",n=>{j=n.target.value,document.getElementById("typeInLabel").className=j==="in"?"checked-in":"",document.getElementById("typeOutLabel").className=j==="out"?"checked-out":""})}),document.getElementById("closeAdjustBtn").addEventListener("click",()=>t.innerHTML=""),document.getElementById("submitAdjustBtn").addEventListener("click",async()=>{const a=Number(document.getElementById("adjustQty").value),n=document.getElementById("adjustReason").value;if(!a||a<=0){d("Masukkan jumlah yang valid","error");return}try{await A("/api/stock/adjust",{productId:e.id,type:j,qty:a,reason:n}),d("Stok berhasil disesuaikan","success"),t.innerHTML="",await De(),await qe(),await E("products")}catch(s){d(s.message,"error")}})}async function ea(){await De(),await qe()}function ta(){}const aa={id:"stok",template:Zt,init:ta,load:ea},na=`
<section class="view" id="view-retur">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Retur</div>
        <div class="page-subtitle">Proses pengembalian barang dari transaksi yang sudah selesai</div>
      </div>
      <button class="btn btn-primary" id="openReturnSearchBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Retur Baru
      </button>
    </div>

    <div class="stat-grid" id="returnStatGrid"></div>

    <div class="card-title-row"><h3 style="font-size:15px;">Riwayat Retur</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-retur">
        <thead><tr><th>Tanggal</th><th>Invoice Asal</th><th>Pelanggan</th><th>Item Diretur</th><th>Nilai Refund</th><th>Alasan</th><th>Diproses Oleh</th></tr></thead>
        <tbody id="returnTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;let z=null;function sa(){z=null;const e=document.getElementById("returnModal");e.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Retur Transaksi</h3>
        <div class="return-search-row">
          <input type="text" id="returnModalSearchInput" placeholder="Cari nomor invoice (mis. INV-0001) atau nama pelanggan...">
          <button class="btn btn-primary" id="returnModalSearchBtn">Cari</button>
        </div>
        <div id="returnModalMatches"></div>
        <div id="returnFormSection" class="return-form-section" style="opacity:0.45; pointer-events:none;">
          <p id="returnFormHint" style="font-size:12.5px; color:var(--text-secondary); margin:0 0 10px;">Pilih transaksi di atas untuk mengisi form retur.</p>
          <div id="returnModalItemsList"></div>
          <div class="form-field" style="margin-top:14px;">
            <label>Alasan Retur</label>
            <select id="returnModalReason" disabled>
              <option value="Barang Rusak">Barang Rusak</option>
              <option value="Salah Pesan">Salah Pesan</option>
              <option value="Tidak Sesuai">Tidak Sesuai Pesanan</option>
              <option value="Pelanggan Berubah Pikiran">Pelanggan Berubah Pikiran</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div class="return-summary-box">
            <div class="sum-row grand"><span>Total Refund</span><span id="returnModalRefundTotal">Rp 0</span></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReturnModalBtn">Tutup</button>
          <button class="btn btn-primary" id="submitReturnModalBtn" disabled>Proses Retur</button>
        </div>
      </div>
    </div>
  `,document.getElementById("returnModalSearchBtn").addEventListener("click",()=>Ee(e)),document.getElementById("returnModalSearchInput").addEventListener("keydown",t=>{t.key==="Enter"&&Ee(e)}),document.getElementById("closeReturnModalBtn").addEventListener("click",()=>e.innerHTML=""),document.getElementById("submitReturnModalBtn").addEventListener("click",()=>{z&&Ke(z.id,e)}),document.getElementById("returnModalSearchInput").focus()}async function Ee(e){const t=document.getElementById("returnModalSearchInput").value.trim(),a=document.getElementById("returnModalMatches");if(!t){a.innerHTML="";return}try{const n=await h("/api/transactions/lookup?query="+encodeURIComponent(t));if(!n.length){a.innerHTML=`<div class="empty-state">${l("receipt","icon-lg")}<div class="es-title">Tidak ditemukan transaksi yang bisa diretur</div></div>`;return}a.innerHTML=n.map(s=>`
      <div class="return-match-card" data-id="${s.id}">
        <div class="return-match-top">
          <b>#INV-${String(s.id).padStart(4,"0")}</b>
          <span class="badge gray">${new Date(s.createdAt).toLocaleDateString("id-ID")}</span>
        </div>
        <div style="font-size:12.5px; color:var(--text-secondary);">${s.customerName||"Pelanggan Umum"} · ${s.items.length} jenis item · ${p(s.total)}</div>
      </div>
    `).join(""),a.querySelectorAll(".return-match-card").forEach(s=>{s.addEventListener("click",()=>{const i=n.find(o=>o.id===Number(s.dataset.id));ia(i,e)})})}catch(n){d(n.message,"error")}}function ia(e,t){z=e,t.querySelectorAll(".return-match-card").forEach(s=>{s.classList.toggle("selected",Number(s.dataset.id)===e.id)});const a=e.items.filter(s=>s.remainingQty>0).map(s=>`
    <div class="return-item-row" data-product-id="${s.productId}" data-price="${s.price}" data-max="${s.remainingQty}">
      <div class="ri-name"><b>${s.name}</b><div class="ri-remaining">Sisa bisa diretur: ${s.remainingQty} dari ${s.qty} dibeli</div></div>
      <input type="number" class="returnQtyInput" min="0" max="${s.remainingQty}" value="0">
    </div>
  `).join("");document.getElementById("returnFormHint").textContent=`#INV-${String(e.id).padStart(4,"0")} · ${e.customerName||"Pelanggan Umum"} · ${new Date(e.createdAt).toLocaleString("id-ID")} · Kasir: ${e.cashierName}`,document.getElementById("returnModalItemsList").innerHTML=a;const n=document.getElementById("returnFormSection");n.style.opacity="1",n.style.pointerEvents="auto",document.getElementById("returnModalReason").disabled=!1,document.getElementById("submitReturnModalBtn").disabled=!1,t.querySelectorAll("#returnModalItemsList .returnQtyInput").forEach(s=>s.addEventListener("input",()=>W(t))),W(t)}async function da(e){try{const t=await h(`/api/transactions/${e}/returnable`);if(!t.items.some(a=>a.remainingQty>0)){d("Semua item pada transaksi ini sudah diretur","error");return}oa(t)}catch(t){d(t.message,"error")}}function oa(e){const t=document.getElementById("returnModal"),a=e.items.filter(n=>n.remainingQty>0).map(n=>`
    <div class="return-item-row" data-product-id="${n.productId}" data-price="${n.price}" data-max="${n.remainingQty}">
      <div class="ri-name"><b>${n.name}</b><div class="ri-remaining">Sisa bisa diretur: ${n.remainingQty} dari ${n.qty} dibeli</div></div>
      <input type="number" class="returnQtyInput" min="0" max="${n.remainingQty}" value="0">
    </div>
  `).join("");t.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Retur — #INV-${String(e.id).padStart(4,"0")}</h3>
        <p style="font-size:12px; color:var(--text-secondary); margin-top:-8px; margin-bottom:14px;">${e.customerName||"Pelanggan Umum"} · ${new Date(e.createdAt).toLocaleString("id-ID")} · Kasir: ${e.cashierName}</p>
        <div id="returnModalItemsList">${a}</div>
        <div class="form-field" style="margin-top:14px;">
          <label>Alasan Retur</label>
          <select id="returnModalReason">
            <option value="Barang Rusak">Barang Rusak</option>
            <option value="Salah Pesan">Salah Pesan</option>
            <option value="Tidak Sesuai">Tidak Sesuai Pesanan</option>
            <option value="Pelanggan Berubah Pikiran">Pelanggan Berubah Pikiran</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div class="return-summary-box">
          <div class="sum-row grand"><span>Total Refund</span><span id="returnModalRefundTotal">Rp 0</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReturnModalBtn">Batal</button>
          <button class="btn btn-primary" id="submitReturnModalBtn">Proses Retur</button>
        </div>
      </div>
    </div>
  `,t.querySelectorAll(".returnQtyInput").forEach(n=>n.addEventListener("input",()=>W(t))),W(t),document.getElementById("closeReturnModalBtn").addEventListener("click",()=>t.innerHTML=""),document.getElementById("submitReturnModalBtn").addEventListener("click",()=>Ke(e.id,t))}function W(e){let t=0;e.querySelectorAll(".return-item-row").forEach(a=>{const n=Number(a.dataset.max),s=Number(a.dataset.price),i=a.querySelector(".returnQtyInput");let o=Number(i.value||0);o>n&&(o=n,i.value=n),o<0&&(o=0,i.value=0),t+=s*o}),document.getElementById("returnModalRefundTotal").textContent=p(t)}async function Ke(e,t){const a=[];if(t.querySelectorAll(".return-item-row").forEach(s=>{const i=Number(s.querySelector(".returnQtyInput").value||0);i>0&&a.push({productId:Number(s.dataset.productId),qty:i})}),!a.length){d("Pilih minimal 1 item untuk diretur","error");return}const n=document.getElementById("returnModalReason").value;try{await A("/api/returns",{transactionId:e,items:a,reason:n}),d("Retur berhasil diproses, stok dikembalikan","success"),t.innerHTML="",await E("products"),await Ue(),await ze(),$("retur:transaction-voided-or-returned")}catch(s){d(s.message,"error")}}async function Ue(){const e=await h("/api/returns"),t=new Date().toISOString().slice(0,7),a=new Date().toISOString().slice(0,10),n=e.filter(i=>i.createdAt.slice(0,7)===t),s=e.filter(i=>i.createdAt.slice(0,10)===a);document.getElementById("returnStatGrid").innerHTML=`
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon blue">${l("undo")}</div></div><div class="stat-label">Retur Bulan Ini</div><div class="stat-value">${n.length}</div></div>
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon amber">${l("receipt")}</div></div><div class="stat-label">Nilai Retur Bulan Ini</div><div class="stat-value" style="font-size:18px;">${p(n.reduce((i,o)=>i+o.refundAmount,0))}</div></div>
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon green">${l("clock")}</div></div><div class="stat-label">Retur Hari Ini</div><div class="stat-value">${s.length}</div></div>
  `}async function ze(){const e=await h("/api/returns"),t=document.getElementById("returnTableBody");if(!e.length){t.innerHTML=`<tr><td colspan="7"><div class="empty-state">${l("undo","icon-lg")}<div class="es-title">Belum ada retur</div></div></td></tr>`;return}t.innerHTML=e.map(a=>`
    <tr>
      <td>${new Date(a.createdAt).toLocaleString("id-ID")}</td>
      <td><b>${a.invoiceLabel}</b></td>
      <td>${a.customerName}</td>
      <td>${a.items.map(n=>n.name+" x"+n.qty).join(", ")}</td>
      <td>${p(a.refundAmount)}</td>
      <td><span class="badge amber">${a.reason}</span></td>
      <td>${a.userName}</td>
    </tr>
  `).join("")}async function ra(){await Ue(),await ze()}function la(){document.getElementById("openReturnSearchBtn").addEventListener("click",sa),x("transaksi:go-return",e=>da(e.detail))}const ca={id:"retur",template:na,init:la,load:ra},ua=`
<section class="view" id="view-laporan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Laporan</div>
        <div class="page-subtitle">Ringkasan performa penjualan pada rentang tanggal tertentu</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-ghost" id="reportExportBtn">Export CSV</button>
        <button class="btn btn-ghost" id="reportPrintBtn">Cetak</button>
      </div>
    </div>

    <div class="card card-pad" style="margin-bottom:16px;">
      <div class="report-filter-row">
        <div class="report-presets" id="reportPresets">
          <button class="preset-btn active" data-preset="today">Hari Ini</button>
          <button class="preset-btn" data-preset="yesterday">Kemarin</button>
          <button class="preset-btn" data-preset="week">Minggu Ini</button>
          <button class="preset-btn" data-preset="month">Bulan Ini</button>
          <button class="preset-btn" data-preset="lastmonth">Bulan Lalu</button>
        </div>
        <div class="report-daterange">
          <input type="date" id="reportFrom">
          <span>s/d</span>
          <input type="date" id="reportTo">
          <button class="btn btn-primary" id="reportApplyBtn">Terapkan</button>
        </div>
      </div>
    </div>

    <div class="stat-grid" id="reportStatGrid"></div>

    <div class="report-grid-2">
      <div class="card card-pad">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Penjualan per Kategori</h3>
        <div id="reportCategoryBars"></div>
      </div>
      <div class="card card-pad">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Penjualan per Metode Pembayaran</h3>
        <div id="reportPaymentBars"></div>
      </div>
    </div>

    <div class="card-title-row" style="margin-top:16px;"><h3 style="font-size:15px;">Produk Terlaris</h3></div>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table class="data-table tbl-lap-top">
        <thead><tr><th>#</th><th>Produk</th><th>Qty Terjual</th><th>Total Pendapatan</th></tr></thead>
        <tbody id="reportTopProductsBody"></tbody>
      </table>
    </div>

    <div class="card-title-row"><h3 style="font-size:15px;">Performa Kasir</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-lap-kasir">
        <thead><tr><th>Kasir</th><th>Jumlah Transaksi</th><th>Total Pendapatan</th><th>Rata-rata / Transaksi</th></tr></thead>
        <tbody id="reportCashierBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;let B={from:"",to:""},ne=null;function ma(e){const t=new Date;let a=new Date(t),n=new Date(t);if(e!=="today")if(e==="yesterday")a.setDate(a.getDate()-1),n.setDate(n.getDate()-1);else if(e==="week"){const s=(t.getDay()+6)%7;a.setDate(t.getDate()-s)}else e==="month"?a=new Date(t.getFullYear(),t.getMonth(),1):e==="lastmonth"&&(a=new Date(t.getFullYear(),t.getMonth()-1,1),n=new Date(t.getFullYear(),t.getMonth(),0));B.from=G(a),B.to=G(n),document.getElementById("reportFrom").value=B.from,document.getElementById("reportTo").value=B.to,ce()}async function ce(){const e=await h(`/api/reports/range?from=${B.from}&to=${B.to}`);ne=e,pa(e),va(e),ga(e),ya(e),ba(e)}function Ie(e){const t=e>0?"green":e<0?"red":"gray",a=e>0?"▲":e<0?"▼":"–";return`<span class="growth-badge ${t}">${a} ${Math.abs(e)}%</span>`}function pa(e){document.getElementById("reportStatGrid").innerHTML=`
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${l("receipt")}</div></div>
      <div class="stat-label">Total Pendapatan</div>
      <div class="stat-value" style="font-size:20px;">${p(e.summary.totalRevenue)}</div>
      <div class="stat-trend">${Ie(e.growth.revenue)} <span class="trend-note">vs periode sebelumnya</span></div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${l("cart")}</div></div>
      <div class="stat-label">Jumlah Transaksi</div>
      <div class="stat-value">${e.summary.totalTransactions}</div>
      <div class="stat-trend">${Ie(e.growth.transactions)} <span class="trend-note">vs periode sebelumnya</span></div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${l("package")}</div></div>
      <div class="stat-label">Item Terjual</div>
      <div class="stat-value">${e.summary.totalItemsSold}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${l("trendUp")}</div></div>
      <div class="stat-label">Rata-rata / Transaksi</div>
      <div class="stat-value" style="font-size:18px;">${p(e.summary.avgTransactionValue)}</div>
    </div>
  `}function va(e){const t=document.getElementById("reportCategoryBars");if(!e.byCategory.length){t.innerHTML=`<div class="empty-state">${l("tag","icon-lg")}<div class="es-title">Belum ada data</div></div>`;return}const a=Math.max(...e.byCategory.map(n=>n.revenue),1);t.innerHTML=e.byCategory.map(n=>`
    <div class="report-bar-row">
      <div class="report-bar-label"><span>${n.category}</span><span>${p(n.revenue)}</span></div>
      <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round(n.revenue/a*100)}%"></div></div>
    </div>
  `).join("")}function ga(e){const t=document.getElementById("reportPaymentBars");if(!e.byPaymentMethod.length){t.innerHTML=`<div class="empty-state">${l("receipt","icon-lg")}<div class="es-title">Belum ada data</div></div>`;return}const a=Math.max(...e.byPaymentMethod.map(s=>s.revenue),1),n={cash:"Tunai",qris:"QRIS",debit:"Kartu Debit",credit:"Kartu Kredit"};t.innerHTML=e.byPaymentMethod.map(s=>`
    <div class="report-bar-row">
      <div class="report-bar-label"><span>${n[s.method]||s.method} (${s.count}x)</span><span>${p(s.revenue)}</span></div>
      <div class="report-bar-track"><div class="report-bar-fill amber" style="width:${Math.round(s.revenue/a*100)}%"></div></div>
    </div>
  `).join("")}function ya(e){const t=document.getElementById("reportTopProductsBody");if(!e.topProducts.length){t.innerHTML=`<tr><td colspan="4"><div class="empty-state">${l("package","icon-lg")}<div class="es-title">Belum ada penjualan pada periode ini</div></div></td></tr>`;return}t.innerHTML=e.topProducts.map((a,n)=>`
    <tr><td>${n+1}</td><td>${a.name}</td><td>${a.qty}</td><td>${p(a.revenue)}</td></tr>
  `).join("")}function ba(e){const t=document.getElementById("reportCashierBody");if(!e.cashierPerformance.length){t.innerHTML=`<tr><td colspan="4"><div class="empty-state">${l("users","icon-lg")}<div class="es-title">Belum ada data kasir</div></div></td></tr>`;return}t.innerHTML=e.cashierPerformance.map(a=>`
    <tr><td>${a.name}</td><td>${a.transactions}</td><td>${p(a.revenue)}</td><td>${p(Math.round(a.revenue/a.transactions))}</td></tr>
  `).join("")}function ha(){if(!ne){d("Belum ada data laporan","error");return}const e=ne;let t=[];t.push(["Laporan Penjualan",`${e.from} s/d ${e.to}`]),t.push([]),t.push(["Ringkasan"]),t.push(["Total Pendapatan",e.summary.totalRevenue]),t.push(["Jumlah Transaksi",e.summary.totalTransactions]),t.push(["Item Terjual",e.summary.totalItemsSold]),t.push(["Rata-rata / Transaksi",e.summary.avgTransactionValue]),t.push([]),t.push(["Penjualan per Kategori"]),t.push(["Kategori","Qty","Pendapatan"]),e.byCategory.forEach(o=>t.push([o.category,o.qty,o.revenue])),t.push([]),t.push(["Penjualan per Metode Pembayaran"]),t.push(["Metode","Jumlah Transaksi","Pendapatan"]),e.byPaymentMethod.forEach(o=>t.push([o.method,o.count,o.revenue])),t.push([]),t.push(["Produk Terlaris"]),t.push(["Produk","Qty","Pendapatan"]),e.topProducts.forEach(o=>t.push([o.name,o.qty,o.revenue])),t.push([]),t.push(["Performa Kasir"]),t.push(["Kasir","Transaksi","Pendapatan"]),e.cashierPerformance.forEach(o=>t.push([o.name,o.transactions,o.revenue]));const a=t.map(o=>o.map(m=>`"${String(m).replace(/"/g,'""')}"`).join(",")).join(`
`),n=new Blob([a],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=`laporan-${e.from}_${e.to}.csv`,i.click(),URL.revokeObjectURL(s),d("Laporan CSV berhasil diunduh","success")}async function fa(){const e=new Date;B.from=G(e),B.to=G(e),document.getElementById("reportFrom").value=B.from,document.getElementById("reportTo").value=B.to,await ce()}function Ba(){document.getElementById("reportPresets").querySelectorAll(".preset-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll("#reportPresets .preset-btn").forEach(t=>t.classList.remove("active")),e.classList.add("active"),ma(e.dataset.preset)})}),document.getElementById("reportApplyBtn").addEventListener("click",()=>{document.querySelectorAll("#reportPresets .preset-btn").forEach(e=>e.classList.remove("active")),B.from=document.getElementById("reportFrom").value||B.from,B.to=document.getElementById("reportTo").value||B.to,ce()}),document.getElementById("reportExportBtn").addEventListener("click",ha),document.getElementById("reportPrintBtn").addEventListener("click",()=>window.print())}const ka={id:"laporan",template:ua,init:Ba,load:fa},Ea=`
<section class="view" id="view-pengaturan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Pengaturan</div>
        <div class="page-subtitle">Kelola profil toko, preferensi, pengguna, dan keamanan akun</div>
      </div>
    </div>

    <div class="settings-tabs" id="settingsTabs">
      <button class="settings-tab active" data-tab="profil">Profil Toko</button>
      <button class="settings-tab" data-tab="preferensi">Preferensi</button>
      <button class="settings-tab" data-tab="pengguna">Pengguna</button>
      <button class="settings-tab" data-tab="aksesmenu">Akses Menu</button>
      <button class="settings-tab" data-tab="keamanan">Keamanan</button>
    </div>

    <div class="settings-panel" id="panel-profil">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field"><label>Nama Toko</label><input type="text" id="settingStoreName"></div>
        <div class="form-field"><label>Alamat Toko</label><input type="text" id="settingStoreAddress"></div>
        <div class="form-field"><label>Nomor Telepon</label><input type="text" id="settingStorePhone"></div>
        <div class="form-field"><label>Pesan Footer Struk</label><input type="text" id="settingReceiptFooter"></div>
        <button class="btn btn-primary" id="saveProfilBtn">Simpan Profil Toko</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-preferensi" style="display:none;">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field">
          <label>Pajak Default (%)</label>
          <input type="number" id="settingTaxPercent" min="0" step="0.5">
          <span class="field-hint">Nilai ini akan otomatis dipakai sebagai pajak awal pada halaman Kasir.</span>
        </div>
        <div class="form-field">
          <label>Ambang Batas Stok Menipis</label>
          <input type="number" id="settingLowStockThreshold" min="0" step="1">
          <span class="field-hint">Produk dengan stok di bawah atau sama dengan angka ini akan ditandai "Menipis".</span>
        </div>
        <button class="btn btn-primary" id="savePreferensiBtn">Simpan Preferensi</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-pengguna" style="display:none;">
      <div class="card-title-row">
        <h3 style="font-size:15px;">Daftar Pengguna</h3>
        <button class="btn btn-primary" id="addUserBtn">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Tambah Pengguna
        </button>
      </div>
      <div class="table-wrap" style="margin-bottom:16px;">
        <table class="data-table tbl-users">
          <thead><tr><th>Username</th><th>Nama</th><th>Role</th><th>Aksi</th></tr></thead>
          <tbody id="userTableBody"></tbody>
        </table>
      </div>
      <div class="card card-pad" id="userFormCard" style="display:none; max-width:480px;">
        <h3 style="font-size:14.5px; margin-bottom:12px;" id="userFormTitle">Tambah Pengguna</h3>
        <input type="hidden" id="userFormId">
        <div class="form-field"><label>Username</label><input type="text" id="userFormUsername"></div>
        <div class="form-field"><label>Nama Lengkap</label><input type="text" id="userFormName"></div>
        <div class="form-field">
          <label>Role</label>
          <select id="userFormRole">
            <option value="kasir">Kasir</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-field"><label id="userFormPasswordLabel">Password</label><input type="password" id="userFormPassword"></div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary" id="saveUserBtn">Simpan</button>
          <button class="btn btn-ghost" id="cancelUserBtn">Batal</button>
        </div>
      </div>
    </div>

    <div class="settings-panel" id="panel-aksesmenu" style="display:none;">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field"><label>Terapkan Pengaturan Untuk</label><select id="menuAccessTarget"></select></div>
        <p class="field-hint" id="menuAccessHint" style="margin-bottom:14px;">Atur menu yang boleh diakses oleh role Kasir. Role Admin selalu memiliki akses penuh ke semua menu, apa pun pengaturan di sini.</p>
        <div class="menu-access-row" id="menuAccessCustomRow" style="display:none;">
          <span class="ma-label">Gunakan Akses Khusus untuk User Ini</span>
          <label class="ma-switch"><input type="checkbox" id="menuAccessCustomCheckbox"><span class="ma-slider"></span></label>
        </div>
        <div id="menuAccessList"></div>
        <button class="btn btn-primary" id="saveMenuAccessBtn" style="margin-top:6px;">Simpan Akses Menu</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-keamanan" style="display:none;">
      <div class="card card-pad" style="max-width:480px;">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Ganti Password</h3>
        <div class="form-field"><label>Password Saat Ini</label><input type="password" id="pwCurrent"></div>
        <div class="form-field"><label>Password Baru</label><input type="password" id="pwNew"></div>
        <div class="form-field"><label>Konfirmasi Password Baru</label><input type="password" id="pwConfirm"></div>
        <button class="btn btn-primary" id="changePasswordBtn">Simpan Password Baru</button>
      </div>
    </div>
  </div>
</section>
`;let P=[];function Oe(e){document.querySelectorAll("#settingsTabs .settings-tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),document.querySelectorAll(".settings-panel").forEach(t=>t.style.display="none"),document.getElementById("panel-"+e).style.display=""}async function Ia(){r.appSettings=await h("/api/settings"),document.getElementById("settingStoreName").value=r.appSettings.storeName||"",document.getElementById("settingStoreAddress").value=r.appSettings.storeAddress||"",document.getElementById("settingStorePhone").value=r.appSettings.storePhone||"",document.getElementById("settingReceiptFooter").value=r.appSettings.receiptFooter||"",document.getElementById("settingTaxPercent").value=r.appSettings.defaultTaxPercent||0,document.getElementById("settingLowStockThreshold").value=r.appSettings.lowStockThreshold||15;const e=r.currentUser.role==="admin";e&&(P=await h("/api/users")),ue(),_e(),document.getElementById("settingsTabs").querySelectorAll(".settings-tab").forEach(a=>{a.dataset.tab!=="keamanan"&&(a.style.display=e?"":"none")}),e||Oe("keamanan")}async function wa(){try{r.appSettings=await S("/api/settings",{storeName:document.getElementById("settingStoreName").value,storeAddress:document.getElementById("settingStoreAddress").value,storePhone:document.getElementById("settingStorePhone").value,receiptFooter:document.getElementById("settingReceiptFooter").value}),document.querySelector(".brand-text").textContent=r.appSettings.storeName||"Kasir Cafe",document.title=r.appSettings.storeName||"Kasir Cafe",d("Profil toko berhasil disimpan","success")}catch(e){d(e.message,"error")}}async function xa(){try{r.appSettings=await S("/api/settings",{defaultTaxPercent:Number(document.getElementById("settingTaxPercent").value||0),lowStockThreshold:Number(document.getElementById("settingLowStockThreshold").value||0)}),d("Preferensi berhasil disimpan","success")}catch(e){d(e.message,"error")}}function ue(){const e=document.getElementById("menuAccessTarget"),t=P.filter(s=>s.role==="kasir"),a=e.value||"__general__";e.innerHTML='<option value="__general__">Semua Kasir (Umum)</option>'+t.map(s=>`<option value="${s.id}">${s.name} (${s.username})${s.menuAccessOverride?" — Khusus":""}</option>`).join("");const n=Array.from(e.options).some(s=>s.value===a);e.value=n?a:"__general__"}function _e(){const t=document.getElementById("menuAccessTarget").value||"__general__",a=document.getElementById("menuAccessCustomCheckbox");if(t==="__general__")a.checked=!1;else{const n=P.find(s=>s.id===Number(t));a.checked=!!(n&&n.menuAccessOverride)}me()}function me(){const t=document.getElementById("menuAccessTarget").value||"__general__",a=document.getElementById("menuAccessList"),n=document.getElementById("menuAccessCustomRow"),s=document.getElementById("menuAccessCustomCheckbox"),i=document.getElementById("menuAccessHint"),o=O.filter(v=>_.includes(v.id)),m=r.appSettings.menuAccess||{};let u,g;if(t==="__general__")u=m,g=!1,n.style.display="none",i.textContent="Atur menu yang boleh diakses oleh semua role Kasir (berlaku sebagai pengaturan umum). Role Admin selalu memiliki akses penuh ke semua menu.";else{const v=P.find(f=>f.id===Number(t));n.style.display="",g=!s.checked,i.textContent=`Atur akses menu khusus untuk ${v?v.name:"user ini"}. Jika "Akses Khusus" dimatikan, user ini mengikuti pengaturan umum di atas.`,s.checked?(u={...m},v&&v.menuAccessOverride&&_.forEach(f=>{v.menuAccessOverride[f]!=null&&(u[f]=!!v.menuAccessOverride[f])})):u=m}a.innerHTML=o.map(v=>`
    <div class="menu-access-row">
      <span class="ma-label">${l(v.icon)} ${v.label}</span>
      <label class="ma-switch">
        <input type="checkbox" data-menu-id="${v.id}" ${u[v.id]!==!1?"checked":""} ${g?"disabled":""}>
        <span class="ma-slider"></span>
      </label>
    </div>
  `).join("")}async function $a(){const e=document.getElementById("menuAccessTarget"),t=e.value||"__general__",a=document.getElementById("menuAccessList"),n={};a.querySelectorAll("input[data-menu-id]").forEach(s=>{n[s.dataset.menuId]=s.checked});try{if(t==="__general__")r.appSettings=await S("/api/settings",{menuAccess:n});else{const s=document.getElementById("menuAccessCustomCheckbox"),i=Number(t),o=s.checked?n:null,m=await S("/api/users/"+i,{menuAccessOverride:o}),u=P.findIndex(g=>g.id===i);u!==-1&&(P[u]={...P[u],...m}),ue(),e.value=String(i),me()}Se(),q(r.activeView)||C(we()),d("Akses menu berhasil disimpan","success")}catch(s){d(s.message,"error")}}async function Sa(){const e=document.getElementById("pwCurrent").value,t=document.getElementById("pwNew").value,a=document.getElementById("pwConfirm").value;if(!e||!t){d("Lengkapi semua kolom","error");return}if(t!==a){d("Konfirmasi password baru tidak cocok","error");return}try{await S("/api/me/password",{currentPassword:e,newPassword:t}),document.getElementById("pwCurrent").value="",document.getElementById("pwNew").value="",document.getElementById("pwConfirm").value="",d("Password berhasil diubah","success")}catch(n){d(n.message,"error")}}async function pe(){if(r.currentUser.role!=="admin"){document.getElementById("userTableBody").innerHTML="";return}const e=await h("/api/users");P=e,ue();const t=document.getElementById("userTableBody");t.innerHTML=e.map(a=>`
    <tr>
      <td>${a.username}</td>
      <td>${a.name}</td>
      <td><span class="badge ${a.role==="admin"?"blue":"green"}">${a.role==="admin"?"Admin":"Kasir"}</span></td>
      <td class="row-actions">
        <button class="btn-icon-sm" data-act="edit" data-id="${a.id}" title="Edit">${l("tag","icon-sm")}</button>
        <button class="btn-icon-sm danger" data-act="delete" data-id="${a.id}" title="Hapus">${l("ban","icon-sm")}</button>
      </td>
    </tr>
  `).join(""),t.querySelectorAll('[data-act="edit"]').forEach(a=>{a.addEventListener("click",()=>Ge(e.find(n=>n.id===Number(a.dataset.id))))}),t.querySelectorAll('[data-act="delete"]').forEach(a=>{a.addEventListener("click",async()=>{if(confirm("Hapus pengguna ini?"))try{await Z("/api/users/"+a.dataset.id),d("Pengguna dihapus","success"),pe()}catch(n){d(n.message,"error")}})})}function Ge(e){document.getElementById("userFormCard").style.display="",document.getElementById("userFormTitle").textContent=e?"Edit Pengguna":"Tambah Pengguna",document.getElementById("userFormId").value=e?e.id:"",document.getElementById("userFormUsername").value=e?e.username:"",document.getElementById("userFormUsername").disabled=!!e,document.getElementById("userFormName").value=e?e.name:"",document.getElementById("userFormRole").value=e?e.role:"kasir",document.getElementById("userFormPassword").value="",document.getElementById("userFormPasswordLabel").textContent=e?"Password Baru (opsional)":"Password"}async function Ta(){const e=document.getElementById("userFormId").value,t=document.getElementById("userFormUsername").value.trim(),a=document.getElementById("userFormName").value.trim(),n=document.getElementById("userFormRole").value,s=document.getElementById("userFormPassword").value;if(!a){d("Nama wajib diisi","error");return}try{if(e)await S("/api/users/"+e,{name:a,role:n,password:s||void 0}),d("Pengguna berhasil diperbarui","success");else{if(!t||!s){d("Username dan password wajib diisi","error");return}await A("/api/users",{username:t,password:s,name:a,role:n}),d("Pengguna berhasil ditambahkan","success")}document.getElementById("userFormCard").style.display="none",pe()}catch(i){d(i.message,"error")}}async function La(){await Ia(),await pe()}function Ma(){document.getElementById("settingsTabs").querySelectorAll(".settings-tab").forEach(e=>{e.addEventListener("click",()=>Oe(e.dataset.tab))}),document.getElementById("saveProfilBtn").addEventListener("click",wa),document.getElementById("savePreferensiBtn").addEventListener("click",xa),document.getElementById("changePasswordBtn").addEventListener("click",Sa),document.getElementById("addUserBtn").addEventListener("click",()=>Ge()),document.getElementById("cancelUserBtn").addEventListener("click",()=>{document.getElementById("userFormCard").style.display="none"}),document.getElementById("saveUserBtn").addEventListener("click",Ta),document.getElementById("saveMenuAccessBtn").addEventListener("click",$a),document.getElementById("menuAccessTarget").addEventListener("change",_e),document.getElementById("menuAccessCustomCheckbox").addEventListener("change",me)}const Pa={id:"pengaturan",template:Ea,init:Ma,load:La};async function Ca(){const e=await Xe();e&&(r.appSettings=await h("/api/settings"),document.querySelector(".brand-text").textContent=r.appSettings.storeName||"Kasir Cafe",document.title=r.appSettings.storeName||"Kasir Cafe",et(e),[vt,It,Mt,Ht,Ut,Wt,aa,ca,ka,Pa].forEach(at),nt(document.getElementById("mainViews")),lt(),st(),tt(),document.getElementById("globalSearch").addEventListener("keydown",t=>{t.key==="Enter"&&(C("kasir"),document.getElementById("posSearch").value=t.target.value,D())}),C(we()))}Ca().catch(e=>{console.error("Gagal memuat aplikasi:",e),document.body.innerHTML=`
    <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; font-family:system-ui,sans-serif; background:#F8FAFC;">
      <div style="max-width:420px; text-align:center;">
        <div style="font-size:40px; margin-bottom:12px;">⚠️</div>
        <h2 style="margin:0 0 8px; color:#0F172A;">Gagal memuat aplikasi</h2>
        <p style="color:#64748B; font-size:14px; margin:0 0 16px;">${e&&e.message||"Terjadi kesalahan tak terduga."}</p>
        <p style="color:#94A3B8; font-size:12.5px; margin:0 0 20px;">Kemungkinan penyebab: URL Apps Script di <code>config.js</code> belum benar, deployment Apps Script belum di-authorize, atau koneksi internet bermasalah.</p>
        <button onclick="location.reload()" style="background:#2563EB; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-size:14px; cursor:pointer;">Coba Lagi</button>
      </div>
    </div>
  `});
