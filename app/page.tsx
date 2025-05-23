"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Users,
  UserPlus,
  LineChart,
  Award,
  Settings,
  ChartArea,
} from "lucide-react";
import { AddDeveloperButton } from "@/components/add-developer-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { useState, useEffect } from "react";
import { PasswordProtectionModal } from "@/components/password-protection-modal";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    readyForPromotion: 0,
    averageCompletion: 0,
    pendingReviews: 0,
  });
  const [developers, setDevelopers] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(storedAuth === "true");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createServerSupabaseClient();

        const { data: developersData, error: developersError } = await supabase
          .from("developers")
          .select(
            `
            *,
            level:levels(level_number, level_name, salary_min, salary_max)
          `
          )
          .order("name");

        if (!developersError && developersData) {
          const newStats = {
            totalDevelopers: 0,
            readyForPromotion: 0,
            averageCompletion: 0,
            pendingReviews: 0,
          };

          const newDevelopers = developersData;
          newStats.totalDevelopers = newDevelopers.length;

          for (const developer of newDevelopers) {
            const { data: criteriaData, error: criteriaError } = await supabase
              .from("criteria_definitions")
              .select("*")
              .eq("from_level", developer.current_level)
              .eq("to_level", developer.current_level + 1);

            if (!criteriaError && criteriaData) {
              const coreCriteria = criteriaData.filter(
                (c) => c.category === "core"
              );
              const growthCriteria = criteriaData.filter(
                (c) => c.category === "growth"
              );

              const coreTotal = coreCriteria.length;
              const growthTotal = growthCriteria.length;

              const { data: actualCriteria } = await supabase
                .from("developer_criteria")
                .select("*")
                .eq("developer_id", developer.id)
                .eq("from_level", developer.current_level)
                .eq("to_level", developer.current_level + 1);

              const actualCoreMet =
                actualCriteria?.filter((c) => c.category === "core" && c.is_met)
                  .length || 0;
              const actualGrowthMet =
                actualCriteria?.filter(
                  (c) => c.category === "growth" && c.is_met
                ).length || 0;

              const corePercentage = Math.round(
                (actualCoreMet / coreTotal) * 100
              );
              const growthPercentage = Math.round(
                (actualGrowthMet / growthTotal) * 100
              );

              developer.core_criteria_met = actualCoreMet;
              developer.core_criteria_total = coreTotal;
              developer.growth_criteria_met = actualGrowthMet;
              developer.growth_criteria_total = growthTotal;
              developer.core_percentage = corePercentage;
              developer.growth_percentage = growthPercentage;

              developer.promotion_ready =
                corePercentage === 100 && growthPercentage >= 80;

              if (developer.promotion_ready) {
                newStats.readyForPromotion++;
              }

              const overallCompletion =
                coreTotal + growthTotal > 0
                  ? ((actualCoreMet + actualGrowthMet) /
                      (coreTotal + growthTotal)) *
                    100
                  : 0;

              newStats.averageCompletion += overallCompletion;
            }
          }

          if (newStats.totalDevelopers > 0) {
            newStats.averageCompletion = Math.round(
              newStats.averageCompletion / newStats.totalDevelopers
            );
          }

          newStats.pendingReviews = 0;

          setStats(newStats);
          setDevelopers(newDevelopers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <PasswordProtectionModal
        isOpen={true}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Developer Progression Framework
          </h1>
          <p className="text-muted-foreground mt-1">
            Track, manage, and grow your engineering team
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/reports">
              <ChartArea className="mr-2 h-4 w-4" />
              Team Reports
            </Link>
          </Button>
          <AddDeveloperButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Total Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDevelopers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="mr-2 h-4 w-4 text-muted-foreground" />
              Ready for Promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.readyForPromotion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <LineChart className="mr-2 h-4 w-4 text-muted-foreground" />
              Average Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageCompletion}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Developer Overview</h2>
        {developers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {developers.map((developer) => (
              <Card key={developer.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{developer.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {developer.email}
                      </p>
                    </div>
                    {developer.promotion_ready && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Ready for Promotion
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current Level:
                      </span>
                      <span className="font-medium">
                        {developer.level?.level_name} (Level{" "}
                        {developer.current_level})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current Salary:
                      </span>
                      <span className="font-medium">
                        €{developer.current_salary.toLocaleString()}
                      </span>
                    </div>
                    {developer.core_criteria_total > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            Core Criteria ({developer.core_criteria_met}/
                            {developer.core_criteria_total})
                          </span>
                          <span>{Math.round(developer.core_percentage)}%</span>
                        </div>
                        <Progress
                          value={developer.core_percentage}
                          className="h-2"
                        />
                      </div>
                    )}
                    {developer.growth_criteria_total > 0 && (
                      <div className="mt-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            Growth Criteria ({developer.growth_criteria_met}/
                            {developer.growth_criteria_total})
                          </span>
                          <span>
                            {Math.round(developer.growth_percentage)}%
                          </span>
                        </div>
                        <Progress
                          value={developer.growth_percentage}
                          className="h-2"
                        />
                      </div>
                    )}
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/developers/${developer.id}`}>
                          View Profile
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  No developers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your first developer to get started
                </p>
                <AddDeveloperButton variant="default" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
