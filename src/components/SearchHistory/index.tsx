import { useEffect, useState } from "react";

export default function SearchHistory(){

    const [search, setSearch] = useState('');
    const [searchHistory,setSearchHistory] = useState<string[]>([]);

    useEffect(()=> {
        const saved = localStorage.getItem("seacrh-history");
        if(saved){
            setSearchHistory(JSON.parse(saved));
        }
    }, [])
    const handleSearch = ()=> {
        if(!search.trim()){
            return;
        }

        const updated = [
            search,
            ...searchHistory.filter((item)=> item !== search)
        ].slice(0,5);
        setSearchHistory(updated);
        localStorage.setItem("search-history", JSON.stringify(updated));
        setSearch('');
    }

    return(
        <div>
            <input type="text"
                value={search}
                onChange={(e)=> setSearch(e.target.value)} 
                placeholder="search ..."          
            />
            <button onClick={handleSearch}>search</button>
            <ul>
                {
                    searchHistory.map((item)=> {
                        return(
                            <li key={item}>{item}</li>
                        )
                    })
                }
            </ul>
        </div>
    )
}