<template>
  <div class="skeleton-card">
    <div class="skeleton-poster"></div>
    <div class="skeleton-text title"></div>
    <div class="skeleton-text meta"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-poster {
  width: 100%;
  padding-top: 150%; /* 2:3 aspect ratio */
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-lg);
}

.skeleton-text {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.title {
  height: 20px;
  width: 80%;
}

.meta {
  height: 16px;
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
