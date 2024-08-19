import classNames from 'classnames';
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bloom & Wild',
  description: 'A flower e-commerce store',
}
export const fetchCache = 'force-no-store';

export default function RootLayout({ children, pageProps }) {
  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={classNames(
          inter.className,
          'h-full bg-white',
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
