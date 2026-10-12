import {defineConfig} from 'vite';
export default defineConfig(({isSsrBuild})=>({worker:{format:'es'},build:{copyPublicDir:!isSsrBuild,target:'es2022',assetsInlineLimit:0},server:{allowedHosts:['terminal.local']}}));
