const KEY = "dizonFarmSystemV1";
const HARVEST_RATE_PER_HA = 7000,
  OPERATOR_PCT = 10,
  BAGGER_PCT = 5;
const ROLES = ["Harvester Operator", "Bagger", "Tractor Driver/Operator"];
const defaultWorkers = [
  {
    id: 101,
    name: "Ramon Dela Cruz",
    phone: "09171110001",
    role: "Harvester Operator",
    status: "Active",
  },
  {
    id: 102,
    name: "Eduardo Santos",
    phone: "09171110002",
    role: "Harvester Operator",
    status: "Active",
  },
  {
    id: 111,
    name: "Jun Reyes",
    phone: "09171110011",
    role: "Bagger",
    status: "Active",
  },
  {
    id: 112,
    name: "Mario Bautista",
    phone: "09171110012",
    role: "Bagger",
    status: "Active",
  },
  {
    id: 113,
    name: "Carlo Mendoza",
    phone: "09171110013",
    role: "Bagger",
    status: "Active",
  },
  {
    id: 114,
    name: "Renato Flores",
    phone: "09171110014",
    role: "Bagger",
    status: "Active",
  },
  {
    id: 121,
    name: "Nestor Villanueva",
    phone: "09171110021",
    role: "Tractor Driver/Operator",
    status: "Active",
  },
  {
    id: 122,
    name: "Alfredo Ramos",
    phone: "09171110022",
    role: "Tractor Driver/Operator",
    status: "Active",
  },
];
const defaultEquipment = [
  {
    id: 1,
    unit: "YH-001",
    name: "Yanmar Harvester",
    brand: "Yanmar",
    type: "Harvester",
    capacity: "1.2 ha/hr",
    engine: "Diesel 4-cylinder",
    fuel: "Diesel",
    tank: "55 L",
    year: "2024",
    rate: 7000,
    warranty: "1 Year",
    insurance: "Insured",
    status: "Available",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0a6b3c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    unit: "YH-002",
    name: "Yanmar Harvester",
    brand: "Yanmar",
    type: "Harvester",
    capacity: "1.2 ha/hr",
    engine: "Diesel 4-cylinder",
    fuel: "Diesel",
    tank: "55 L",
    year: "2023",
    rate: 7000,
    warranty: "1 Year",
    insurance: "Insured",
    status: "Available",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    unit: "MF-001",
    name: "Massey Ferguson Tractor",
    brand: "Massey Ferguson",
    type: "Tractor",
    capacity: "2.5 tons",
    engine: "Diesel 4-cylinder",
    fuel: "Diesel",
    tank: "60 L",
    year: "2024",
    rate: 4000,
    warranty: "1 Year",
    insurance: "Insured",
    status: "Available",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=900&q=80",
  },
];
let db = JSON.parse(localStorage.getItem(KEY) || "null") || {
  users: [],
  equipment: defaultEquipment,
  bookings: [],
  payments: [],
  reviews: [],
  notifications: [],
  workers: null,
  settings: { tractorRate: null },
};
db.notifications = db.notifications || [];
db.workers = db.workers || JSON.parse(JSON.stringify(defaultWorkers));
db.settings = db.settings || {};
db.payroll = db.payroll || [];
if (db.settings.tractorRate === undefined) db.settings.tractorRate = null;
db.equipment = (db.equipment || []).map((e) => ({
  ...e,
  quantity: Math.max(1, Number(e.quantity || 1)),
}));
/* ---------- Demo seed: one farmer who already has a booking ---------- */
const DEMO_USER_ID = 900001,
  DEMO_BOOKING_ID = 900002;
function seedDemoData() {
  db.users = db.users || [];
  db.bookings = db.bookings || [];
  db.payments = db.payments || [];
  if (db.users.some((u) => u.id === DEMO_USER_ID)) return;
  const date = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    code = "BK-" + String(DEMO_BOOKING_ID).slice(-6);
  db.users.push({
    id: DEMO_USER_ID,
    fullName: "Juan Dela Cruz",
    username: "juan",
    email: "juan@example.com",
    phone: "09171234567",
    password: "farmer123",
    image: "",
    age: "45",
    address: "Purok 1, Brgy. Sample, Sample Municipality",
  });
  db.bookings.push({
    id: DEMO_BOOKING_ID,
    code,
    userId: DEMO_USER_ID,
    equipmentId: 2,
    date,
    time: "08:00",
    ha: 2,
    purok: "Purok 1",
    barangay: "Sample Barangay",
    municipality: "Sample Municipality",
    total: 2 * HARVEST_RATE_PER_HA,
    service: "Harvester",
    assignedWorkers: {},
    assignmentFinalized: false,
    completedHa: null,
    payment: "GCash",
    status: "Pending",
    createdAt: new Date().toISOString(),
  });
  db.payments.push({
    id: DEMO_BOOKING_ID + 1,
    bookingId: DEMO_BOOKING_ID,
    userId: DEMO_USER_ID,
    date: new Date().toISOString().slice(0, 10),
    amount: 2 * HARVEST_RATE_PER_HA,
    method: "GCash",
    status: "Paid",
    reference: "PAY-" + String(DEMO_BOOKING_ID).slice(-6),
  });
  addNotification(
    DEMO_USER_ID,
    "Order Confirmation",
    `Your booking ${code} for Yanmar Harvester on ${date} at 08:00 was filed successfully. It is Pending until the admin confirms it.`,
    "order",
  );
  save();
}
/* ---------- Demo seed: 3 completed jobs for the payroll example ----------
   Crew: Ramon Dela Cruz (Operator 101), Jun Reyes (Bagger 111), Mario Bautista (Bagger 112) */
