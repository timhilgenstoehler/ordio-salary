import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Pencil } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function LevelsPage() {
  let levels: any[] = []

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("levels").select("*").order("level_number")

    if (!error && data) {
      levels = data
    }
  } catch (error) {
    console.error("Error fetching levels:", error)
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Developer Levels</h1>
            <p className="text-muted-foreground mt-1">Manage your organization's developer levels and salary ranges</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Level
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {levels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Salary Range (€)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.level_number}</TableCell>
                    <TableCell>{level.level_name}</TableCell>
                    <TableCell>
                      €{level.salary_min.toLocaleString()} - €{level.salary_max.toLocaleString()}
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No levels found. Add your first level to get started.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Level
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
