<template>
  <div class="min-h-screen p-6">
    <div class="max-w-3xl mx-auto">
      <div class="card p-6">
        <div class="flex items-center gap-4">
          <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" class="w-20 h-20 rounded-full" />
          <div>
            <h2 class="text-2xl font-bold">{{ profile.nickname || profile.username }}</h2>
            <p class="text-sm text-base-content/60">{{ profile.username }}</p>
            <p v-if="profile.email" class="text-sm text-base-content/60">{{ profile.email }}</p>
          </div>
        </div>

        <div class="mt-6">
          <p class="mb-2">账户信息：</p>
          <ul class="space-y-2 text-sm text-base-content/70">
            <li>来源: {{ profile.from || 'local' }}</li>
            <li>是否管理员: {{ profile.isAdmin ? '是' : '否' }}</li>
            <li>邮箱已验证: {{ profile.isVerified ? '是' : '否' }}</li>
          </ul>
        </div>

        <div class="mt-6" v-if="canResend">
          <button class="btn btn-outline btn-warning" :disabled="sendingVerify" @click="onResend">
            <span v-if="sendingVerify" class="loading loading-spinner loading-sm mr-2"></span>
            {{ sendingVerify ? '发送中...' : '重发验证邮件' }}
          </button>
          <p v-if="message" class="text-sm mt-2" :class="messageClass">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import request from '@/utils/http';
import { getUser } from '@/api/user';
import { useAuthStore } from '@/stores/modules/auth';

const route = useRoute();
const username = String(route.params.username || '');
const profile = ref<any>({});
const sendingVerify = ref(false);
const message = ref('');
const messageClass = computed(() => (message.value.includes('成功') ? 'text-success' : 'text-error'));

const auth = useAuthStore();

const canResend = computed(() => {
  // Only allow resend for the currently logged-in user's own profile and if email exists and not verified
  return (
    auth.getUser?.value?.username === username &&
    auth.getUser?.value?.email &&
    !auth.getUser?.value?.isVerified
  );
});

async function load() {
  try {
    const data = await getUser(username);
    profile.value = data;
  } catch (err: any) {
    console.error('failed to load profile', err);
  }
}

async function onResend() {
  if (!auth.getUser?.value?.email) return;
  sendingVerify.value = true;
  message.value = '';
  try {
    await request.post({ url: '/auth/resend-verification', data: { email: auth.getUser.value.email } });
    message.value = '验证邮件已发送，请注意查收（若未收到请稍后重试）';
    // update local user lastVerifyMailTime or similar by reloading profile
    await auth.loadProfile();
  } catch (err: any) {
    message.value = err?.response?.data?.msg || err?.message || '发送失败，请稍后再试';
  } finally {
    sendingVerify.value = false;
  }
}

onMounted(() => {
  load();
});
</script>
