import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CalculatorPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}
