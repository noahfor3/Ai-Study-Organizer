"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPassword() {
  console.log("RESET PAGE LOADED")
  const router = useRouter()
  const sp = useSearchParams()
  const type = sp.get("type") // must be "recovery"
  const [p1, setP1] = useState("")
  const [p2, setP2] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (type !== "recovery") setErr("Invalid or expired reset link.")
  }, [type])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null)
    if (p1 !== p2) return setErr("Passwords do not match.")
    if (p1.length < 6) return setErr("Password must be at least 6 characters.")

    const { error } = await sb.auth.updateUser({ password: p1 })
    if (error) setErr(error.message)
    else {
      setMsg("Password updated. Redirecting to login…")
      setTimeout(()=>router.push("/"), 1500)
    }
  }

  return (
    <main style={{maxWidth:420, margin:"40px auto", fontFamily:"sans-serif"}}>
      <h1>Reset Password</h1>
      <form onSubmit={onSubmit} style={{display:"grid", gap:8, marginTop:12}}>
        <input
          type="password"
          placeholder="new password"
          value={p1}
          onChange={e=>setP1(e.target.value)}
        />
        <input
          type="password"
          placeholder="confirm password"
          value={p2}
          onChange={e=>setP2(e.target.value)}
        />
        <button type="submit">Set new password</button>
      </form>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      {msg && <p style={{color:"seagreen"}}>{msg}</p>}
    </main>
  )
}
