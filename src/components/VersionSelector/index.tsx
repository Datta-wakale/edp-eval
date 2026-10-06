import React, { useState} from 'react'

const versions = {
  v1: 'Old API documentation',
  v2: 'Current API documentation',
  v3: 'Latest API documentation',
};

export default function VersionSelector(){
    const [version, setVersion] = useState('v3');

    return(
            <div>
                <h3>Api Version Documentation</h3>
                <select value={version}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>)=>setVersion(event.target.value)}>
                    <option value='v1'>V1</option>
                    <option value='v2'>V2</option>
                    <option value='v3'>V3</option>
                </select>
              {
                 version === 'v3' ? (<p>This version support Beta features.</p>) 
                                  : (<p>This Version does not support any beta features</p>)
              }
            </div>
    )
}