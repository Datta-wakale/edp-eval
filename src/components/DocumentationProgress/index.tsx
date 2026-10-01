import React, {useEffect, useState} from 'react'

type Topic = {
    id: string;
    title:string;
}

type DocumentationProgressProps = {
    topics: Topic[]
}

export default function DocumentationProgress({topics} : DocumentationProgressProps){

    const [completedTopics, setCompletedTopics] = useState<String[]>([]);

    useEffect(()=> {
        const saved = localStorage.getItem("documentation-progress");
        if(saved){
            setCompletedTopics(JSON.parse(saved));
        }
    },[])
    const toggleTopic = (id : string)=> {

        let updated;
        if(completedTopics.includes(id)){
            updated = completedTopics.filter((topicId)=> topicId !== id);
        }
        else {
            updated = [...completedTopics, id]
        }
        setCompletedTopics(updated);
        localStorage.setItem("documentation-progress", JSON.stringify(updated));
    }

    const progress = topics.length === 0 ? 0 :
                Math.round((completedTopics.length/topics.length) * 100);
                console.log("progress ::37",progress);
    return(
        <div>
            <h3>Documentation Progress</h3>
            {topics.map((topic)=> (
                <label key={topic.id}>
                    <input type="checkbox" 
                        checked = {completedTopics.includes(topic.id)}
                        onChange={()=> toggleTopic(topic.id)}
                    />
                    {topic.title}
                </label>
            ))}
         <p>Progress : {progress}</p>
        </div>
    )
}