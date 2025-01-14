import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import Auth from "@/pages/Auth"
import AuthCallback from "@/pages/AuthCallback"
import WorkflowBuilder from "@/pages/WorkflowBuilder"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/workflow" element={<WorkflowBuilder />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App