import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function DetailedDebugPage() {
  // Get raw environment variable values
  const rawEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Check various conditions
  const checks = {
    hasPublicUrl: !!rawEnvVars.NEXT_PUBLIC_SUPABASE_URL,
    hasPublicKey: !!rawEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlLength: rawEnvVars.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: rawEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    urlStartsWith: rawEnvVars.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://"),
    keyStartsWith: rawEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ"),
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Detailed Environment Debug</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your environment variable configuration</p>
      </div>

      {/* Raw Values */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Raw Environment Variable Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(rawEnvVars).map(([key, value]) => (
              <div key={key} className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm font-semibold">{key}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {value ? "SET" : "NOT SET"}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                  {value ? (
                    <>
                      <div>
                        <strong>Value:</strong> {value}
                      </div>
                      <div>
                        <strong>Length:</strong> {value.length} characters
                      </div>
                      <div>
                        <strong>Type:</strong> {typeof value}
                      </div>
                      <div>
                        <strong>First 10 chars:</strong> {value.substring(0, 10)}...
                      </div>
                      <div>
                        <strong>Last 10 chars:</strong> ...{value.substring(value.length - 10)}
                      </div>
                    </>
                  ) : (
                    <span className="text-red-600">undefined</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validation Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`p-3 rounded flex justify-between ${checks.hasPublicUrl ? "bg-green-50" : "bg-red-50"}`}>
              <span>NEXT_PUBLIC_SUPABASE_URL exists</span>
              <span>{checks.hasPublicUrl ? "✅" : "❌"}</span>
            </div>

            <div className={`p-3 rounded flex justify-between ${checks.hasPublicKey ? "bg-green-50" : "bg-red-50"}`}>
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY exists</span>
              <span>{checks.hasPublicKey ? "✅" : "❌"}</span>
            </div>

            {checks.hasPublicUrl && (
              <div
                className={`p-3 rounded flex justify-between ${checks.urlStartsWith ? "bg-green-50" : "bg-yellow-50"}`}
              >
                <span>URL starts with https://</span>
                <span>{checks.urlStartsWith ? "✅" : "⚠️"}</span>
              </div>
            )}

            {checks.hasPublicKey && (
              <div
                className={`p-3 rounded flex justify-between ${checks.keyStartsWith ? "bg-green-50" : "bg-yellow-50"}`}
              >
                <span>Key looks like JWT (starts with eyJ)</span>
                <span>{checks.keyStartsWith ? "✅" : "⚠️"}</span>
              </div>
            )}

            {checks.hasPublicUrl && (
              <div
                className={`p-3 rounded flex justify-between ${checks.urlLength > 20 ? "bg-green-50" : "bg-yellow-50"}`}
              >
                <span>URL length reasonable ({checks.urlLength} chars)</span>
                <span>{checks.urlLength > 20 ? "✅" : "⚠️"}</span>
              </div>
            )}

            {checks.hasPublicKey && (
              <div
                className={`p-3 rounded flex justify-between ${checks.keyLength > 100 ? "bg-green-50" : "bg-yellow-50"}`}
              >
                <span>Key length reasonable ({checks.keyLength} chars)</span>
                <span>{checks.keyLength > 100 ? "✅" : "⚠️"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Runtime Environment Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Runtime Environment Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Node.js Version:</strong> {process.version}
            </div>
            <div>
              <strong>Platform:</strong> {process.platform}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>Vercel:</strong> {process.env.VERCEL ? "Yes" : "No"}
            </div>
            <div>
              <strong>Vercel Environment:</strong> {process.env.VERCEL_ENV || "Not set"}
            </div>
            <div>
              <strong>Total Env Vars:</strong> {Object.keys(process.env).length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Environment Variables (filtered) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Supabase/Database Related Env Vars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-xs font-mono">
            {Object.entries(process.env)
              .filter(
                ([key]) =>
                  key.includes("SUPABASE") ||
                  key.includes("POSTGRES") ||
                  key.includes("DATABASE") ||
                  key.includes("DB_"),
              )
              .map(([key, value]) => (
                <div key={key} className="flex justify-between p-1 border-b">
                  <span>{key}</span>
                  <span className="text-gray-600">{value ? `${value.substring(0, 20)}...` : "undefined"}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Specific Issues */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Potential Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!checks.hasPublicUrl && (
              <Alert variant="destructive">
                <AlertTitle>❌ NEXT_PUBLIC_SUPABASE_URL is missing</AlertTitle>
                <AlertDescription>
                  This variable is completely undefined. Make sure it's added to Vercel and the project is redeployed.
                </AlertDescription>
              </Alert>
            )}

            {!checks.hasPublicKey && (
              <Alert variant="destructive">
                <AlertTitle>❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing</AlertTitle>
                <AlertDescription>
                  This variable is completely undefined. Make sure it's added to Vercel and the project is redeployed.
                </AlertDescription>
              </Alert>
            )}

            {checks.hasPublicUrl && !checks.urlStartsWith && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTitle className="text-yellow-800">⚠️ URL format issue</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Your Supabase URL doesn't start with https://. It should look like: https://your-project.supabase.co
                </AlertDescription>
              </Alert>
            )}

            {checks.hasPublicKey && !checks.keyStartsWith && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTitle className="text-yellow-800">⚠️ Key format issue</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Your anon key doesn't look like a JWT token. It should start with "eyJ" and be very long.
                </AlertDescription>
              </Alert>
            )}

            {checks.hasPublicUrl && checks.hasPublicKey && checks.urlStartsWith && checks.keyStartsWith && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">✅ Environment variables look correct!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your environment variables appear to be properly formatted. The connection issue might be elsewhere.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!checks.hasPublicUrl || !checks.hasPublicKey) && (
              <Alert>
                <AlertTitle>Add Missing Variables</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                    <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                    <li>Add the missing variables</li>
                    <li>Make sure to redeploy after adding them</li>
                    <li>Come back to this page to verify</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {checks.hasPublicUrl && checks.hasPublicKey && (
              <div className="flex gap-2">
                <Link href="/test-connection">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Test Connection
                  </button>
                </Link>
                <Link href="/live-connection-test">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Live Connection Test
                  </button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
