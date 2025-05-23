"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// Get all levels
export async function getLevels() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .order("level_number");

  if (error) {
    console.error("Error fetching levels:", error);
    throw new Error("Failed to fetch levels");
  }

  return data;
}

// Get level by number
export async function getLevelByNumber(levelNumber: number) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("level_number", levelNumber)
    .single();

  if (error) {
    console.error(`Error fetching level ${levelNumber}:`, error);
    throw new Error("Failed to fetch level");
  }

  return data;
}

// Get next level
export async function getNextLevel(currentLevelNumber: number) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("level_number", currentLevelNumber + 1)
    .maybeSingle();

  if (error) {
    console.error(
      `Error fetching next level for ${currentLevelNumber}:`,
      error
    );
    throw new Error("Failed to fetch next level");
  }

  return data;
}

// Create initial levels
export async function createInitialLevels() {
  const supabase = createServerSupabaseClient();

  const levels = [
    {
      level_number: 1,
      level_name: "Junior Developer",
      salary_min: 40000,
      salary_max: 55000,
    },
    {
      level_number: 2,
      level_name: "Mid-Level Developer",
      salary_min: 55000,
      salary_max: 75000,
    },
    {
      level_number: 3,
      level_name: "Senior Developer",
      salary_min: 75000,
      salary_max: 95000,
    },
    {
      level_number: 4,
      level_name: "Specialist / Team Lead",
      salary_min: 90000,
      salary_max: 120000,
    },
    {
      level_number: 5,
      level_name: "Expert / Principal",
      salary_min: 110000,
      salary_max: 150000,
    },
  ];

  const { data, error } = await supabase.from("levels").insert(levels).select();

  if (error) {
    console.error("Error creating levels:", error);
    throw new Error(`Failed to create levels: ${error.message}`);
  }

  return data;
}
