import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth, createServiceClient } from "@/lib/api-auth"

export const GET = withAdminAuth(async (request, user) => {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("categories").select("*").limit(5)
  return NextResponse.json({ data, error })
})
