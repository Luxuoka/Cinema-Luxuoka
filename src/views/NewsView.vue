<template>
  <div class="news-view">
    <div class="page-header">
      <h1>News Center 📰</h1>
      <p>Tracking the latest headlines from around the world.</p>
    </div>

    <div class="empty-state">
      <i class="fas fa-newspaper"></i>
      <h3>News Digest Coming Soon</h3>
      <p>We are updating our news sources. Please check back later.</p>
    </div>
  </div>
</template>

<script setup>
// Live channels removed due to API unavailability
</script>

<style scoped>
.news-view { padding-bottom: 50px; }
.page-header { text-align: center; margin-bottom: 40px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}
</style>
