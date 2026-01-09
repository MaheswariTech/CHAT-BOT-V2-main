import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Admin from './components/Admin'
import Chatbot from './components/Chatbot'
import AdmissionForm from './components/AdmissionForm'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/apply" element={<AdmissionForm />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  )
}

export default App
