import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { federation } from "@module-federation/vite";
import moduleFederationConfig from './module-federation.config.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      federation(moduleFederationConfig(env)),
    ],
  }
})
