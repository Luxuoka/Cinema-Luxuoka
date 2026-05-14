<template>
  <div class="profile-selection">
    <div class="logo">
      <div class="logo-icon">C</div>
      <div class="logo-text">Cinema<span>Luxuoka</span></div>
    </div>

    <div class="selection-content">
      <h1>Siapa yang menonton?</h1>
      
      <div class="profiles-grid">
        <div 
          v-for="profile in allProfiles" 
          :key="profile.id" 
          class="profile-card"
          @click="pickProfile(profile)"
        >
          <div class="avatar-wrapper">
            <img :src="profile.avatar" :alt="profile.name" />
            <div class="profile-overlay">
              <i class="fas fa-play"></i>
            </div>
          </div>
          <span class="profile-name">{{ profile.name }}</span>
          <button v-if="allProfiles.length > 1" class="delete-btn" @click.stop="handleDelete(profile.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="allProfiles.length < 4" class="profile-card add-profile" @click="showAddModal = true">
          <div class="avatar-wrapper">
            <div class="add-icon"><i class="fas fa-plus"></i></div>
          </div>
          <span class="profile-name">Tambah Profil</span>
        </div>
      </div>

      <button class="manage-btn" @click="goBack">Batal</button>
    </div>

    <!-- Add Profile Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>Buat Profil Baru</h3>
        <input v-model="newProfileName" type="text" placeholder="Nama Profil" class="modal-input" />
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showAddModal = false">Batal</button>
          <button class="btn btn-primary" @click="handleAddProfile" :disabled="!newProfileName">Buat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { allProfiles, selectProfile, createProfile, deleteProfile } from '../stores/userStore'

const router = useRouter()
const showAddModal = ref(false)
const newProfileName = ref('')

function pickProfile(profile) {
  selectProfile(profile)
  router.push('/')
}

async function handleAddProfile() {
  if (newProfileName.value) {
    await createProfile(newProfileName.value)
    newProfileName.value = ''
    showAddModal.value = false
  }
}

async function handleDelete(id) {
  if (confirm('Hapus profil ini beserta seluruh riwayatnya?')) {
    await deleteProfile(id)
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.profile-selection {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  animation: fadeIn 0.5s ease;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 80px;
}
.logo-icon {
  width: 44px;
  height: 44px;
  background: var(--accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  font-weight: 800;
}
.logo-text { font-size: 24px; font-weight: 700; }
.logo-text span { color: var(--accent); }

.selection-content {
  text-align: center;
  max-width: 900px;
  width: 100%;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 40px;
  color: #fff;
}

.profiles-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
}

.profile-card {
  width: 160px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.profile-card:hover { transform: scale(1.1); }

.avatar-wrapper {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 3px solid transparent;
  transition: border-color 0.3s;
}

.profile-card:hover .avatar-wrapper {
  border-color: #fff;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.profile-card:hover .profile-overlay { opacity: 1; }
.profile-overlay i { font-size: 32px; color: #fff; }

.profile-name {
  font-size: 18px;
  color: var(--text2);
  transition: color 0.3s;
}
.profile-card:hover .profile-name { color: #fff; }

.add-profile .avatar-wrapper {
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-icon {
  font-size: 48px;
  color: var(--text3);
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}
.profile-card:hover .delete-btn { opacity: 1; }

.manage-btn {
  background: transparent;
  border: 1px solid var(--text3);
  color: var(--text3);
  padding: 10px 30px;
  font-size: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
}
.manage-btn:hover { border-color: #fff; color: #fff; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--bg2);
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  text-align: left;
  border: 1px solid var(--border);
}
.modal-content h3 { margin-bottom: 20px; font-size: 20px; }
.modal-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 8px;
  color: #fff;
  margin-bottom: 30px;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 15px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  h1 { font-size: 32px; }
  .profile-card { width: 120px; }
  .avatar-wrapper { width: 110px; height: 110px; }
}
</style>
