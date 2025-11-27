Vue.component("notification-message", {
  template: "#notification-template",
  props: {
    message: String,
    type: {
      type: String,
      default: "info", // info, warning, success, error
    },
  },
  computed: {
    notificationClass: function () {
      return this.type === "info" ? "watcher-notification" : "filter-info";
    },
    notificationStyle: function () {
      var colors = {
        info: { bg: "#e3f2fd", border: "#2196F3" },
        warning: { bg: "#fff3cd", border: "#ffc107" },
        success: { bg: "#d4edda", border: "#28a745" },
        error: { bg: "#f8d7da", border: "#dc3545" },
      };
      var color = colors[this.type] || colors.info;
      return "background: " + color.bg + "; border-left: 4px solid " + color.border + "; padding: 12px; margin-bottom: 15px; border-radius: 4px;";
    },
    iconClass: function () {
      var icons = {
        info: "fa-solid fa-info-circle",
        warning: "fa-solid fa-filter",
        success: "fa-solid fa-check-circle",
        error: "fa-solid fa-exclamation-circle",
      };
      return icons[this.type] || icons.info;
    },
    iconStyle: function () {
      var colors = {
        info: "#2196F3",
        warning: "#ffc107",
        success: "#28a745",
        error: "#dc3545",
      };
      return "color: " + (colors[this.type] || colors.info) + "; margin-right: 8px;";
    },
  },
});

Vue.component("stock-card", {
  template: "#stock-card-template",
  props: {
    item: Object,
  },
  methods: {
    getStockClass: function (qty, safety) {
      if (qty === 0) return "stock-low";
      if (qty < safety) return "stock-medium";
      return "stock-high";
    },
    formatRupiah: function (amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },
  },
});

Vue.component("form-input", {
  template: "#form-input-template",
  props: {
    label: String,
    value: [String, Number],
    type: {
      type: String,
      default: "text",
    },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    error: String,
    options: Array,
  },
});

