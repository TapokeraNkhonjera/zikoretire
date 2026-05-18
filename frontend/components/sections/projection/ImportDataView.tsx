"use client"

import { useState, useRef, ChangeEvent } from "react"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Calculator, Info, BrainCircuit, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProjectionInputs } from "@/types/ProjectionInputs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImportDataViewProps {
  onCancel: () => void;
  onRun: (inputs: Partial<ProjectionInputs>, historicalData: any) => void;
}

export default function ImportDataView({ onCancel, onRun }: ImportDataViewProps) {
  const { toast } = useToast()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [inputs, setInputs] = useState<Partial<ProjectionInputs>>({
    retirementAge: "65",
    inflationRate: "8",
    growthModel: "balanced",
    incomeType: "stable",
    savingBehavior: "consistent",
    projectionStrategy: "balanced"
  })

  // Track what was auto-extracted
  const [extractedFields, setExtractedFields] = useState({
    age: false,
    currentSavings: false,
    monthlyIncome: false,
    monthlyContribution: false
  })

  // Historical Profile for the deterministic engine
  const [historicalData, setHistoricalData] = useState<any>(null)

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<{
    foundTransactions: number;
    message: string;
  } | null>(null)

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsProcessing(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, raw: false })
      const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, raw: true })
      
      let foundAge = ""
      let foundSavings = ""
      let foundIncome = ""
      let foundContribution = ""

      const transactions: { date: Date, amount: number, monthId: string }[] = []

      // Heuristic Scanner
      for (let r = 0; r < jsonData.length; r++) {
        const row = jsonData[r]
        const rawRow = rawData[r]
        if (!Array.isArray(row)) continue;
        
        let rowDate: Date | null = null;
        let rowAmount: number | null = null;

        for (let i = 0; i < row.length; i++) {
          const cellStr = String(row[i]).toLowerCase().trim()
          const rawVal = rawRow[i]
          
          if (!cellStr) continue;

          // 1. Check for Summary Keywords
          const nextVal = row[i+1]
          if (nextVal !== undefined && nextVal !== null && !isNaN(Number(rawRow[i+1]))) {
            const numStr = String(rawRow[i+1]).trim()
            
            if (cellStr.includes("age") && !foundAge) {
              foundAge = numStr
            } else if ((cellStr.includes("saving") || cellStr.includes("balance") || cellStr.includes("fund")) && !foundSavings) {
              foundSavings = numStr
            } else if ((cellStr.includes("income") || cellStr.includes("salary")) && !foundIncome) {
              foundIncome = numStr
            } else if ((cellStr.includes("contribution") || cellStr.includes("deposit")) && !foundContribution) {
              foundContribution = numStr
            }
          }

          // 2. Check for Transaction Ledger (Date + Amount)
          if (typeof row[i] === 'string' && !rowDate) {
            if (/^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(row[i])) {
              const parsed = new Date(row[i])
              if (!isNaN(parsed.getTime())) rowDate = parsed
            }
          } else if (rawVal && typeof rawVal === 'number' && rawVal > 10000 && rawVal < 60000 && !rowDate && cellStr.includes("/")) {
             const parsed = new Date(row[i])
             if (!isNaN(parsed.getTime())) rowDate = parsed
          }

          // Is it an amount?
          if (typeof rawVal === 'number' && rawVal > 0 && !rowAmount && rawVal !== rawRow[i+1]) { 
            rowAmount = rawVal
          }
        }

        if (rowDate && rowAmount) {
          transactions.push({ 
            date: rowDate, 
            amount: rowAmount,
            monthId: `${rowDate.getFullYear()}-${rowDate.getMonth()}`
          })
        }
      }

      // --- ADVANCED ANALYSIS ENGINE ---
      let inferredBehavior: "consistent" | "flexible" | "opportunistic" | null = null;
      let inferredIncome: "stable" | "seasonal" | "flexible" | null = null;
      let calculatedAvgCont = 0;
      let aiMessage = "";
      
      let depositProbabilityMap: Record<number, number> = {};
      let totalMonthsDetected = 0;
      let historicalDataPayload: any = null;

      if (transactions.length >= 3) {
        transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        const firstDate = transactions[0].date;
        const lastDate = transactions[transactions.length - 1].date;
        const monthSpan = Math.max(1, (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth()) + 1);
        
        calculatedAvgCont = Math.round(totalAmount / monthSpan);

        let totalGapMonths = 0;
        const activeMonthMap = new Set<number>();
        
        // Exact historical gap tracking for engine
        const monthHits = Array(12).fill(0);
        let yearsTracked = Math.ceil(monthSpan / 12) || 1;

        for (let i = 1; i < transactions.length; i++) {
          const prev = transactions[i-1].date;
          const curr = transactions[i].date;
          const gap = (curr.getFullYear() - prev.getFullYear()) * 12 + (curr.getMonth() - prev.getMonth());
          if (gap > 1) totalGapMonths += (gap - 1);
          activeMonthMap.add(curr.getMonth());
        }
        
        transactions.forEach(t => {
          monthHits[t.date.getMonth()] += 1;
        });

        // Probability of a deposit per month (for exact mapping)
        monthHits.forEach((hits, m) => {
          depositProbabilityMap[m] = Math.min(1, hits / yearsTracked);
        });

        activeMonthMap.add(transactions[0].date.getMonth());
        totalMonthsDetected = monthSpan;

        const gapRatio = totalGapMonths / monthSpan;
        
        if (gapRatio < 0.1) {
          inferredBehavior = "consistent";
          inferredIncome = "stable";
          aiMessage = "We analyzed your ledger and detected regular, consistent deposits. We've optimized your strategy for Stable Income.";
        } else if (gapRatio > 0.4 && transactions.length < (monthSpan / 2)) {
          inferredBehavior = "opportunistic";
          inferredIncome = "flexible";
          aiMessage = "Your ledger shows large, infrequent lumpsum deposits. We've optimized your strategy for Opportunistic saving.";
        } else {
          inferredBehavior = "flexible";
          if (activeMonthMap.size <= 5 && monthSpan > 12) {
             inferredIncome = "seasonal";
             aiMessage = "Your ledger shows deposits clustered around specific seasons. We've mapped your exact historical harvest months into the engine!";
          } else {
             inferredIncome = "flexible";
             aiMessage = "Your ledger shows somewhat irregular deposit patterns. We've securely mapped your exact historical skipping habits for precise projection.";
          }
        }

        setAiInsights({
          foundTransactions: transactions.length,
          message: aiMessage
        });
        
        historicalDataPayload = {
          hasLedger: true,
          totalTransactions: transactions.length,
          monthSpan,
          depositProbabilityMap,
          avgContribution: calculatedAvgCont,
          inferredBehavior,
          inferredIncome
        };
      }
      const finalInputs: Partial<ProjectionInputs> = {
        currentAge: foundAge || undefined,
        currentSavings: foundSavings || undefined,
        monthlyIncome: foundIncome || undefined,
        monthlyContribution: calculatedAvgCont ? calculatedAvgCont.toString() : (foundContribution || undefined),
        incomeType: inferredIncome || undefined,
        savingBehavior: inferredBehavior || undefined
      }

      toast({
        title: "Ledger Processed Successfully!",
        description: `We analyzed ${transactions.length} transactions and auto-filled your projection form. You can now tweak the fields and run your projection!`,
        duration: 8000
      })
      
      console.log("[IMPORT] File parsed successfully. Sending data to main form...")
      onRun(finalInputs, historicalDataPayload)
      
    } catch (error) {
      console.error(error)
      toast({
        title: "Processing Error",
        description: "Failed to parse the file. Please ensure it's a valid Excel or CSV file.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Import Ledger Data
          </h2>
          <p className="mt-1 text-muted-foreground">
            Upload your spreadsheet to run an ML-powered accurate projection.
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Manual Form
        </Button>
      </div>

      {step === 1 && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Advanced Ledger Analysis</AlertTitle>
            <AlertDescription>
              If your spreadsheet contains a <strong>Transaction Ledger</strong> (rows with Dates and Deposit Amounts), our AI will automatically scan it, identify your exact deposit skipping habits, detect seasonality, and feed this extremely accurate historical profile directly into the math engine!
            </AlertDescription>
          </Alert>

          <Card className="border-2 border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload your Spreadsheet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Drop your .xlsx, .xls, or .csv file here, or click to browse. We will securely scan it in your browser.
                </p>
              </div>
              
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              <Button size="lg" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                {isProcessing ? "Scanning Document..." : "Select File"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  )
}
