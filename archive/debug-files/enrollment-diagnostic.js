// Enrollment count diagnostic script
const { createClient } = require('@supabase/supabase-js')

// Load environment variables manually
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEnrollmentConsistency() {
  try {
    console.log('🔍 Checking enrollment count consistency...\n')

    // Get all courses with their student_count
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, student_count')
      .order('title')

    if (coursesError) {
      throw coursesError
    }

    // Get actual enrollment counts
    const { data: enrollmentCounts, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_id')

    if (enrollmentsError) {
      throw enrollmentsError
    }

    // Count enrollments per course
    const actualCounts = {}
    enrollmentCounts.forEach(enrollment => {
      if (actualCounts[enrollment.course_id]) {
        actualCounts[enrollment.course_id]++
      } else {
        actualCounts[enrollment.course_id] = 1
      }
    })

    console.log('📊 Course Enrollment Analysis:')
    console.log('='.repeat(70))

    let inconsistentCount = 0
    let totalCalculatedStudents = 0
    let totalStoredStudents = 0

    for (const course of courses) {
      const actualCount = actualCounts[course.id] || 0
      const storedCount = course.student_count || 0
      const isConsistent = actualCount === storedCount

      totalCalculatedStudents += actualCount
      totalStoredStudents += storedCount

      if (!isConsistent) {
        inconsistentCount++
        console.log(`❌ ${course.title}`)
        console.log(`   Stored: ${storedCount}, Actual: ${actualCount}`)
      } else {
        console.log(`✅ ${course.title}: ${storedCount} students`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📈 Summary:')
    console.log(`Total courses checked: ${courses.length}`)
    console.log(`Consistent courses: ${courses.length - inconsistentCount}`)
    console.log(`Inconsistent courses: ${inconsistentCount}`)
    console.log(`Total students (calculated): ${totalCalculatedStudents}`)
    console.log(`Total students (stored): ${totalStoredStudents}`)

    if (inconsistentCount > 0) {
      console.log('\n⚠️  Found inconsistencies! Running fix...')
      
      // Fix inconsistencies by updating student_count to match actual enrollments
      for (const course of courses) {
        const actualCount = actualCounts[course.id] || 0
        const storedCount = course.student_count || 0
        
        if (actualCount !== storedCount) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({ student_count: actualCount })
            .eq('id', course.id)
          
          if (updateError) {
            console.log(`❌ Failed to update ${course.title}: ${updateError.message}`)
          } else {
            console.log(`✅ Fixed ${course.title}: ${storedCount} → ${actualCount}`)
          }
        }
      }
    } else {
      console.log('\n✅ All enrollment counts are consistent!')
    }

  } catch (error) {
    console.error('❌ Error checking enrollment consistency:', error)
  }
}

// Run the diagnostic
checkEnrollmentConsistency()
