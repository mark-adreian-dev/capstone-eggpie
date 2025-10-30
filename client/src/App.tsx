import { Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./layout/Dashboard"
import TimerPage from "./pages/TimerPage"
import { Toaster } from "sonner"
import ConfigurationPage from "./pages/ConfigurationPage"

function App() {

  const reloadedURL = sessionStorage.getItem("current_url") ?? "/timer"
  return (
    <>
      <Toaster/>
      <Routes>
        <Route index element={<Navigate to={reloadedURL}/>} />
        <Route path={"timer"} element={<Dashboard />}>
          <Route index element={<TimerPage />}/>
        </Route>
        <Route path={"config"} element={<Dashboard />}>
          <Route index element={<ConfigurationPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
