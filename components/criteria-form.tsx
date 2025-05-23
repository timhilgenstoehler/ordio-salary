"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { updateDeveloperCriterion } from "@/app/actions/criteria-actions"
import { useRouter } from "next/navigation"

type CriteriaFormProps = {
  developerId: number
  fromLevel: number
  toLevel: number
}

type Criterion = {
  id?: number
  criterion_key: string
  criterion_name: string
  criterion_description: string
  category: string
  is_met?: boolean
}

export function CriteriaForm({ developerId, fromLevel, toLevel }: CriteriaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [criteria, setCriteria] = useState<{ core: Criterion[]; growth: Criterion[] }>({ core: [], growth: [] })
  const [developerCriteria, setDeveloperCriteria] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCriteria() {
      try {
        setLoading(true)

        const definitionsRes = await fetch(`/api/criteria-definitions?fromLevel=${fromLevel}&toLevel=${toLevel}`)
        const definitionsData = await definitionsRes.json()

        if (!definitionsRes.ok) {
          throw new Error(definitionsData.error || "Failed to fetch criteria definitions")
        }

        const developerCriteriaRes = await fetch(
          `/api/developers/${developerId}/criteria?fromLevel=${fromLevel}&toLevel=${toLevel}`,
        )
        const developerCriteriaData = await developerCriteriaRes.json()

        if (!developerCriteriaRes.ok) {
          throw new Error(developerCriteriaData.error || "Failed to fetch developer criteria")
        }

        const coreCriteria = definitionsData.data.filter((c: Criterion) => c.category === "core")
        const growthCriteria = definitionsData.data.filter((c: Criterion) => c.category === "growth")

        setCriteria({
          core: coreCriteria,
          growth: growthCriteria,
        })

        const criteriaState: Record<string, boolean> = {}
        developerCriteriaData.data.forEach((dc: any) => {
          criteriaState[`${dc.category}:${dc.criterion_key}`] = dc.is_met
        })

        setDeveloperCriteria(criteriaState)
      } catch (err: any) {
        console.error("Error fetching criteria:", err)
        setError("Failed to load criteria. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCriteria()
  }, [developerId, fromLevel, toLevel])

  const coreTotal = criteria.core?.length || 0
  const coreMet = Object.entries(developerCriteria).filter(([key, value]) => key.startsWith("core:") && value).length
  const corePercentage = coreTotal > 0 ? (coreMet / coreTotal) * 100 : 0

  const growthTotal = criteria.growth?.length || 0
  const growthMet = Object.entries(developerCriteria).filter(
    ([key, value]) => key.startsWith("growth:") && value,
  ).length
  const growthPercentage = growthTotal > 0 ? (growthMet / growthTotal) * 100 : 0

  const isPromotionReady = corePercentage === 100 && growthPercentage >= 80

  const toggleCriterion = async (category: string, key: string) => {
    const criterionKey = `${category}:${key}`
    const newValue = !developerCriteria[criterionKey]

    try {
      setSaving(true)

      await updateDeveloperCriterion(developerId, fromLevel, toLevel, category, key, newValue, "Current User")

      setDeveloperCriteria((prev) => ({
        ...prev,
        [criterionKey]: newValue,
      }))

      router.refresh()
    } catch (err: any) {
      console.error("Error updating criterion:", err)
      alert("Failed to update criterion. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const resetCheckboxes = async () => {
    if (confirm("Are you sure you want to reset all criteria? This cannot be undone.")) {
      try {
        setSaving(true)

        const promises = Object.entries(developerCriteria).map(([key, value]) => {
          if (value) {
            const [category, criterionKey] = key.split(":")
            return updateDeveloperCriterion(
              developerId,
              fromLevel,
              toLevel,
              category,
              criterionKey,
              false,
              "Current User",
            )
          }
          return Promise.resolve()
        })

        await Promise.all(promises)

        setDeveloperCriteria({})
        router.refresh()
      } catch (err: any) {
        console.error("Error resetting criteria:", err)
        alert("Failed to reset criteria. Please try again.")
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading criteria...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-3 w-full max-w-md">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Core Criteria</span>
              <span>
                {coreMet}/{coreTotal} ({Math.round(corePercentage)}%)
              </span>
            </div>
            <Progress value={corePercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Growth Criteria</span>
              <span>
                {growthMet}/{growthTotal} ({Math.round(growthPercentage)}%)
              </span>
            </div>
            <Progress value={growthPercentage} className="h-2" />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={resetCheckboxes}
          disabled={saving || Object.values(developerCriteria).every((v) => !v)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {isPromotionReady && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Ready for Promotion!</AlertTitle>
          <AlertDescription className="text-green-700">
            All required criteria have been met for promotion to the next level.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="core">
        <TabsList className="mb-4">
          <TabsTrigger value="core">
            Core Criteria ({coreMet}/{coreTotal})
          </TabsTrigger>
          <TabsTrigger value="growth">
            Growth Criteria ({growthMet}/{growthTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          {criteria.core?.length > 0 ? (
            criteria.core.map((criterion) => (
              <div key={criterion.criterion_key} className="flex items-start space-x-3 p-3 rounded-md border">
                <Checkbox
                  id={`core-${criterion.criterion_key}`}
                  checked={developerCriteria[`core:${criterion.criterion_key}`] || false}
                  onCheckedChange={() => toggleCriterion("core", criterion.criterion_key)}
                  className="mt-1"
                  disabled={saving}
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`core-${criterion.criterion_key}`}
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {criterion.criterion_name}
                  </label>
                  <p className="text-sm text-muted-foreground">{criterion.criterion_description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No core criteria defined for this level transition.
            </div>
          )}
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {criteria.growth?.length > 0 ? (
            criteria.growth.map((criterion) => (
              <div key={criterion.criterion_key} className="flex items-start space-x-3 p-3 rounded-md border">
                <Checkbox
                  id={`growth-${criterion.criterion_key}`}
                  checked={developerCriteria[`growth:${criterion.criterion_key}`] || false}
                  onCheckedChange={() => toggleCriterion("growth", criterion.criterion_key)}
                  className="mt-1"
                  disabled={saving}
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`growth-${criterion.criterion_key}`}
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {criterion.criterion_name}
                  </label>
                  <p className="text-sm text-muted-foreground">{criterion.criterion_description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No growth criteria defined for this level transition.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
