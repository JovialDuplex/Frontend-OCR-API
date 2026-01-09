import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import  {useState, useRef} from "react";
import {Modal, Button} from "react-bootstrap";
import OutputText from "./components/outputText";

function App() {
  const [file, setFile] = useState(null);
  const [urlFile, setUrlFile] = useState("");
  const [showText, setShowText] = useState(false);
  const [outputText, setOutputText] = useState("");

  const inputRef = useRef();

  const openFilePicker = ()=>inputRef.current.click();
  const selectFile = (event)=>{
    const myfile = event.target.files[0];
    if(myfile) {
      if (myfile.type.startsWith("image/")) {
        setFile(myfile);
        const url = URL.createObjectURL(myfile);
        setUrlFile(url);
      }
      else {
        alert("Please select an Image file");
      }
    } else {
      alert("Please Select one file");
    }
  };

  const removeSelectFile = ()=>{setFile(null); setUrlFile("");};

  const sendFileToAPI = async()=>{

  };

  return (
      <div className="App">
        <div className="h-100 main-container container">
          <div className="upload-block position-relative p-1">
            <input type="file" ref={inputRef} onChange={selectFile} accept="image/*" style={{display: "none"}}/>
            {urlFile ? (
                <>
                <img src={urlFile} alt={"upload image"} width={"100%"} height={"100%"} className="position-absolute start-0 top-0"/>
                <button onClick={removeSelectFile} className="btn btn-dark position-absolute end-0 top-0 m-2"><i className="fas fa-close"></i></button>
                </>
            ): (
                <button id="upload-btn" onClick={openFilePicker} className="btn btn-secondary h-100 w-100">
                  {/*<span class="fas fa-upload"></span> <br/><br/> */}
                  <h1 className="fw-bold text-capitalize"> Click Here for Upload Your Image</h1>
                </button>
            )}


          </div>

          <div className="arrow-block d-flex align-items-center justify-content-center">
            <span className="fas fa-arrow-right"></span>
          </div>
          <div className="result-block d-flex flex-column gap-2">
            <div className="image-result bg-light flex-grow-1 rounded-3"></div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-success btn-success fw-bold"> Download Image <span
                  className="text-light fas fa-download"></span>
              </button>

              <Modal size={"xl"} className="position-fixed top-50 start-50 translate-middle" show={showText} onHide={()=>setShowText(false)}>
                <Modal.Header closeButton={true}>
                  <Modal.Title> Output Text </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{height: 500}} className="d-flex align-items-center justify-content-center">
                  <textarea className="h-100 w-100" value={outputText} onChange={(event)=>setOutputText(event.target.value)}/>
                </Modal.Body>

                <Modal.Footer className="d-flex align-items-center justify-content-between">
                    <Button className="flex-grow-1 fw-bold" variant={"success"}>Copy Output Text</Button>
                    <Button className="flex-grow-1 fw-bold" variant={"dark"} onClick={()=>setShowText(false)}> Close </Button>
                </Modal.Footer>
              </Modal>

              <button className="btn btn-primary fw-bold" disabled={outputText === "" ? true : false} onClick={()=>setShowText(true)}> Show Output Text</button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
