<template>
  <div class="navbar-end gap-3">
    <div class="hidden text-right sm:block">
      <p class="text-xs uppercase tracking-[0.28em] text-base-content/60">
        Layout Template
      </p>
      <p class="text-sm font-medium text-base-content">Vue 3 + daisyUI</p>
    </div>

    <label class="btn btn-ghost btn-sm gap-2 rounded-btn">
      <input
        :checked="appStore.theme === 'dark'"
        class="theme-controller toggle toggle-sm"
        type="checkbox"
        value="dark"
        @change="appStore.toggleTheme()"
      />
      <span class="hidden sm:inline">{{ appStore.themeLabel }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/modules/app";
const appStore = useAppStore();
</script>
