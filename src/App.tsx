import { Funnel } from './components/Funnel'

function App() {
    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
            {/* Main Content */}
            <main className="flex-grow w-full">
                <Funnel />
            </main>
        </div>
    )
}

export default App
