import { ExampleComponent } from '@/views/components'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Senseifi
        </h1>
        <ExampleComponent 
          title="MVVM Architecture"
          description="This project uses Model-View-ViewModel architecture pattern"
        />
      </div>
    </main>
  )
}

