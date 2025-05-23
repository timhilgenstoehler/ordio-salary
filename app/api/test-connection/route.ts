import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase environment variables",
          env: {
            NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
          },
        },
        { status: 500 },
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test a simple query
    const { data, error } = await supabase.from("levels").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Database query failed",
          error: error.message,
          details: error,
        },
        { status: 500 },
      )
    }

    // Try to list tables
    const { data: tablesData, error: tablesError } = await supabase
      .from("pg_catalog.pg_tables")
      .select("tablename")
      .eq("schemaname", "public")

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      data,
      tables: tablesError ? null : tablesData,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Error connecting to database",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
