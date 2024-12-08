export default function registerPwa() {
  if (typeof window !== 'undefined') {
    console.log('Registering Service Worker');
    // @ts-expect-error - TypeScript doesn't know about virtual:pwa-register
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ /* ... */ });
    });
  }
}