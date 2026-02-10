import "./ListOfSearch.css";

const ListOfSearch = ({ params }) => {

    const getLatestAvailableDate = () => {
        const now = new Date();
        const day = now.getDate();
        let month = now.getMonth() + 1; // getMonth() is 0-indexed, so +1 for 1-12
        let year = now.getFullYear();

        // Rule: If before the 15th, show previous month
        if (day < 15) {
            month -= 1;
        }

        // Handle Year wrap-around (If it was Jan (1) and we subtract, go to Dec (12) last year)
        if (month === 0) {
            month = 12;
            year -= 1;
        }

        return `${month}-${year}`;
    };

    const handelClick = (id) => {
        const dateParam = getLatestAvailableDate();
        // Constructing the URL: /MFinfo?id=...&d=M-YYYY
        window.open(`${window.location.origin}/MFinfo?id=${id}&d=${dateParam}`);
    }

    return (
        <>
            {params.filteredFunds && params.filteredFunds.map((values, idx) => (
                <div 
                    key={values.ISIN || idx} 
                    className="results" 
                    onClick={() => handelClick(values.ISIN)}
                >
                    <p>{values.Scheme}</p>
                </div>
            ))}
        </>
    );
}

export default ListOfSearch;