import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Supportiyo - Sign Up"
}

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage(){
    return(
        <div className="flex h-screen items-center justify-center">
             <SignUp appearance={{variables: {colorPrimary: "#001346"}}} />
        </div>
    )
}