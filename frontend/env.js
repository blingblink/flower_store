const env = process.env.NEXT_PUBLIC_APP_ENV;
let envApiUrl = '';

if (env === 'production') {
  envApiUrl = `https://${process.env.NEXT_PUBLIC_DOMAIN_PROD}`;
} else if (env === 'staging') {
  envApiUrl = `https://${process.env.NEXT_PUBLIC_DOMAIN_STAG}`;
} else {
  envApiUrl = `http://${process.env.NEXT_PUBLIC_DOMAIN_DEV}`;
}

export const apiUrl = envApiUrl;