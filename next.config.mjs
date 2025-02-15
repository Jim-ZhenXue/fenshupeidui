let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: '.output',
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 禁用缓存
      config.cache = false;
      
      // 禁用一些不必要的功能
      config.optimization.moduleIds = 'deterministic';
      config.optimization.runtimeChunk = 'single';
      config.optimization.concatenateModules = true;
      
      // 配置分块策略
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10,
        minSize: 20000,
        maxSize: 50000,
        cacheGroups: {
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next|@next)[\\/]/,
            priority: 40,
            enforce: true,
            reuseExistingChunk: true,
          },
          phaser: {
            name: 'phaser',
            test: /[\\/]node_modules[\\/]phaser[\\/]/,
            priority: 30,
            enforce: true,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 1,
            priority: 10,
            reuseExistingChunk: true,
          }
        }
      };

      // 启用压缩
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.providedExports = true;
    }
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
