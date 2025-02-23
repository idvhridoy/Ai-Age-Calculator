import AgeCalculator from './components/AgeCalculator'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>FuturAge</h1>
        <p>AI-Powered Age Analysis</p>
      </header>
      <main>
        <AgeCalculator />
      </main>
      <footer>
        <p> 2025 FuturAge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
