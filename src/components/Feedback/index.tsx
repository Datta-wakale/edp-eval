import { useState } from "react";

type status = "yes" | "no" | null;
export default function Feedback(){

    const [feedback, setFeedback] = useState<status>(null);

    return (
        <>
            {
                feedback === null && 
            }
        </>
    )
}