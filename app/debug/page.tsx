import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function DebugPage() {
  const diagnostics: any = {
    envVars: {},
    connectionTest: null,
    error: null,
  }

  // Check environment variables
  diagnostics.envVars = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    actualValues: {
      SUPABASE_URL: process.env.SUPABASE_URL?.substring(0, 20) + "...",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + "...",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    },
  }

  // Test connection
  try {
    const supabase = createServerSupabaseClient()

    // Try a simple query
    const { data, error } = await supabase.from("levels").select("count").limit(1)

    if (error) {
      diagnostics.connectionTest = {
        success: false,
        error: error.message,
        details: error,
      }
    } else {
      diagnostics.connectionTest = {
        success: true,
        data: data,
      }
    }
  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      stack: error.stack,
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Supabase Connection Diagnostics</h1>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(diagnostics.envVars, null, 2)}</pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(diagnostics.connectionTest, null, 2)}</pre>
        </div>

        {diagnostics.error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Error Details</h2>
            <pre className="text-sm overflow-auto text-red-700">{JSON.stringify(diagnostics.error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
