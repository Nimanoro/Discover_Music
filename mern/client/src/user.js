
const User = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('newest');
    const playlistsPerPage = 16;
    const [showPopup, setShowPopup] = useState(false); 
    const API_URL = process.env.REACT_APP_API_URI;
    
    return (< div> Nima is a bit du
    mb 
    </div>)
}
export default User;