import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { CriteriaForm } from "@/components/criteria-form"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function DeveloperProfilePage({ params }: { params: { id: string } }) {
  const developerId = Number.parseInt(params.id)

  if (isNaN(developerId)) {
    notFound()
  }

  const supabase = createServerSupabaseClient()

  const { data: developer, error } = await supabase
    .from("developers")
    .select(`
      *,
      level:levels(level_number, level_name, salary_min, salary_max)
    `)
    .eq("id", developerId)
    .single()

  if (error || !developer) {
    console.error(`Error fetching developer with ID ${developerId}:`, error)
    notFound()
  }

  const { data: nextLevel } = await supabase
    .from("levels")
    .select("*")
    .eq("level_number", developer.current_level + 1)
    .maybeSingle()

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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{developer.name}</h1>
            <p className="text-muted-foreground">{developer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Developer Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Current Level</div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  Level {developer.current_level}
                </Badge>
                <span className="text-lg font-semibold">{developer.level?.level_name}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Current Salary</div>
              <div className="text-lg font-semibold">€{developer.current_salary.toLocaleString()}</div>
            </div>
            {developer.hire_date && (
              <div>
                <div className="text-sm font-medium mb-1">Hire Date</div>
                <div className="text-lg font-semibold">{new Date(developer.hire_date).toLocaleDateString()}</div>
              </div>
            )}

            {nextLevel ? (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-1">Next Level</div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      Level {nextLevel.level_number}
                    </Badge>
                    <span className="text-lg font-semibold">{nextLevel.level_name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Salary Range</div>
                  <div className="text-lg font-semibold">
                    €{nextLevel.salary_min.toLocaleString()} - €{nextLevel.salary_max.toLocaleString()}
                  </div>
                </div>
              </>
            ) : (
              <Alert>
                <AlertTitle>Maximum Level Reached</AlertTitle>
                <AlertDescription>
                  This developer has reached the highest level in the progression framework.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {nextLevel ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Promotion Criteria</CardTitle>
              <CardDescription>
                Level {developer.current_level} ({developer.level?.level_name}) to Level {nextLevel.level_number} (
                {nextLevel.level_name})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriteriaForm
                developerId={developer.id}
                fromLevel={developer.current_level}
                toLevel={nextLevel.level_number}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Maximum Level Reached</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                This developer has reached the highest level in the progression framework. No further promotion criteria
                are available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
