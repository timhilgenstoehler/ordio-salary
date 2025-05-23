import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function EnvCheckPage() {
  // Check all possible environment variables
  const envVars = {
    // Required Supabase variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Optional Supabase variables
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,

    // Database variables (alternative)
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
  }

  const setVars = Object.entries(envVars).filter(([key, value]) => value !== undefined && value !== "")
  const missingVars = Object.entries(envVars).filter(([key, value]) => value === undefined || value === "")

  const hasRequiredSupabase = envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasAlternativeSupabase = envVars.SUPABASE_URL && envVars.SUPABASE_ANON_KEY
  const hasPostgres = envVars.POSTGRES_URL

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Environment Variables Diagnostic</h1>
        <p className="text-muted-foreground mt-1">Checking all database-related environment variables</p>
      </div>

      {/* Status Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className={`p-3 rounded ${hasRequiredSupabase ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center">
                <span className="mr-2">{hasRequiredSupabase ? "✅" : "❌"}</span>
                <span className="font-medium">Required Supabase Variables</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
            </div>

            <div
              className={`p-3 rounded ${hasAlternativeSupabase ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center">
                <span className="mr-2">{hasAlternativeSupabase ? "✅" : "ℹ️"}</span>
                <span className="font-medium">Alternative Supabase Variables</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">SUPABASE_URL and SUPABASE_ANON_KEY (server-only)</p>
            </div>

            <div
              className={`p-3 rounded ${hasPostgres ? "bg-purple-50 border border-purple-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center">
                <span className="mr-2">{hasPostgres ? "✅" : "ℹ️"}</span>
                <span className="font-medium">Direct Postgres Connection</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">POSTGRES_URL (direct database connection)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Variables */}
      {setVars.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Available Variables ({setVars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {setVars.map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-xs text-green-600">
                    {typeof value === "string" && value.length > 20 ? `${value.substring(0, 20)}...` : "Set"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Variables */}
      {missingVars.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-600">Missing Variables ({missingVars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {missingVars.map(([key]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-xs text-gray-600">Not set</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What to Do Next</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRequiredSupabase ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">✅ Ready to Test Connection</AlertTitle>
              <AlertDescription className="text-green-700">
                You have the required Supabase environment variables. Try testing the connection now.
              </AlertDescription>
            </Alert>
          ) : hasAlternativeSupabase ? (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle className="text-blue-800">⚠️ Server-Only Variables Found</AlertTitle>
              <AlertDescription className="text-blue-700">
                You have server-only Supabase variables. For full functionality, add the NEXT_PUBLIC_ versions.
              </AlertDescription>
            </Alert>
          ) : hasPostgres ? (
            <Alert className="bg-purple-50 border-purple-200">
              <AlertTitle className="text-purple-800">🔄 Direct Postgres Connection Available</AlertTitle>
              <AlertDescription className="text-purple-700">
                You have a direct Postgres connection. We can modify the app to use this instead of Supabase.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>❌ No Database Connection Variables Found</AlertTitle>
              <AlertDescription>
                You need to add database connection variables. Follow the setup guide below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Option 1: Supabase (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Create a new project or select existing one</li>
                <li>Go to Settings → API</li>
                <li>Copy "Project URL" and "anon public" key</li>
                <li>Add to Vercel as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Redeploy your project</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Option 2: Use Existing Postgres</h4>
              <p className="text-sm text-muted-foreground">
                If you have POSTGRES_URL available, we can modify the app to use direct Postgres connection instead of
                Supabase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {(hasRequiredSupabase || hasAlternativeSupabase) && (
          <Link href="/test-connection">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Test Connection</button>
          </Link>
        )}

        <Link href="/mock-data">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">View Mock Data</button>
        </Link>

        {hasPostgres && (
          <Link href="/postgres-setup">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              Setup Postgres Connection
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
