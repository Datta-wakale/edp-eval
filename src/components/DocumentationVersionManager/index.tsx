import { useMemo, useState, version } from "react";

const versions = [
  {
    id: 1,
    name: "v3.0",
    status: "active",
    releaseDate: "2026-08-10",
  },
  {
    id: 2,
    name: "v2.5",
    status: "active",
    releaseDate: "2026-03-15",
  },
  {
    id: 3,
    name: "v2.0",
    status: "deprecated",
    releaseDate: "2025-01-20",
  },
  {
    id: 4,
    name: "v1.5",
    status: "deprecated",
    releaseDate: "2024-06-10",
  },
];

// Business Logic

const getActiveVersions = (versions:any)=> {
    return versions.filter((version: any)=> version.status === "active");
}

//get latest active version
const getLatestActiveVersion = (versions:any) => {
  const activeVersions = getActiveVersions(versions);

  return activeVersions.reduce((latest:any, current:any) => {
    if(!latest) {
      return current;
    }

    return new Date(current.releaseDate) > new Date(latest.releaseDate)
      ? current
      : latest
  }, null);
};

const searchVersions = (versions:any, search:any) => {
  if (!search.trim()) {
    return versions;
  }

  return versions.filter((version:any) =>
    version.name.toLowerCase().includes(search.toLowerCase())
  );
};

// depreacated
const isDeprecated = (version : any)=> {
    return version?.status === "deprecated";  
}


// get version by id
const getVersionById = (versions: any, id: any)=>{
   return versions.find((version : any)=> version.id === Number(id)); 
}

// React Component

function DocumentationVersionManager() {
  const [selectedVersion, setSelectedVersion] = useState("");
  const [search, setSearch] = useState("");

  // Get active versions
  const activeVersions = useMemo(() => {
    return getActiveVersions(versions);
  }, []);

  // Get latest active version
  const latestActiveVersion = useMemo(() => {
    return getLatestActiveVersion(versions);
  }, []);

  // Search versions
  const filteredVersions = useMemo(() => {
    return searchVersions(versions, search);
  }, [search]);

  // Get selected version object
  const selectedVersionData = useMemo(() => {
    return getVersionById(versions, selectedVersion);
  }, [selectedVersion]);

  // Handle dropdown change
  const handleVersionChange = (versionId:any) => {
    const version = getVersionById(versions, versionId);

    if (!version) {
      setSelectedVersion("");
      return;
    }

    setSelectedVersion(versionId);
  };

  // Switch to latest 
 const handleSwitchToLatest = ()=> {
    if(latestActiveVersion){
        setSelectedVersion(String(latestActiveVersion.id))
    }
 }
  return (
    <div style={{ maxWidth: "500px", padding: "20px" }}>
      <h2>Documentation Versions</h2>

      {/* Search */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search version..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Active version count */}
      <p>
        Active versions: <strong>{activeVersions.length}</strong>
      </p>

      {/* Version dropdown */}
      <select
        value={selectedVersion}
        onChange={(e) => handleVersionChange(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
        }}
      >
        <option value="">Select version</option>

        {filteredVersions.map((version:any) => (
          <option key={version.id} value={version.id}>
            {version.name}
            {version.status === "deprecated" ? " (Deprecated)" : ""}
          </option>
        ))}
      </select>

      {/* No results */}
      {filteredVersions.length === 0 && (
        <p>No documentation version found.</p>
      )}

      {/* Selected version */}
      {selectedVersionData && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>{selectedVersionData.name}</h3>

          <p>
            Status:{" "}
            <strong>{selectedVersionData.status}</strong>
          </p>

          <p>
            Released: {selectedVersionData.releaseDate}
          </p>

          {/* Deprecated warning */}
          {isDeprecated(selectedVersionData) && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff3cd",
                borderRadius: "6px",
                marginTop: "10px",
              }}
            >
              <p>
                This documentation version is deprecated.
              </p>

              <p>
                We recommend using{" "}
                <strong>{latestActiveVersion?.name}</strong>
              </p>

              <button onClick={handleSwitchToLatest}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                }}>
                Switch to {latestActiveVersion?.name}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentationVersionManager;
