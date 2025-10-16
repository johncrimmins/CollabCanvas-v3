// Auth page - sign in / sign up
import { AuthForm } from '@/features/auth';

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CollabCanvas
          </h1>
          <p className="text-gray-600">
            Real-time collaborative canvas
          </p>
        </div>
        
        <AuthForm />
      </div>
    </main>
  );
}

