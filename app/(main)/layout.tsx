import React, { ReactNode } from 'react'
import Sidebar from '@/components/sidebar'
import { SignedIn } from '@clerk/nextjs'

const MainLayout = ({ children }: { children: ReactNode }) => {

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 mt-24 mb-20">
        {children}
      </main>
    </div>
  )
}

export default MainLayout