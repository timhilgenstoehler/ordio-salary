import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const developerId = Number.parseInt(params.id)

  if (isNaN(developerId)) {
    return NextResponse.json({ error: "Invalid developer ID" }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const fromLevel = Number.parseInt(searchParams.get("fromLevel") || "0")
  const toLevel = Number.parseInt(searchParams.get("toLevel") || "0")

  if (isNaN(fromLevel) || isNaN(toLevel)) {
    return NextResponse.json({ error: "Invalid level parameters" }, { status: 400 })
  }

  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("developer_criteria")
      .select("*")
      .eq("developer_id", developerId)
      .eq("from_level", fromLevel)
      .eq("to_level", toLevel)

    if (error) {
      console.error("Error fetching developer criteria:", error)
      return NextResponse.json({ error: "Failed to fetch criteria" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in criteria API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
