import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import  {useState, useRef} from "react";
import {Modal, Button} from "react-bootstrap";
import Spinner from "./components/spinner";
import JSZIP from "jszip";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [urlFile, setUrlFile] = useState("");
  const [showText, setShowText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // state for get a url of image
  const [ocrResultUrl, setOcrResultUrl] = useState("");
  const [imageResultUrl, setImageResultUrl] = useState("");
  const [outputText, setOutputText] = useState("");

  const outputInfo = [];
  // JSON.parse(outputText);
  var i = 0;

  for(i; i<100; i++){
    outputInfo.push({
      x: 2*i,
      y: 15*i,
      w: 100*i,
      h: 200*i,
      confidence: i/100,
      text: `Jovial${i}`
    })
  }

  // setOutputText(JSON.stringify(outputInfo));

  const inputRef = useRef();

  const openFilePicker = ()=>inputRef.current.click();
  const selectFile = (event)=>{
    const myfile = event.target.files[0];
    if(myfile) {
      if (myfile.type.startsWith("image/")) {
        setFile(myfile);
        const url = URL.createObjectURL(myfile);
        // console.log(file);
        setUrlFile(url);
        console.log(urlFile);

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
    try {
      setIsLoading(true);
      const response = await axios.post("https://8000-01kfy0asv24j2kkd0xxs48725n.cloudspaces.litng.ai/uploadfile", {file: file}, {
        responseType: "blob",
        headers: {
          "Content-Type" : "multipart/form-data"
        }
      });
      const zipFile = new JSZIP();

      const data = await response.data;

      zipFile.loadAsync(data).then(zip=>{
        zip.file("ocr-result-image.png").async("arraybuffer").then(content=>{
          const blob = new Blob([content], {type: "image/png"});
          const urlresult = URL.createObjectURL(blob)
          setOcrResultUrl(urlresult);
        }).catch(error=>{
          console.log("An error has occured when the reading of ocr-result-image.png: ", error);
        });

        zip.file("data.json").async("string").then(content=>{
          setOutputText(content);
        }).catch(error=>{
          console.log("An error has occured when reading data.json : ",error);
        });

        zip.file("inpaint-result-image.png").async("arraybuffer").then(content=>{
          const blob = new Blob([content], {type: "image/png"});
          const urlresult = URL.createObjectURL(blob);
          setImageResultUrl(urlresult);
        }).catch(error=>{
          console.log("An error has occured when the reading of inpaint-result-image.png: ", error)
        })


      });
    }
    catch (error) {
      setIsLoading(false);
    } 
    finally {
      console.log("finish to loading data");
      setIsLoading(false);
    }

  };

  const downloadImage = (imageUrl, acronyme)=>{
    alert(imageUrl);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${acronyme}Result-${Date.now()}.png`
    link.click();

  };

  return (
      <div className="App">
        <div className="h-100 main-container container-fluid">
          <div className="upload-block p-1">
            <input type="file" ref={inputRef} onChange={selectFile} accept="image/*" style={{display: "none"}}/>
            {urlFile ? (
              <div className="h-100 w-100 d-flex flex-column gap-2" >
                <h2 className="text-center text-uppercase fw-bold"> Preview Image </h2>
                  <div className="position-relative flex-grow-1 rounded-3" style={{boxShadow: "0 0 10px #000"}}>
                    <img src={urlFile} alt={"Upload"} width={"100%"} height={"100%"} className="position-absolute start-0 top-0"/>
                    <button onClick={removeSelectFile} className="btn btn-dark position-absolute end-0 top-0 m-2"><i className="fas fa-close"></i></button>
                  </div>
                  <Button variant={"primary"} className={"fw-bold"} onClick={sendFileToAPI}> Erase Text</Button>

                </div>
            ): (
                <button id="upload-btn" onClick={openFilePicker} className="btn btn-secondary h-100 w-100">
                  {/*<span class="fas fa-upload"></span> <br/><br/> */}
                  <h1 className="fw-bold text-capitalize"> Click Here for Upload Your Image</h1>
                </button>
            )}


          </div>
          {/* ocr result ----------------------------------------------- */}
          <div className="arrow-block ocr-arrow">
            <span className="fas fa-arrow-right"></span>
          </div>
          
          <div className="ocr-result">
            <h2 className={"text-center text-uppercase fw-bold"}> ocr result</h2>
            <div className={"bg-light rounded-3 flex-grow-1 position-relative"}>
              {isLoading && <Spinner />}
              {(ocrResultUrl !== "") && <img src={ocrResultUrl} className={"position-absolute start-0 top-0 h-100 w-100"} alt="OCR Result" />}
            </div>
            <Button className={"mt-2 fw-bold"} onClick={()=>downloadImage(ocrResultUrl, "ocr")} disabled={ocrResultUrl !== "" ? false : true}> Download OCR Result <span className={"fas fa-download"}></span></Button>
          </div>

          {/* final result --------------------------------------------------- */}
          <div className="arrow-block d-flex align-items-center justify-content-center">
            <span className="fas fa-arrow-right"></span>
          </div>
          
          <div className="result-block d-flex flex-column gap-2">
            <h2 className="text-center text-uppercase fw-bold"> Image Result </h2>
            <div className="image-result bg-light flex-grow-1 rounded-3 position-relative">
              {/* image result block */}
              {isLoading && <Spinner/>}
              {(imageResultUrl !== "") && <img src={imageResultUrl} className={"h-100 w-100 position-absolute start-0 top-0"} alt={"Final Result"} />}
            </div>
            <div className="d-flex justify-content-between">
              <button onClick={()=>downloadImage(imageResultUrl, "image")} className="btn btn-success btn-success fw-bold" disabled={imageResultUrl !== "" ? false : true}> Download Image <span
                  className="text-light fas fa-download"></span>
              </button>

              <Modal size={"xl"} className="position-fixed top-50 start-50 translate-middle" show={showText} onHide={()=>setShowText(false)}>
                <Modal.Header closeButton={true}>
                  <Modal.Title> Output Information </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{height: 500}} className="p-0 overflow-y-scroll d-flex flex-column gap-2">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th className={"text-center"}>Text</th>
                        <th className={'text-center'}>Position (x,y)</th>
                        <th className={'text-center'}>Size Box (w, h) </th>
                        <th className={'text-center'}> Ocr Presion </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(outputText !== "") && (JSON.parse(outputText).map((value, index)=>(
                        <tr key={index}>
                          <td className={"text-center"}>{value.text}</td>
                          <td className={'text-center'}>({value.x}, {value.y})</td>
                          <td className={'text-center'}>({value.w}, {value.h})</td>
                          <td className={'text-center'}>{(value.confidence * 100).toFixed(2)} % </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                  {/* <textarea id="output-textarea" className="h-100 w-100" value={outputText} onChange={(event)=>setOutputText(event.target.value)} disabled/>
                  <Button className="flex-grow-1 fw-bold" variant={"success"}>Copy Output Text <span className='fas fa-copy'></span></Button> */}
                </Modal.Body>

                {/* ocr-result on mobile ------------------------------------ */}
                <div className={"ocr-result-mobile"}>
                  <Modal.Header>
                    <Modal.Title> OCR Result </Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{height: 500}} className={"d-flex flex-column gap-2"}>
                    <div className={"ocr-image-mobile rounded-3 h-100 w-100 position-relative"}>
                      {isLoading && <Spinner/>}
                      {(ocrResultUrl !== "") && <img src={ocrResultUrl} className={"position-absolute h-100 w-100 start-0 top-0"} alt="OCR Result" />}
                    </div>
                    <button className={"btn btn-success fw-bold"} onClick={()=>downloadImage(ocrResultUrl, "ocr")} disabled={ocrResultUrl!=="" ? false : true}>Download OCR Result <span className={"fas fa-download"}></span></button>
                  </Modal.Body>
                </div>

              </Modal>

              <button className="btn btn-primary fw-bold" disabled={outputText === "" ? true : false} onClick={()=>setShowText(true)}> Show Outputs</button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
