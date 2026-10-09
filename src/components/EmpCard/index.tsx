
type Employee = {
    fName: string,
    lName: string,
    phonNo: string,
    jobTitle: string,
    email: string
}

type EmpProps = {
    employees : Employee[]
}

export default function EmpCard({employees}:EmpProps){
    return(

          <div>
        <h3>Emp Card</h3>
       
            {
                employees.map((emp)=> {
                    return(
                        <div key={emp.email}>
                            <p>Name : {emp.fName} -- LastName : {emp.lName}</p>
                            <p>JobTitle : {emp.jobTitle} -- Ph : {emp.phonNo}</p>
                            <p>EmailId : {emp.email}</p>
                        </div>
                    )
                })
            }
        
    </div>
    )
  

}