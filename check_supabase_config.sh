#!/bin/bash

# ENVIRONMENT VARIABLES CHECK SCRIPT
# Run this to verify your Supabase configuration

echo "🔍 Checking Supabase Environment Variables..."
echo "============================================="

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "❌ .env.local file missing"
    exit 1
fi

# Check for required variables (without showing values for security)
echo ""
echo "📋 Required Environment Variables:"

if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL: Found"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL: Missing"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Found"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing"
fi

if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY: Found"
else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY: Missing"
fi

# Check URL format
echo ""
echo "🔗 URL Format Check:"
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'=' -f2)
if [[ $SUPABASE_URL == *"supabase.co"* ]]; then
    echo "✅ Supabase URL format looks correct"
else
    echo "⚠️  Supabase URL format might be incorrect"
fi

# Check key lengths (Supabase keys have specific patterns)
echo ""
echo "🔑 Key Format Check:"
ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d'=' -f2)
SERVICE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d'=' -f2)

if [[ ${#ANON_KEY} -gt 100 ]]; then
    echo "✅ Anon key length looks correct"
else
    echo "⚠️  Anon key might be too short"
fi

if [[ ${#SERVICE_KEY} -gt 100 ]]; then
    echo "✅ Service role key length looks correct"
else
    echo "⚠️  Service role key might be too short"
fi

echo ""
echo "🧪 Testing Supabase Connection..."
echo "================================="

# Test connection with curl (basic test)
SUPABASE_URL_CLEAN=$(echo $SUPABASE_URL | tr -d '"')
if command -v curl &> /dev/null; then
    echo "Testing connection to: $SUPABASE_URL_CLEAN"
    
    HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$SUPABASE_URL_CLEAN/rest/v1/" \
        -H "apikey: $(echo $ANON_KEY | tr -d '"')" \
        -H "Authorization: Bearer $(echo $ANON_KEY | tr -d '"')")
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "✅ Supabase connection successful"
    else
        echo "❌ Supabase connection failed (HTTP $HTTP_STATUS)"
    fi
else
    echo "⚠️  curl not available, skipping connection test"
fi

echo ""
echo "📝 RECOMMENDATIONS:"
echo "==================="
echo "1. Run the SQL diagnostic queries in your Supabase dashboard"
echo "2. Verify your admin user email is in the auth.users table"
echo "3. Check that your user has role='admin' in the public.users table"
echo "4. Ensure RLS policies allow service_role access"
echo "5. Try the browser debug script to test authentication flow"

echo ""
echo "🔧 If issues persist:"
echo "- Double-check your Supabase project dashboard"
echo "- Regenerate API keys if needed"
echo "- Verify database permissions and RLS policies"
