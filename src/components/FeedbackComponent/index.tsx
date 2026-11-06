import { useState} from 'react'

type Feedback = {
   status: "yes" | "No" | null; 
}

export default function FeedbackComponent(){

    const [feedback,setFeedback] = useState<Feedback>(null);

    return (
        <div>
            
        </div>
    )
}