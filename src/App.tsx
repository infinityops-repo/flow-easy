import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import Auth from "@/pages/Auth"
import AuthCallback from "@/pages/AuthCallback"
import WorkflowBuilder from "@/pages/WorkflowBuilder"
import MainNav from "@/components/MainNav"

function App() {
  return (
    <Router>
      <MainNav />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<WorkflowBuilder />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App