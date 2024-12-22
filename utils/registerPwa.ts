export default async function registerPwa() {
  if (typeof window !== 'undefined') {
    // @ts-expect-error - TypeScript doesn't know about virtual:pwa-register
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({
      immediate: true,
      onRegisterError: (error: never) => {
        console.error('Service Worker Registration Error', error);
      }
    });
  }
}