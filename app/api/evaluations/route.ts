import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      ratings,
      comments,
      attendeeName = "",
      affiliatedSchool = "Colegio San Agustin - Bacolod",
      attendeeRole = "Student",
      generalComment = "",
      averageScore = 0,
    } = body;

    const basePayload = {
      event_name: "Dare to be",
      school: affiliatedSchool || "Colegio San Agustin - Bacolod",
      attendee_role: attendeeRole,
      success_rating: ratings?.[0] ?? null,
      success_feedback: comments?.[0] || null,
      organized_rating: ratings?.[1] ?? null,
      organized_feedback: comments?.[1] || null,
      venue_rating: ratings?.[2] ?? null,
      venue_feedback: comments?.[2] || null,
      goal_rating: ratings?.[3] ?? null,
      goal_feedback: comments?.[3] || null,
      punctuality_rating: ratings?.[4] ?? null,
      punctuality_feedback: comments?.[4] || null,
      average_score: averageScore,
      general_comment: generalComment || null,
      metadata: {
        attendee_name: attendeeName || null,
        affiliated_school: affiliatedSchool || "Colegio San Agustin - Bacolod",
      },
    };

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: true,
        isConfigured: false,
        message:
          "Supabase environment variables are not set in .env.local. Submission handled in demo mode.",
        savedData: basePayload,
      });
    }

    // Attempt insert with specific columns if they exist
    const fullPayload = {
      ...basePayload,
      attendee_name: attendeeName || null,
      affiliated_school: affiliatedSchool || "Colegio San Agustin - Bacolod",
    };

    let result = await supabase
      .from("event_evaluations")
      .insert([fullPayload])
      .select()
      .single();

    // If columns don't exist yet in table, fallback to basePayload where data is safely in school & metadata
    if (result.error && result.error.message.includes("column")) {
      result = await supabase
        .from("event_evaluations")
        .insert([basePayload])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Supabase insert error:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          message:
            "Failed to save evaluation to Supabase. Check that you ran supabase/schema.sql.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isConfigured: true,
      id: result.data?.id,
      message: "Successfully recorded evaluation in Supabase database!",
      data: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("API error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const configured = isSupabaseConfigured();

  if (!configured || !supabase) {
    return NextResponse.json({
      isConfigured: false,
      message: "Supabase not configured in .env.local",
      totalResponses: 0,
      records: [],
    });
  }

  try {
    const { data, error, count } = await supabase
      .from("event_evaluations")
      .select("*", { count: "exact" })
      .eq("event_name", "Dare to be")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        isConfigured: true,
        error: error.message,
        records: [],
      });
    }

    return NextResponse.json({
      isConfigured: true,
      totalResponses: count ?? data?.length ?? 0,
      records: data ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching stats";
    return NextResponse.json({ isConfigured: true, error: message, records: [] });
  }
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json(
      { success: false, message: "Supabase is not configured" },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      const { error } = await supabase
        .from("event_evaluations")
        .delete()
        .eq("event_name", "Dare to be");

      if (error) {
        console.error("Supabase clear all error:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All evaluations deleted successfully",
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Submission ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("event_evaluations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evaluation deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

