import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Pizzarra La Piedra - Sistema de Pedidos',
  description: 'Sistema digital de gestion de pedidos para cocina. Sin papel, sin complicaciones.',
  icons: {
    icon: [
      {
        url: '/pizzarra.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/pizzarra.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/pizzarra.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/pizzarra.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
