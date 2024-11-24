'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Zap, ArrowRight } from 'lucide-react'

interface TransformResponse {
  original_text: string
  transformed_text: string
  analysis: {
    tone: string
    confidence: number
    improvements: string[]
  }
}

interface Context {
  situation: string
  importance: string
  additionalContext?: string
}

export default function ToneTransformer() {
  const [text, setText] = useState('')
  const [situation, setSituation] = useState('client')
  const [importance, setImportance] = useState('high')
  const [customContext, setCustomContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TransformResponse | null>(null)
  const [error, setError] = useState('')



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const context: Context = {
      situation,
      importance,
      additionalContext: customContext.trim() || undefined
    }

    const formData = new FormData()
    formData.append('text', text)
    formData.append('context', JSON.stringify(context))

    try {
      const response = await fetch('http://localhost:8000/process/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Header */}
      <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        ToneLift{' '}
        <span className="bg-gradient-to-r from-lime-400 via-green-500 to-green-600 bg-clip-text text-transparent">
          AI
        </span>
      </h1>
      <p className="mt-2 text-gray-300">
        Elevate your communication with AI-powered tone transformation
      </p>
    </div>

      <div className="relative grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card className="border border-gray-500 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader className="rounded-t-xl bg-black text-white">
            <CardTitle className="text-xl">Transform Your Message</CardTitle>
            <CardDescription className="text-gray-100">
              Customize your message settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="situation" className="text-black">Situation</Label>
                <Select value={situation} onValueChange={setSituation}>
                  <SelectTrigger id="situation">
                    <SelectValue placeholder="Select situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Business Client (B2B)</SelectItem>
                    <SelectItem value="customer_service">Customer Service (B2C)</SelectItem>
                    <SelectItem value="external_comms">Brand Communications</SelectItem>
                    <SelectItem value="feedback_to_team">Team Feedback</SelectItem>
                    <SelectItem value="feedback_to_management">Management Feedback</SelectItem>
                    <SelectItem value="other">Other Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importance" className="text-black">
                  Importance
                  <span className="ml-1 text-sm">(Affects tone)</span>
                </Label>
                <Select value={importance} onValueChange={setImportance}>
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Formal)</SelectItem>
                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                    <SelectItem value="low">Low (Casual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context" className="text-black">
                Additional Context
                <span className="ml-1 text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="context"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Add any additional context..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="text-black">Message to Transform</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[120px]"
                required
              />
            </div>

            <Button 
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-lime-400 via-green-500 to-green-600 text-white hover:from-lime-500 hover:via-green-600 hover:to-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" />
                  Transform Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Arrow between cards */}
        <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div className="flex size-12 items-center justify-center rounded-full bg-black text-white shadow-lg">
            <ArrowRight className="size-6" />
          </div>
        </div>

      {/* Result Card */}
      <Card className="border border-gray-500 bg-white/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="rounded-t-xl bg-black text-white">
          <CardTitle className="text-xl">Transformation Result</CardTitle>
          <CardDescription className="text-gray-100">
            Enhanced message output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {result ? (
            <div className="space-y-4">
              {/* Transformed Text Section */}
              <div className="space-y-2">
                <Label className="text-black">Transformed Message</Label>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="prose prose-gray max-w-none text-gray-700">
                    <p>
                      {(() => {
                        try {
                          // Try to parse the JSON
                          const jsonStart = result.transformed_text.indexOf('{');
                          const jsonEnd = result.transformed_text.indexOf('I made these changes');
                          const jsonStr = result.transformed_text.slice(jsonStart, jsonEnd > -1 ? jsonEnd : undefined).trim();
                          const parsed = JSON.parse(jsonStr);
                          return parsed.text;
                        } catch (error:unknown) {
                          console.error('Failed to parse response:', error);
                          return result.transformed_text;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="space-y-2">
                <Label className="text-black">Analysis</Label>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="space-y-4">
                    {/* Tone Analysis */}
                    <div className="rounded-md  p-3">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Detected Tone: </span>
                        <span className="text-gray-600">{result.analysis.tone.charAt(0).toUpperCase() + result.analysis.tone.slice(1)}</span>
                      </p>
                    </div>
                    
                    {/* Improvements */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Key Improvements:</h4>
                      <ul className="space-y-2">
                        {(() => {
                          try {
                            const jsonStart = result.transformed_text.indexOf('{');
                            const jsonEnd = result.transformed_text.indexOf('I made these changes');
                            const jsonStr = result.transformed_text.slice(jsonStart, jsonEnd > -1 ? jsonEnd : undefined).trim();
                            const parsed = JSON.parse(jsonStr);
                            return parsed.improvements.map((improvement: string, index: number) => (
                              <li 
                                key={index} 
                                className="flex gap-2 rounded-md bg-green-50 p-2 text-sm text-gray-600"
                              >
                                <span className="select-none text-green-500">✓</span>
                                <span>{improvement}</span>
                              </li>
                            ));
                          } catch (error:unknown) {
                            console.error('Failed to parse response:', error);
                            return null;
                          }
                        })()}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state - just labels without placeholder content
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black">Transformed Message</Label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4"></div>
              </div>

              <div className="space-y-2">
                <Label className="text-black">Analysis</Label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-4">
                    <div className="rounded-md bg-gray-100 p-3"></div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Key Improvements:</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        {error && (
          <Alert variant="destructive" className="border border-red-200">
            <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}