import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import ProjectDetail from "./pages/ProjectDetail"
import UploadProject from "./pages/UploadProject"
import NLSearch from "./pages/NLSearch"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/upload" element={<UploadProject />} />
        <Route path="/search" element={<NLSearch />} />
      </Routes>
    </BrowserRouter>
  )
}
