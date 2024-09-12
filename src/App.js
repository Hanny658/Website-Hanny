import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      {/* Check if tailwind installed saftly and working */}
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-3xl font-bold">Tailwind is working properly here!</h1>
      </div>
    </div>
  );
}

export default App;
