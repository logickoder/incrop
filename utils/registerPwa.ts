export default async function registerPwa() {
  if (typeof window !== 'undefined') {
    // @ts-expect-error - TypeScript doesn't know about virtual:pwa-register
    const { registerSW } = await import('virtual:pwa-register');
    console.log('Registering Service Worker');
    registerSW({
      immediate: true,
      onRegisteredSW: (swUrl: never, registration: never) => {
        console.log('Service Worker Registered', swUrl, registration);
      },
      onRegisterError: (error: never) => {
        console.error('Service Worker Registration Error', error);
      }
    });
  }
}