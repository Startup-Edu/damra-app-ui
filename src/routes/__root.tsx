import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  // The root now applies NO layout, allowing nested folders to choose their own
  component: () => <Outlet />,
})