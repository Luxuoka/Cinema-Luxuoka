<template>
  <div class="admin-view">
    <div class="admin-header">
      <h1><i class="fas fa-shield-alt"></i> Admin Dashboard</h1>
      <p>Kelola data dan lihat statistik Cinema Luxuoka</p>
    </div>

    <div class="admin-tabs">
      <button :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">Overview</button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">User Management</button>
      <button :class="{ active: activeTab === 'moderation' }" @click="activeTab = 'moderation'">Moderasi Review</button>
    </div>

    <div v-if="activeTab === 'overview'" class="tab-content">
      <div class="admin-stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">Total Pengguna</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.reviews }}</div>
          <div class="stat-label">Ulasan Baru</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.watch_count }}</div>
          <div class="stat-label">Total Tontonan</div>
        </div>
      </div>

      <div class="admin-content-grid">
        <!-- Recent Reviews -->
        <div class="admin-card">
          <div class="card-header">
            <h3>Ulasan Terbaru</h3>
          </div>
          <div class="recent-list">
            <div v-for="review in recentReviews" :key="review.id" class="recent-item">
              <img :src="review.avatar" class="recent-avatar" />
              <div class="recent-info">
                <div class="recent-name">{{ review.username }} <span class="rating"><i class="fas fa-star"></i> {{ review.rating }}</span></div>
                <div class="recent-text">{{ review.review }}</div>
                <div class="recent-meta">pada {{ review.contentId }} • {{ new Date(review.createdAt).toLocaleDateString() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="admin-card">
          <div class="card-header">
            <h3>Aksi Cepat</h3>
          </div>
          <div class="action-btns">
            <button class="action-btn" @click="sendTestNotif">
              <i class="fas fa-bell"></i> Kirim Notifikasi Dummy
            </button>
            <button class="action-btn">
              <i class="fas fa-plus"></i> Tambah Koleksi Film
            </button>
            <button class="action-btn danger">
              <i class="fas fa-trash"></i> Bersihkan Cache Sistem
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'users'" class="tab-content">
      <div class="admin-card">
        <div class="card-header"><h3>Daftar Pengguna</h3></div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Profiles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userList" :key="user.id">
                <td>
                  <div class="user-cell">
                    <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id" />
                    <span>{{ user.username }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-' }}</td>
                <td>{{ user.profiles ? user.profiles.length : 1 }}</td>
                <td>
                  <button class="btn-icon" title="Ban User"><i class="fas fa-ban"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'moderation'" class="tab-content">
      <div class="admin-card">
        <div class="card-header"><h3>Moderasi Ulasan</h3></div>
        <div class="moderation-list">
          <div v-for="review in allReviews" :key="review.id" class="mod-item">
            <div class="mod-user">
              <img :src="review.avatar" />
              <div>
                <div class="mod-name">{{ review.username }}</div>
                <div class="mod-rating">Rating: {{ review.rating }}/5</div>
              </div>
            </div>
            <div class="mod-content">
              <div class="mod-text">{{ review.review }}</div>
              <div class="mod-meta">ID: {{ review.contentId }} • {{ new Date(review.createdAt).toLocaleString() }}</div>
            </div>
            <button class="btn-delete-mod" @click="handleDeleteReview(review.id)">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, getDocs, query, orderBy, limit, addDoc, deleteDoc, doc } from 'firebase/firestore'

const activeTab = ref('overview')
const userList = ref([])
const allReviews = ref([])

const stats = ref({
  users: 0,
  reviews: 0,
  watch_count: 0
})

const recentReviews = ref([])

async function loadAdminData() {
  if (!db) return
  
  // Load Stats (Count docs in collections - simplified)
  const usersSnap = await getDocs(collection(db, 'users'))
  stats.value.users = usersSnap.size
  
  const reviewsSnap = await getDocs(collection(db, 'ratings'))
  stats.value.reviews = reviewsSnap.size
  
  // Load Recent Reviews
  const q = query(collection(db, 'ratings'), orderBy('createdAt', 'desc'), limit(5))
  const snap = await getDocs(q)
  recentReviews.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Load All Reviews for Moderation
  const allRSnap = await getDocs(query(collection(db, 'ratings'), orderBy('createdAt', 'desc')))
  allReviews.value = allRSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Load All Users
  const userSnap = await getDocs(collection(db, 'users'))
  userList.value = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function handleDeleteReview(reviewId) {
  if (!confirm('Hapus ulasan ini secara permanen?')) return
  try {
    await deleteDoc(doc(db, 'ratings', reviewId))
    allReviews.value = allReviews.value.filter(r => r.id !== reviewId)
    alert('Ulasan dihapus!')
  } catch (err) {
    console.error(err)
  }
}

async function sendTestNotif() {
  if (!db || !auth.currentUser) return
  await addDoc(collection(db, 'notifications'), {
    uid: auth.currentUser.uid,
    text: '<b>Admin:</b> Anda baru saja mengirim notifikasi percobaan dari dashboard!',
    createdAt: new Date().toISOString(),
    read: false
  })
  alert('Notifikasi terkirim ke akun Anda!')
}

onMounted(loadAdminData)
</script>

<style scoped>
.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}
.admin-tabs button {
  background: transparent;
  border: none;
  color: var(--text3);
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s;
}
.admin-tabs button.active {
  background: var(--surface2);
  color: #fff;
}

/* User Table */
.admin-table-wrapper { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.admin-table th {
  text-align: left;
  padding: 12px 20px;
  background: var(--surface2);
  color: var(--text3);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
}
.admin-table td {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border);
}
.user-cell { display: flex; align-items: center; gap: 12px; }
.user-cell img { width: 32px; height: 32px; border-radius: 50%; }

.btn-icon {
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 16px;
}
.btn-icon:hover { color: var(--accent); }

/* Moderation List */
.moderation-list { padding: 0; }
.mod-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  gap: 20px;
}
.mod-user { display: flex; align-items: center; gap: 12px; min-width: 150px; }
.mod-user img { width: 40px; height: 40px; border-radius: 50%; }
.mod-name { font-weight: 700; font-size: 14px; }
.mod-rating { font-size: 12px; color: #f1c40f; }
.mod-content { flex: 1; }
.mod-text { font-size: 14px; margin-bottom: 5px; line-height: 1.4; }
.mod-meta { font-size: 11px; color: var(--text3); }

.btn-delete-mod {
  background: rgba(232, 54, 79, 0.1);
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-delete-mod:hover { background: var(--accent); color: #fff; }
</style>
