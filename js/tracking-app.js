Vue.component("timeline-item", {
  template: "#timeline-item-template",
  props: {
    item: Object,
  },
});

Vue.component("tracking-info-card", {
  template: "#tracking-info-template",
  props: {
    data: Object,
  },
});

// Reuse Notification Component from stok-app (if not already defined)
if (!Vue.options.components["notification-message"]) {
  Vue.component("notification-message", {
    props: {
      message: String,
      type: {
        type: String,
        default: "info",
      },
    },
    computed: {
      notificationClass: function () {
        return this.type === "info" ? "watcher-notification" : "search-notification";
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
          warning: "fa-solid fa-search",
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
    template: `
      <div v-if="message" :class="notificationClass" :style="notificationStyle">
        <i :class="iconClass" :style="iconStyle"></i>
        <span v-text="message"></span>
      </div>
    `,
  });
}

// Reuse Form Input Component from stok-app (if not already defined)
if (!Vue.options.components["form-input"]) {
  Vue.component("form-input", {
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
    template: `
      <div class="detail-row">
        <span class="detail-label">{{ label }} <span v-if="required">*</span></span>
        <input 
          v-if="type !== 'select' && type !== 'textarea'"
          class="detail-value" 
          :type="type"
          :value="value"
          @input="$emit('input', $event.target.value)"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
        />
        <select 
          v-if="type === 'select'"
          class="detail-value"
          :value="value"
          @change="$emit('input', $event.target.value)"
          :required="required"
          :disabled="disabled"
        >
          <option value="">{{ placeholder }}</option>
          <option v-for="option in options" :key="option.kode || option" :value="option.nama || option">
            {{ option.nama || option }}
          </option>
        </select>
        <textarea
          v-if="type === 'textarea'"
          class="detail-value"
          :value="value"
          @input="$emit('input', $event.target.value)"
          :placeholder="placeholder"
          :required="required"
        ></textarea>
        <span v-if="error" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="error"></span>
      </div>
    `,
  });
}

new Vue({
  el: "#app",
  data: function () {
    return {
      searchQuery: "",
      trackingData: null,
      showResult: false,
      dataTracking: {},
      paketList: [],
      ekspedisiList: [],
      showAddModal: false,
      selectedPaket: {},
      newTracking: {
        nomorDO: "",
        nim: null,
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0,
      },
      validationErrors: {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: "",
      },
      watcherMessage: "",
      searchMessage: "",
    };
  },
  methods: {
    backToDashboard: function () {
      window.location.href = "index.html";
    },
    searchTracking: function () {
      var nomorDO = this.searchQuery.trim();

      if (!nomorDO) {
        var vm = this;
        this.searchMessage = "Mohon masukkan nomor Delivery Order";
        setTimeout(function () {
          vm.searchMessage = "";
        }, 3000);
        return;
      }

      if (this.dataTracking[nomorDO]) {
        var vm = this;
        this.trackingData = this.dataTracking[nomorDO];
        this.showResult = true;
        this.searchMessage = "Data ditemukan untuk DO: " + nomorDO;
        setTimeout(function () {
          vm.searchMessage = "";
        }, 3000);
      } else {
        var vm = this;
        this.searchMessage = 'Nomor Delivery Order "' + nomorDO + '" tidak ditemukan!';
        this.showResult = false;
        this.trackingData = null;
        setTimeout(function () {
          vm.searchMessage = "";
        }, 4000);
      }
    },
    openAddModal: function () {
      var currentYear = new Date().getFullYear();
      var sequenceNumber = Object.keys(this.dataTracking).length + 1;
      var paddedSequence = String(sequenceNumber).padStart(3, "0");
      this.newTracking.nomorDO = "DO" + currentYear + "-" + paddedSequence;

      this.showAddModal = true;
    },
    closeAddModal: function () {
      this.showAddModal = false;
      this.resetNewTracking();
    },
    clearValidationErrors: function () {
      this.validationErrors = {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: "",
      };
    },
    resetNewTracking: function () {
      this.newTracking = {
        nomorDO: "",
        nim: null,
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0,
      };
      this.selectedPaket = {};
      this.clearValidationErrors();
    },
    validateNewTracking: function () {
      this.clearValidationErrors();
      var isValid = true;

      if (!this.newTracking.nama || this.newTracking.nama.trim() === "") {
        this.validationErrors.nama = "Nama penerima wajib diisi";
        isValid = false;
      } else if (this.newTracking.nama.length < 3) {
        this.validationErrors.nama = "Nama minimal 3 karakter";
        isValid = false;
      }

      if (this.newTracking.nim !== null && this.newTracking.nim !== "") {
        if (this.newTracking.nim.toString().length < 9) {
          this.validationErrors.nim = "NIM harus minimal 9 digit";
          isValid = false;
        }
      }

      if (!this.newTracking.ekspedisi) {
        this.validationErrors.ekspedisi = "Ekspedisi wajib dipilih";
        isValid = false;
      }

      if (this.newTracking.tanggalKirim) {
        var selectedDate = new Date(this.newTracking.tanggalKirim);
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          this.validationErrors.tanggalKirim = "Tanggal kirim tidak boleh di masa lalu";
          isValid = false;
        }
      }

      return isValid;
    },
    addNewTracking: function () {
      if (!this.validateNewTracking()) {
        return;
      }

      var exists = this.dataTracking[this.newTracking.nomorDO];
      if (exists) {
        alert("Nomor Delivery Order sudah ada!");
        return;
      }

      var vm = this;
      this.dataTracking[this.newTracking.nomorDO] = {
        nomorDO: this.newTracking.nomorDO,
        nim: this.newTracking.nim,
        nama: this.newTracking.nama,
        ekspedisi: this.newTracking.ekspedisi,
        paket: this.newTracking.paket,
        tanggalKirim: this.newTracking.tanggalKirim,
        total: this.newTracking.total,
        status: "Dibuat",
        perjalanan: [
          {
            waktu: new Date().toLocaleString("id-ID"),
            keterangan: "Delivery Order dibuat",
          },
        ],
      };

      this.closeAddModal();
      this.watcherMessage = "✓ Delivery Order " + this.newTracking.nomorDO + " berhasil ditambahkan";
      setTimeout(function () {
        vm.watcherMessage = "";
      }, 4000);
    },
  },
  mounted: function () {
    if (typeof dataTracking !== "undefined") {
      this.dataTracking = dataTracking;
    } else {
      console.error("Data tracking tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof paketList !== "undefined") {
      this.paketList = paketList;
    } else {
      console.error("Data paket tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof pengirimanList !== "undefined") {
      this.ekspedisiList = pengirimanList;
    } else {
      console.error("Data ekspedisi tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }
  },
  watch: {
    "newTracking.paket": function (newValue) {
      var vm = this;
      if (newValue && newValue !== "") {
        this.selectedPaket =
          paketList.find(function (p) {
            return p.kode === newValue;
          }) || {};
        this.newTracking.total = this.selectedPaket.harga || 0;
        this.watcherMessage = 'Paket "' + this.selectedPaket.nama + '" dipilih. Total: Rp ' + this.newTracking.total.toLocaleString("id-ID");
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      } else if (newValue === "") {
        this.newTracking.total = 0;
        this.selectedPaket = {};
      }
    },

    "newTracking.nama": function (newVal) {
      if (newVal && this.validationErrors.nama) {
        if (newVal.length >= 3) {
          this.validationErrors.nama = "";
        }
      }
    },

    "newTracking.nim": function (newVal) {
      if (newVal && this.validationErrors.nim) {
        if (newVal.toString().length >= 9) {
          this.validationErrors.nim = "";
        }
      }
    },

    "newTracking.ekspedisi": function (newVal, oldVal) {
      var vm = this;
      if (newVal && this.validationErrors.ekspedisi) {
        this.validationErrors.ekspedisi = "";
      }
      if (newVal && oldVal && newVal !== oldVal) {
        this.watcherMessage = 'Ekspedisi berubah dari "' + oldVal + '" ke "' + newVal + '"';
        setTimeout(function () {
          vm.watcherMessage = "";
        }, 3000);
      }
    },

    "newTracking.tanggalKirim": function (newVal) {
      var vm = this;
      if (newVal) {
        var selectedDate = new Date(newVal);
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate >= today) {
          this.validationErrors.tanggalKirim = "";
          var formattedDate = selectedDate.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          this.watcherMessage = "Tanggal kirim: " + formattedDate;
          setTimeout(function () {
            vm.watcherMessage = "";
          }, 3000);
        }
      }
    },

    searchQuery: function (newVal) {
      var vm = this;
      if (newVal) {
        this.searchMessage = 'Mencari: "' + newVal + '"...';
        setTimeout(function () {
          if (vm.searchMessage === 'Mencari: "' + newVal + '"...') {
            vm.searchMessage = "";
          }
        }, 2000);
      }
    },
  },
  template: `
    <main>
      <header class="tracking-main-header">
      <div class="page-header">
        <button class="back-button" @click="backToDashboard">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="header-text">
          <h2>Tracking Pengiriman Bahan Ajar</h2>
          <p>Manajemen Tracking Bahan Ajar UT</p>
        </div>
      </div>
      <button class="add-button" @click="openAddModal">
          <i class="fa-solid fa-plus"></i> Input Delivery Order
        </button>
      </header>

      <section class="tracking-container">
        <!-- Using Notification Components -->
        <notification-message :message="watcherMessage" type="info" />
        <notification-message :message="searchMessage" type="warning" />

        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            class="search-input" 
            placeholder="Nomor Delivery Order"
            @keyup.enter="searchTracking"
          />
          <button type="button" class="btn-submit" @click="searchTracking">Cari</button>
        </div>

        <div class="placeholder-box" v-if="!showResult">
          <i class="fa-solid fa-search"></i>
          <p>Masukkan nomor delivery order untuk melihat informasi pengiriman</p>
        </div>

        <div class="result-box" v-if="showResult && trackingData">
          <!-- Using Tracking Info Component -->
          <tracking-info-card :data="trackingData" />
          
          <div class="timeline">
            <p class="timeline-header">Perjalanan Paket</p>
            <!-- Using Timeline Item Component -->
            <timeline-item 
              v-for="(item, index) in trackingData.perjalanan" 
              :key="index"
              :item="item"
            />
          </div>
        </div>
      </section>

      <!-- Modal Add New Tracking - Using Form Input Component -->
      <dialog 
        class="modal-stock"
        :open="showAddModal"
        @click="closeAddModal"
      >
        <div class="modal-stock-content" @click.stop>
          <div class="modal-stock-header">
            <h2>Input Delivery Order Baru</h2>
            <button type="button" class="close-modal" @click="closeAddModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-stock-body">
            <notification-message :message="watcherMessage" type="info" />

            <form-input 
              label="Nomor DO"
              v-model="newTracking.nomorDO"
              placeholder="Masukkan nomor DO"
              :required="true"
              :disabled="true"
            />
            
            <form-input 
              label="NIM"
              type="number"
              v-model.number="newTracking.nim"
              placeholder="Masukkan NIM (opsional)"
              :error="validationErrors.nim"
            />
            
            <form-input 
              label="Nama Penerima"
              v-model="newTracking.nama"
              placeholder="Masukkan nama penerima"
              :required="true"
              :error="validationErrors.nama"
            />
            
            <form-input 
              label="Ekspedisi"
              type="select"
              v-model="newTracking.ekspedisi"
              placeholder="-- Pilih Ekspedisi --"
              :options="ekspedisiList"
              :required="true"
              :error="validationErrors.ekspedisi"
            />
            
            <form-input 
              label="Paket"
              type="select"
              v-model="newTracking.paket"
              placeholder="-- Pilih Paket --"
              :options="paketList"
            />
            
            <div v-if="selectedPaket.kode" style="padding: 10px; background: #f5f5f5; border-radius: 4px; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Detail Paket:</strong> {{ selectedPaket.nama }}</p>
              <p style="margin: 5px 0;"><strong>Kode Paket:</strong> {{ selectedPaket.kode }}</p>
              <p style="margin: 5px 0;">
                <strong>Isi:</strong> 
                <span v-for="(value, index) in selectedPaket.isi" :key="value">
                  {{ value }}{{ index < selectedPaket.isi.length - 1 ? ', ' : '' }}
                </span>
              </p>
            </div>
            
            <form-input 
              label="Tanggal Kirim"
              type="date"
              v-model="newTracking.tanggalKirim"
              :error="validationErrors.tanggalKirim"
            />
            
            <form-input 
              label="Total"
              type="number"
              v-model.number="newTracking.total"
              placeholder="Masukkan total"
              :disabled="true"
            />
            
            <button class="action-button" @click="addNewTracking">
              <i class="fa-solid fa-check"></i>
              Simpan
            </button>
          </div>
        </div>
      </dialog>
    </main>
  `,
});
