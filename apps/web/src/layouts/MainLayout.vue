<template>
  <div class="min-h-screen bg-base-200 text-base-content h-full flex flex-col">
    <Header />
    <Content />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
import Content from "./components/Content.vue";
import Footer from "./components/Footer.vue";
</script>
