/**
 * Security Audit Admin Page
 * Comprehensive security assessment interface for administrators
 */

'use client'

import { Suspense } from 'react'
import SecurityAuditDashboard from '@/components/admin/SecurityAuditDashboard'
import { Container, Section } from '@/components/ui/Layout'
import { H1, BodyLG } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldCheckIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

// Loading component for security audit
const SecurityAuditLoading = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-center p-8">
      <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-3 text-lg text-gray-600">Loading Security Audit Dashboard...</span>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export default function SecurityAuditPage() {
  return (
    <Section className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <H1 className="text-gray-900">Security Audit Center</H1>
          </div>
          <BodyLG className="text-gray-600 max-w-3xl">
            Comprehensive security assessment and penetration testing for the Acadex platform. 
            Monitor security posture, run automated tests, and ensure compliance with security standards.
          </BodyLG>
        </div>

        {/* Security Notice */}
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Security Advisory:</strong> This audit system provides comprehensive security assessment. 
            Results should be reviewed regularly and critical issues addressed immediately. 
            All audit activities are logged for compliance purposes.
          </AlertDescription>
        </Alert>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Automated Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyLG className="text-blue-700">
                Comprehensive security tests including input validation, 
                authentication security, and injection prevention.
              </BodyLG>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">Penetration Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyLG className="text-purple-700">
                Advanced penetration testing to identify vulnerabilities 
                and assess security controls effectiveness.
              </BodyLG>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Compliance Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyLG className="text-green-700">
                Continuous compliance assessment with security standards 
                and best practices for educational platforms.
              </BodyLG>
            </CardContent>
          </Card>
        </div>

        {/* Main Security Audit Dashboard */}
        <Suspense fallback={<SecurityAuditLoading />}>
          <SecurityAuditDashboard className="mt-8" />
        </Suspense>

        {/* Security Resources */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Security Documentation</h3>
              <p className="text-sm text-gray-600">
                Comprehensive security policies, procedures, and incident response guidelines.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Emergency Contacts</h3>
              <p className="text-sm text-gray-600">
                Critical security incident reporting and emergency response procedures.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This security audit system is designed to provide comprehensive 
            assessment of the Acadex platform security. Regular audits are recommended to maintain 
            optimal security posture. All audit results are confidential and should be handled 
            according to security protocols.
          </p>
        </div>
      </Container>
    </Section>
  )
}
