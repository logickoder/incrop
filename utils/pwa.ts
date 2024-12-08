// @ts-expect-error - TypeScript doesn't know about virtual:pwa-register
import { registerSW } from 'virtual:pwa-register';

registerSW({ /* ... */ });