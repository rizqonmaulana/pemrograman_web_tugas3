# Bukti Implementasi Requirement - Tugas 3 Vue.js

**Proyek:** Sistem Informasi Bahan Ajar UT  
**Framework:** Vue.js 2.7.14  
**Tanggal:** 23 November 2025

---

## 1.1. Arsitektur dan Struktur Proyek Vue.js

### Struktur Folder

```
tugas3-vue-ut/
├── index.html              # Dashboard utama
├── stok.html              # Halaman manajemen stok
├── tracking.html          # Halaman tracking pengiriman
├── css/
│   ├── style.css          # Style global
│   ├── stok.css           # Style khusus stok
│   └── tracking.css       # Style khusus tracking
└── js/
    ├── dataBahanAjar.js   # Data source
    ├── stok-app.js        # Vue app untuk stok
    └── tracking-app.js    # Vue app untuk tracking
```

### Struktur Penamaan File

- **HTML Files:** Nama deskriptif (stok.html, tracking.html)
- **JavaScript Files:** Format `[nama]-app.js` untuk Vue apps
- **CSS Files:** Nama sesuai dengan halaman terkait

### Struktur Komponen Vue

**File:** `js/stok-app.js`

**Komponen Global yang Didefinisikan:**

```javascript
// Line 2-46: Notification Message Component
Vue.component("notification-message", {
  template: "#notification-template",
  props: {
    message: String,
    type: { type: String, default: "info" }
  },
  computed: {
    notificationClass: function() { ... },
    notificationStyle: function() { ... },
    iconClass: function() { ... },
    iconStyle: function() { ... }
  }
});

// Line 49-68: Stock Card Component
Vue.component("stock-card", {
  template: "#stock-card-template",
  props: { item: Object },
  methods: {
    getStockClass: function(qty, safety) { ... },
    formatRupiah: function(amount) { ... }
  }
});

// Line 71-85: Form Input Component
Vue.component("form-input", {
  template: "#form-input-template",
  props: {
    label: String,
    value: [String, Number],
    type: { type: String, default: "text" },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    error: String,
    options: Array
  }
});
```

### Pemakaian Vue Component

**File:** `stok.html` - Line 14-79

```html
<!-- X-Template untuk Component -->
<script type="text/x-template" id="notification-template">
  <div v-if="message" :class="notificationClass" :style="notificationStyle">
      <i :class="iconClass" :style="iconStyle"></i>
      <span v-text="message"></span>
  </div>
</script>

<script type="text/x-template" id="stock-card-template">
  <div class="stock-item" @click="$emit('click', item)">
      <!-- Component content -->
  </div>
</script>
```

**File:** `js/stok-app.js` - Line 469-478

```javascript
// Penggunaan Component dalam Template
template: `
  <main>
    <!-- Using Notification Component -->
    <notification-message :message="watcherMessage" type="info" />
    <notification-message :message="filterMessage" type="warning" />
    
    <!-- Using Stock Card Component -->
    <stock-card 
      v-for="item in filteredStok" 
      :key="item.kode"
      :item="item"
      @click="showDetailModal"
    />
    
    <!-- Using Form Input Component -->
    <form-input 
      label="Kode Bahan Ajar"
      v-model="newItem.kode"
      :required="true"
      :error="validationErrors.kode"
    />
  </main>
`;
```

---

## 1.2. Data Binding & Directive, Array, Filter untuk List Rendering

### Mustaches (Text Interpolation)

**File:** `js/stok-app.js` - Line 295

```javascript
<span class="detail-value">{{ selectedItem.kode }}</span>
```

### v-text

**File:** `js/stok-app.js` - Line 522

```javascript
<strong v-text="searchResultCount"></strong>
```

### v-html

**File:** `js/stok-app.js` - Line 635

```javascript
<span class="detail-value" v-html="selectedItem.catatanHTML"></span>
```

### v-bind

**File:** `js/stok-app.js` - Line 539

```javascript
<stock-card
  :key="item.kode"
  :item="item"
  @click="showDetailModal"
/>
```

### v-model (Two-way Binding)

**File:** `js/stok-app.js` - Line 492

