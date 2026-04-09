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
        domains: ['lh3.googleusercontent.com'],
    },
    experimental: {
        serverComponentsExternalPackages: ['better-sqlite3'],
    }
};

export default nextConfig;
