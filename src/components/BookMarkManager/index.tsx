import {useState , useEffect} from 'react'

const storage_key = "documentation_bookmark"
const initialBookMarks:any = [];

export default function BookMarkManager(){

  const [bookmarks, setBookmarks] = useState(initialBookMarks);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(()=> {

        try {
            const savedBookMarks = localStorage.getItem('storage_key');
        } catch (error) {
            
        }
    })

}