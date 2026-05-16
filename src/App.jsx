import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import PlatformPage from './pages/PlatformPage'
import StepPage from './pages/StepPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30 }, // 30s cache
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path=":platformId" element={<PlatformPage />} />
              <Route path=":platformId/:stepId" element={<StepPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
