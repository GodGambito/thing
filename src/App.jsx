import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ThreeScene from "../components/ThreeScene"
import Bokeh from "../components/BokehBackground"
import Home from "../components/Home"
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/three" element={<ThreeScene />} />
        <Route path="/bokeh" element={<Bokeh />} />
      </Routes>
    </Router>
  )
}

export default App