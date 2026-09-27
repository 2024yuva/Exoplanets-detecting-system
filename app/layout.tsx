import type { Metadata } from 'next';
import { Orbit } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExoScope | Worlds beyond our solar system',
  description: 'Explore and compare exoplanets through an interactive, data-led experience.',
};

const navigation = [
  { href: '#home', number: '01', label: 'Home' },
  { href: '#size-explorer', number: '02', label: 'Size explorer' },
  { href: '#discover', number: '03', label: 'How we discover' },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <div className="site-backdrop" aria-hidden="true" />
        <header className="site-header">
          <a href="#home" className="brand" aria-label="ExoScope home">
            <span className="brand-mark"><Orbit size={19} strokeWidth={1.8} /></span>
            <span className="brand-name">exo<span>scope</span><small>EXOPLANET FIELD NOTES</small></span>
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            {navigation.map((item) => <a key={item.href} href={item.href}><span>{item.number}</span>{item.label}</a>)}
          </nav>
          <div className="header-status"><span /> FIELD GUIDE</div>
        </header>
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}
