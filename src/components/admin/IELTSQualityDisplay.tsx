/**
 * IELTS Quality Matrix Results Display Component
 * Shows the "Unfair Advantage" curation results to admins
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Edit3, 
  BarChart3,
  BookOpen,
  Award,
  MessageSquare,
  Users,
  Lightbulb
} from 'lucide-react'
import { IELTSQualityResult, IELTSQualityCheck } from '@/lib/ielts-quality-matrix'

interface IELTSQualityDisplayProps {
  results: IELTSQualityResult[]
  onEditQuestion?: (questionIndex: number) => void
  onApproveQuestion?: (questionIndex: number) => void
  onRejectQuestion?: (questionIndex: number) => void
}

export function IELTSQualityDisplay({ 
  results, 
  onEditQuestion, 
  onApproveQuestion, 
  onRejectQuestion 
}: IELTSQualityDisplayProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null)

  // Calculate overall stats
  const totalQuestions = results.length
  const passingQuestions = results.filter(r => r.isPassing).length
  const needsReview = results.filter(r => r.requiresManualReview).length
  const averageScore = totalQuestions > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / totalQuestions)
    : 0

  // Quality criteria info
  const qualityCriteria = {
    clarity_accuracy: { 
      icon: CheckCircle, 
      label: 'Clarity & Accuracy',
      description: 'Question and explanation are clear and grammatically correct'
    },
    ielts_relevance: { 
      icon: BookOpen, 
      label: 'IELTS Relevance',
      description: 'Content is relevant to IELTS exam and teaches IELTS language'
    },
    examiner_lens: { 
      icon: Users, 
      label: 'Examiner\'s Lens',
      description: 'Question meets IELTS examiner standards and conventions'
    },
    vocabulary_quality: { 
      icon: MessageSquare, 
      label: 'Vocabulary Quality',
      description: 'Uses natural and academic vocabulary appropriate for IELTS'
    },
    grammar_structures: { 
      icon: Award, 
      label: 'Grammar Structures',
      description: 'Demonstrates sophisticated grammar that impresses examiners'
    },
    educational_value: { 
      icon: Lightbulb, 
      label: 'Educational Value',
      description: 'Explanation teaches the "why" behind the answer for active learning'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number, isPassing: boolean) => {
    if (isPassing && score >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
    if (isPassing) return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>
    if (score >= 60) return <Badge variant="outline" className="border-yellow-400 text-yellow-700">Needs Work</Badge>
    return <Badge variant="destructive">Reject</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            IELTS Quality Matrix Summary - &ldquo;The Unfair Advantage&rdquo;
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passingQuestions}</div>
              <div className="text-sm text-gray-600">Questions Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{needsReview}</div>
              <div className="text-sm text-gray-600">Need Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>
          
          {averageScore < 75 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Quality Alert:</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This quiz batch scored below IELTS standards. Review and improve questions before publishing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Question Results */}
      <div className="space-y-4">
        {results.map((result, questionIndex) => (
          <Card 
            key={questionIndex} 
            className={`transition-all duration-200 ${
              result.isPassing 
                ? 'border-green-200 bg-green-50/30' 
                : result.requiresManualReview 
                  ? 'border-yellow-200 bg-yellow-50/30' 
                  : 'border-red-200 bg-red-50/30'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-lg">Question {questionIndex + 1}</span>
                  {getScoreBadge(result.overallScore, result.isPassing)}
                  <span className={`font-mono text-sm ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}%
                  </span>
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedQuestion(
                      expandedQuestion === questionIndex ? null : questionIndex
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    {expandedQuestion === questionIndex ? 'Hide Details' : 'View Details'}
                  </Button>
                  
                  {onEditQuestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditQuestion(questionIndex)}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}

                  {result.requiresManualReview && (
                    <div className="flex gap-1">
                      {onApproveQuestion && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onApproveQuestion(questionIndex)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                      )}
                      {onRejectQuestion && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRejectQuestion(questionIndex)}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {result.requiresManualReview && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 mt-2">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Manual Review Required
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This question needs curator attention before publishing to maintain IELTS standards.
                  </p>
                </div>
              )}
            </CardHeader>

            {expandedQuestion === questionIndex && (
              <CardContent className="pt-0">
                {/* Quality Criteria Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {result.checks.map((check, checkIndex) => {
                    const criterion = qualityCriteria[check.criterion as keyof typeof qualityCriteria]
                    if (!criterion) return null
                    
                    const IconComponent = criterion.icon
                    
                    return (
                      <Card 
                        key={checkIndex}
                        className={`cursor-pointer transition-all ${
                          selectedCriterion === check.criterion 
                            ? 'ring-2 ring-blue-300 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        } ${check.isPassing ? 'border-green-200' : 'border-red-200'}`}
                        onClick={() => setSelectedCriterion(
                          selectedCriterion === check.criterion ? null : check.criterion
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`w-4 h-4 ${
                                check.isPassing ? 'text-green-600' : 'text-red-600'
                              }`} />
                              <span className="font-medium text-sm">{criterion.label}</span>
                            </div>
                            <span className={`text-xs font-mono ${getScoreColor(check.score)}`}>
                              {check.score}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                check.score >= 80 ? 'bg-green-500' :
                                check.score >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(5, check.score)}%` }}
                            />
                          </div>
                          
                          <p className="text-xs text-gray-600">{criterion.description}</p>
                          
                          {!check.isPassing && (
                            <div className="mt-2 text-xs text-red-700 font-medium">
                              {check.feedback}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Detailed Feedback for Selected Criterion */}
                {selectedCriterion && (
                  <Card className="mb-4 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Detailed Feedback: {qualityCriteria[selectedCriterion as keyof typeof qualityCriteria]?.label}
                      </h4>
                      {(() => {
                        const selectedCheck = result.checks.find(c => c.criterion === selectedCriterion)
                        if (!selectedCheck) return null
                        
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700">
                              <strong>Assessment:</strong> {selectedCheck.feedback}
                            </p>
                            {selectedCheck.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">Improvement Suggestions:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedCheck.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-sm text-blue-700">
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Overall Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Curation Recommendations
                      </h4>
                      <div className="space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <div key={idx} className="text-sm text-gray-700 leading-relaxed">
                            {rec.startsWith('OVERALL:') ? (
                              <div className="font-medium text-gray-800 mb-2">{rec}</div>
                            ) : rec.startsWith('  •') ? (
                              <div className="ml-4 text-gray-600">{rec}</div>
                            ) : (
                              <div className="font-medium text-gray-700 mt-2">{rec}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Summary */}
      {(needsReview > 0 || averageScore < 75) && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Quality Curation Required</h3>
                <p className="text-sm text-orange-700 mt-1">
                  This quiz needs additional curation to meet IELTS excellence standards. 
                  Use the &ldquo;Unfair Advantage&rdquo; framework to review and improve flagged questions 
                  before publishing to ensure students receive examiner-quality content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}