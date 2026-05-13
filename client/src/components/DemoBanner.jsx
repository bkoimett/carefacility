import { useAuth } from '../context/AuthContext'

export default function DemoBanner() {
  const { logout } = useAuth()

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div className="bg-[rgba(6,182,212,0.18)] border-b border-[rgba(6,182,212,0.35)] backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <p className="text-[#F0F4FF] text-sm">
              <span className="font-medium">You’re in Demo Mode</span> — data is simulated
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-premium text-xs px-3 py-1.5 whitespace-nowrap bg-[#0B1426] hover:bg-[#1A263D] border border-[#1A263D]"
            type="button"
          >
            Exit Demo
          </button>
        </div>
      </div>
    </div>
  )
}

