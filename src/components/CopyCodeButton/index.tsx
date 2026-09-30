import { useState } from "react";

type CopyCodeCommands = {
    command : string;
}

export default function CopyCodeButton({command}: CopyCodeCommands){

    const [copied, setCopied] = useState<Boolean>(false);

    const handleCopy = async()=> {
           await navigator.clipboard.writeText(command); 
           setCopied(true);

           // Reset the copied state after 2.5 seconds
              setTimeout(()=> {
                setCopied(false);
              },2500);    
    }

    return(
        <div>
            <code>{command}</code>
            <button onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    )
}