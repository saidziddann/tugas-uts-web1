/* script.js - logika bersama semua halaman */
const $ = (s, r = document) => r.querySelector(s);
const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const load = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
const simpan = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const halaman = document.body.dataset.page;
const sesi = load("sesi", null);
const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const semuaUser = () => [...dataUser, ...load("userBaru", [])];
const semuaPesanan = () => [...dataTracking, ...load("pesanan_v2", [])];
const katalog = () =>
  load(
    "katalog_v2",
    dataKatalogBuku.map((b) => ({ ...b })),
  );

if (halaman !== "login" && !sesi) location.href = "index.html";

/* ---------- Modal / pop-up ---------- */
function tutupModal() {
  document.querySelector(".modal")?.remove();
}
function bukaModal(judul, html) {
  tutupModal();
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="${judul}">
    <button class="tutup" aria-label="Tutup">&times;</button><h2>${judul}</h2>${html}</div>`;
  m.addEventListener("click", (e) => {
    if (e.target === m || e.target.classList.contains("tutup")) tutupModal();
  });
  document.body.appendChild(m);
  return m.firstElementChild;
}
const alertBox = (judul, pesan, tipe = "error") =>
  bukaModal(
    judul,
    `<div class="pesan ${tipe}">${pesan}</div><button class="btn" onclick="tutupModal()">Mengerti</button>`,
  );
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") tutupModal();
});

/* ---------- Navbar ---------- */
function renderNavbar() {
  const nav = $("#navbar");
  if (!nav || !sesi) return;
  const menu = [
    ["dashboard.html", "Dashboard"],
    ["stok.html", "Katalog"],
    ["checkout.html", "Pemesanan"],
    ["tracking.html", "Tracking"],
  ];
  const jml = load("keranjang_v2", []).reduce((a, i) => a + i.qty, 0);
  nav.innerHTML = `<a class="logo" href="dashboard.html">Hanzz<span>Pustaka</span></a>
    <nav aria-label="Navigasi utama"><ul>${menu
      .map(
        ([h, t]) =>
          `<li><a href="${h}" ${h.startsWith(halaman) ? 'aria-current="page"' : ""}>${t}${h === "checkout.html" && jml ? ` <b class="badge">${jml}</b>` : ""}</a></li>`,
      )
      .join("")}</ul></nav>
    <button class="btn kecil garis" id="btnKeluar">Keluar</button>`;
  $("#btnKeluar").onclick = () => {
    localStorage.removeItem("sesi");
    location.href = "index.html";
  };
}
renderNavbar();

/* ---------- Sampul, status bayar, bukti transaksi ---------- */
const sampulHTML = (b) =>
  b.gambar
    ? `<img class="cover" src="img/${b.gambar}" alt="Sampul ${b.judul}" loading="lazy">`
    : `<span class="cover kosong" style="background:${b.warna}" aria-hidden="true">${b.judul[0]}</span>`;
const infoMetode = (nama) => dataMetodeBayar.find((m) => m.nama === nama);
const statusBayar = (p) => {
  const g = infoMetode(p.metode)?.grup;
  return g === "Transfer Bank"
    ? "Menunggu pembayaran"
    : g === "Bayar di Tempat"
      ? "Bayar di tempat"
      : "Lunas";
};
function qrSimulasi() {
  const n = 21;
  let seed = 7,
    c = "";
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let on;
      if ((x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)) {
        const fx = x > 13 ? x - 14 : x,
          fy = y > 13 ? y - 14 : y;
        on =
          fx === 0 ||
          fx === 6 ||
          fy === 0 ||
          fy === 6 ||
          (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else on = r() > 0.5;
      if (on) c += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  return `<svg viewBox="-1 -1 23 23" role="img" aria-label="QR simulasi">${c}</svg>`;
}
function bukaBukti(p) {
  const items = p.items || [],
    sub = items.reduce((a, i) => a + i.harga * i.qty, 0),
    ongkir = p.total - sub;
  const mt = infoMetode(p.metode),
    sb = statusBayar(p);
  const tgl = (d) =>
    new Date(d).toLocaleDateString("id-ID", { dateStyle: "long" });
  const b = bukaModal(
    "Bukti transaksi",
    `
    <div class="struk-atas"><svg class="centang" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>
      <p class="nominal">${rupiah(p.total)}</p><span class="lencana ${sb === "Lunas" ? "ok" : "tunggu"}">${sb}</span><small>${tgl(p.tanggalPesan || p.tanggalKirim)}</small></div>
    <dl class="struk-info"><dt>No. DO</dt><dd>${p.noDO}</dd><dt>Pemesan</dt><dd>${p.pemesan}</dd>
      <dt>Pembayaran</dt><dd><span class="merk mini" style="--w:${mt ? warnaMetode[mt.id] : "#14213d"}">${p.metode}</span>${p.noVA ? `<br><small>VA ${p.noVA}</small>` : p.akunBayar ? ` <small>${p.akunBayar}</small>` : ""}</dd>
      <dt>Pengiriman</dt><dd>${p.ekspedisi} · ${p.jenisPaket}</dd></dl>
    <ul class="struk-item">${items.map((i) => `<li><span>${i.judul} <small>×${i.qty}</small></span><b>${rupiah(i.harga * i.qty)}</b></li>`).join("")}</ul>
    <dl class="struk-total"><dt>Subtotal</dt><dd>${rupiah(sub)}</dd><dt>Ongkos kirim</dt><dd>${rupiah(ongkir)}</dd><dt>Total</dt><dd>${rupiah(p.total)}</dd></dl>
    <div class="struk-aksi"><button class="btn" onclick="window.print()">Cetak / simpan PDF</button> <a class="btn garis" href="tracking.html?do=${p.noDO}">Lacak pesanan</a></div>`,
  );
  b.classList.add("struk-box");
}

/* ---------- Keranjang ---------- */
function tambahKeKeranjang(kode, qty = 1) {
  const buku = katalog().find((b) => b.kode === kode);
  if (!buku || buku.stok < 1)
    return alertBox("Stok habis", "Buku ini sedang tidak tersedia.");
  const k = load("keranjang_v2", []);
  const ada = k.find((i) => i.kode === kode);
  if (ada) {
    if (ada.qty + qty > buku.stok)
      return alertBox(
        "Stok terbatas",
        `Stok ${buku.judul} hanya ${buku.stok}.`,
      );
    ada.qty += qty;
  } else k.push({ kode, qty });
  simpan("keranjang_v2", k);
  renderNavbar();
  return true;
}

/* =====================  LOGIN  ===================== */
function initLogin() {
  if (sesi) return (location.href = "dashboard.html");
  $("#formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim().toLowerCase(),
      pw = $("#password").value;
    const user = semuaUser().find(
      (u) => u.email === email && u.password === pw,
    );
    if (!email || !pw || !user)
      return alertBox(
        "Login gagal",
        "Email/password yang anda masukkan salah.",
      );
    simpan("sesi", { nama: user.nama, email: user.email });
    location.href = "dashboard.html";
  });
  $("#btnLupa").onclick = () => {
    const b = bukaModal(
      "Lupa password",
      `<form id="fLupa" novalidate><label for="emailLupa">Email terdaftar</label>
      <input id="emailLupa" type="email" placeholder="nama@mail.com"><p class="galat" id="gLupa"></p><button class="btn">Kirim tautan reset</button></form>`,
    );
    $("#fLupa", b).onsubmit = (e) => {
      e.preventDefault();
      const em = $("#emailLupa", b).value.trim().toLowerCase();
      if (!emailValid(em))
        return ($("#gLupa", b).textContent = "Format email belum benar.");
      if (!semuaUser().some((u) => u.email === em))
        return ($("#gLupa", b).textContent = "Email tidak ditemukan.");
      alertBox(
        "Tautan terkirim",
        `Tautan reset password dikirim ke ${em} (simulasi).`,
        "ok",
      );
    };
  };
  $("#btnDaftar").onclick = () => {
    const b = bukaModal(
      "Daftar akun baru",
      `<form id="fDaftar" novalidate>
      <label for="dNama">Nama lengkap</label><input id="dNama">
      <label for="dEmail">Email</label><input id="dEmail" type="email">
      <label for="dPw">Password (min. 6 karakter)</label><input id="dPw" type="password">
      <p class="galat" id="gDaftar"></p><button class="btn">Buat akun</button></form>`,
    );
    $("#fDaftar", b).onsubmit = (e) => {
      e.preventDefault();
      const nama = $("#dNama", b).value.trim(),
        em = $("#dEmail", b).value.trim().toLowerCase(),
        pw = $("#dPw", b).value;
      const g = $("#gDaftar", b);
      if (nama.length < 3) return (g.textContent = "Nama minimal 3 karakter.");
      if (!emailValid(em)) return (g.textContent = "Format email belum benar.");
      if (pw.length < 6)
        return (g.textContent = "Password minimal 6 karakter.");
      if (semuaUser().some((u) => u.email === em))
        return (g.textContent = "Email sudah terdaftar.");
      simpan("userBaru", [
        ...load("userBaru", []),
        { nama, email: em, password: pw },
      ]);
      alertBox(
        "Pendaftaran berhasil",
        "Silakan login dengan akun baru anda.",
        "ok",
      );
    };
  };
}

/* =====================  DASHBOARD  ===================== */
function sapaan() {
  const j = new Date().getHours();
  return j < 11
    ? "Selamat pagi"
    : j < 15
      ? "Selamat siang"
      : j < 18
        ? "Selamat sore"
        : "Selamat malam";
}
function tabel(kepala, baris) {
  return `<div class="gulir"><table><thead><tr>${kepala.map((k) => `<th>${k}</th>`).join("")}</tr></thead><tbody>${
    baris
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("") ||
    `<tr><td colspan="${kepala.length}">Belum ada data.</td></tr>`
  }</tbody></table></div>`;
}
function initDashboard() {
  const tampilJam = () => {
    const d = new Date();
    $("#sapaan").textContent = `${sapaan()}, ${sesi.nama}`;
    $("#jam").textContent =
      d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("id-ID");
  };
  tampilJam();
  setInterval(tampilJam, 1000);
  const buku = katalog(),
    pesanan = semuaPesanan();
  $("#statJudul").textContent = buku.length;
  $("#statStok").textContent = buku.reduce((a, b) => a + b.stok, 0);
  $("#statPesanan").textContent = pesanan.length;
  $("#btnLaporan").onclick = () => {
    const kat = [...new Set(buku.map((b) => b.kategori))];
    const omzet = pesanan.reduce((a, p) => a + p.total, 0);
    bukaModal(
      "Laporan pemesanan",
      `<p>Total pesanan <b>${pesanan.length}</b> · Omzet <b>${rupiah(omzet)}</b></p>` +
        tabel(
          ["Kategori", "Judul", "Total stok", "Nilai persediaan"],
          kat.map((k) => {
            const l = buku.filter((b) => b.kategori === k);
            return [
              k,
              l.length,
              l.reduce((a, b) => a + b.stok, 0),
              rupiah(l.reduce((a, b) => a + b.stok * b.harga, 0)),
            ];
          }),
        ) +
        tabel(
          ["Status", "Jumlah pesanan"],
          langkahPengiriman.map((s, i) => [
            s,
            pesanan.filter((p) => p.status === i).length,
          ]),
        ),
    );
  };
  $("#rak").innerHTML = buku
    .filter((b) => b.gambar)
    .map((b) => `<a href="stok.html" title="${b.judul}">${sampulHTML(b)}</a>`)
    .join("");
  $("#btnHistory").onclick = () => {
    const m = bukaModal(
      "History transaksi",
      tabel(
        ["No. DO", "Pemesan", "Tanggal", "Metode", "Total", "Bukti"],
        pesanan.map((p) => [
          p.noDO,
          p.pemesan,
          p.tanggalPesan || p.tanggalKirim,
          p.metode,
          rupiah(p.total),
          `<button class="btn kecil garis" data-do="${p.noDO}">Lihat</button>`,
        ]),
      ),
    );
    m.addEventListener("click", (e) => {
      const n = e.target.dataset.do;
      if (n) bukaBukti(semuaPesanan().find((x) => x.noDO === n));
    });
  };
}

/* =====================  STOK / KATALOG  ===================== */
function initStok() {
  let data = katalog();
  const tbody = $("#tbodyStok"),
    grid = $("#gridBuku");
  const chip = (b) =>
    `<span class="chip ${b.stok <= 5 ? "rendah" : "aman"}">${b.stok}${b.stok <= 5 ? " (menipis)" : ""}</span>`;
  const baris = (b) => {
    const tr = document.createElement("tr");
    tr.dataset.kode = b.kode;
    tr.innerHTML = `<td>${sampulHTML(b)}</td><td>${b.kode}</td><td><b>${b.judul}</b><br><small>${b.penulis}</small></td>
      <td>${b.kategori}</td><td>${rupiah(b.harga)}</td><td>${chip(b)}</td>
      <td class="aksi"><button class="btn kecil" data-aksi="pesan">Pesan</button> <button class="btn kecil garis" data-aksi="hapus">Hapus</button></td>`;
    return tr;
  };
  const kartu = (
    b,
  ) => `<article class="buku" data-kode="${b.kode}">${sampulHTML(b)}
    <div class="isi"><h3>${b.judul}</h3><p class="penulis">${b.penulis}</p><p class="harga">${rupiah(b.harga)} ${chip(b)}</p></div>
    <div class="aksi"><button class="btn kecil" data-aksi="pesan">Pesan</button> <button class="btn kecil garis" data-aksi="hapus">Hapus</button></div></article>`;
  function render() {
    const q = $("#cari").value.toLowerCase(),
      kat = $("#filterKat").value;
    const hasil = data.filter(
      (b) =>
        (kat === "semua" || b.kategori === kat) &&
        (b.judul + b.penulis + b.kode).toLowerCase().includes(q),
    );
    tbody.innerHTML = "";
    hasil.forEach((b) => tbody.appendChild(baris(b)));
    if (!hasil.length)
      tbody.innerHTML = `<tr><td colspan="7">Buku tidak ditemukan.</td></tr>`;
    grid.innerHTML =
      hasil.map(kartu).join("") || "<p>Buku tidak ditemukan.</p>";
    $("#ringkas").textContent =
      `${data.length} judul · ${data.reduce((a, b) => a + b.stok, 0)} eksemplar`;
  }
  const kats = [...new Set(dataKatalogBuku.map((b) => b.kategori))];
  $("#filterKat").innerHTML =
    `<option value="semua">Semua kategori</option>` +
    kats.map((k) => `<option>${k}</option>`).join("");
  $("#kategoriBaru").innerHTML = kats
    .map((k) => `<option>${k}</option>`)
    .join("");
  $("#sampulBaru").innerHTML =
    `<option value="">Tanpa gambar (otomatis)</option>` +
    dataKatalogBuku
      .map((b) => `<option value="${b.gambar}">${b.judul}</option>`)
      .join("");
  $("#cari").oninput = render;
  $("#filterKat").onchange = render;

  document.querySelectorAll("[data-tampil]").forEach(
    (t) =>
      (t.onclick = () => {
        const kartuMode = t.dataset.tampil === "kartu";
        grid.hidden = !kartuMode;
        $("#bungkusTabel").hidden = kartuMode;
        document
          .querySelectorAll("[data-tampil]")
          .forEach((x) => x.setAttribute("aria-pressed", x === t));
      }),
  );

  const aksiBuku = (e) => {
    const aksi = e.target.dataset.aksi;
    if (!aksi) return;
    const kode = e.target.closest("[data-kode]").dataset.kode;
    if (aksi === "pesan" && tambahKeKeranjang(kode) === true)
      bukaModal(
        "Ditambahkan",
        `<p class="pesan ok">Buku masuk keranjang.</p><a class="btn" href="checkout.html">Ke pemesanan</a> <button class="btn garis" onclick="tutupModal()">Lanjut belanja</button>`,
      );
    if (aksi === "hapus") {
      const b = data.find((x) => x.kode === kode);
      const m = bukaModal(
        "Hapus buku?",
        `<p>${b.judul} akan dihapus dari katalog.</p><button class="btn" id="ya">Hapus</button> <button class="btn garis" onclick="tutupModal()">Batal</button>`,
      );
      $("#ya", m).onclick = () => {
        data = data.filter((x) => x.kode !== kode);
        simpan("katalog_v2", data);
        tutupModal();
        render();
      };
    }
  };
  tbody.addEventListener("click", aksiBuku);
  grid.addEventListener("click", aksiBuku);

  $("#formTambah").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target,
      g = $("#galatTambah");
    const judul = f.judul.value.trim(),
      penulis = f.penulis.value.trim(),
      harga = +f.harga.value,
      stok = +f.stok.value;
    if (!judul || !penulis)
      return (g.textContent = "Judul dan penulis wajib diisi.");
    if (!(harga > 0)) return (g.textContent = "Harga harus lebih dari 0.");
    if (!Number.isInteger(stok) || stok < 0)
      return (g.textContent = "Stok harus bilangan bulat ≥ 0.");
    g.textContent = "";
    const warna = `hsl(${Math.floor(Math.random() * 360)} 45% 38%)`;
    let n = data.length + 1,
      kode;
    do {
      kode = "BK-" + String(n++).padStart(3, "0");
    } while (data.some((b) => b.kode === kode));
    data.push({
      kode,
      judul,
      penulis,
      kategori: f.kategori.value,
      harga,
      stok,
      gambar: f.gambar.value,
      warna,
    });
    simpan("katalog_v2", data);
    render();
    document
      .querySelectorAll(`[data-kode="${kode}"]`)
      .forEach((el) => el.classList.add("baru"));
    f.reset();
  });
  $("#btnReset").onclick = () => {
    localStorage.removeItem("katalog_v2");
    data = katalog();
    render();
  };
  render();
}

/* =====================  CHECKOUT  ===================== */
function initCheckout() {
  const buku = katalog();
  $("#pilihBuku").innerHTML = buku
    .map(
      (b) =>
        `<option value="${b.kode}">${b.judul} — ${rupiah(b.harga)} (stok ${b.stok})</option>`,
    )
    .join("");
  $("#ekspedisi").innerHTML = Object.entries(dataEkspedisi)
    .map(([k, v]) => `<option value="${k}">${k} (${rupiah(v)})</option>`)
    .join("");
  $("#nama").value = sesi.nama;
  $("#emailPemesan").value = sesi.email;
  const grupList = [...new Set(dataMetodeBayar.map((m) => m.grup))];
  $("#metodeBayar").innerHTML = grupList
    .map(
      (g) =>
        `<p class="sub">${g}</p><div class="tiles lebar">${dataMetodeBayar
          .filter((m) => m.grup === g)
          .map(
            (m) =>
              `<label class="tile"><input type="radio" name="metode" value="${m.id}"><span class="merk" style="--w:${warnaMetode[m.id]}"><img class="logo" src="assets/pay/${m.logo}" alt=""><span class="teks"><strong>${m.nama}</strong><small>${m.ket}</small></span></span></label>`,
          )
          .join("")}</div>`,
    )
    .join("");
  $("#metodeBayar").addEventListener("change", (e) => {
    const m = dataMetodeBayar.find((x) => x.id === e.target.value),
      p = $("#panelBayar");
    p.hidden = !m;
    if (!m) return;
    e.target
      .closest(".tiles")
      .after(p); /* panel muncul tepat di bawah grup yang dipilih */
    if (m.grup === "E-Wallet")
      p.innerHTML = `<p>Pembayaran lewat <b>${m.nama}</b>. Pastikan saldo anda cukup.</p><label for="akunBayar">Nomor ${m.nama} anda</label><input id="akunBayar" type="tel" placeholder="08xxxxxxxxxx">`;
    else if (m.grup === "QRIS")
      p.innerHTML = `<div class="qris">${qrSimulasi()}<p>Scan dari e-wallet atau m-banking apa pun.<br><small>QR ini hanya simulasi.</small></p></div>`;
    else if (m.grup === "Transfer Bank")
      p.innerHTML = `<p>Nomor Virtual Account ${m.nama} (awalan <b>${m.va}</b>) dibuat otomatis setelah pesanan dibuat.</p>`;
    else
      p.innerHTML = `<p>Siapkan uang tunai sesuai total saat kurir tiba.</p>`;
  });

  function render() {
    const k = load("keranjang_v2", []);
    const tb = $("#tbodyKeranjang");
    tb.innerHTML = "";
    let sub = 0;
    k.forEach((i) => {
      const b = buku.find((x) => x.kode === i.kode);
      if (!b) return;
      sub += b.harga * i.qty;
      const tr = document.createElement("tr");
      tr.dataset.kode = i.kode;
      tr.innerHTML = `<td class="item">${sampulHTML(b)}<span><b>${b.judul}</b><br><small>${rupiah(b.harga)}</small></span></td>
        <td><input class="qty" type="number" min="1" max="${b.stok}" value="${i.qty}" aria-label="Jumlah ${b.judul}"></td>
        <td>${rupiah(b.harga * i.qty)}</td><td><button type="button" class="btn kecil garis">Hapus</button></td>`;
      tb.appendChild(tr);
    });
    if (!tb.children.length)
      tb.innerHTML = `<tr><td colspan="4">Keranjang kosong. Pilih buku di bawah atau dari halaman katalog.</td></tr>`;
    const ongkir = k.length
      ? dataEkspedisi[$("#ekspedisi").value] +
        ($("#jenisPaket").value === "Express" ? 10000 : 0)
      : 0;
    $("#subtotal").textContent = rupiah(sub);
    $("#ongkir").textContent = rupiah(ongkir);
    $("#total").textContent = rupiah(sub + ongkir);
    renderNavbar();
    return sub + ongkir;
  }
  $("#formTambahBuku").onsubmit = (e) => {
    e.preventDefault();
    if (
      tambahKeKeranjang($("#pilihBuku").value, +$("#jumlahBuku").value || 1) ===
      true
    )
      render();
  };
  $("#tbodyKeranjang").addEventListener("change", (e) => {
    if (!e.target.classList.contains("qty")) return;
    const kode = e.target.closest("tr").dataset.kode,
      b = buku.find((x) => x.kode === kode);
    let q = Math.max(1, parseInt(e.target.value) || 1);
    if (q > b.stok) {
      alertBox("Stok terbatas", `Stok ${b.judul} hanya ${b.stok}.`);
      q = b.stok;
    }
    simpan(
      "keranjang_v2",
      load("keranjang_v2", []).map((i) =>
        i.kode === kode ? { ...i, qty: q } : i,
      ),
    );
    render();
  });
  $("#tbodyKeranjang").addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    const kode = e.target.closest("tr").dataset.kode;
    simpan(
      "keranjang_v2",
      load("keranjang_v2", []).filter((i) => i.kode !== kode),
    );
    render();
  });
  ["ekspedisi", "jenisPaket"].forEach((id) => ($("#" + id).onchange = render));

  $("#formPesan").addEventListener("submit", (e) => {
    e.preventDefault();
    const k = load("keranjang_v2", []),
      f = e.target,
      galat = [];
    const mt = dataMetodeBayar.find((m) => m.id === f.metode.value),
      wallet = mt?.grup === "E-Wallet" ? mt : null,
      metode = mt?.nama || "";
    if (!k.length) galat.push("Keranjang masih kosong.");
    if (f.nama.value.trim().length < 3)
      galat.push("Nama pemesan minimal 3 karakter.");
    if (!emailValid(f.emailPemesan.value.trim()))
      galat.push("Format email belum benar.");
    if (!/^(08|\+628)\d{8,12}$/.test(f.hp.value.trim()))
      galat.push("No. HP harus diawali 08 atau +628 (10–14 digit).");
    if (f.alamat.value.trim().length < 10)
      galat.push("Alamat minimal 10 karakter.");
    if (!metode) galat.push("Pilih metode pembayaran.");
    if (
      wallet &&
      !/^(08|\+628)\d{8,12}$/.test(($("#akunBayar")?.value || "").trim())
    )
      galat.push(`Nomor ${wallet.nama} anda belum benar (awali 08 atau +628).`);
    if (galat.length)
      return alertBox(
        "Data belum lengkap",
        "<ul>" + galat.map((g) => `<li>${g}</li>`).join("") + "</ul>",
      );
    const total = render();
    const noDO =
      "DO-2026-" + String(semuaPesanan().length + 1).padStart(3, "0");
    const hari = (d) =>
      new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
    const pesanan = {
      noDO,
      pemesan: f.nama.value.trim(),
      status: 0,
      ekspedisi: f.ekspedisi.value,
      tanggalPesan: hari(0),
      tanggalKirim: hari(1),
      jenisPaket: f.jenisPaket.value,
      total,
      metode,
      akunBayar: wallet ? $("#akunBayar").value.trim() : "",
      noVA: mt.va
        ? mt.va + String(Math.floor(Math.random() * 1e10)).padStart(10, "0")
        : "",
      items: k.map((i) => {
        const b = buku.find((x) => x.kode === i.kode);
        return { judul: b.judul, qty: i.qty, harga: b.harga };
      }),
    };
    simpan("pesanan_v2", [...load("pesanan_v2", []), pesanan]);
    const kat = katalog();
    k.forEach((i) => {
      const b = kat.find((x) => x.kode === i.kode);
      if (b) b.stok -= i.qty;
    });
    simpan("katalog_v2", kat);
    simpan("keranjang_v2", []);
    render();
    if (mt.grup === "E-Wallet" || mt.grup === "QRIS") {
      bukaModal(
        "Memproses pembayaran",
        `<div class="proses"><div class="spin" style="--w:${warnaMetode[mt.id]}"></div><p>Menunggu konfirmasi <b>${mt.nama}</b>…</p></div>`,
      );
      setTimeout(() => bukaBukti(pesanan), 1700);
    } else bukaBukti(pesanan);
  });
  render();
}

/* =====================  TRACKING  ===================== */
function initTracking() {
  const hasil = $("#hasil");
  const cari = (no) => {
    if (!no.trim())
      return alertBox(
        "Input kosong",
        "Masukkan nomor Delivery Order terlebih dahulu.",
      );
    const p = semuaPesanan().find(
      (x) => x.noDO.toLowerCase() === no.trim().toLowerCase(),
    );
    if (!p) {
      hasil.innerHTML = "";
      return alertBox(
        "Tidak ditemukan",
        `Nomor ${no} tidak terdaftar. Coba DO-2026-001.`,
      );
    }
    const persen = (p.status / (langkahPengiriman.length - 1)) * 100;
    hasil.innerHTML = `<article class="kartu"><h2>${p.noDO}</h2><p class="status s${p.status}">${langkahPengiriman[p.status]}</p>
      <div class="bar" role="progressbar" aria-valuenow="${persen}" aria-valuemin="0" aria-valuemax="100"><span style="width:${persen}%"></span></div>
      <ol class="langkah">${langkahPengiriman.map((s, i) => `<li class="${i < p.status ? "done" : i === p.status ? "aktif" : ""}">${s}</li>`).join("")}</ol>
      <dl><dt>Nama pemesan</dt><dd>${p.pemesan}</dd><dt>Ekspedisi</dt><dd>${p.ekspedisi}</dd>
      <dt>Tanggal kirim</dt><dd>${new Date(p.tanggalKirim).toLocaleDateString("id-ID", { dateStyle: "long" })}</dd>
      <dt>Jenis paket</dt><dd>${p.jenisPaket}</dd><dt>Total pembayaran</dt><dd>${rupiah(p.total)}</dd></dl><button class="btn kecil garis" id="btnBukti" type="button">Lihat bukti transaksi</button></article>`;
    $("#btnBukti").onclick = () => bukaBukti(p);
  };
  $("#formCari").onsubmit = (e) => {
    e.preventDefault();
    cari($("#noDO").value);
  };
  const q = new URLSearchParams(location.search).get("do");
  if (q) {
    $("#noDO").value = q;
    cari(q);
  }
}

({
  login: initLogin,
  dashboard: initDashboard,
  stok: initStok,
  checkout: initCheckout,
  tracking: initTracking,
})[halaman]?.();
