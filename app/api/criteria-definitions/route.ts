import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fromLevel = Number.parseInt(searchParams.get("fromLevel") || "0")
  const toLevel = Number.parseInt(searchParams.get("toLevel") || "0")

  if (isNaN(fromLevel) || isNaN(toLevel)) {
    return NextResponse.json({ error: "Invalid level parameters" }, { status: 400 })
  }

  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("criteria_definitions")
      .select("*")
      .eq("from_level", fromLevel)
      .eq("to_level", toLevel)
      .order("category")
      .order("criterion_name")

    if (error) {
      console.error("Error fetching criteria definitions:", error)
      return NextResponse.json({ error: "Failed to fetch criteria definitions" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in criteria definitions API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
