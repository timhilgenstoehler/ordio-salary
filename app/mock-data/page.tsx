import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

// Mock data
const mockDevelopers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@company.com",
    current_level: 1,
    current_salary: 45000,
    level: {
      level_number: 1,
      level_name: "Junior",
      salary_min: 40000,
      salary_max: 55000,
    },
    core_criteria_met: 3,
    core_criteria_total: 5,
    growth_criteria_met: 2,
    growth_criteria_total: 5,
    promotion_ready: false,
  },
  {
    id: 2,
    name: "Sam Taylor",
    email: "sam.taylor@company.com",
    current_level: 2,
    current_salary: 65000,
    level: {
      level_number: 2,
      level_name: "Mid",
      salary_min: 55000,
      salary_max: 75000,
    },
    core_criteria_met: 6,
    core_criteria_total: 6,
    growth_criteria_met: 4,
    growth_criteria_total: 5,
    promotion_ready: true,
  },
  {
    id: 3,
    name: "Jordan Smith",
    email: "jordan.smith@company.com",
    current_level: 3,
    current_salary: 85000,
    level: {
      level_number: 3,
      level_name: "Senior",
      salary_min: 75000,
      salary_max: 95000,
    },
    core_criteria_met: 4,
    core_criteria_total: 6,
    growth_criteria_met: 3,
    growth_criteria_total: 5,
    promotion_ready: false,
  },
];

export default function MockDataPage() {
  const totalDevelopers = mockDevelopers.length;
  const readyForPromotion = mockDevelopers.filter(
    (d) => d.promotion_ready
  ).length;
  const averageCompletion = 65; // Mock value

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-500 hover:underline mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Mock Data Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Using static data (no database connection)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDevelopers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{readyForPromotion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageCompletion}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Developer Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockDevelopers.map((developer) => (
            <Card key={developer.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{developer.name}</CardTitle>
                    <CardDescription>{developer.email}</CardDescription>
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
                      {developer.level.level_name} (Level{" "}
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
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Core Criteria ({developer.core_criteria_met}/
                        {developer.core_criteria_total})
                      </span>
                      <span>
                        {developer.core_criteria_total > 0
                          ? Math.round(
                              (developer.core_criteria_met /
                                developer.core_criteria_total) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        developer.core_criteria_total > 0
                          ? (developer.core_criteria_met /
                              developer.core_criteria_total) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Growth Criteria ({developer.growth_criteria_met}/
                        {developer.growth_criteria_total})
                      </span>
                      <span>
                        {developer.growth_criteria_total > 0
                          ? Math.round(
                              (developer.growth_criteria_met /
                                developer.growth_criteria_total) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        developer.growth_criteria_total > 0
                          ? (developer.growth_criteria_met /
                              developer.growth_criteria_total) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View Profile
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
