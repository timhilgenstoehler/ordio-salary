"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { useState, useEffect } from "react";
import { PasswordProtectionModal } from "@/components/password-protection-modal";

export default function ReportsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    developersByLevel: [] as any[],
    averageSalaryByLevel: [] as any[],
    promotionReadiness: {
      ready: 0,
      inProgress: 0,
      notStarted: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createServerSupabaseClient();

        // Fetch developers with their levels
        const { data: developers, error: developersError } =
          await supabase.from("developers").select(`
            *,
            level:levels(level_number, level_name, salary_min, salary_max)
          `);

        if (!developersError && developers) {
          const newStats = {
            totalDevelopers: developers.length,
            developersByLevel: [] as any[],
            averageSalaryByLevel: [] as any[],
            promotionReadiness: {
              ready: 0,
              inProgress: 0,
              notStarted: 0,
            },
          };

          // Group developers by level
          const developersByLevel: Record<number, any[]> = {};
          const salaryByLevel: Record<number, number[]> = {};

          developers.forEach((dev) => {
            const level = dev.current_level;

            if (!developersByLevel[level]) {
              developersByLevel[level] = [];
            }
            developersByLevel[level].push(dev);

            if (!salaryByLevel[level]) {
              salaryByLevel[level] = [];
            }
            salaryByLevel[level].push(dev.current_salary);
          });

          // Calculate stats
          for (const level in developersByLevel) {
            const levelNumber = Number.parseInt(level);
            const devs = developersByLevel[levelNumber];
            const salaries = salaryByLevel[levelNumber];
            const avgSalary =
              salaries.reduce((sum, salary) => sum + salary, 0) /
              salaries.length;

            newStats.developersByLevel.push({
              level: levelNumber,
              levelName: devs[0].level.level_name,
              count: devs.length,
              percentage: Math.round(
                (devs.length / newStats.totalDevelopers) * 100
              ),
            });

            newStats.averageSalaryByLevel.push({
              level: levelNumber,
              levelName: devs[0].level.level_name,
              averageSalary: Math.round(avgSalary),
              minSalary: Math.min(...salaries),
              maxSalary: Math.max(...salaries),
              rangeLow: devs[0].level.salary_min,
              rangeHigh: devs[0].level.salary_max,
            });
          }

          // Sort by level
          newStats.developersByLevel.sort((a, b) => a.level - b.level);
          newStats.averageSalaryByLevel.sort((a, b) => a.level - b.level);

          // Calculate promotion readiness (placeholder for now)
          newStats.promotionReadiness = {
            ready: 2,
            inProgress: 5,
            notStarted: newStats.totalDevelopers - 7,
          };

          setStats(newStats);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

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
      <div className="mb-8">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Team Reports</h1>
        <p className="text-muted-foreground mt-1">
          Analytics and insights about your engineering team
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Developers by Level</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.developersByLevel.length > 0 ? (
              <div className="space-y-4">
                {stats.developersByLevel.map((levelStat) => (
                  <div
                    key={levelStat.level}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Level {levelStat.level}: {levelStat.levelName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {levelStat.count} developers ({levelStat.percentage}%)
                      </div>
                    </div>
                    <div className="w-1/2 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${levelStat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Analysis by Level</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.averageSalaryByLevel.length > 0 ? (
              <div className="space-y-6">
                {stats.averageSalaryByLevel.map((salaryStat) => (
                  <div key={salaryStat.level}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          Level {salaryStat.level}: {salaryStat.levelName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Average: €{salaryStat.averageSalary.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          Range: €{salaryStat.minSalary.toLocaleString()} - €
                          {salaryStat.maxSalary.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Target: €{salaryStat.rangeLow.toLocaleString()} - €
                          {salaryStat.rangeHigh.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-xs text-muted-foreground w-full flex justify-between">
                          <span>€{salaryStat.rangeLow.toLocaleString()}</span>
                          <span>€{salaryStat.rangeHigh.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                        <div
                          className="bg-blue-500 h-full"
                          style={{
                            width: `${
                              ((salaryStat.averageSalary -
                                salaryStat.rangeLow) /
                                (salaryStat.rangeHigh - salaryStat.rangeLow)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div
                        className="absolute top-7 w-1 h-3 bg-black rounded-full -translate-x-1/2"
                        style={{
                          left: `${
                            ((salaryStat.averageSalary - salaryStat.rangeLow) /
                              (salaryStat.rangeHigh - salaryStat.rangeLow)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No salary data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
