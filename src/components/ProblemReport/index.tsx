import {useState} from 'react'

type ProblemReportsProps ={
    title: string;
}

export default function ProblemReport({title="Something went wrong on this page,report the problem"} : ProblemReportsProps){

    const [open, setOpen] = useState<boolean>(false);
    const [formdata, setFormData] = useState({
        problemType: '',
        description: ''
    });
    const [submitted, setSubmitted] = useState<boolean>(false);

    const ProblemCollect =(event: React.ChangeEvent<HTMLSelectElement>)=> {

        setFormData({
            ...formdata,
            problemType : event.target.value
        })
    }

    const submitReport = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!formdata.problemType.trim() || !formdata.description.trim()){
            return alert("all fields are required");
        }
        const reportData = {
            problemType: formdata.problemType,
            description: formdata.description,
        }
        console.log("Report submitted:", reportData);
        setFormData({
            problemType: '',
            description: ''
        })
    }
    
    return(
            <div>
                <h3>{title}</h3>
                <p>Report a problem</p>
                <button onClick={()=> setOpen(!open)}>{open ? 'Hide Form' : 'Show Form'}</button>
                {
                    open && (
                        <form onSubmit={submitReport}>
                            <div>
                                <label htmlFor="problemType">Problem Type:</label>
                                <select id="problemType" value={formdata.problemType} onChange= {ProblemCollect}>
                                    <option value="">Select a problem type</option>
                                    <option value="bug">Bug</option>
                                    <option value="broken links">Broken Links</option>
                                    <option value="page Rendering issue">Page Render Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description">Description:</label>
                                <textarea id="description" value={formdata.description} onChange={(e) => setFormData({...formdata, description: e.target.value})}></textarea>
                            </div>
                            <div>
                                <button type="button" onClick={()=> setOpen(false)}>Cancel</button>
                                <button type="submit">Submit Report</button>
                            </div>
                        </form>
                    )
                }
            </div>
    )
}