```javascript
<input
  type="text"
  v-model="searchQuery"
  placeholder="Cari bahan ajar berdasarkan kode, judul, lokasi rak.."
  class="search-input"
>
```

### v-for (Array Iteration)

**File:** `js/stok-app.js` - Line 537-542

```javascript
<div class="stock-list" v-if="filteredStok.length > 0">
  <stock-card
    v-for="item in filteredStok"
    :key="item.kode"
    :item="item"
    @click="showDetailModal"
  />
</div>
```

### Filter/Computed Property

**File:** `js/stok-app.js` - Line 116-165

```javascript
computed: {
  filteredStok: function() {
    var filtered = this.stokData;

    // Filter by search query
    if (this.searchQuery) {
      var query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(function(item) {
        return item.judul.toLowerCase().includes(query) ||
               item.kode.toLowerCase().includes(query) ||
               item.lokasiRak.toLowerCase().includes(query);
      });
    }

    // Filter by UPBJJ
    if (this.selectedUpbjj) {
      var selectedUpbjj = this.selectedUpbjj;
      filtered = filtered.filter(function(item) {
        return item.upbjj === selectedUpbjj;
      });
    }

    // Sorting
    if (this.sortKey) {
      var sortKey = this.sortKey;
      var sortOrder = this.sortOrder;
      filtered = filtered.slice().sort(function(a, b) {
        var valueA = a[sortKey];
        var valueB = b[sortKey];
        if (valueA === valueB) return 0;
        var isAscending = sortOrder === "asc";
        return isAscending ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
      });
    }

    this.searchResultCount = filtered.length;
    return filtered;
  }
}
```

---

## 1.3. Penggunaan Conditional

### v-if

**File:** `js/stok-app.js` - Line 537

```javascript
<div class="stock-list" v-if="filteredStok.length > 0">
  <stock-card v-for="item in filteredStok" :key="item.kode" :item="item" />
</div>
```

### v-else

**File:** `js/stok-app.js` - Line 545-547

```javascript
<div v-else style="text-align: center; color: #999; padding: 40px;">
  <p>Tidak ada data ditemukan</p>
</div>
```

### v-if dengan Template

**File:** `js/stok-app.js` - Line 572-578

```javascript
<template v-if="showInput">
  <input class="detail-value" v-model="selectedItem.kode" />
</template>
<template v-else>
  <span class="detail-value">{{ selectedItem.kode }}</span>
</template>
```

### v-show (Implicit)

**File:** `js/tracking-app.js` - Line 392-395

```javascript
<div class="placeholder-box" v-if="!showResult">
  <i class="fa-solid fa-search"></i>
  <p>Masukkan nomor delivery order untuk melihat informasi pengiriman</p>
</div>
```

### Conditional dalam Computed

**File:** `js/stok-app.js` - Line 13-15

```javascript
notificationClass: function() {
  return this.type === "info" ? "watcher-notification" : "filter-info";
}
```

---

## 1.4. Property (Computed & Methods)

### Computed Properties

**File:** `js/stok-app.js` - Line 116-165

```javascript
computed: {
  filteredStok: function() {
    var filtered = this.stokData;
    // Complex filtering logic
    if (this.searchQuery) { ... }
    if (this.selectedUpbjj) { ... }
    if (this.selectedKategori) { ... }
    if (this.filterQtyBelowSafety) { ... }
    if (this.filterQtyZero) { ... }
    if (this.sortKey) { ... }
    this.searchResultCount = filtered.length;
    return filtered;
  },

  availableKategori: function() {
    if (!this.selectedUpbjj) {
      return Array.from(new Set(this.stokData.map(function(item) {
        return item.kategori;
      })));
    }
    var selectedUpbjj = this.selectedUpbjj;
    return Array.from(new Set(
      this.stokData
        .filter(function(item) { return item.upbjj === selectedUpbjj; })
        .map(function(item) { return item.kategori; })
    ));
  }
}
```

### Methods

**File:** `js/stok-app.js` - Line 187-348

