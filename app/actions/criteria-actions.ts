"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCriteriaDefinitions(
  fromLevel: number,
  toLevel: number
) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("criteria_definitions")
    .select("*")
    .eq("from_level", fromLevel)
    .eq("to_level", toLevel)
    .order("category")
    .order("criterion_name");

  if (error) {
    console.error(
      `Error fetching criteria for levels ${fromLevel} to ${toLevel}:`,
      error
    );
    throw new Error("Failed to fetch criteria definitions");
  }

  const groupedCriteria = data.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, typeof data>);

  return groupedCriteria;
}

export async function updateDeveloperCriterion(
  developerId: number,
  fromLevel: number,
  toLevel: number,
  category: string,
  criterionKey: string,
  isMet: boolean,
  reviewedBy?: string
) {
  const supabase = createServerSupabaseClient();

  const { data: existing, error: checkError } = await supabase
    .from("developer_criteria")
    .select("id")
    .eq("developer_id", developerId)
    .eq("from_level", fromLevel)
    .eq("to_level", toLevel)
    .eq("category", category)
    .eq("criterion_key", criterionKey)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking for existing criterion:", checkError);
    throw new Error("Failed to check for existing criterion");
  }

  let result;

  if (existing) {
    const { data, error } = await supabase
      .from("developer_criteria")
      .update({
        is_met: isMet,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select();

    if (error) {
      console.error("Error updating developer criterion:", error);
      throw new Error("Failed to update developer criterion");
    }

    result = data[0];
  } else {
    const { data, error } = await supabase
      .from("developer_criteria")
      .insert({
        developer_id: developerId,
        from_level: fromLevel,
        to_level: toLevel,
        category,
        criterion_key: criterionKey,
        is_met: isMet,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error creating developer criterion:", error);
      throw new Error("Failed to create developer criterion");
    }

    result = data[0];
  }

  revalidatePath(`/developers/${developerId}`);
  return result;
}

// Create initial criteria definitions
export async function createInitialCriteriaDefinitions() {
  const supabase = createServerSupabaseClient();

  const criteriaDefinitions = [
    // Level 1 to Level 2
    {
      from_level: 1,
      to_level: 2,
      category: "core",
      criterion_key: "technical_proficiency",
      criterion_name: "Technical Proficiency",
      criterion_description:
        "Demonstrates solid understanding of core technologies and can work independently on routine tasks",
      is_required: true,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "core",
      criterion_key: "code_quality",
      criterion_name: "Code Quality",
      criterion_description:
        "Writes clean, readable code that follows team standards",
      is_required: true,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "core",
      criterion_key: "problem_solving",
      criterion_name: "Problem Solving",
      criterion_description:
        "Can debug and solve routine problems with minimal guidance",
      is_required: true,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "core",
      criterion_key: "delivery",
      criterion_name: "Delivery",
      criterion_description: "Consistently delivers assigned tasks on time",
      is_required: true,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "growth",
      criterion_key: "mentoring",
      criterion_name: "Mentoring",
      criterion_description: "Helps onboard new junior developers",
      is_required: false,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "growth",
      criterion_key: "knowledge_sharing",
      criterion_name: "Knowledge Sharing",
      criterion_description:
        "Actively participates in team discussions and shares knowledge",
      is_required: false,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "growth",
      criterion_key: "initiative",
      criterion_name: "Initiative",
      criterion_description:
        "Takes initiative to improve processes or solve problems",
      is_required: false,
    },
    {
      from_level: 1,
      to_level: 2,
      category: "growth",
      criterion_key: "learning",
      criterion_name: "Continuous Learning",
      criterion_description: "Actively learns new technologies and approaches",
      is_required: false,
    },
  ];

  const { data, error } = await supabase
    .from("criteria_definitions")
    .insert(criteriaDefinitions)
    .select();

  if (error) {
    console.error("Error creating criteria definitions:", error);
    throw new Error(`Failed to create criteria definitions: ${error.message}`);
  }

  return data;
}
