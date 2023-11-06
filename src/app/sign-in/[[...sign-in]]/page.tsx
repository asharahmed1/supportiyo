import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Supportiyo - Sign In"
}

import { SignIn } from "@clerk/nextjs"

export default function SignInPage(){
    return(
        <div className="flex h-screen items-center justify-center">
             <SignIn appearance={{variables: {colorPrimary: "#001346"}}} />
        </div>
    )
}