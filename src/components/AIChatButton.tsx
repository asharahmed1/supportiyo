import { useState } from "react";
import AIChatBox from "./AIChatBox";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

export default function AIChatButton(){
    const [chatBoxOpen, setChatBoxOpen] = useState(false);

    return(
        <>
        <Button onClick={()=>setChatBoxOpen(true)}>
            <Bot size={15} className="mr-1"/>
            Chat
        </Button>
        <AIChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
        </>
    )
}
