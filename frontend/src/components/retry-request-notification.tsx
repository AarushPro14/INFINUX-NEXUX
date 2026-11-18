"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RetryRequestNotification(){
 const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");
 async function retry(){setBusy(true);setError("");try{const response=await fetch("/api/staff-request/notify",{method:"POST"});const data=await response.json();if(!response.ok){setError(data.error??"The owner notification could not be delivered.");return}router.refresh()}catch{setError("Connection issue. Please try again.")}finally{setBusy(false)}}
 return <div className="retry-notice"><p><Mail size={15}/> {error||"The request is saved, but its email notification has not been delivered."}</p><button type="button" onClick={retry} disabled={busy}>{busy?"Sending…":"Retry email"}</button></div>;
}
