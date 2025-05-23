import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Pencil } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function CriteriaPage() {
  let criteriaDefinitions: any[] = []
  let levels: any[] = []

  try {
    const supabase = createServerSupabaseClient()

    // Fetch levels
    const { data: levelsData, error: levelsError } = await supabase.from("levels").select("*").order("level_number")

    if (!levelsError && levelsData) {
      levels = levelsData
    }

    // Fetch criteria definitions
    const { data, error } = await supabase
      .from("criteria_definitions")
      .select("*")
      .order("from_level")
      .order("to_level")
      .order("category")
      .order("criterion_name")

    if (!error && data) {
      criteriaDefinitions = data
    }
  } catch (error) {
    console.error("Error fetching criteria:", error)
  }

  // Group criteria by level transition
  const criteriaByTransition: Record<string, any[]> = {}

  criteriaDefinitions.forEach((criterion) => {
    const key = `${criterion.from_level}-${criterion.to_level}`
    if (!criteriaByTransition[key]) {
      criteriaByTransition[key] = []
    }
    criteriaByTransition[key].push(criterion)
  })

  // Get unique transitions
  const transitions = Object.keys(criteriaByTransition).sort()

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
            <h1 className="text-3xl font-bold tracking-tight">Promotion Criteria</h1>
            <p className="text-muted-foreground mt-1">Manage criteria for level transitions</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Criterion
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotion Criteria by Level</CardTitle>
        </CardHeader>
        <CardContent>
          {transitions.length > 0 ? (
            <Tabs defaultValue={transitions[0]}>
              <TabsList className="mb-4">
                {transitions.map((transition) => {
                  const [from, to] = transition.split("-").map(Number)
                  const fromLevel = levels.find((l) => l.level_number === from)
                  const toLevel = levels.find((l) => l.level_number === to)

                  return (
                    <TabsTrigger key={transition} value={transition}>
                      {fromLevel?.level_name || `Level ${from}`} → {toLevel?.level_name || `Level ${to}`}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {transitions.map((transition) => (
                <TabsContent key={transition} value={transition}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criteriaByTransition[transition].map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {criterion.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{criterion.criterion_name}</TableCell>
                          <TableCell className="max-w-md truncate">{criterion.criterion_description}</TableCell>
                          <TableCell>
                            {criterion.is_required ? (
                              <Badge className="bg-blue-500">Required</Badge>
                            ) : (
                              <Badge variant="outline">Optional</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No criteria found. Add your first criterion to get started.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Criterion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
