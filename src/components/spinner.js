import "./spinner.css";

const Spinner = ()=>{
    return (
        <div className={"d-flex align-items-center justify-content-center h-100 w-100 bg-transparent"}>
            <svg className="h-50 w-75">
                <circle cx={"50%"} cy={"50%"} r={"36%"}></circle>
            </svg>
        </div>
    )
};

export default Spinner;