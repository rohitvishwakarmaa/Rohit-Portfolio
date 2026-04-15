import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'))
const Portfolio = lazy(() => import('@/pages/Portfolio'))
const VideoDetail = lazy(() => import('@/pages/VideoDetail'))
const AdminLogin = lazy(() => import('@/pages/Admin/Login'))
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
      <p className="text-gray-400 text-sm font-medium tracking-wide">Loading…</p>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/portfolio',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Portfolio />
      </Suspense>
    ),
  },
  {
    path: '/portfolio/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VideoDetail />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
