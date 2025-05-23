"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createDeveloper(developerData: {
  name: string
  email: string
  current_level: number
  current_salary: number
  hire_date?: string
}) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("developers").insert(developerData).select()

  if (error) {
    console.error("Error creating developer:", error)
    throw new Error(`Failed to create developer: ${error.message}`)
  }

  revalidatePath("/")
  return data[0]
}

export async function getDevelopers() {
  const supabase = createServerSupabaseClient()

  const { data: developers, error } = await supabase
    .from("developers")
    .select(`
      *,
      level:levels!inner(level_number, level_name, salary_min, salary_max)
    `)
    .order("name")

  if (error) {
    console.error("Error fetching developers:", error)
    throw new Error(`Failed to fetch developers: ${error.message}`)
  }

  return developers
}

export async function getDeveloperById(id: number) {
  const supabase = createServerSupabaseClient()

  const { data: developer, error } = await supabase
    .from("developers")
    .select(`
      *,
      level:levels!inner(level_number, level_name, salary_min, salary_max)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching developer with ID ${id}:`, error)
    throw new Error(`Failed to fetch developer: ${error.message}`)
  }

  return developer
}
