import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="WhatsApp Business Dashboard" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-lg font-bold">WhatsApp Business Dashboard</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Registrar</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Gerencie seu WhatsApp Business de forma eficiente
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Envie mensagens, automatize respostas, visualize estatísticas e muito mais com nosso dashboard completo.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="bg-whatsapp hover:bg-whatsapp-dark">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline">
                    Ver recursos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/dashboard-preview.png"
                alt="Dashboard Preview"
                width={550}
                height={380}
                className="rounded-lg border shadow-lg"
              />
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 md:px-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-whatsapp"
                >
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Gerenciamento de Conversas</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Visualize e responda todas as suas conversas em um único lugar.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-whatsapp"
                >
                  <path d="M12 8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h6Z" />
                  <path d="M18 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2" />
                  <circle cx="12" cy="14" r="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Automações Inteligentes</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Configure respostas automáticas e fluxos de conversação.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-whatsapp"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Análises Detalhadas</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Acompanhe métricas e estatísticas de suas conversas.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="WhatsApp Business Dashboard" 
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="text-sm font-medium">WhatsApp Business Dashboard</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} WhatsApp Business Dashboard. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}