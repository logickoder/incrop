import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { UserConfig } from 'vite';

const config: UserConfig = {
    plugins: [
        react(),
        vike({
            // Use default settings:
            prerender: true
        })
    ]
}

export default config
