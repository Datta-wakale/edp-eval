import { useState} from "react"

type FAQProps = {
    question: string;
    answer: string;
}

export default function FAQ({ question, answer } : FAQProps){

    const [open, setOpen] = useState<Boolean>(false);
    return(
        <div>
            <h3>FAQ List </h3>
            <button onClick={()=> setOpen(!open)}>
                {open? "--" : "+"} {question}
            </button>
           {open && <p>{answer}</p>}
        </div>
    )
}