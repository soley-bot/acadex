/**
 * Security Audit Dashboard Component
 * Comprehensive security assessment interface
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShieldCheckIcon, 
  AlertTriangleIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  RefreshCwIcon,
  AwardIcon,
  TrendingUpIcon,
  FileTextIcon,
  BugIcon
} from 'lucide-react'
import { securityAuditor, SecurityAuditReport, SecurityAuditItem } from '@/lib/security-auditor'
import { penetrationTester } from '@/lib/penetration-tester'

interface SecurityAuditDashboardProps {
  className?: string
}

const SecurityAuditDashboard: React.FC<SecurityAuditDashboardProps> = ({ className = '' }) => {
  const [auditReport, setAuditReport] = useState<SecurityAuditReport | null>(null)
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null)
  const [selectedView, setSelectedView] = useState('overview')

  // Run security audit
  const runSecurityAudit = async () => {
    setIsRunningAudit(true)
    try {
      const report = await securityAuditor.runSecurityAudit('Security Dashboard')
      setAuditReport(report)
      setLastAuditTime(new Date())
    } catch (error) {
      console.error('Security audit failed:', error)
    } finally {
      setIsRunningAudit(false)
    }
  }

  // Run penetration test only
  const runPenetrationTest = async () => {
    setIsRunningAudit(true)
    try {
      const report = await penetrationTester.runPenetrationTests()
      console.log('Penetration test completed:', report)
    } catch (error) {
      console.error('Penetration test failed:', error)
    } finally {
      setIsRunningAudit(false)
    }
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircleIcon className="h-4 w-4 text-red-600" />
      case 'in_progress': return <ClockIcon className="h-4 w-4 text-yellow-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  // Get certification badge color
  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-blue-100 text-blue-800'
      case 'standard': return 'bg-green-100 text-green-800'
      case 'basic': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    // Auto-run audit on component mount
    runSecurityAudit()
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Audit Dashboard</h2>
          <p className="text-gray-600">Comprehensive security assessment and monitoring</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={runPenetrationTest}
            disabled={isRunningAudit}
            variant="outline"
          >
            {isRunningAudit ? <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" /> : <BugIcon className="h-4 w-4 mr-2" />}
            Penetration Test
          </Button>
          <Button 
            onClick={runSecurityAudit}
            disabled={isRunningAudit}
          >
            {isRunningAudit ? <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" /> : <PlayIcon className="h-4 w-4 mr-2" />}
            Run Full Audit
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isRunningAudit && (
        <Alert>
          <RefreshCwIcon className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Running comprehensive security audit... This may take a few minutes.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      {auditReport && (
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          {['overview', 'audit-items', 'penetration', 'recommendations'].map((view) => (
            <Button
              key={view}
              variant={selectedView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {auditReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {auditReport.summary.complianceScore}%
                </div>
                <TrendingUpIcon className={`h-4 w-4 ${auditReport.summary.complianceScore >= 80 ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${auditReport.summary.complianceScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Certification Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AwardIcon className="h-5 w-5 text-purple-600" />
                <Badge className={getCertificationColor(auditReport.certificationLevel)}>
                  {auditReport.certificationLevel.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Next audit: {auditReport.nextAuditDate.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${auditReport.summary.criticalIssues === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {auditReport.summary.criticalIssues}
                </div>
                {auditReport.summary.criticalIssues === 0 ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {auditReport.summary.highIssues} high priority issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tests Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {auditReport.summary.completed}/{auditReport.summary.totalItems}
                </div>
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {auditReport.summary.failed} failed tests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Views */}
      {auditReport && selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Security Categories</CardTitle>
              <CardDescription>Compliance score by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(auditReport.categories).map(([category, stats]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stats.complianceScore}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.complianceScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.completed}/{stats.totalItems} completed
                    {stats.failed > 0 && `, ${stats.failed} failed`}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Audit Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
              <CardDescription>
                Audit ID: {auditReport.auditId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Auditor</div>
                  <div className="text-gray-600">{auditReport.auditor}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Version</div>
                  <div className="text-gray-600">{auditReport.version}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Timestamp</div>
                  <div className="text-gray-600">
                    {auditReport.timestamp.toLocaleDateString()} {auditReport.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Next Audit</div>
                  <div className="text-gray-600">
                    {auditReport.nextAuditDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Items View */}
      {auditReport && selectedView === 'audit-items' && (
        <div className="space-y-4">
          {auditReport.auditItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge className={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.category.replace('_', ' ')}
                  </div>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              {(item.findings?.length || item.recommendations?.length) && (
                <CardContent className="space-y-3">
                  {item.findings && item.findings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Findings:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {item.findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <XCircleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.recommendations && item.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Recommendations:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {item.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.completedAt && (
                    <div className="text-xs text-gray-500">
                      Completed: {item.completedAt.toLocaleDateString()} {item.completedAt.toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Penetration Test View */}
      {auditReport && selectedView === 'penetration' && auditReport.penetrationTestReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overall Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={
                  auditReport.penetrationTestReport.overallStatus === 'secure' ? 'bg-green-100 text-green-800' :
                  auditReport.penetrationTestReport.overallStatus === 'moderate_risk' ? 'bg-yellow-100 text-yellow-800' :
                  auditReport.penetrationTestReport.overallStatus === 'high_risk' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }>
                  {auditReport.penetrationTestReport.overallStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {auditReport.penetrationTestReport.riskScore}/100
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  {auditReport.penetrationTestReport.summary.vulnerabilitiesFound}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Penetration Test Results</CardTitle>
              <CardDescription>
                {auditReport.penetrationTestReport.results.length} tests executed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditReport.penetrationTestReport.results.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {result.passed ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.testName}</div>
                        <div className="text-sm text-gray-600">{result.details}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.severity}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {result.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations View */}
      {auditReport && selectedView === 'recommendations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileTextIcon className="h-5 w-5" />
                <span>Security Recommendations</span>
              </CardTitle>
              <CardDescription>
                Prioritized actions to improve security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditReport.recommendations.map((recommendation, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {auditReport.summary.criticalIssues > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical issues detected!</strong> Address these immediately to improve security posture.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Last Audit Time */}
      {lastAuditTime && (
        <div className="text-center text-sm text-gray-500">
          Last audit completed: {lastAuditTime.toLocaleDateString()} at {lastAuditTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default SecurityAuditDashboard
