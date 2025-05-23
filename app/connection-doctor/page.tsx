import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

export default async function ConnectionDoctorPage() {
  // Diagnostic results
  const diagnosis = {
    variables: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://"),
      keyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ"),
    },
    connection: {
      success: false,
      error: null as string | null,
      details: null as any,
      data: null as any,
    },
    tables: {
      success: false,
      error: null as string | null,
      tables: [] as string[],
    },
    recommendations: [] as string[],
  }

  // Test basic connection
  if (diagnosis.variables.hasUrl && diagnosis.variables.hasKey) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      // Test connection with a simple query
      const { data, error } = await supabase.from("levels").select("count")

      if (error) {
        diagnosis.connection.success = false
        diagnosis.connection.error = error.message
        diagnosis.connection.details = error

        // Add recommendations based on error
        if (error.message.includes("relation") || error.message.includes("does not exist")) {
          diagnosis.recommendations.push("Create the required database tables")
          diagnosis.recommendations.push("Run the database setup script")
        } else if (error.message.includes("permission denied")) {
          diagnosis.recommendations.push("Check Row Level Security (RLS) policies")
          diagnosis.recommendations.push("Verify the anon key has the necessary permissions")
        } else if (error.message.includes("JWT")) {
          diagnosis.recommendations.push("Your anon key appears to be invalid")
          diagnosis.recommendations.push("Get a fresh key from Supabase dashboard → Settings → API")
        } else if (error.message.includes("connection")) {
          diagnosis.recommendations.push("Check if your Supabase project is active and not paused")
          diagnosis.recommendations.push("Verify your project URL is correct")
        }
      } else {
        diagnosis.connection.success = true
        diagnosis.connection.data = data

        // If connection works, try to list tables
        try {
          const { data: tablesData, error: tablesError } = await supabase
            .from("pg_catalog.pg_tables")
            .select("tablename")
            .eq("schemaname", "public")

          if (tablesError) {
            diagnosis.tables.error = tablesError.message
          } else {
            diagnosis.tables.success = true
            diagnosis.tables.tables = tablesData.map((t: any) => t.tablename)

            // Check for required tables
            const requiredTables = ["levels", "developers", "criteria_definitions", "developer_criteria"]
            const missingTables = requiredTables.filter((table) => !diagnosis.tables.tables.includes(table))

            if (missingTables.length > 0) {
              diagnosis.recommendations.push(`Missing tables: ${missingTables.join(", ")}`)
              diagnosis.recommendations.push("Run the database setup script to create missing tables")
            }
          }
        } catch (e: any) {
          diagnosis.tables.error = e.message
        }
      }
    } catch (e: any) {
      diagnosis.connection.error = e.message
      diagnosis.recommendations.push("There was an error creating the Supabase client")
      diagnosis.recommendations.push("Check that your URL and key are correctly formatted")
    }
  } else {
    if (!diagnosis.variables.hasUrl) {
      diagnosis.recommendations.push("Add NEXT_PUBLIC_SUPABASE_URL to your environment variables")
    }
    if (!diagnosis.variables.hasKey) {
      diagnosis.recommendations.push("Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Connection Doctor</h1>
        <p className="text-muted-foreground mt-1">Comprehensive diagnosis of your Supabase connection</p>
      </div>

      {/* Environment Variables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className={`p-3 rounded ${diagnosis.variables.hasUrl ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
                <span>{diagnosis.variables.hasUrl ? "✅ Set" : "❌ Missing"}</span>
              </div>
              {diagnosis.variables.hasUrl && (
                <div className="mt-2 text-sm">
                  <div>Value: {diagnosis.variables.url}</div>
                  <div>
                    Format: {diagnosis.variables.urlFormat ? "✅ Correct (starts with https://)" : "⚠️ Incorrect format"}
                  </div>
                </div>
              )}
            </div>

            <div className={`p-3 rounded ${diagnosis.variables.hasKey ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span>{diagnosis.variables.hasKey ? "✅ Set" : "❌ Missing"}</span>
              </div>
              {diagnosis.variables.hasKey && (
                <div className="mt-2 text-sm">
                  <div>
                    Value: {diagnosis.variables.key?.substring(0, 10)}...
                    {diagnosis.variables.key?.substring(diagnosis.variables.key.length - 10)}
                  </div>
                  <div>Length: {diagnosis.variables.key?.length} characters</div>
                  <div>Format: {diagnosis.variables.keyFormat ? "✅ Looks like JWT token" : "⚠️ Unusual format"}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          {!diagnosis.variables.hasUrl || !diagnosis.variables.hasKey ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Test Connection</AlertTitle>
              <AlertDescription>Missing required environment variables. Please add them first.</AlertDescription>
            </Alert>
          ) : diagnosis.connection.success ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">✅ Connection Successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                <p>Successfully connected to your Supabase project.</p>
                <pre className="mt-2 bg-green-100 p-2 rounded text-sm">
                  {JSON.stringify(diagnosis.connection.data, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>❌ Connection Failed</AlertTitle>
              <AlertDescription>
                <p>Error: {diagnosis.connection.error}</p>
                {diagnosis.connection.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">View Error Details</summary>
                    <pre className="mt-2 bg-red-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(diagnosis.connection.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Tables */}
      {diagnosis.connection.success && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosis.tables.success ? (
              <div>
                <p className="mb-2">Found {diagnosis.tables.tables.length} tables in your database:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {diagnosis.tables.tables.map((table) => (
                    <div key={table} className="p-2 bg-gray-50 rounded text-sm">
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>Could not list tables</AlertTitle>
                <AlertDescription>{diagnosis.tables.error || "Unable to query database tables."}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diagnosis & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnosis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosis.connection.success ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">✅ Connection is working!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your Supabase connection is working correctly.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>❌ Connection issues detected</AlertTitle>
                <AlertDescription>
                  We found problems with your Supabase connection. See recommendations below.
                </AlertDescription>
              </Alert>
            )}

            {diagnosis.recommendations.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Recommendations:</h3>
                <ul className="space-y-2">
                  {diagnosis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Next Steps:</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/setup-database">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Setup Database Tables
                  </button>
                </Link>
                <Link href="/mock-data">
                  <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">View Mock Data</button>
                </Link>
                <Link href="/detailed-debug">
                  <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    Detailed Debug
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
