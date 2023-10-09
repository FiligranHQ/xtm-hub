/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: false,
    swcMinify: true,
    compiler: {
        relay: {
            src: "./",
            language: "typescript",
            artifactDirectory: "__generated__",
        },
    },
    async rewrites() {
        const apiDestination = process.env.SERVER_HTTP_API + '/graphql-api';
        console.log('apiDestination', apiDestination);
        return [
            {
                source: '/graphql-api',
                destination: apiDestination
            },
            {
                source: '/graphql-sse',
                destination: process.env.SERVER_HTTP_API + '/graphql-sse'
            }
        ]
    }
};

module.exports = nextConfig;