```javascript
methods: {
  getStockClass: function(qty, safety) {
    if (qty === 0) return "stock-low";
    if (qty < safety) return "stock-medium";
    return "stock-high";
  },

  showDetailModal: function(item) {
    this.selectedItem = item;
    this.showModal = true;
  },

  formatRupiah: function(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  },

  validateNewItem: function() {
    this.clearValidationErrors();
    var isValid = true;

    if (!this.newItem.kode || this.newItem.kode.trim() === "") {
      this.validationErrors.kode = "Kode bahan ajar wajib diisi";
      isValid = false;
    } else if (this.newItem.kode.length < 4) {
      this.validationErrors.kode = "Kode minimal 4 karakter";
      isValid = false;
    }

    // ... more validation logic
    return isValid;
  }
}
```

---

## 1.5. Watchers (Minimal 2)

### Watcher 1: Monitor selectedUpbjj

**File:** `js/stok-app.js` - Line 368-382

```javascript
watch: {
  selectedUpbjj: function(newVal, oldVal) {
    var vm = this;
    if (newVal !== oldVal && oldVal !== "") {
      this.selectedKategori = "";
      this.watcherMessage = 'UPBJJ berubah dari "' + oldVal + '" ke "' + newVal + '". Kategori filter direset.';
      this.filterMessage = "Filter aktif: UPBJJ = " + newVal;
      setTimeout(function() {
        vm.watcherMessage = "";
      }, 3000);
    } else if (newVal) {
      this.filterMessage = "Filter aktif: UPBJJ = " + newVal;
    } else {
      this.filterMessage = "";
    }
  }
}
```

### Watcher 2: Monitor selectedKategori

**File:** `js/stok-app.js` - Line 384-394

```javascript
selectedKategori: function(newVal, oldVal) {
  var vm = this;
  if (newVal && this.sortKey) {
    this.sortKey = "";
    this.sortOrder = "asc";
  }
  if (newVal && oldVal) {
    this.watcherMessage = 'Kategori berubah dari "' + oldVal + '" ke "' + newVal + '"';
    setTimeout(function() {
      vm.watcherMessage = "";
    }, 3000);
  }
}
```

### Watcher 3: Monitor filterQtyBelowSafety

**File:** `js/stok-app.js` - Line 396-405

```javascript
filterQtyBelowSafety: function(newVal) {
  var vm = this;
  if (newVal && this.filterQtyZero) {
    this.filterQtyZero = false;
    this.watcherMessage = "Filter 'Stok Habis' dinonaktifkan karena 'Stok di bawah Safety' aktif";
    setTimeout(function() {
      vm.watcherMessage = "";
    }, 3000);
  }
}
```

### Watcher 4: Monitor searchQuery

**File:** `js/stok-app.js` - Line 418-426

```javascript
searchQuery: function(newVal, oldVal) {
  var vm = this;
  if (newVal && newVal !== oldVal) {
    this.watcherMessage = 'Pencarian: "' + newVal + '" - Menemukan ' + this.searchResultCount + ' hasil';
    setTimeout(function() {
      vm.watcherMessage = "";
    }, 3000);
  }
}
```

### Watcher 5: Monitor newTracking.paket (tracking-app.js)

**File:** `js/tracking-app.js` - Line 321-335

```javascript
"newTracking.paket": function(newValue) {
  var vm = this;
  if (newValue && newValue !== "") {
    this.selectedPaket = paketList.find(function(p) {
      return p.kode === newValue;
    }) || {};
    this.newTracking.total = this.selectedPaket.harga || 0;
    this.watcherMessage = 'Paket "' + this.selectedPaket.nama + '" dipilih. Total: Rp ' + this.newTracking.total.toLocaleString("id-ID");
    setTimeout(function() {
      vm.watcherMessage = "";
    }, 3000);
  } else if (newValue === "") {
    this.newTracking.total = 0;
    this.selectedPaket = {};
  }
}
```

**Total Watchers dalam Proyek: 15 watchers** (Requirement minimal: 2)

---

## 1.6. Form Input, Validasi & Event Handler

### Form Input dengan v-model

**File:** `js/stok-app.js` - Line 492-495