const PAYROLL_DEMO_IDS = [900101, 900102, 900103];
function seedPayrollExample() {
  db.bookings = db.bookings || [];
  if (db.bookings.some((b) => PAYROLL_DEMO_IDS.includes(b.id))) return;
  const jobs = [
    { id: 900101, date: "2026-10-26", ha: 2 },
    { id: 900102, date: "2026-10-28", ha: 3 },
    { id: 900103, date: "2026-10-30", ha: 1.5 },
  ];
  jobs.forEach((j) => {
    const total = r2(j.ha * HARVEST_RATE_PER_HA),
      code = "BK-" + j.id;
    const b = {
      id: j.id,
      code,
      userId: DEMO_USER_ID,
      equipmentId: 2,
      date: j.date,
      time: "08:00",
      ha: j.ha,
      purok: "Purok 1",
      barangay: "Sample Barangay",
      municipality: "Sample Municipality",
      total,
      service: "Harvester",
      assignedWorkers: { operatorId: 101, baggerIds: [111, 112] },
      assignmentFinalized: true,
      completedHa: j.ha,
      payment: "GCash",
      status: "Completed",
      createdAt: j.date + "T00:00:00.000Z",
      completedAt: j.date + "T10:00:00.000Z",
    };
    snapshotPayroll(b);
    db.bookings.push(b);
    db.payments.push({
      id: j.id + 1000,
      bookingId: j.id,
      userId: DEMO_USER_ID,
      date: j.date,
      amount: total,
      method: "GCash",
      status: "Paid",
      reference: "PAY-" + j.id,
    });
  });
  save();
}
seedPayrollExample();
backfillPayroll();
let session = JSON.parse(localStorage.getItem(KEY + "_session") || "null");
let currentPage = "dashboard",
  selectedEquipment = null,
  bookingDraft = {},
  bookingStep = 1;

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}
function money(n) {
  return "₱" + Number(n || 0).toLocaleString("en-PH");
}
function toast(msg, type = "success") {
  const host = document.getElementById("toast");
  if (!host) {
    alert(msg);
    return;
  }
  // Each popup gets its own element so multiple notifications do not overwrite one another.
  const item = document.createElement("div");
  item.className = "toast-message " + (type === "error" ? "error" : "success");
  item.setAttribute("role", type === "error" ? "alert" : "status");
  item.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  item.textContent = msg;
  host.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  const timer = setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 250);
  }, 5000);
  item.addEventListener("click", () => {
    clearTimeout(timer);
    item.remove();
  });
}
function notifyAndToast(userId, title, message, type) {
  addNotification(userId, title, message, type);
  toast(title + ": " + message, "success");
}
function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
function currentUser() {
  return session?.role === "farmer"
    ? db.users.find((u) => u.id === session.userId)
    : null;
}
function init() {
  document
    .querySelectorAll(".auth-tab")
    .forEach((b) => (b.onclick = () => switchAuth(b.dataset.auth)));
  document.getElementById("loginForm").onsubmit = login;
  document.getElementById("registerForm").onsubmit = register;
  document.getElementById("adminForm").onsubmit = adminLogin;
  document.getElementById("forgotBtn").onclick = forgotPassword;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("mobileMenu").onclick = () =>
    document.getElementById("sidebar").classList.toggle("open");
  if (session) showApp();
  else showAuth();
}
function switchAuth(type) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((x) => x.classList.toggle("active", x.dataset.auth === type));
  ["login", "register", "admin"].forEach((x) =>
    document.getElementById(x + "Form").classList.toggle("hidden", x !== type),
  );
}
function showAuth() {
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}
function showApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  buildNav();
  updateUser();
  render();
}
function buildNav() {
  const admin = session.role === "admin";
  const items = admin
    ? [
        ["dashboard", "▦", "Dashboard"],
        ["bookings", "▣", "Manage Bookings"],
        ["workers", "👷", "Workers"],
        ["payroll", "🧾", "Payroll"],
        ["equipment", "🚜", "Manage Equipment"],
        ["payments", "₱", "Payments"],
        ["reports", "▥", "Reports"],
      ]
    : [
        ["dashboard", "⌂", "Dashboard"],
        ["equipment", "🚜", "Equipment"],
        ["bookings", "▣", "My Bookings"],
        ["payments", "₱", "Payments"],
        ["notifications", "🔔", "Notifications"],
        ["profile", "◉", "Profile"],
        ["about", "i", "About Us"],
        ["support", "☎", "Contact Support"],
        ["terms", "✓", "Terms & Conditions"],
      ];
  const unread =
    session.role === "farmer"
      ? db.notifications.filter((n) => n.userId === session.userId && !n.read)
          .length
      : 0;
  document.getElementById("navMenu").innerHTML = items
    .map(
      (i) =>
        `<button class="nav-btn ${currentPage === i[0] ? "active" : ""}" onclick="navigate('${i[0]}')">${i[1]} &nbsp; ${i[2]}${navBadge(i[0], unread)}</button>`,
    )
    .join("");
}
function updateUser() {
  const n =
    session.role === "admin"
      ? "Administrator"
      : currentUser()?.fullName || "Farmer";
  document.getElementById("topUserName").textContent = n;
  const av = document.getElementById("topAvatar"),
    u = currentUser();
  av.innerHTML = u?.image ? `<img src="${u.image}">` : "👤";
}
function navigate(page) {
  if ((page === "workers" || page === "payroll") && session?.role !== "admin")
    return;
  currentPage = page;
  document.getElementById("sidebar").classList.remove("open");
  buildNav();
  render();
}
function render() {
  const title =
    {
      dashboard: "Dashboard",
      equipment: session.role === "admin" ? "Manage Equipment" : "Equipment",
      bookings: session.role === "admin" ? "Manage Bookings" : "My Bookings",
      payments: "Payments",
      notifications: "Notifications",
      profile: "My Profile",
      about: "About Us",
      support: "Contact Support",
      terms: "Terms & Conditions",
      reports: "Reports & Analytics",
      workers: "Worker Management",
      payroll: "Weekly Payroll",
    }[currentPage] || "Dashboard";
  document.getElementById("pageTitle").textContent = title;
  const c = document.getElementById("content");
  if (currentPage === "dashboard")
    c.innerHTML =
      session.role === "admin" ? adminDashboard() : farmerDashboard();
  else if (currentPage === "equipment")
    c.innerHTML = session.role === "admin" ? adminEquipment() : equipmentPage();
  else if (currentPage === "bookings") c.innerHTML = bookingsPage();
  else if (currentPage === "payments") c.innerHTML = paymentsPage();
  else if (currentPage === "notifications") c.innerHTML = notificationsPage();
  else if (currentPage === "profile") c.innerHTML = profilePage();
  else if (currentPage === "about") c.innerHTML = aboutPage();
  else if (currentPage === "support") c.innerHTML = supportPage();
  else if (currentPage === "terms") c.innerHTML = termsPage();
  else if (currentPage === "reports") c.innerHTML = reportsPage();
  else if (currentPage === "workers" && session.role === "admin")
    c.innerHTML = workersPage();
  else if (currentPage === "payroll" && session.role === "admin")
    c.innerHTML = payrollPage();
  bindPage();
}
function farmerDashboard() {
  const u = currentUser(),
    active = db.bookings.filter(
      (b) => b.userId === u.id && ["Pending", "Confirmed"].includes(b.status),
    ).length;
  return `<div class="hero"><div><h1>Welcome, ${escapeHtml(u?.fullName || "Farmer")}!</h1><p>Reserve reliable farm equipment for your rice field operations. Check availability, submit bookings, and keep your payment records organized.</p><button class="primary-btn" onclick="navigate('equipment')">View Equipment</button></div></div>
 <div class="stats"><div class="stat"><small>Available Equipment</small><h3>${db.equipment.reduce((sum, e) => sum + availableUnits(e.id), 0)}</h3></div><div class="stat"><small>My Active Bookings</small><h3>${active}</h3></div><div class="stat"><small>Completed Bookings</small><h3>${db.bookings.filter((b) => b.userId === u.id && b.status === "Completed").length}</h3></div><div class="stat"><small>Total Paid</small><h3>${money(db.payments.filter((p) => p.userId === u.id && p.status === "Paid").reduce((a, p) => a + p.amount, 0))}</h3></div></div>
 <div class="section-head"><div><h3>Available Machines</h3><p>Choose equipment for your farm operation.</p></div><button class="secondary-btn" onclick="navigate('equipment')">See All</button></div>${equipmentCards(db.equipment.slice(0, 3))}`;
}
function adminDashboard() {
  const revenue = db.payments
    .filter((p) => p.status === "Paid")
    .reduce((a, p) => a + p.amount, 0);
  return `<div class="hero"><div><h1>Fleet Monitoring Dashboard</h1><p>Manage equipment, bookings, payments, and farm equipment operations from one place.</p><button class="primary-btn" onclick="navigate('bookings')">Manage Bookings</button></div></div>
 <div class="stats"><div class="stat"><small>Total Equipment</small><h3>${db.equipment.reduce((sum, e) => sum + totalUnits(e), 0)}</h3></div><div class="stat"><small>Available Units</small><h3>${db.equipment.reduce((sum, e) => sum + availableUnits(e.id), 0)}</h3></div><div class="stat"><small>Active Bookings</small><h3>${db.bookings.filter((b) => ["Pending", "Confirmed"].includes(b.status)).length}</h3></div><div class="stat"><small>Total Revenue</small><h3>${money(revenue)}</h3></div></div>
 <div class="section-head"><div><h3>Recent Bookings</h3><p>Latest reservations from farmers.</p></div></div>${bookingTable(db.bookings.slice(-5).reverse(), true)}`;
}
function equipmentCards(list) {
  if (!list.length) return `<div class="empty">No equipment found.</div>`;
  return `<div class="equipment-grid">${list
    .map((e) => {
      const available = availableUnits(e.id),
        total = totalUnits(e),
        canBook = available > 0 && e.status === "Available";
      return `<article class="equipment-card"><div class="equipment-img"><img src="${e.image || ""}" onerror="this.style.display='none'"><span class="status-pill ${!canBook ? "unavailable" : ""}">${canBook ? "Available" : "Unavailable"}</span></div><div class="equipment-body"><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.brand)} • ${escapeHtml(e.type)} • ${escapeHtml(e.capacity)}</p><div class="details"><div><b>Fuel</b><br>${escapeHtml(e.fuel)}</div><div><b>Year</b><br>${escapeHtml(e.year)}</div><div><b>Availability</b><br>${available} / ${total} unit(s)</div><div><b>Reserved</b><br>${Math.max(0, total - available)} unit(s)</div></div><div class="price">${money(e.rate)} <small>/ rental</small></div><div class="card-actions"><button class="secondary-btn" onclick="viewEquipment(${e.id})">VIEW MORE</button><button class="primary-btn" ${!canBook ? "disabled" : ""} onclick="startBooking(${e.id})">BOOK NOW</button></div></div></article>`;
    })
    .join("")}</div>`;
}
function equipmentPage() {
  return `<div class="toolbar"><input id="equipmentSearch" placeholder="Search machines..." value="${escapeHtml(window.eqSearch || "")}"><select id="typeFilter"><option value="">All Types</option><option>Harvester</option><option>Tractor</option></select><select id="priceFilter"><option value="">All Prices</option><option value="4000">₱4,000 and below</option><option value="7000">₱7,000 and below</option></select></div><div id="equipmentResults">${equipmentCards(filterEquipment())}</div>`;
}
function filterEquipment() {
  const q = (window.eqSearch || "").toLowerCase(),
    type = window.eqType || "",
    price = window.eqPrice || "";
  return db.equipment.filter(
    (e) =>
      (!q || `${e.name} ${e.brand} ${e.type}`.toLowerCase().includes(q)) &&
      (!type || e.type === type) &&
      (!price || e.rate <= Number(price)),
  );
}
function bindPage() {
  const s = document.getElementById("equipmentSearch"),
    t = document.getElementById("typeFilter"),
    p = document.getElementById("priceFilter");
  if (s) {
    s.oninput = () => {
      window.eqSearch = s.value;
      document.getElementById("equipmentResults").innerHTML =
        equipmentCards(filterEquipment());
    };
    t.onchange = () => {
      window.eqType = t.value;
      document.getElementById("equipmentResults").innerHTML =
        equipmentCards(filterEquipment());
    };
    p.onchange = () => {
      window.eqPrice = p.value;
      document.getElementById("equipmentResults").innerHTML =
        equipmentCards(filterEquipment());
    };
  }
}
function viewEquipment(id) {
  const e = db.equipment.find((x) => x.id === id);
  if (!e) return;
  showModal(
    `<div class="modal-head"><h2>${escapeHtml(e.name)}</h2><button class="close" onclick="closeModal()">✕</button></div><img src="${e.image}" style="width:100%;height:220px;object-fit:cover;border-radius:14px"><div class="details" style="margin-top:15px"><div><b>Unit</b><br>${e.unit}</div><div><b>Brand</b><br>${e.brand}</div><div><b>Type</b><br>${e.type}</div><div><b>Capacity</b><br>${e.capacity}</div><div><b>Engine</b><br>${e.engine}</div><div><b>Fuel Tank</b><br>${e.tank}</div><div><b>Year Model</b><br>${e.year}</div><div><b>Warranty</b><br>${e.warranty}</div><div><b>Insurance</b><br>${e.insurance}</div><div><b>Price</b><br>${money(e.rate)}</div></div><div class="notice">Available units: ${availableUnits(e.id)}. Booked dates are shown in the booking calendar.</div><div class="card-actions"><button class="primary-btn" onclick="closeModal();startBooking(${e.id})">BOOK NOW</button></div>`,
  );
}
function totalUnits(e) {
  return Math.max(1, Number(e?.quantity || 1));
}
function activeBookingsForEquipment(eid) {
  return db.bookings.filter(
    (b) => b.equipmentId === eid && ["Pending", "Confirmed"].includes(b.status),
  );
}
function availableUnits(eid) {
  const e = db.equipment.find((x) => x.id === eid);
  if (!e || e.status !== "Available") return 0;
  return Math.max(0, totalUnits(e) - activeBookingsForEquipment(eid).length);
}
function availableUnitsOnDate(eid, date) {
  const e = db.equipment.find((x) => x.id === eid);
  if (!e || e.status !== "Available") return 0;
  const booked = db.bookings.filter(
    (b) =>
      b.equipmentId === eid &&
      b.date === date &&
      ["Pending", "Confirmed"].includes(b.status),
  ).length;
  return Math.max(0, totalUnits(e) - booked);
}
function addNotification(userId, title, message, type) {
  db.notifications.push({
    id: Date.now() + Math.floor(Math.random() * 10000),
    userId,
    title,
    message,
    type: type || "info",
    createdAt: new Date().toISOString(),
    read: false,
  });
}
function startBooking(id) {
  if (session.role !== "farmer") {
    toast("Only farmers can create bookings.", "error");
    return;
  }
  selectedEquipment = db.equipment.find((e) => e.id === id);
  if (!selectedEquipment || availableUnits(id) <= 0) {
    toast("No units are currently available for this equipment.", "error");
    return;
  }
  bookingStep = 1;
  bookingDraft = { equipmentId: id };
  openBooking();
}
function openBooking() {
  renderBookingModal();
}
function renderBookingModal() {
  const e = selectedEquipment,
    d = bookingDraft;
  if (!e) {
    closeModal();
    return;
  }
  let body = "";
  if (bookingStep === 1)
    body = `<div class="booking-steps"><div class="step active">1. Date & Location</div><div class="step">2. Summary & Payment</div><div class="step">3. Confirmation</div></div>
 <div class="notice booking-availability"><b>Available: ${availableUnits(e.id)} of ${totalUnits(e)} unit(s)</b><br>Choose your preferred date and complete all required fields.<br>Service: <b>${escapeHtml(e.type)}</b>${e.type === "Harvester" ? ` • ${money(HARVEST_RATE_PER_HA)} per hectare` : ""}<br>Your request stays Pending until the admin confirms it. Workers are assigned by the admin only.</div>
 <div class="form-grid"><div class="form-group"><label>Date *</label><input class="form-control" id="bDate" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${d.date || ""}"></div><div class="form-group"><label>Time *</label><input class="form-control" id="bTime" type="time" value="${d.time || ""}"></div><div class="form-group"><label>Hectare Area *</label><input class="form-control" id="bHa" type="number" min="0.1" step="0.1" value="${d.ha || ""}" placeholder="e.g. 2"></div><div class="form-group"><label>Purok *</label><input class="form-control" id="bPurok" value="${escapeHtml(d.purok || "")}"></div><div class="form-group"><label>Barangay *</label><input class="form-control" id="bBarangay" value="${escapeHtml(d.barangay || "")}"></div><div class="form-group"><label>Municipality *</label><input class="form-control" id="bMunicipality" value="${escapeHtml(d.municipality || "")}"></div></div>
 <div class="section-head"><div><h3>Availability Calendar</h3><p>Red = fully reserved. Green = available.</p></div></div>${calendar(e.id, d.date)}<div class="card-actions"><button type="button" class="secondary-btn" onclick="closeModal()">CANCEL</button><button type="button" class="primary-btn" onclick="nextBooking()">NEXT STEP</button></div>`;
  else if (bookingStep === 2)
    body = `<div class="booking-steps"><div class="step active">1. Date & Location</div><div class="step active">2. Summary & Payment</div><div class="step">3. Confirmation</div></div><h3>Booking Summary</h3><div class="notice" style="margin:12px 0">${escapeHtml(e.name)} • ${d.date} • ${d.time}<br>${d.ha} hectare(s) • ${escapeHtml(d.purok)}, ${escapeHtml(d.barangay)}, ${escapeHtml(d.municipality)}<br><strong>${e.type === "Harvester" ? "Estimated total" : "Total"}: ${money(bookingEstimate(e, d.ha))}</strong>${e.type === "Harvester" ? `<br><small>${d.ha} ha × ${money(HARVEST_RATE_PER_HA)}. The final fee is based on the hectares actually completed.</small>` : ""}</div><h3 style="margin:16px 0 10px">Payment Method</h3><div class="payment-choice"><label><input type="radio" name="pay" value="GCash" ${d.payment === "GCash" || !d.payment ? "checked" : ""}> GCash</label><label><input type="radio" name="pay" value="Maya" ${d.payment === "Maya" ? "checked" : ""}> Maya</label><label><input type="radio" name="pay" value="Cash" ${d.payment === "Cash" ? "checked" : ""}> Cash</label></div><p class="notice" style="margin-top:12px">Payment method will be recorded with your booking.</p><div class="card-actions"><button type="button" class="secondary-btn" onclick="bookingStep=1;renderBookingModal()">BACK</button><button type="button" class="primary-btn" onclick="nextPayment()">CONTINUE</button></div>`;
  else
    body = `<div class="booking-steps"><div class="step active">1. Date & Location</div><div class="step active">2. Summary & Payment</div><div class="step active">3. Confirmation</div></div><div style="text-align:center;padding:15px"><div style="font-size:50px">✓</div><h2>Ready to File Booking</h2><p style="color:var(--muted);margin:8px 0 18px">Review your reservation before submitting. It will appear as Pending until the admin confirms it.</p></div><div class="notice"><b>${escapeHtml(e.name)}</b><br>Date: ${d.date}<br>Time: ${d.time}<br>Hectare Area: ${d.ha}<br>Location: ${escapeHtml(d.purok)}, ${escapeHtml(d.barangay)}, ${escapeHtml(d.municipality)}<br>Payment: ${escapeHtml(d.payment)}<br>${e.type === "Harvester" ? "Estimated total" : "Total"}: <b>${money(bookingEstimate(e, d.ha))}</b></div><div class="card-actions"><button type="button" class="secondary-btn" onclick="bookingStep=2;renderBookingModal()">BACK</button><button type="button" class="primary-btn" onclick="confirmBooking()">FILE BOOKING</button></div>`;
  showModal(
    `<div class="modal-head"><h2>Book Equipment</h2><button class="close" onclick="closeModal()">✕</button></div>${body}`,
  );
}
function calendar(eid, selected) {
  const now = new Date(),
    y = now.getFullYear(),
    m = now.getMonth(),
    first = new Date(y, m, 1).getDay(),
    days = new Date(y, m + 1, 0).getDate(),
    names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let h =
    '<div class="calendar">' +
    names.map((x) => `<div class="cal-head">${x}</div>`).join("");
  for (let i = 0; i < first; i++) h += "<div></div>";
  for (let day = 1; day <= days; day++) {
    let dt = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      isB = availableUnitsOnDate(eid, dt) <= 0,
      isS = selected === dt;
    h += `<div class="cal-day ${isB ? "booked" : "available"} ${isS ? "selected" : ""}">${day}${isB ? "<br><small>Fully booked</small>" : ""}</div>`;
  }
  return h + "</div>";
}
function nextBooking() {
  try {
    if (!selectedEquipment) {
      toast("Please select equipment first.", "error");
      return false;
    }
    const ids = [
        "bDate",
        "bTime",
        "bHa",
        "bPurok",
        "bBarangay",
        "bMunicipality",
      ],
      v = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      v[id] = el ? String(el.value || "").trim() : "";
    });
    if (ids.some((id) => !v[id])) {
      toast("Please complete all required booking fields.", "error");
      return false;
    }
    if (Number(v.bHa) <= 0) {
      toast("Hectare area must be greater than zero.", "error");
      return false;
    }
    const chosen = new Date(v.bDate + "T" + v.bTime);
    if (Number.isNaN(chosen.getTime())) {
      toast("Please enter a valid date and time.", "error");
      return false;
    }
    if (chosen.getTime() < Date.now()) {
      toast("Please choose a future date and time.", "error");
      return false;
    }
    if (availableUnits(selectedEquipment.id) <= 0) {
      toast("This equipment is no longer available.", "error");
      return false;
    }
    if (availableUnitsOnDate(selectedEquipment.id, v.bDate) <= 0) {
      toast(
        "That date is fully reserved. Please select another date.",
        "error",
      );
      return false;
    }
    bookingDraft = {
      ...bookingDraft,
      equipmentId: selectedEquipment.id,
      date: v.bDate,
      time: v.bTime,
      ha: v.bHa,
      purok: v.bPurok,
      barangay: v.bBarangay,
      municipality: v.bMunicipality,
    };
    bookingStep = 2;
    renderBookingModal();
    toast(
      "Step 1 complete. Review your booking and choose a payment method.",
      "success",
    );
    return true;
  } catch (err) {
    console.error(err);
    toast(
      "Unable to continue. Please check the booking details and try again.",
      "error",
    );
    return false;
  }
}
function nextPayment() {
  try {
    const p = document.querySelector('input[name="pay"]:checked');
    if (!p) {
      toast("Please select a payment method.", "error");
      return false;
    }
    bookingDraft.payment = p.value;
    bookingStep = 3;
    renderBookingModal();
    toast("Payment method saved. Review the confirmation details.", "success");
    return true;
  } catch (err) {
    console.error(err);
    toast("Unable to continue to confirmation.", "error");
    return false;
  }
}
function confirmBooking() {
  try {
    const u = currentUser(),
      e = selectedEquipment;
    if (!u) {
      toast("Please log in as a farmer.", "error");
      return false;
    }
    if (!e) {
      toast("Equipment selection is missing.", "error");
      return false;
    }
    if (!bookingDraft.date || !bookingDraft.time || !bookingDraft.payment) {
      toast("Please complete all booking steps first.", "error");
      bookingStep = 1;
      renderBookingModal();
      return false;
    }
    if (
      availableUnits(e.id) <= 0 ||
      availableUnitsOnDate(e.id, bookingDraft.date) <= 0
    ) {
      toast(
        "This equipment is no longer available for the selected date.",
        "error",
      );
      bookingStep = 1;
      renderBookingModal();
      return false;
    }
    let now = Date.now();
    while (db.bookings.some((x) => x.id === now || x.id === now - 1)) now++;
    const code = "BK-" + String(now).slice(-6),
      b = {
        id: now,
        code,
        userId: u.id,
        equipmentId: e.id,
        date: bookingDraft.date,
        time: bookingDraft.time,
        ha: Number(bookingDraft.ha),
        purok: bookingDraft.purok,
        barangay: bookingDraft.barangay,
        municipality: bookingDraft.municipality,
        total: bookingEstimate(e, bookingDraft.ha),
        service: e.type,
        assignedWorkers: {},
        assignmentFinalized: false,
        completedHa: null,
        payment: bookingDraft.payment,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
    db.bookings.push(b);
    const paid = b.payment !== "Cash";
    db.payments.push({
      id: now + 1,
      bookingId: b.id,
      userId: u.id,
      date: new Date().toISOString().slice(0, 10),
      amount: b.total,
      method: b.payment,
      status: paid ? "Paid" : "Pending",
      reference: "PAY-" + String(now).slice(-6),
    });
    notifyAndToast(
      u.id,
      "Order Confirmation",
      `Your booking ${b.code} for ${e.name} on ${b.date} at ${b.time} was filed successfully. It is Pending until the admin confirms it.`,
      "order",
    );
    notifyAndToast(
      u.id,
      "Payment Confirmation",
      paid
        ? `Payment of ${money(b.total)} via ${b.payment} for ${b.code} was recorded.`
        : `Your ${b.payment} payment method for ${b.code} was recorded and is pending confirmation.`,
      "payment",
    );
    save();
    closeModal();
    toast(
      `Booking ${b.code} filed successfully! Availability updated.`,
      "success",
    );
    navigate("bookings");
    return true;
  } catch (err) {
    console.error(err);
    toast("Booking could not be filed. Please try again.", "error");
    return false;
  }
}

function bookingsPage() {
  const list =
    session.role === "admin"
      ? db.bookings
      : db.bookings.filter((b) => b.userId === currentUser().id);
  return `<div class="section-head"><div><h3>${session.role === "admin" ? "Manage Bookings" : "My Bookings"}</h3><p>Track reservations and booking status.</p></div>${session.role === "farmer" ? '<button class="primary-btn" onclick="navigate(\'equipment\')">+ New Booking</button>' : ""}</div>${bookingTable(list, session.role === "admin")}`;
}
function paymentsPage() {
  const list =
    session.role === "admin"
      ? db.payments
      : db.payments.filter((p) => p.userId === currentUser().id);
  return `<div class="section-head"><div><h3>Payment Records</h3><p>Organized payment inventory for completed transactions.</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Payment ID</th><th>Booking</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>${
    list.length
      ? list
          .map((p) => {
            let b = db.bookings.find((x) => x.id === p.bookingId);
            return `<tr><td>${p.reference}</td><td>${b?.code || "-"}</td><td>${p.date}</td><td>${money(p.amount)}</td><td>${p.method}</td><td><span class="badge ${p.status === "Paid" ? "green" : "yellow"}">${p.status}</span></td></tr>`;
          })
          .join("")
      : `<tr><td colspan="6" style="text-align:center">No payment records.</td></tr>`
  }</tbody></table></div>`;
}
function profilePage() {
  const u = currentUser();
  return `<div class="profile-grid"><div class="panel profile-card"><div class="profile-large">${u?.image ? `<img src="${u.image}">` : "👤"}</div><h3>${escapeHtml(u.fullName)}</h3><p style="color:var(--muted);font-size:12px">@${escapeHtml(u.username)}</p><p style="margin-top:15px;font-size:12px">${escapeHtml(u.email)}<br>${escapeHtml(u.phone)}</p></div><div class="panel"><h3>Personal Information</h3><div class="form-grid" style="margin-top:15px"><div class="form-group"><label>Name</label><input class="form-control" value="${escapeHtml(u.fullName)}" id="pName"></div><div class="form-group"><label>Age</label><input class="form-control" id="pAge" value="${escapeHtml(u.age || "")}"></div><div class="form-group full-row"><label>Address</label><input class="form-control" id="pAddress" value="${escapeHtml(u.address || "")}"></div></div><button class="primary-btn" style="margin-top:15px" onclick="saveProfile()">SAVE PROFILE</button><hr style="border:0;border-top:1px solid var(--border);margin:25px 0"><h3>Change Password</h3><div class="form-grid" style="margin-top:15px"><div class="form-group"><label>Current Password</label><input class="form-control" type="password" id="oldPass"></div><div class="form-group"><label>New Password</label><input class="form-control" type="password" id="newPass"></div><div class="form-group"><label>Confirm Password</label><input class="form-control" type="password" id="confirmPass"></div></div><button class="primary-btn" style="margin-top:15px" onclick="changePassword()">CHANGE PASSWORD</button></div></div>`;
}
function saveProfile() {
  const u = currentUser();
  u.fullName = document.getElementById("pName").value.trim();
  u.age = document.getElementById("pAge").value.trim();
  u.address = document.getElementById("pAddress").value.trim();
  notifyAndToast(
    u.id,
    "Profile Update",
    "Your profile information was updated successfully.",
    "profile",
  );
  save();
  updateUser();
  render();
}
function changePassword() {
  const u = currentUser(),
    o = document.getElementById("oldPass").value,
    n = document.getElementById("newPass").value,
    c = document.getElementById("confirmPass").value;
  if (o !== u.password) return toast("Current password is incorrect.", "error");
  if (n.length < 6 || n !== c)
    return toast(
      "New passwords must match and contain at least 6 characters.",
      "error",
    );
  u.password = n;
  notifyAndToast(
    u.id,
    "Change Password",
    "Your account password was changed successfully.",
    "security",
  );
  save();
}
function notificationsPage() {
  const u = currentUser();
  const list = db.notifications
    .filter((n) => n.userId === u?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  list.forEach((n) => (n.read = true));
  save();
  const rows = list
    .map((n) => {
      const icon =
        n.type === "payment"
          ? "₱"
          : n.type === "security"
            ? "🔒"
            : n.type === "profile"
              ? "👤"
              : "✓";
      return `<div class="notification-item"><div class="notification-icon">${icon}</div><div><b>${escapeHtml(n.title)}</b><p>${escapeHtml(n.message)}</p><small>${new Date(n.createdAt).toLocaleString("en-PH")}</small></div></div>`;
    })
    .join("");
  return `<div class="panel"><div class="section-head"><div><h3>Notifications</h3><p>Order, payment, profile, and security notifications.</p></div></div>${rows || `<div class="empty">No notifications yet.</div>`}</div>`;
}
function aboutPage() {
  return `<div class="panel"><h2>About Dizon Farm Equipment Management System</h2><p style="margin-top:12px;line-height:1.8;color:var(--muted)">The Operational Framework for Dizon Farm Equipment Management System is a centralized platform designed to help farmers reserve agricultural machinery more conveniently. The system organizes equipment availability, booking schedules, payments, and transaction records while giving administrators tools to monitor farm equipment operations.</p></div>`;
}
function supportPage() {
  return `<div class="panel"><h2>Contact Support</h2><p style="color:var(--muted);margin:8px 0 20px">For questions about equipment reservations and transactions, contact the farm support team.</p><div class="stats"><div class="stat"><small>Smart</small><h3>09771093589</h3></div><div class="stat"><small>Globe</small><h3>09304898851</h3></div><div class="stat"><small>DITO</small><h3>09985198524</h3></div></div></div>`;
}
function termsPage() {
  return `<div class="panel"><h2>Terms & Conditions</h2><div style="line-height:1.8;color:var(--muted);margin-top:12px"><p>1. Farmers must provide accurate information when registering and booking.</p><p>2. Equipment shall be used only for lawful agricultural purposes.</p><p>3. The farmer is responsible for following the equipment operator's safety instructions.</p><p>4. Damage caused by misuse may be subject to additional charges.</p><p>5. Reservations are subject to equipment availability and administrator approval.</p><p>6. Cancellation and rescheduling are subject to the farm's booking policy.</p></div></div>`;
}
function reportsPage() {
  const revenue = db.payments
      .filter((p) => p.status === "Paid")
      .reduce((a, p) => a + p.amount, 0),
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    vals = months.map((m, i) => Math.round((revenue * (i + 1)) / 21));
  return `<div class="stats"><div class="stat"><small>Total Revenue</small><h3>${money(revenue)}</h3></div><div class="stat"><small>Total Bookings</small><h3>${db.bookings.length}</h3></div><div class="stat"><small>Completed</small><h3>${db.bookings.filter((b) => b.status === "Completed").length}</h3></div><div class="stat"><small>Cancelled / Rejected</small><h3>${db.bookings.filter((b) => ["Cancelled", "Rejected"].includes(b.status)).length}</h3></div></div><div class="report-grid"><div class="panel"><div class="section-head"><h3>Revenue Chart</h3><select class="form-control" style="width:auto"><option>Monthly</option><option>Yearly</option></select></div><div class="chart">${vals.map((v, i) => `<div class="bar" style="height:${Math.max(10, (v / (Math.max(...vals) || 1)) * 180)}px"><em>${money(v)}</em><span>${months[i]}</span></div>`).join("")}</div></div><div class="panel"><h3>Most Booked Equipment</h3>${db.equipment.map((e) => `<div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;font-size:13px"><b>${escapeHtml(e.name)}</b><span>${db.bookings.filter((b) => b.equipmentId === e.id).length} bookings</span></div>`).join("")}<button class="secondary-btn" style="margin-top:18px" onclick="toast('PDF/Excel export requires a backend or export library in the production version.')">EXPORT PDF / EXCEL</button></div></div>`;
}
function adminEquipment() {
  return `<div class="section-head"><div><h3>Manage Equipment</h3><p>Add, edit, or monitor equipment units.</p></div><button class="primary-btn" onclick="equipmentForm()">+ ADD NEW EQUIPMENT</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Unit</th><th>Brand</th><th>Type</th><th>Rate</th><th>Availability</th><th>Status</th><th>Bookings</th><th>Action</th></tr></thead><tbody>${db.equipment.map((e) => `<tr><td>${e.unit}</td><td>${e.brand}</td><td>${e.type}</td><td>${money(e.rate)}</td><td><span class="badge ${availableUnits(e.id) > 0 ? "green" : "yellow"}">${availableUnits(e.id)} / ${totalUnits(e)} available</span></td><td><span class="badge ${e.status === "Available" ? "green" : "yellow"}">${e.status}</span></td><td>${db.bookings.filter((b) => b.equipmentId === e.id).length}</td><td><div class="card-actions"><button class="secondary-btn" onclick="equipmentForm(${e.id})">EDIT</button><button class="danger-btn" onclick="deleteEquipment(${e.id})">DELETE</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function equipmentForm(id = null) {
  const e = id
    ? db.equipment.find((x) => x.id === id)
    : {
        unit: "",
        name: "",
        brand: "",
        type: "Harvester",
        capacity: "",
        engine: "",
        fuel: "Diesel",
        tank: "",
        year: "2026",
        rate: 7000,
        quantity: 1,
        warranty: "1 Year",
        insurance: "Insured",
        image:
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
        status: "Available",
      };
  showModal(
    `<div class="modal-head"><h2>${id ? "Edit" : "Add"} Equipment</h2><button class="close" onclick="closeModal()">✕</button></div><div class="form-grid">${["unit", "name", "brand", "capacity", "engine", "tank", "year", "rate", "quantity", "warranty", "insurance", "image"].map((k) => `<div class="form-group"><label>${k.replace(/^\w/, (x) => x.toUpperCase())}</label><input class="form-control" id="e_${k}" value="${escapeHtml(e[k])}"></div>`).join("")}<div class="form-group"><label>Type</label><select class="form-control" id="e_type"><option ${e.type === "Harvester" ? "selected" : ""}>Harvester</option><option ${e.type === "Tractor" ? "selected" : ""}>Tractor</option></select></div><div class="form-group"><label>Status</label><select class="form-control" id="e_status"><option ${e.status === "Available" ? "selected" : ""}>Available</option><option ${e.status === "Maintenance" ? "selected" : ""}>Maintenance</option><option ${e.status === "Unavailable" ? "selected" : ""}>Unavailable</option></select></div></div><div class="card-actions"><button class="primary-btn" onclick="saveEquipment(${id || 0})">SAVE EQUIPMENT</button><button class="secondary-btn" onclick="closeModal()">CANCEL</button></div>`,
  );
}
function saveEquipment(id) {
  const keys = [
      "unit",
      "name",
      "brand",
      "capacity",
      "engine",
      "tank",
      "year",
      "rate",
      "quantity",
      "warranty",
      "insurance",
      "image",
    ],
    o = {};
  keys.forEach((k) => (o[k] = document.getElementById("e_" + k).value));
  o.rate = Number(o.rate) || 0;
  o.quantity = Math.max(1, Number(o.quantity) || 1);
  o.type = document.getElementById("e_type").value;
  o.fuel = "Diesel";
  o.status = document.getElementById("e_status").value;
  if (id) {
    Object.assign(
      db.equipment.find((e) => e.id === id),
      o,
    );
  } else {
    db.equipment.push({ id: Date.now(), ...o });
  }
  save();
  closeModal();
  toast("Equipment saved.");
  render();
}
function deleteEquipment(id) {
  if (session?.role !== "admin") {
    toast("Only administrators can delete equipment.", "error");
    return;
  }
  const equipment = db.equipment.find((e) => e.id === id);
  if (!equipment) {
    toast("Equipment could not be found.", "error");
    return;
  }
  const active = db.bookings.filter(
    (b) => b.equipmentId === id && ["Pending", "Confirmed"].includes(b.status),
  );
  if (active.length) {
    toast(
      "Cannot delete this equipment while it has pending or confirmed bookings. Cancel or complete those bookings first.",
      "error",
    );
    return;
  }
  if (
    !confirm(
      `Delete ${equipment.name} (${equipment.unit})? This action cannot be undone.`,
    )
  )
    return;
  db.equipment = db.equipment.filter((e) => e.id !== id);
  save();
  toast("Equipment deleted successfully.");
  render();
}
function login(ev) {
  ev.preventDefault();
  const id = document
      .getElementById("loginIdentity")
      .value.trim()
      .toLowerCase(),
    p = document.getElementById("loginPassword").value,
    u = db.users.find(
      (x) =>
        (x.username.toLowerCase() === id || x.email.toLowerCase() === id) &&
        x.password === p,
    );
  if (!u) return toast("Invalid username/email or password.", "error");
  session = { role: "farmer", userId: u.id };
  localStorage.setItem(KEY + "_session", JSON.stringify(session));
  showApp();
}
function register(ev) {
  ev.preventDefault();
  const name = document.getElementById("regName").value.trim(),
    username = document.getElementById("regUsername").value.trim(),
    email = document.getElementById("regEmail").value.trim(),
    phone = document.getElementById("regPhone").value.trim(),
    pass = document.getElementById("regPassword").value,
    confirm = document.getElementById("regConfirm").value;
  if (pass !== confirm) return toast("Passwords do not match.", "error");
  if (
    db.users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase(),
    )
  )
    return toast("Username or email already exists.", "error");
  const f = document.getElementById("regImage").files[0];
  const create = (img) => {
    db.users.push({
      id: Date.now(),
      fullName: name,
      username,
      email,
      phone,
      password: pass,
      image: img || "",
      age: "",
      address: "",
    });
    save();
    toast("Registration successful. Please login.");
    switchAuth("login");
    document.getElementById("loginIdentity").value = username;
  };
  if (f) {
    const r = new FileReader();
    r.onload = () => create(r.result);
    r.readAsDataURL(f);
  } else create("");
}
function adminLogin(ev) {
  ev.preventDefault();
  if (
    document.getElementById("adminUsername").value === "admin" &&
    document.getElementById("adminPassword").value === "admin123"
  ) {
    session = { role: "admin" };
    localStorage.setItem(KEY + "_session", JSON.stringify(session));
    showApp();
  } else toast("Demo admin credentials: admin / admin123", "error");
}
function forgotPassword() {
  const email = prompt("Enter your registered email:");
  if (!email) return;
  const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return toast("Email not found.", "error");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  alert("Demo verification code: " + code);
  const newPass = prompt("Enter verification code:");
  if (newPass !== code) return toast("Invalid code.", "error");
  const np = prompt("Enter your new password (6+ characters):");
  if (!np || np.length < 6)
    return toast("Password must be at least 6 characters.", "error");
  u.password = np;
  save();
  toast("Password reset successfully.");
}
function logout() {
  session = null;
  localStorage.removeItem(KEY + "_session");
  showAuth();
  switchAuth("login");
}
function showModal(content) {
  document.getElementById("modalContent").innerHTML = content;
  document.getElementById("modal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
/* =====================================================================
   WORKER ASSIGNMENT, COMPLETION & COMMISSIONS (admin-only management)
   ===================================================================== */
function navBadge(page, unread) {
  if (page === "notifications" && unread)
    return ` <span class="nav-count">${unread}</span>`;
  if (page === "bookings" && session?.role === "admin") {
    const n = db.bookings.filter((b) => b.status === "Pending").length;
    if (n) return ` <span class="nav-count">${n}</span>`;
  }
  return "";
}
function r2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
function requireAdmin(action) {
  if (session?.role !== "admin") {
    toast("Only the admin can " + action + ".", "error");
    return false;
  }
  return true;
}
function statusBadge(s) {
  const c =
    {
      Pending: "yellow",
      Confirmed: "green",
      Completed: "blue",
      Rejected: "red",
      Cancelled: "red",
    }[s] || "yellow";
  return `<span class="badge ${c}">${escapeHtml(s)}</span>`;
}
function bookingService(b) {
  return (
    b.service ||
    db.equipment.find((e) => e.id === b.equipmentId)?.type ||
    "Harvester"
  );
}
function bookingEstimate(e, ha) {
  return e.type === "Harvester"
    ? r2((Number(ha) || 0) * HARVEST_RATE_PER_HA)
    : e.rate;
}
function workerById(id) {
  return db.workers.find((w) => w.id === id);
}
function workerName(id) {
  return workerById(id)?.name || "Unknown worker";
}
function crewIds(b) {
  const a = b.assignedWorkers || {};
  return [a.operatorId, ...(a.baggerIds || [])].filter(Boolean);
}
function hasFullCrew(b) {
  const a = b.assignedWorkers || {},
    svc = bookingService(b);
  if (!a.operatorId) return false;
  if (svc === "Tractor") return true;
  const bg = a.baggerIds || [];
  return (
    bg.length === 2 &&
    bg.every(Boolean) &&
    new Set([a.operatorId, ...bg]).size === 3
  );
}
// Bookings have a date/time but no duration, so a worker may hold only one confirmed/completed job per date.
function workerConflict(workerId, b) {
  return db.bookings.find(
    (o) =>
      o.id !== b.id &&
      o.date === b.date &&
      ["Confirmed", "Completed"].includes(o.status) &&
      o.assignmentFinalized &&
      crewIds(o).includes(workerId),
  );
}
function tractorRateFor(b) {
  return b.tractorRateUsed ?? db.settings.tractorRate;
}
// Commission rules: Operator 10% and each Bagger 5% of (hectares x P7,000). Tractor rate is admin-defined (Not Set until then).
function commissionsFor(b, ha) {
  const svc = bookingService(b),
    a = b.assignedWorkers || {},
    h = Number(ha) || 0;
  if (svc === "Harvester") {
    const opAmt = r2((h * HARVEST_RATE_PER_HA * OPERATOR_PCT) / 100),
      bagAmt = r2((h * HARVEST_RATE_PER_HA * BAGGER_PCT) / 100),
      bg = a.baggerIds || [];
    const lines = [
      {
        workerId: a.operatorId || null,
        role: "Harvester Operator",
        rate: OPERATOR_PCT,
        amount: opAmt,
      },
      {
        workerId: bg[0] || null,
        role: "Bagger 1",
        rate: BAGGER_PCT,
        amount: bagAmt,
      },
      {
        workerId: bg[1] || null,
        role: "Bagger 2",
        rate: BAGGER_PCT,
        amount: bagAmt,
      },
    ];
    return {
      service: svc,
      fee: r2(h * HARVEST_RATE_PER_HA),
      lines,
      total: r2(lines.reduce((s, l) => s + l.amount, 0)),
      notSet: false,
    };
  }
  const rate = tractorRateFor(b),
    notSet = rate === null || rate === undefined,
    fee = Number(b.total) || 0;
  const amount = notSet ? null : r2((fee * rate) / 100);
  return {
    service: svc,
    fee,
    lines: [
      {
        workerId: a.operatorId || null,
        role: "Tractor Driver/Operator",
        rate: notSet ? null : rate,
        amount,
      },
    ],
    total: amount,
    notSet,
  };
}
function crewBadge(b) {
  if (["Pending", "Rejected", "Cancelled"].includes(b.status))
    return `<span style="color:var(--muted)">—</span>`;
  return b.assignmentFinalized && hasFullCrew(b)
    ? `<span class="badge green">Assigned</span>`
    : `<span class="badge yellow">Needs workers</span>`;
}
function bookingTable(list, admin = false) {
  if (!list.length) return `<div class="empty">No bookings found.</div>`;
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Booking</th><th>Customer</th><th>Equipment</th><th>Date</th><th>Hectares</th><th>Payment</th><th>Status</th>${admin ? "<th>Workers</th>" : ""}<th>Action</th></tr></thead><tbody>${list
    .map((b) => {
      let u = db.users.find((x) => x.id === b.userId),
        e = db.equipment.find((x) => x.id === b.equipmentId);
      return `<tr><td><b>${b.code}</b></td><td>${escapeHtml(u?.fullName || "Unknown")}</td><td>${escapeHtml(e?.name || "")}</td><td>${b.date}</td><td>${b.ha}${b.status === "Completed" && b.completedHa != null ? `<br><small>Done: ${b.completedHa}</small>` : ""}</td><td>${b.payment}</td><td>${statusBadge(b.status)}</td>${admin ? `<td>${crewBadge(b)}</td>` : ""}<td>${admin ? `<button class="secondary-btn" onclick="adminBooking(${b.id})">Manage</button>` : `<button class="secondary-btn" onclick="userBooking(${b.id})">View</button>`}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function commissionTable(b) {
  if (["Rejected", "Cancelled", "Pending"].includes(b.status))
    return `<div class="notice" style="margin-top:14px">${b.status === "Pending" ? "Worker earnings are not calculated until the booking is confirmed." : `No worker earnings are calculated for ${b.status.toLowerCase()} bookings.`}</div>`;
  const done = b.status === "Completed",
    ha = done ? b.completedHa : b.ha,
    c = commissionsFor(b, ha);
  const rows = c.lines
    .map(
      (l) =>
        `<tr><td>${l.role}</td><td>${l.workerId ? escapeHtml(workerName(l.workerId)) : "<i>Unassigned</i>"}</td><td>${l.rate == null ? "Not Set" : l.rate + "%"}</td><td>${l.amount == null ? "Not Set" : money(l.amount)}</td></tr>`,
    )
    .join("");
  return `<div class="crew-box"><div class="section-head" style="margin:0 0 8px"><div><h3>Worker Commissions</h3><p class="small" style="margin:2px 0 0">${done ? `FINAL — based on ${ha} completed hectare(s).` : `ESTIMATE ONLY — based on ${ha} booked hectare(s). Not payable until the booking is completed.`}</p></div><span class="badge ${done ? "blue" : "yellow"}">${done ? "FINALIZED" : "ESTIMATED"}</span></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Role</th><th>Worker</th><th>Rate</th><th>${done ? "Earnings" : "Est. Earnings"}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3">Total worker commissions</td><td>${c.total == null ? "Not Set" : money(c.total)}</td></tr></tfoot></table></div>${c.notSet ? `<p class="small" style="margin-top:8px">The Tractor Driver/Operator commission rate has not been set. Define it under Workers → Tractor Commission Setting.</p>` : ""}<p style="margin-top:10px;font-size:13px">${done ? "Final customer service fee" : "Estimated customer service fee"}: <b>${money(c.fee)}</b>${c.service === "Harvester" ? ` <small style="color:var(--muted)">(${ha} ha × ${money(HARVEST_RATE_PER_HA)})</small>` : ""}</p></div>`;
}
function workerOptions(b, role, selectedId) {
  const opts = db.workers
    .filter(
      (w) => w.role === role && (w.status === "Active" || w.id === selectedId),
    )
    .map((w) => {
      const c = workerConflict(w.id, b);
      return `<option value="${w.id}" ${w.id === selectedId ? "selected" : ""} ${c ? "disabled" : ""}>${escapeHtml(w.name)}${c ? ` (busy on ${b.date}: ${c.code})` : ""}</option>`;
    });
  return `<option value="">— Select —</option>` + opts.join("");
}
function crewPanel(b) {
  const a = b.assignedWorkers || {},
    svc = bookingService(b),
    bg = a.baggerIds || [];
  const sel = (label, id, role, val) =>
    `<div class="form-group"><label>${label}</label><select class="form-control" id="${id}">${workerOptions(b, role, val)}</select></div>`;
  const fields =
    svc === "Harvester"
      ? sel(
          "Harvester Operator (1 required)",
          "crewOp",
          "Harvester Operator",
          a.operatorId,
        ) +
        sel("Bagger 1", "crewB1", "Bagger", bg[0]) +
        sel("Bagger 2", "crewB2", "Bagger", bg[1])
      : sel(
          "Tractor Driver/Operator (1 required)",
          "crewOp",
          "Tractor Driver/Operator",
          a.operatorId,
        );
  const final = b.assignmentFinalized && hasFullCrew(b);
  return `<div class="crew-box"><div class="section-head" style="margin:0 0 10px"><div><h3>Worker Assignment</h3><p class="small" style="margin:2px 0 0">${svc === "Harvester" ? "Requires exactly 1 Harvester Operator and 2 Baggers." : "Requires exactly 1 Tractor Driver/Operator."} Only the admin can assign workers.</p></div><span class="badge ${final ? "green" : "yellow"}">${final ? "Assignment finalized" : "Not finalized"}</span></div><div class="form-grid">${fields}</div><div class="card-actions"><button class="primary-btn" onclick="saveAssignment(${b.id})">${final ? "UPDATE ASSIGNMENT" : "FINALIZE ASSIGNMENT"}</button></div></div>`;
}
function crewReadOnly(b) {
  const c = commissionsFor(b, 0);
  return `<div class="crew-box"><h3>Assigned Workers</h3>${c.lines.map((l) => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border)"><span>${l.role}</span><b>${l.workerId ? escapeHtml(workerName(l.workerId)) : "—"}</b></div>`).join("")}</div>`;
}
function userBooking(id) {
  const b = db.bookings.find(
    (x) =>
      x.id === id &&
      (session?.role === "admin" || x.userId === session?.userId),
  );
  if (!b) return;
  const e = db.equipment.find((x) => x.id === b.equipmentId),
    done = b.status === "Completed";
  const msg =
    {
      Pending: "Waiting for the admin to review and confirm your request.",
      Confirmed: "Your booking was confirmed by the admin.",
      Rejected:
        "Your booking request was rejected by the admin." +
        (b.rejectReason ? " Reason: " + escapeHtml(b.rejectReason) : ""),
      Completed: "The service has been completed.",
      Cancelled: "This booking was cancelled.",
    }[b.status] || "";
  const crew = ["Confirmed", "Completed"].includes(b.status)
    ? b.assignmentFinalized && hasFullCrew(b)
      ? crewReadOnly(b)
      : `<div class="notice" style="margin-top:12px">Workers will be assigned by the admin.</div>`
    : "";
  showModal(
    `<div class="modal-head"><h2>${b.code}</h2><button class="close" onclick="closeModal()">✕</button></div><div class="notice">Service: ${escapeHtml(bookingService(b))}<br>Equipment: ${escapeHtml(e?.name || "")}<br>Date: ${b.date}<br>Time: ${b.time}<br>Location: ${escapeHtml(b.purok || "")}, ${escapeHtml(b.barangay)}, ${escapeHtml(b.municipality)}<br>Booked hectares: ${b.ha}${done ? `<br>Completed hectares: <b>${b.completedHa}</b>` : ""}<br>${done ? "Final service fee" : "Estimated fee"}: ${money(b.total)}<br>Status: ${statusBadge(b.status)}</div><p style="font-size:12px;color:var(--muted);margin:10px 0">${msg}</p>${crew}<div class="card-actions">${["Pending", "Confirmed"].includes(b.status) ? `<button class="danger-btn" onclick="cancelBooking(${b.id})">CANCEL BOOKING</button>` : ""}<button class="secondary-btn" onclick="closeModal()">CLOSE</button></div>`,
  );
}
function adminBooking(id) {
  if (!requireAdmin("manage bookings")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return;
  const u = db.users.find((x) => x.id === b.userId),
    e = db.equipment.find((x) => x.id === b.equipmentId),
    done = b.status === "Completed";
  let panel = "";
  if (b.status === "Pending")
    panel = `<div class="crew-box"><h3>Review Request</h3><p class="small">Bookings are never confirmed automatically. Confirm or reject this request.</p><div class="form-group"><label>Rejection reason (optional)</label><input class="form-control" id="rejectReason" placeholder="Shown to the customer if rejected"></div><div class="card-actions"><button class="primary-btn" onclick="adminConfirm(${b.id})">CONFIRM BOOKING</button><button class="danger-btn" onclick="adminReject(${b.id})">REJECT BOOKING</button></div></div>`;
  else if (b.status === "Confirmed")
    panel =
      crewPanel(b) +
      `<div class="crew-box"><h3>Record Completion</h3><p class="small">Enter the actual hectares completed, then mark the booking as Completed. Workers must be assigned first.</p><div class="form-group"><label>Completed hectares *</label><input class="form-control" id="doneHa" type="number" min="0.01" step="0.01" placeholder="Booked: ${b.ha}"></div><div class="card-actions"><button class="primary-btn" onclick="saveCompletion(${b.id})">MARK AS COMPLETED</button></div></div>`;
  else if (done)
    panel =
      crewReadOnly(b) +
      `<div class="crew-box"><h3>Completed Hectares</h3><p class="small">Updating the hectares recalculates the final fee and commissions.</p><div class="form-group"><label>Completed hectares *</label><input class="form-control" id="doneHa" type="number" min="0.01" step="0.01" value="${b.completedHa}"></div><div class="card-actions"><button class="secondary-btn" onclick="saveCompletion(${b.id})">UPDATE HECTARES</button></div></div>`;
  else
    panel = `<div class="notice" style="margin-top:14px">This booking is ${b.status.toLowerCase()}.${b.rejectReason ? " Reason: " + escapeHtml(b.rejectReason) : ""}</div>`;
  showModal(
    `<div class="modal-head"><h2>Manage ${b.code}</h2><button class="close" onclick="closeModal()">✕</button></div><div class="notice">Customer: ${escapeHtml(u?.fullName || "")}<br>Phone: ${escapeHtml(u?.phone || "")}<br>Service: <b>${escapeHtml(bookingService(b))}</b> — ${escapeHtml(e?.name || "")}<br>Schedule: ${b.date} ${b.time}<br>Location: ${escapeHtml(b.purok || "")}, ${escapeHtml(b.barangay)}, ${escapeHtml(b.municipality)}<br>Booked hectares: ${b.ha}${done ? ` • Completed: <b>${b.completedHa}</b>` : ""}<br>Payment: ${b.payment}<br>${done ? "Final service fee" : "Estimated fee"}: <b>${money(b.total)}</b></div><div style="margin:12px 0 0">Status: ${statusBadge(b.status)}</div>${panel}${commissionTable(b)}<div class="card-actions" style="margin-top:16px">${["Pending", "Confirmed"].includes(b.status) ? `<button class="danger-btn" onclick="adminCancel(${b.id})">CANCEL BOOKING</button>` : ""}<button class="secondary-btn" onclick="closeModal()">CLOSE</button></div>`,
  );
}
function adminConfirm(id) {
  if (!requireAdmin("confirm bookings")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || b.status !== "Pending") {
    toast("Only pending bookings can be confirmed.", "error");
    return;
  }
  b.status = "Confirmed";
  addNotification(
    b.userId,
    "Order Confirmation",
    `Your booking ${b.code} was confirmed by the admin.`,
    "order",
  );
  save();
  toast(`${b.code} confirmed. Now assign the required workers.`);
  render();
  adminBooking(id);
}
function adminReject(id) {
  if (!requireAdmin("reject bookings")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || b.status !== "Pending") {
    toast("Only pending bookings can be rejected.", "error");
    return;
  }
  b.status = "Rejected";
  b.rejectReason = (
    document.getElementById("rejectReason")?.value || ""
  ).trim();
  addNotification(
    b.userId,
    "Order Confirmation",
    `Your booking ${b.code} was rejected.${b.rejectReason ? " Reason: " + b.rejectReason : ""}`,
    "order",
  );
  save();
  closeModal();
  toast(`${b.code} rejected.`);
  render();
}
function adminCancel(id) {
  if (!requireAdmin("cancel bookings")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || !["Pending", "Confirmed"].includes(b.status)) {
    toast("This booking cannot be cancelled.", "error");
    return;
  }
  if (!confirm(`Cancel booking ${b.code}? Assigned workers will be released.`))
    return;
  b.status = "Cancelled";
  addNotification(
    b.userId,
    "Order Confirmation",
    `Your booking ${b.code} was cancelled by the admin.`,
    "order",
  );
  save();
  closeModal();
  toast("Booking cancelled.");
  render();
}
function saveAssignment(id) {
  if (!requireAdmin("assign workers")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || b.status !== "Confirmed") {
    toast("Workers can only be assigned to confirmed bookings.", "error");
    return;
  }
  const svc = bookingService(b),
    val = (k) => Number(document.getElementById(k)?.value) || null;
  const operatorId = val("crewOp"),
    baggerIds = svc === "Harvester" ? [val("crewB1"), val("crewB2")] : [];
  const picked = [operatorId, ...baggerIds];
  if (picked.some((x) => !x)) {
    toast(
      svc === "Harvester"
        ? "Incomplete assignment: a Harvester booking needs exactly 1 Harvester Operator and 2 Baggers."
        : "Incomplete assignment: a Tractor booking needs exactly 1 Tractor Driver/Operator.",
      "error",
    );
    return;
  }
  if (new Set(picked).size !== picked.length) {
    toast("The same worker cannot be selected twice for one booking.", "error");
    return;
  }
  const roles = [
    svc === "Harvester" ? "Harvester Operator" : "Tractor Driver/Operator",
    ...baggerIds.map(() => "Bagger"),
  ];
  for (let i = 0; i < picked.length; i++) {
    const w = workerById(picked[i]);
    if (!w) {
      toast("Selected worker no longer exists.", "error");
      return;
    }
    if (w.status !== "Active") {
      toast(`${w.name} is inactive and cannot be assigned.`, "error");
      return;
    }
    if (w.role !== roles[i]) {
      toast(
        `${w.name} is a ${w.role} and is not qualified as ${roles[i]}.`,
        "error",
      );
      return;
    }
    const c = workerConflict(w.id, b);
    if (c) {
      toast(
        `Scheduling conflict: ${w.name} is already assigned to ${c.code} on ${b.date}.`,
        "error",
      );
      return;
    }
  }
  b.assignedWorkers = { operatorId, baggerIds };
  b.assignmentFinalized = true;
  addNotification(
    b.userId,
    "Order Confirmation",
    `Workers have been assigned to your booking ${b.code} by the admin.`,
    "order",
  );
  save();
  toast("Worker assignment finalized.");
  render();
  adminBooking(id);
}
function saveCompletion(id) {
  if (!requireAdmin("record completed hectares")) return;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || !["Confirmed", "Completed"].includes(b.status)) {
    toast("Only confirmed bookings can be completed.", "error");
    return;
  }
  if (isBookingPaid(b.id)) {
    toast(
      "This booking is already in a paid payroll. Undo that payroll entry first (Payroll page) before changing its hectares.",
      "error",
    );
    return;
  }
  const raw = String(document.getElementById("doneHa")?.value || "").trim(),
    ha = Number(raw);
  if (!raw) {
    toast("Please enter the completed hectares.", "error");
    return;
  }
  if (!Number.isFinite(ha) || ha <= 0) {
    toast("Completed hectares must be a number greater than zero.", "error");
    return;
  }
  const wasDone = b.status === "Completed";
  if (!wasDone && !(b.assignmentFinalized && hasFullCrew(b))) {
    toast(
      "Cannot complete this booking: assign and finalize the required workers first.",
      "error",
    );
    return;
  }
  b.completedHa = r2(ha);
  if (!wasDone) {
    b.status = "Completed";
    b.completedAt = new Date().toISOString();
    if (
      bookingService(b) === "Tractor" &&
      db.settings.tractorRate != null &&
      b.tractorRateUsed == null
    )
      b.tractorRateUsed = db.settings.tractorRate;
  }
  if (bookingService(b) === "Harvester") {
    b.total = r2(b.completedHa * HARVEST_RATE_PER_HA);
    const p = db.payments.find((x) => x.bookingId === b.id);
    if (p) p.amount = b.total;
  }
  snapshotPayroll(b);
  addNotification(
    b.userId,
    "Order Confirmation",
    wasDone
      ? `The completed hectares for ${b.code} were updated to ${b.completedHa}. Final service fee: ${money(b.total)}.`
      : `Your booking ${b.code} is completed (${b.completedHa} hectare(s)). Final service fee: ${money(b.total)}.`,
    "order",
  );
  save();
  toast(
    wasDone
      ? "Completed hectares updated; commissions recalculated."
      : "Booking completed. Commissions finalized.",
  );
  render();
  adminBooking(id);
}
function cancelBooking(id) {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return;
  if (session?.role !== "admin" && b.userId !== session?.userId) {
    toast("You can only cancel your own bookings.", "error");
    return;
  }
  if (!["Pending", "Confirmed"].includes(b.status)) {
    toast("This booking can no longer be cancelled.", "error");
    return;
  }
  b.status = "Cancelled";
  addNotification(
    b.userId,
    "Order Confirmation",
    `Your booking ${b.code} was cancelled. The equipment unit is available again.`,
    "order",
  );
  save();
  closeModal();
  toast("Booking cancelled. Availability restored.");
  render();
}

/* ---------- Worker management (admin only) ---------- */
function workerStats(w) {
  let upcoming = 0,
    completed = 0,
    earnings = 0,
    pendingRate = false;
  db.bookings.forEach((b) => {
    if (!b.assignmentFinalized || !crewIds(b).includes(w.id)) return;
    if (b.status === "Confirmed") upcoming++;
    else if (b.status === "Completed") {
      completed++;
      const l = commissionsFor(b, b.completedHa).lines.find(
        (x) => x.workerId === w.id,
      );
      if (l) {
        if (l.amount == null) pendingRate = true;
        else earnings += l.amount;
      }
    }
  });
  return { upcoming, completed, earnings: r2(earnings), pendingRate };
}
function workersPage() {
  const stats = db.workers.map(workerStats),
    rate = db.settings.tractorRate;
  return `<div class="stats"><div class="stat"><small>Active Workers</small><h3>${db.workers.filter((w) => w.status === "Active").length}</h3></div><div class="stat"><small>Upcoming Assignments</small><h3>${stats.reduce((s, x) => s + x.upcoming, 0)}</h3></div><div class="stat"><small>Completed Jobs</small><h3>${stats.reduce((s, x) => s + x.completed, 0)}</h3></div><div class="stat"><small>Finalized Commissions</small><h3>${money(stats.reduce((s, x) => s + x.earnings, 0))}</h3></div></div>
 <div class="panel" style="margin-bottom:18px"><div class="section-head" style="margin-top:0"><div><h3>Tractor Commission Setting</h3><p>Harvester rates are fixed (Operator 10%, each Bagger 5% of ${money(HARVEST_RATE_PER_HA)}/ha). The tractor rate is not defined yet — set it here (percent of the tractor service fee).</p></div><span class="badge ${rate == null ? "yellow" : "green"}">${rate == null ? "Not Set" : rate + "%"}</span></div><div class="settings-row"><div class="form-group"><label>Tractor Driver/Operator commission (%)</label><input class="form-control" id="tractorRate" type="number" min="0" max="100" step="0.1" value="${rate == null ? "" : rate}" placeholder="Not Set"></div><button class="primary-btn" onclick="saveTractorRate()">SAVE RATE</button></div></div>
 <div class="section-head"><div><h3>Workers</h3><p>Operators, baggers and tractor drivers. Workers can only be assigned to roles they are qualified for.</p></div><button class="primary-btn" onclick="workerForm()">+ ADD WORKER</button></div>
 <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Upcoming</th><th>Completed</th><th>Total Earnings</th><th>Action</th></tr></thead><tbody>${
   db.workers.length
     ? db.workers
         .map((w, i) => {
           const s = stats[i];
           return `<tr><td><b>${escapeHtml(w.name)}</b></td><td>${escapeHtml(w.phone || "-")}</td><td>${escapeHtml(w.role)}</td><td><span class="badge ${w.status === "Active" ? "green" : "red"}">${w.status}</span></td><td>${s.upcoming}</td><td>${s.completed}</td><td>${money(s.earnings)}${s.pendingRate ? `<br><small style="color:var(--muted)">+ tractor rate Not Set</small>` : ""}</td><td><div class="card-actions" style="margin:0"><button class="secondary-btn" onclick="viewWorker(${w.id})">VIEW</button><button class="secondary-btn" onclick="workerForm(${w.id})">EDIT</button></div></td></tr>`;
         })
         .join("")
     : `<tr><td colspan="8" style="text-align:center">No workers yet.</td></tr>`
 }</tbody></table></div>`;
}
function saveTractorRate() {
  if (!requireAdmin("change commission rates")) return;
  const raw = String(document.getElementById("tractorRate").value).trim();
  if (raw === "") {
    db.settings.tractorRate = null;
    save();
    toast("Tractor commission rate cleared (Not Set).");
    render();
    return;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    toast("Commission rate must be a number between 0 and 100.", "error");
    return;
  }
  db.settings.tractorRate = n;
  save();
  toast(`Tractor commission rate set to ${n}%.`);
  render();
}
function workerForm(id = null) {
  if (!requireAdmin("manage workers")) return;
  const w = id
    ? workerById(id)
    : { name: "", phone: "", role: "Harvester Operator", status: "Active" };
  if (!w) return;
  showModal(
    `<div class="modal-head"><h2>${id ? "Edit" : "Add"} Worker</h2><button class="close" onclick="closeModal()">✕</button></div><div class="form-grid"><div class="form-group"><label>Full Name *</label><input class="form-control" id="w_name" value="${escapeHtml(w.name)}"></div><div class="form-group"><label>Phone</label><input class="form-control" id="w_phone" value="${escapeHtml(w.phone || "")}"></div><div class="form-group"><label>Role *</label><select class="form-control" id="w_role">${ROLES.map((r) => `<option ${w.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></div><div class="form-group"><label>Status</label><select class="form-control" id="w_status"><option ${w.status === "Active" ? "selected" : ""}>Active</option><option ${w.status === "Inactive" ? "selected" : ""}>Inactive</option></select></div></div><div class="card-actions"><button class="primary-btn" onclick="saveWorker(${id || 0})">SAVE WORKER</button><button class="secondary-btn" onclick="closeModal()">CANCEL</button></div>`,
  );
}
function saveWorker(id) {
  if (!requireAdmin("manage workers")) return;
  const name = document.getElementById("w_name").value.trim(),
    phone = document.getElementById("w_phone").value.trim(),
    role = document.getElementById("w_role").value,
    status = document.getElementById("w_status").value;
  if (!name) {
    toast("Worker name is required.", "error");
    return;
  }
  if (!ROLES.includes(role)) {
    toast("Please choose a valid role.", "error");
    return;
  }
  if (id) {
    const w = workerById(id),
      s = workerStats(w);
    if (w.role !== role && (s.upcoming || s.completed)) {
      toast(
        "Cannot change the role of a worker with assigned or completed jobs. Set them Inactive and add a new worker instead.",
        "error",
      );
      return;
    }
    if (status === "Inactive" && s.upcoming) {
      toast(
        "This worker has upcoming assignments. Reassign those bookings before setting them Inactive.",
        "error",
      );
      return;
    }
    Object.assign(w, { name, phone, role, status });
  } else db.workers.push({ id: Date.now(), name, phone, role, status });
  save();
  closeModal();
  toast("Worker saved.");
  render();
}
function viewWorker(id) {
  if (!requireAdmin("view worker records")) return;
  const w = workerById(id);
  if (!w) return;
  const s = workerStats(w),
    jobs = db.bookings
      .filter(
        (b) =>
          b.assignmentFinalized &&
          crewIds(b).includes(w.id) &&
          ["Confirmed", "Completed"].includes(b.status),
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  const rows = jobs
    .map((b) => {
      const done = b.status === "Completed",
        l = commissionsFor(b, done ? b.completedHa : b.ha).lines.find(
          (x) => x.workerId === w.id,
        );
      return `<tr><td><b>${b.code}</b></td><td>${bookingService(b)}</td><td>${b.date}</td><td>${l?.role || ""}</td><td>${done ? b.completedHa : b.ha}</td><td>${statusBadge(b.status)}</td><td>${l?.amount == null ? "Not Set" : money(l.amount)}<br><small style="color:var(--muted)">${done ? "Final" : "Estimated"}</small></td></tr>`;
    })
    .join("");
  showModal(
    `<div class="modal-head"><h2>${escapeHtml(w.name)}</h2><button class="close" onclick="closeModal()">✕</button></div><div class="details"><div><b>Role</b><br>${escapeHtml(w.role)}</div><div><b>Status</b><br>${w.status}</div><div><b>Phone</b><br>${escapeHtml(w.phone || "-")}</div><div><b>Completed jobs</b><br>${s.completed}</div><div><b>Upcoming assignments</b><br>${s.upcoming}</div><div><b>Total earnings (finalized)</b><br>${money(s.earnings)}</div></div>${s.pendingRate ? `<div class="notice" style="margin-bottom:12px">Some completed tractor jobs have no commission yet because the tractor rate is Not Set.</div>` : ""}<h3 style="margin:10px 0">Assigned Bookings</h3>${rows ? `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Booking</th><th>Service</th><th>Date</th><th>Role</th><th>Ha</th><th>Status</th><th>Earnings</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty">No assigned bookings yet.</div>`}<div class="card-actions"><button class="secondary-btn" onclick="closeModal()">CLOSE</button></div>`,
  );
}

/* =====================================================================
   WEEKLY PAYROLL (admin) — per-date record of who worked, their rates and pay.
   Week = Monday–Sunday, grouped by the booking's service date.
   Pay lines are saved on the booking when it is completed, so later rate
   changes or crew edits cannot rewrite past payroll.
   ===================================================================== */
let payrollWeek = null;
function payPad(n) {
  return String(n).padStart(2, "0");
}
function payYmd(d) {
  return (
    d.getFullYear() + "-" + payPad(d.getMonth() + 1) + "-" + payPad(d.getDate())
  );
}
function payParse(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d);
}
function payAddDays(s, n) {
  const d = payParse(s);
  d.setDate(d.getDate() + n);
  return payYmd(d);
}
function payWeekStart(s) {
  const d = payParse(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return payYmd(d);
}
function payFmt(s, long) {
  return payParse(s).toLocaleDateString(
    "en-PH",
    long
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}
function payCurrentWeek() {
  return payrollWeek || payWeekStart(payYmd(new Date()));
}
function payRange(ws) {
  return payFmt(ws) + " – " + payFmt(payAddDays(ws, 6));
}
function snapshotPayroll(b) {
  const c = commissionsFor(b, b.completedHa);
  b.payroll = {
    ha: b.completedHa,
    fee: c.fee,
    lines: c.lines
      .filter((l) => l.workerId)
      .map((l) => ({
        workerId: l.workerId,
        role: l.role,
        rate: l.rate,
        amount: l.amount,
      })),
    at: new Date().toISOString(),
  };
}
// Saved lines when complete; otherwise (older bookings / tractor rate not set yet) computed live.
function payrollFor(b) {
  if (b.payroll && b.payroll.lines.every((l) => l.amount != null))
    return b.payroll;
  const c = commissionsFor(b, b.completedHa);
  return {
    ha: b.completedHa,
    fee: c.fee,
    lines: c.lines.filter((l) => l.workerId),
  };
}
function backfillPayroll() {
  let changed = false;
  db.bookings.forEach((b) => {
    if (b.status !== "Completed" || b.payroll || b.completedHa == null) return;
    if (!crewIds(b).length) return;
    const c = commissionsFor(b, b.completedHa);
    if (c.lines.some((l) => l.workerId && l.amount == null)) return;
    snapshotPayroll(b);
    changed = true;
  });
  if (changed) save();
}
function isLinePaid(workerId, bookingId) {
  return db.payroll.some(
    (p) => p.workerId === workerId && p.bookingIds.includes(bookingId),
  );
}
function isBookingPaid(bookingId) {
  return db.payroll.some((p) => p.bookingIds.includes(bookingId));
}
function payrollLines(ws) {
  const end = payAddDays(ws, 6),
    out = [];
  db.bookings
    .filter((b) => b.status === "Completed" && b.date >= ws && b.date <= end)
    .forEach((b) => {
      const p = payrollFor(b),
        e = db.equipment.find((x) => x.id === b.equipmentId),
        u = db.users.find((x) => x.id === b.userId);
      p.lines.forEach((l) =>
        out.push({
          bookingId: b.id,
          code: b.code,
          date: b.date,
          customer: u?.fullName || "Unknown",
          equipment: e?.name || "",
          workerId: l.workerId,
          role: l.role,
          rate: l.rate,
          ha: p.ha,
          fee: p.fee,
          amount: l.amount,
          paid: isLinePaid(l.workerId, b.id),
        }),
      );
    });
  return out.sort(
    (a, b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code),
  );
}
function payrollByWorker(lines) {
  const m = {};
  lines.forEach((l) => {
    const w = (m[l.workerId] = m[l.workerId] || {
      workerId: l.workerId,
      lines: [],
      days: new Set(),
      jobs: 0,
      ha: 0,
      total: 0,
      paidTotal: 0,
      unpaidTotal: 0,
      hasNull: false,
    });
    w.lines.push(l);
    w.days.add(l.date);
    w.jobs++;
    w.ha = r2(w.ha + (Number(l.ha) || 0));
    if (l.amount == null) w.hasNull = true;
    else {
      w.total = r2(w.total + l.amount);
      if (l.paid) w.paidTotal = r2(w.paidTotal + l.amount);
      else w.unpaidTotal = r2(w.unpaidTotal + l.amount);
    }
  });
  return Object.values(m).sort((a, b) =>
    workerName(a.workerId).localeCompare(workerName(b.workerId)),
  );
}
function payStatusBadge(w) {
  const paid = w.lines.filter((l) => l.paid).length;
  if (paid === w.lines.length) return `<span class="badge green">Paid</span>`;
  if (paid === 0) return `<span class="badge yellow">Unpaid</span>`;
  return `<span class="badge blue">Partly paid</span>`;
}
function payRateText(l) {
  return l.rate == null ? "Not Set" : l.rate + "%";
}
function payAmountText(l) {
  return l.amount == null ? "Not Set" : money(l.amount);
}
function payrollPage() {
  const ws = payCurrentWeek(),
    end = payAddDays(ws, 6),
    lines = payrollLines(ws),
    workers = payrollByWorker(lines),
    jobCount = new Set(lines.map((l) => l.bookingId)).size,
    total = r2(workers.reduce((s, w) => s + w.total, 0)),
    paid = r2(workers.reduce((s, w) => s + w.paidTotal, 0)),
    unpaid = r2(workers.reduce((s, w) => s + w.unpaidTotal, 0)),
    waiting = db.bookings.filter(
      (b) => b.status === "Confirmed" && b.date >= ws && b.date <= end,
    ).length;
  const dates = [...new Set(lines.map((l) => l.date))];
  const daily = dates
    .map((d) => {
      const dl = lines.filter((l) => l.date === d),
        dayTotal = r2(dl.reduce((s, l) => s + (l.amount || 0), 0)),
        jobs = new Set(dl.map((l) => l.bookingId)).size;
      return `<div class="pay-day"><div class="section-head" style="margin:20px 0 8px"><div><h3>${payFmt(d, true)}</h3><p>${jobs} completed job(s)</p></div><b>${money(dayTotal)}</b></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Booking</th><th>Customer</th><th>Equipment</th><th>Role</th><th>Worker</th><th>Hectares</th><th>Rate</th><th>Earnings</th><th>Status</th></tr></thead><tbody>${dl
        .map(
          (l) =>
            `<tr><td><b>${l.code}</b></td><td>${escapeHtml(l.customer)}</td><td>${escapeHtml(l.equipment)}</td><td>${escapeHtml(l.role)}</td><td>${escapeHtml(workerName(l.workerId))}</td><td>${l.ha}</td><td>${payRateText(l)}</td><td><b>${payAmountText(l)}</b></td><td>${l.paid ? `<span class="badge green">Paid</span>` : `<span class="badge yellow">Unpaid</span>`}</td></tr>`,
        )
        .join("")}</tbody></table></div></div>`;
    })
    .join("");
  const summary = workers
    .map((w) => {
      const wk = db.workers.find((x) => x.id === w.workerId),
        hasPaid = w.lines.some((l) => l.paid),
        hasUnpaid = w.lines.some((l) => !l.paid);
      return `<tr><td><b>${escapeHtml(workerName(w.workerId))}</b></td><td>${escapeHtml(wk?.role || "")}</td><td>${w.days.size}</td><td>${w.jobs}</td><td>${w.ha}</td><td><b>${money(w.total)}</b>${w.hasNull ? `<br><small style="color:var(--muted)">+ tractor rate Not Set</small>` : ""}</td><td>${payStatusBadge(w)}</td><td class="no-print"><div class="card-actions" style="margin:0"><button class="secondary-btn" onclick="payslip(${w.workerId},'${ws}')">PAYSLIP</button>${hasUnpaid ? `<button class="primary-btn" onclick="payrollPayWorker(${w.workerId},'${ws}')">MARK PAID</button>` : ""}${hasPaid ? `<button class="danger-btn" onclick="payrollUndo(${w.workerId},'${ws}')">UNDO</button>` : ""}</div></td></tr>`;
    })
    .join("");
  return `<div class="toolbar no-print" style="align-items:center">
<button class="secondary-btn" onclick="payrollShift(-1)">◀ Previous</button>
<div class="pay-week-label">${payRange(ws)}</div>
<button class="secondary-btn" onclick="payrollShift(1)">Next ▶</button>
<input type="date" value="${ws}" onchange="payrollGoto(this.value)" title="Jump to the week containing this date">
<button class="secondary-btn" onclick="payrollGoto('')">This week</button>
<span style="flex:1"></span>
<button class="secondary-btn" onclick="payrollExport()">⬇ Export CSV</button>
<button class="secondary-btn" onclick="payrollPrint()">🖨 Print</button>
<button class="primary-btn" onclick="payrollPayAll()">MARK WEEK AS PAID</button>
</div>
<div id="payrollArea">
<div class="print-only"><h2>Dizon Farm Equipment — Weekly Payroll</h2><p>${payRange(ws)} (Monday–Sunday, by service date)</p></div>
<div class="stats"><div class="stat"><small>Total Payroll</small><h3>${money(total)}</h3></div><div class="stat"><small>Paid</small><h3>${money(paid)}</h3></div><div class="stat"><small>Unpaid</small><h3>${money(unpaid)}</h3></div><div class="stat"><small>Completed Jobs</small><h3>${jobCount}</h3></div></div>
${waiting ? `<div class="notice no-print" style="margin-bottom:14px">${waiting} confirmed booking(s) this week are not completed yet, so they are not in the payroll. Complete them in Manage Bookings first.</div>` : ""}
<div class="section-head"><div><h3>Weekly Summary per Worker</h3><p>You decide when a worker's week is payroll: press MARK PAID once you have paid them. UNDO reverses it.</p></div></div>
${workers.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Worker</th><th>Role</th><th>Days Worked</th><th>Jobs</th><th>Hectares</th><th>Total Pay</th><th>Status</th><th class="no-print">Action</th></tr></thead><tbody>${summary}</tbody><tfoot><tr><td colspan="5">Total</td><td colspan="3">${money(total)}</td></tr></tfoot></table></div>` : `<div class="empty">No completed jobs with assigned workers for this week.</div>`}
${daily ? `<div class="section-head" style="margin-top:30px"><div><h3>Daily Record</h3><p>Who worked on each date, their rate and what they earned.</p></div></div>${daily}` : ""}
</div>`;
}
function payrollShift(n) {
  payrollWeek = payAddDays(payCurrentWeek(), 7 * n);
  render();
}
function payrollGoto(v) {
  payrollWeek = v ? payWeekStart(v) : null;
  render();
}
// Marks every unpaid line of one worker's week as paid; returns the amount, or null if nothing/blocked.
function payWorkerWeek(workerId, ws) {
  const unpaid = payrollLines(ws).filter(
    (l) => l.workerId === workerId && !l.paid,
  );
  if (!unpaid.length || unpaid.some((l) => l.amount == null)) return null;
  const amt = r2(unpaid.reduce((s, l) => s + l.amount, 0));
  let rec = db.payroll.find(
    (p) => p.workerId === workerId && p.weekStart === ws,
  );
  if (!rec) {
    rec = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      workerId,
      weekStart: ws,
      bookingIds: [],
      amount: 0,
      paidAt: null,
    };
    db.payroll.push(rec);
  }
  unpaid.forEach((l) => rec.bookingIds.push(l.bookingId));
  rec.amount = r2(rec.amount + amt);
  rec.paidAt = new Date().toISOString();
  return amt;
}
function payrollPayWorker(workerId, ws) {
  if (!requireAdmin("mark payroll as paid")) return;
  const unpaid = payrollLines(ws).filter(
    (l) => l.workerId === workerId && !l.paid,
  );
  if (unpaid.some((l) => l.amount == null)) {
    toast(
      "Cannot mark as paid: the tractor commission rate is Not Set. Set it under Workers first.",
      "error",
    );
    return;
  }
  const amt = r2(unpaid.reduce((s, l) => s + l.amount, 0));
  if (
    !confirm(
      `Mark ${money(amt)} as paid to ${workerName(workerId)} for ${payRange(ws)}?`,
    )
  )
    return;
  payWorkerWeek(workerId, ws);
  save();
  toast("Marked as paid.");
  render();
}
function payrollPayAll() {
  if (!requireAdmin("mark payroll as paid")) return;
  const ws = payCurrentWeek(),
    ws2 = payrollByWorker(payrollLines(ws)).filter(
      (w) => w.unpaidTotal > 0 || w.lines.some((l) => !l.paid),
    );
  const payable = ws2.filter(
    (w) =>
      w.lines.some((l) => !l.paid) &&
      !w.lines.some((l) => !l.paid && l.amount == null),
  );
  if (!payable.length) {
    toast("Nothing unpaid to mark for this week.", "error");
    return;
  }
  const amt = r2(payable.reduce((s, w) => s + w.unpaidTotal, 0));
  if (
    !confirm(
      `Mark ${money(amt)} as paid to ${payable.length} worker(s) for ${payRange(ws)}?`,
    )
  )
    return;
  payable.forEach((w) => payWorkerWeek(w.workerId, ws));
  save();
  const skipped = ws2.length - payable.length;
  toast(
    skipped
      ? `Marked paid. ${skipped} worker(s) skipped (tractor rate Not Set).`
      : "Week marked as paid.",
  );
  render();
}
function payrollUndo(workerId, ws) {
  if (!requireAdmin("undo payroll")) return;
  const rec = db.payroll.find(
    (p) => p.workerId === workerId && p.weekStart === ws,
  );
  if (!rec) return;
  if (
    !confirm(
      `Undo the paid status (${money(rec.amount)}) for ${workerName(workerId)}, ${payRange(ws)}?`,
    )
  )
    return;
  db.payroll = db.payroll.filter((p) => p !== rec);
  save();
  toast("Payroll entry undone.");
  render();
}
function payslip(workerId, ws) {
  if (!requireAdmin("view payslips")) return;
  const w = payrollByWorker(payrollLines(ws)).find(
    (x) => x.workerId === workerId,
  );
  if (!w) return;
  const wk = db.workers.find((x) => x.id === workerId),
    rec = db.payroll.find((p) => p.workerId === workerId && p.weekStart === ws),
    rows = w.lines
      .map(
        (l) =>
          `<tr><td>${payFmt(l.date)}</td><td><b>${l.code}</b></td><td>${escapeHtml(l.customer)}</td><td>${escapeHtml(l.role)}</td><td>${l.ha}</td><td>${payRateText(l)}</td><td><b>${payAmountText(l)}</b></td></tr>`,
      )
      .join("");
  showModal(
    `<div class="modal-head"><h2>Payslip</h2><button class="close no-print" onclick="closeModal()">✕</button></div>
<div class="details"><div><b>Worker</b><br>${escapeHtml(workerName(workerId))}</div><div><b>Role</b><br>${escapeHtml(wk?.role || "")}</div><div><b>Period</b><br>${payRange(ws)}</div><div><b>Status</b><br>${payStatusBadge(w)}${rec?.paidAt ? `<br><small>Paid ${payFmt(payYmd(new Date(rec.paidAt)))}</small>` : ""}</div></div>
<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Date</th><th>Booking</th><th>Customer</th><th>Role</th><th>Ha</th><th>Rate</th><th>Earnings</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="6">Total (${w.days.size} day(s) worked)</td><td>${money(w.total)}</td></tr></tfoot></table></div>
<div style="display:flex;justify-content:space-between;margin-top:36px;font-size:12px;color:var(--muted)"><span>Prepared by: ____________________</span><span>Received by: ____________________</span></div>
<div class="card-actions no-print"><button class="primary-btn" onclick="payslipPrint()">🖨 PRINT</button><button class="secondary-btn" onclick="closeModal()">CLOSE</button></div>`,
  );
}
function payPrintWith(cls) {
  document.body.classList.add(cls);
  window.addEventListener(
    "afterprint",
    () => document.body.classList.remove(cls),
    { once: true },
  );
  setTimeout(() => window.print(), 50);
}
function payrollPrint() {
  payPrintWith("printing-week");
}
function payslipPrint() {
  payPrintWith("printing-slip");
}
function payrollExport() {
  if (!requireAdmin("export payroll")) return;
  const ws = payCurrentWeek(),
    lines = payrollLines(ws);
  if (!lines.length) {
    toast("No payroll records to export for this week.", "error");
    return;
  }
  const cell = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"',
    rows = [
      [
        "Date",
        "Booking",
        "Customer",
        "Equipment",
        "Worker",
        "Role",
        "Hectares",
        "Rate %",
        "Service Fee",
        "Earnings",
        "Status",
      ],
      ...lines.map((l) => [
        l.date,
        l.code,
        l.customer,
        l.equipment,
        workerName(l.workerId),
        l.role,
        l.ha,
        l.rate ?? "Not Set",
        l.fee,
        l.amount ?? "Not Set",
        l.paid ? "Paid" : "Unpaid",
      ]),
    ];
  const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n")],
      {
        type: "text/csv;charset=utf-8",
      },
    ),
    a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `payroll_${ws}_to_${payAddDays(ws, 6)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

init();