new Vue({
  el: "#app",
  data: function () {
    return {
      stokData: [],
      searchQuery: "",
      selectedItem: null,
      showModal: false,
      showAddModal: false,
      showInput: false,
      selectedUpbjj: "",
      selectedKategori: "",
      filterQtyBelowSafety: false,
      filterQtyZero: false,
      upbjjList: [],
      kategoriList: [],
      sortKey: "",
      sortOrder: "asc",
      newItem: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      },
      validationErrors: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        harga: "",
        qty: "",
        safety: "",
      },
      watcherMessage: "",
      filterMessage: "",
      searchResultCount: 0,
    };
  },
  computed: {
    filteredStok: function () {
      var filtered = this.stokData;

      if (this.searchQuery) {
        var query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(function (item) {
          return item.judul.toLowerCase().includes(query) || item.kode.toLowerCase().includes(query) || item.lokasiRak.toLowerCase().includes(query);
        });
      }

      if (this.selectedUpbjj) {
        var selectedUpbjj = this.selectedUpbjj;
        filtered = filtered.filter(function (item) {
          return item.upbjj === selectedUpbjj;
        });
      }

      if (this.selectedKategori) {
        var selectedKategori = this.selectedKategori;
        filtered = filtered.filter(function (item) {
          return item.kategori === selectedKategori;
        });
      }

      if (this.filterQtyBelowSafety) {
        filtered = filtered.filter(function (item) {
          return item.qty < item.safety;
        });
      }

      if (this.filterQtyZero) {
        filtered = filtered.filter(function (item) {
          return item.qty === 0;
        });
      }

      if (this.sortKey) {
        var sortKey = this.sortKey;
        var sortOrder = this.sortOrder;
        filtered = filtered.slice().sort(function (a, b) {
          var valueA = a[sortKey];
          var valueB = b[sortKey];

          if (valueA === valueB) return 0;

          var isAscending = sortOrder === "asc";
          return isAscending ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1;
        });
      }

      this.searchResultCount = filtered.length;
      return filtered;
    },

    availableKategori: function () {
      if (!this.selectedUpbjj) {
        return Array.from(
          new Set(
            this.stokData.map(function (item) {
              return item.kategori;
            })
          )
        );
      }
      var selectedUpbjj = this.selectedUpbjj;
      return Array.from(
        new Set(
          this.stokData
            .filter(function (item) {
              return item.upbjj === selectedUpbjj;
            })
            .map(function (item) {
              return item.kategori;
            })
        )
      );
    },
  },
  methods: {
    getStockClass: function (qty, safety) {
      if (qty === 0) return "stock-low";
      if (qty < safety) return "stock-medium";
      return "stock-high";
    },
    showDetailModal: function (item) {
      this.selectedItem = item;
      this.showModal = true;
    },
    closeModal: function () {
      this.showModal = false;
      this.selectedItem = null;
    },
    formatRupiah: function (amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },
    backToDashboard: function () {
      window.location.href = "index.html";
    },
    editItem: function () {
      if (this.selectedItem) {
        this.showInput = !this.showInput;
      }
    },
    resetFilters: function () {
      this.selectedUpbjj = "";
      this.selectedKategori = "";
      this.filterQtyBelowSafety = false;
      this.filterQtyZero = false;
    },
    setSort: function (key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },
    openAddModal: function () {
      this.showAddModal = true;
    },
    closeAddModal: function () {
      this.showAddModal = false;
      this.resetNewItem();
    },
    resetNewItem: function () {
      this.newItem = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
      this.clearValidationErrors();
    },
    clearValidationErrors: function () {
      this.validationErrors = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        harga: "",
        qty: "",
        safety: "",
      };
    },
    validateNewItem: function () {
      this.clearValidationErrors();
      var isValid = true;

      if (!this.newItem.kode || this.newItem.kode.trim() === "") {
        this.validationErrors.kode = "Kode bahan ajar wajib diisi";
        isValid = false;
      } else if (this.newItem.kode.length < 4) {
        this.validationErrors.kode = "Kode minimal 4 karakter";
        isValid = false;
      }

      if (!this.newItem.judul || this.newItem.judul.trim() === "") {
        this.validationErrors.judul = "Judul wajib diisi";
        isValid = false;
      } else if (this.newItem.judul.length < 5) {
        this.validationErrors.judul = "Judul minimal 5 karakter";
        isValid = false;
      }

      if (!this.newItem.kategori) {
        this.validationErrors.kategori = "Kategori wajib dipilih";
        isValid = false;
      }

      if (!this.newItem.upbjj) {
        this.validationErrors.upbjj = "UPBJJ wajib dipilih";
        isValid = false;
      }

      if (this.newItem.harga < 0) {
        this.validationErrors.harga = "Harga tidak boleh negatif";
        isValid = false;
      } else if (this.newItem.harga === 0) {
        this.validationErrors.harga = "Harga harus lebih dari 0";
        isValid = false;
      }

      if (this.newItem.qty < 0) {
        this.validationErrors.qty = "Qty tidak boleh negatif";
        isValid = false;
      }

      if (this.newItem.safety < 0) {
        this.validationErrors.safety = "Safety stock tidak boleh negatif";
        isValid = false;
      }

      return isValid;
    },
    addNewItem: function () {
      var vm = this;
      if (!this.validateNewItem()) {
        return;
      }

      var exists = this.stokData.some(function (item) {
        return item.kode === vm.newItem.kode;
      });

      if (exists) {
        this.validationErrors.kode = "Kode bahan ajar sudah ada!";
        return;
      }

      this.stokData.push(Object.assign({}, this.newItem));

      this.closeAddModal();
      alert("Data berhasil ditambahkan!");
    },
  },
  mounted: function () {
    if (typeof stokBahanAjar !== "undefined") {
      this.stokData = stokBahanAjar;
    } else {
      console.error("Data tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof upbjjList !== "undefined") {
      this.upbjjList = upbjjList;
    }

    if (typeof kategoriList !== "undefined") {
      this.kategoriList = kategoriList;
    }
  },
  watch: {
    selectedUpbjj: function (newVal, oldVal) {
      var vm = this;
      if (newVal !== oldVal && oldVal !== "") {
        this.selectedKategori = "";
        this.watcherMessage = 'UPBJJ berubah dari "' + oldVal + '" ke "' + newVal + '". Kategori filter direset.';
        this.filterMessage = "Filter aktif: UPBJJ = " + newVal;
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      } else if (newVal) {
        this.filterMessage = "Filter aktif: UPBJJ = " + newVal;
      } else {
        this.filterMessage = "";
      }
    },

    selectedKategori: function (newVal, oldVal) {
      var vm = this;
      if (newVal && this.sortKey) {
        this.sortKey = "";
        this.sortOrder = "asc";
      }
      if (newVal && oldVal) {
        this.watcherMessage = 'Kategori berubah dari "' + oldVal + '" ke "' + newVal + '"';
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      }
    },

    filterQtyBelowSafety: function (newVal) {
      var vm = this;
      if (newVal && this.filterQtyZero) {
        this.filterQtyZero = false;
        this.watcherMessage = "Filter 'Stok Habis' dinonaktifkan karena 'Stok di bawah Safety' aktif";
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      }
    },

    filterQtyZero: function (newVal) {
      var vm = this;
      if (newVal && this.filterQtyBelowSafety) {
        this.filterQtyBelowSafety = false;
        this.watcherMessage = "Filter 'Stok di bawah Safety' dinonaktifkan karena 'Stok Habis' aktif";
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      }
    },

    searchQuery: function (newVal, oldVal) {
      var vm = this;
      if (newVal && newVal !== oldVal) {
        this.watcherMessage = 'Pencarian: "' + newVal + '" - Menemukan ' + this.searchResultCount + " hasil";
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      }
    },

    "newItem.kode": function (newVal) {
      if (newVal && this.validationErrors.kode) {
        if (newVal.length >= 4) {
          this.validationErrors.kode = "";
        }
      }
    },

    "newItem.judul": function (newVal) {
      if (newVal && this.validationErrors.judul) {
        if (newVal.length >= 5) {
          this.validationErrors.judul = "";
        }
      }
    },

    "newItem.harga": function (newVal) {
      if (newVal > 0 && this.validationErrors.harga) {
        this.validationErrors.harga = "";
      }
    },

    "newItem.qty": function (newVal) {
      if (newVal >= 0 && this.validationErrors.qty) {
        this.validationErrors.qty = "";
      }
      if (newVal !== null && newVal !== undefined && this.newItem.safety > 0) {
        if (newVal < this.newItem.safety) {
          this.watcherMessage = "⚠️ Perhatian: Qty (" + newVal + ") di bawah safety stock (" + this.newItem.safety + ")";
        }
      }
    },

    "newItem.safety": function (newVal) {
      if (newVal >= 0 && this.validationErrors.safety) {
        this.validationErrors.safety = "";
      }
    },
  },
  template: `
    <main>
      <header class="page-header">
        <button class="back-button" @click="backToDashboard">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="header-text">
          <h2>Informasi Stok Bahan Ajar</h2>
          <p>Manajemen Stok Bahan Ajar UT</p>
        </div>
      </header>

      <section class="stock-container">
        <!-- Using Notification Component -->
        <notification-message :message="watcherMessage" type="info" />
        <notification-message :message="filterMessage" type="warning" />

        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Cari bahan ajar berdasarkan kode, judul, lokasi rak.." 
            class="search-input"
          >
          <div class="filter-container">
            <select v-model="selectedUpbjj">
              <option value="">Semua UPBJJ</option>
              <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">
                {{ upbjj }}
              </option>
            </select>

            <select v-model="selectedKategori" :disabled="!selectedUpbjj">
              <option value="">Semua Kategori</option>
              <option v-for="kategori in kategoriList" :key="kategori" :value="kategori">
                {{ kategori }}
              </option>
            </select>

            <label>
              <input type="checkbox" v-model="filterQtyBelowSafety">
              Stok di bawah Safety
            </label>

            <label>
              <input type="checkbox" v-model="filterQtyZero">
              Stok Habis
            </label>

            <button @click="resetFilters">Reset Filter</button>
          </div>
        </div>

        <div class="search-result-info" v-if="searchQuery || selectedUpbjj || selectedKategori || filterQtyBelowSafety || filterQtyZero" style="padding: 10px; margin-bottom: 10px; color: #666; font-size: 14px;">
          <span>Menampilkan </span>
          <strong v-text="searchResultCount"></strong>
          <span> hasil</span>
        </div>

        <div class="sort-container">
          <button @click="setSort('judul')">Sort by Judul</button>
          <button @click="setSort('qty')">Sort by Stok</button>
          <button @click="setSort('harga')">Sort by Harga</button>
          <button @click="openAddModal" class="add-button">
            <i class="fa-solid fa-plus"></i> Tambah Bahan Ajar
          </button>
        </div>

        <!-- Using Stock Card Component -->
        <div class="stock-list" v-if="filteredStok.length > 0">
          <stock-card 
            v-for="item in filteredStok" 
            :key="item.kode"
            :item="item"
            @click="showDetailModal"
          />
        </div>
        
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          <p>Tidak ada data ditemukan</p>
        </div>
      </section>

      <!-- Modal Detail -->
      <dialog 
        class="modal-stock"
        :open="showModal"
        @click="closeModal"
      >
        <div class="modal-stock-content" v-if="selectedItem" @click.stop>
          <div class="modal-stock-header">
            <h2>Detail Bahan Ajar</h2>
            <button type="button" class="close-modal" @click="closeModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-stock-body">
            <div class="detail-row">
              <span class="detail-label">Kode Bahan Ajar</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.kode" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.kode }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Judul</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.judul" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.judul }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Kategori</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.kategori" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.kategori }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">UPBJJ</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.upbjj" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.upbjj }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lokasi Rak</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.lokasiRak" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.lokasiRak }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Harga</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.harga" />
              </template>
              <template v-else>
                <span class="detail-value">{{ formatRupiah(selectedItem.harga) }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stok Tersedia</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.qty" />
              </template>
              <template v-else>
                <span class="detail-value">
                  <span class="stock-badge" :class="getStockClass(selectedItem.qty, selectedItem.safety)">
                    {{ selectedItem.qty }} unit
                  </span>
                </span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Safety Stock</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.safety" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.safety }} unit</span>
              </template>
            </div>
            <div class="detail-row" v-if="selectedItem.catatanHTML">
              <span class="detail-label">Catatan</span>
              <template v-if="showInput">
                <textarea class="detail-value" v-model="selectedItem.catatanHTML"></textarea>
              </template>
              <template v-else>
                <span class="detail-value" v-html="selectedItem.catatanHTML"></span>
              </template>
            </div>
            <button class="action-button" @click="editItem">
              <i v-if="showInput" class="fa-solid fa-check"></i>
              <i v-else class="fa-solid fa-pencil"></i>
              {{ showInput ? 'Simpan' : 'Edit' }}
            </button>
          </div>
        </div>
      </dialog>

      <!-- Modal Add New Item - Using Form Input Component -->
      <dialog 
        class="modal-stock"
        :open="showAddModal"
        @click="closeAddModal"
      >
        <div class="modal-stock-content" @click.stop>
          <div class="modal-stock-header">
            <h2>Tambah Bahan Ajar Baru</h2>
            <button type="button" class="close-modal" @click="closeAddModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-stock-body">
            <notification-message :message="watcherMessage" type="info" />

            <form-input 
              label="Kode Bahan Ajar"
              v-model="newItem.kode"
              placeholder="Masukkan kode"
              :required="true"
              :error="validationErrors.kode"
            />
            
            <form-input 
              label="Judul"
              v-model="newItem.judul"
              placeholder="Masukkan judul"
              :required="true"
              :error="validationErrors.judul"
            />
            
            <form-input 
              label="Kategori"
              type="select"
              v-model="newItem.kategori"
              placeholder="Pilih kategori"
              :options="kategoriList"
              :required="true"
              :error="validationErrors.kategori"
            />
            
            <form-input 
              label="UPBJJ"
              type="select"
              v-model="newItem.upbjj"
              placeholder="Pilih UPBJJ"
              :options="upbjjList"
              :required="true"
              :error="validationErrors.upbjj"
            />
            
            <form-input 
              label="Lokasi Rak"
              v-model="newItem.lokasiRak"
              placeholder="Masukkan lokasi rak"
            />
            
            <form-input 
              label="Harga"
              type="number"
              v-model.number="newItem.harga"
              placeholder="Masukkan harga"
              :required="true"
              :error="validationErrors.harga"
            />
            
            <form-input 
              label="Stok Tersedia"
              type="number"
              v-model.number="newItem.qty"
              placeholder="Masukkan jumlah stok"
              :error="validationErrors.qty"
            />
            
            <form-input 
              label="Safety Stock"
              type="number"
              v-model.number="newItem.safety"
              placeholder="Masukkan safety stock"
              :error="validationErrors.safety"
            />
            
            <form-input 
              label="Catatan (Mendukung HTML)"
              type="textarea"
              v-model="newItem.catatanHTML"
              placeholder="Contoh: <strong>Penting</strong>, <em>Catatan</em>, <u>Highlight</u>"
            />
            
            <div v-if="newItem.catatanHTML" style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <small style="color: #666;">Preview:</small>
              <div v-html="newItem.catatanHTML" style="margin-top: 5px;"></div>
            </div>
            
            <button class="action-button" @click="addNewItem">
              <i class="fa-solid fa-check"></i>
              Simpan
            </button>
          </div>
        </div>
      </dialog>
    </main>
  `,
});