```javascript
<input
  type="text"
  v-model="searchQuery"
  placeholder="Cari bahan ajar berdasarkan kode, judul, lokasi rak.."
  class="search-input"
>
```

### Form Select dengan v-model

**File:** `js/stok-app.js` - Line 498-504

```javascript
<select v-model="selectedUpbjj">
  <option value="">Semua UPBJJ</option>
  <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">
    {{ upbjj }}
  </option>
</select>
```

### Form Checkbox

**File:** `js/stok-app.js` - Line 513-516

```javascript
<label>
  <input type="checkbox" v-model="filterQtyBelowSafety">
  Stok di bawah Safety
</label>
```

### Validasi Input

**File:** `js/stok-app.js` - Line 252-286

```javascript
validateNewItem: function() {
  this.clearValidationErrors();
  var isValid = true;

  // Validasi kode
  if (!this.newItem.kode || this.newItem.kode.trim() === "") {
    this.validationErrors.kode = "Kode bahan ajar wajib diisi";
    isValid = false;
  } else if (this.newItem.kode.length < 4) {
    this.validationErrors.kode = "Kode minimal 4 karakter";
    isValid = false;
  }

  // Validasi judul
  if (!this.newItem.judul || this.newItem.judul.trim() === "") {
    this.validationErrors.judul = "Judul wajib diisi";
    isValid = false;
  } else if (this.newItem.judul.length < 5) {
    this.validationErrors.judul = "Judul minimal 5 karakter";
    isValid = false;
  }

  // Validasi harga
  if (this.newItem.harga < 0) {
    this.validationErrors.harga = "Harga tidak boleh negatif";
    isValid = false;
  } else if (this.newItem.harga === 0) {
    this.validationErrors.harga = "Harga harus lebih dari 0";
    isValid = false;
  }

  return isValid;
}
```

### Event Handler - Mouse (Click)

**File:** `js/stok-app.js` - Line 475-478

```javascript
<button class="back-button" @click="backToDashboard">
  <i class="fa-solid fa-chevron-left"></i>
</button>
```

**File:** `js/stok-app.js` - Line 527-532

```javascript
<button @click="openAddModal" class="add-button">
  <i class="fa-solid fa-plus"></i> Tambah Bahan Ajar
</button>
```

**File:** `js/stok-app.js` - Line 539-542

```javascript
<stock-card
  v-for="item in filteredStok"
  :key="item.kode"
  :item="item"
  @click="showDetailModal"
/>
```

### Event Handler - Keyboard (Enter Key)

**File:** `js/tracking-app.js` - Line 397-403

```javascript
<input
  type="text"
  v-model="searchQuery"
  class="search-input"
  placeholder="Nomor Delivery Order"
  @keyup.enter="searchTracking"
/>
```

### Event Handler - Stop Propagation

**File:** `js/stok-app.js` - Line 556-558

```javascript
<div class="modal-stock-content" v-if="selectedItem" @click.stop>
  <!-- Modal content -->
</div>
```

### Error Display dalam Form

**File:** `js/stok-app.js` - Line 660-666

```javascript
<form-input
  label="Kode Bahan Ajar"
  v-model="newItem.kode"
  placeholder="Masukkan kode"
  :required="true"
  :error="validationErrors.kode"
/>
```

---

## Ringkasan Implementasi

| Requirement                  | Status | File Utama                   | Jumlah Implementasi     |
| ---------------------------- | ------ | ---------------------------- | ----------------------- |
| 1.1 Arsitektur & Struktur    | ✅     | Semua file                   | Struktur lengkap        |
| 1.2 Data Binding & Directive | ✅     | stok-app.js, tracking-app.js | 50+ penggunaan          |
| 1.3 Conditional              | ✅     | stok-app.js                  | 15+ kondisional         |
| 1.4 Computed & Methods       | ✅     | stok-app.js, tracking-app.js | 6 computed, 18+ methods |
| 1.5 Watchers                 | ✅     | stok-app.js, tracking-app.js | 15 watchers             |
| 1.6 Form & Event Handler     | ✅     | stok-app.js, tracking-app.js | 20+ inputs, 20+ events  |

