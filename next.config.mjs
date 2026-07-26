/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MUI paketlerinin tree-shaking'i için modularizasyon
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
}

export default nextConfig
