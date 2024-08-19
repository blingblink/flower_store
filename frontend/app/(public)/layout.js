import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Bloom & Wild',
  description: 'An e-commerce flower shop',
}

export default function PublicLayout({ children, pageProps }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
