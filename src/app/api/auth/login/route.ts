import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

type ReqBody = {
  identifier?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const raw = (body.identifier || "").trim();
    const password = body.password || "";

    if (!raw || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    let emailToUse: string;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    if (isEmail) {
      // Email login
      emailToUse = raw.toLowerCase();
      console.log("[auth/login] Login using email:", emailToUse);
    } else {
      // Username login
      const inputName = raw.trim().toLowerCase();
      console.log("[auth/login] Checking username:", inputName);

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email, username")
        .filter("username", "ilike", `%${inputName}%`)
        .maybeSingle();

      console.log("[auth/login] Profile lookup result:", profile, profileError);

      if (profileError || !profile) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
      }

      if (profile.email) {
        emailToUse = profile.email;
      } else {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        if (userError || !userData?.user?.email) {
          console.warn("[auth/login] Failed to fetch user email", userError);
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        emailToUse = userData.user.email;
      }
    }

    console.log("[auth/login] Attempting sign in for:", emailToUse);

    const { data, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (signInError) {
      console.warn("[auth/login] signInWithPassword failed:", signInError.message);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    console.log("[auth/login] Login success for:", emailToUse);
    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err: any) {
    console.error("[auth/login] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
