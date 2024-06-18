import React, { useState,useEffect,useRef,useCallback } from 'react';
import {
  Container,
  Row,
  Col,Table,Button,Input,ButtonGroup
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import axios, { formToJSON } from 'axios';
import { useDropzone } from 'react-dropzone';

const Musicsview = ({mediatype=1,callbackprop}) => {

    const [musics,setmusics] = useState({});
    const iinit = useRef(false);
    const [isbulk,setisbulk] = useState(false);
    const [bulklist,setbulklist] = useState([]);

    useEffect(() => {
       if(iinit.current == false){
            fetchmusics(mediatype);
            iinit.current = true;
       }
    },[]);

    const fetchmusics = async (mediatp) => {
        var apistr = '/api/getAllFiles';
        if(mediatp == 2){
            apistr = '/api/getAllFiles?ftype=icover';
        }
        else if(mediatp == -1){
            apistr = '/api/getAllFiles?ftype=all';
        }
        var res = await axios.get(apistr);
      
        if(res.data.state == 'OK'){
            setmusics(res.data.ret);
            let nmusics = res.data.ret.filespath.length;
            let thelist = [];
            for(let i=0; i<nmusics; i++){
                thelist.push(false);
            }
            setbulklist(thelist);
        }

    }

    const fdeletefile = async (inputfile,iindex) => {

      const formData = new FormData();
      const formJson = Object.fromEntries(formData.entries());
      const data = formJson;
      data.selfile = inputfile;

        var apistr = '/api/delmufile';
        var res = await axios.post(apistr,data);
      
        if(res.data.state == 'success'){
           fetchmusics(mediatype);
        }
    }

    const fdeletefiles = async () => {

        var dellist = '';
        let nmusics = bulklist.length;
        for(let i=0; i<nmusics; i++){
            if(bulklist[i] == true){
              dellist += musics.filespath[i];
              dellist += ',';
            }
        }
        dellist = dellist.slice(0,-1);
        
        const formData = new FormData();
        const formJson = Object.fromEntries(formData.entries());
        const data = formJson;
        data.dellist = dellist;
        
        var apistr = '/api/delmufile';
        var res = await axios.post(apistr,data);
        
        if(res.data.state == 'success'){
            fetchmusics(mediatype);
        }
        
    }

    //For drop zone section
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const onDrop = useCallback((acceptedFiles) => {
        // Update the uploaded files state
        setUploadedFiles(acceptedFiles);
    
    },[]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true,
        accept: mediatype == 1?{
            'audio/mpeg':['.mp3'],
            'audio/wav': [".wav"],
        }:mediatype == -1?
        {
            'audio/mpeg':['.mp3'],
            'audio/wav': [".wav"],
            'image/png': ['.png','.jpeg']
        }:
        {
            'image/png': ['.png','.jpeg']
        }
    });

    const uploadmultiplefiles = async() => {

     const formData = new FormData();   

     uploadedFiles.map((item,index) => {
         return formData.append('musics'+index,item);
     });
     
     const formJson = Object.fromEntries(formData.entries());
     const data = formJson
    
     const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
     
      var res = await axios.post('/api/Music/multipleupload',data,config)
          if(res.data.result == 'success'){
              alert('upload successfully');
          }
          else {
             alert('error');
          }
          setUploadedFiles([]);
      
    };
    //====================

    const handleselectfile =(sindex,e) => {
        var tmpbluk = bulklist;
        tmpbluk[sindex] = !tmpbluk[sindex];
        setbulklist(tmpbluk);
    }

    const [ftypem,setftypem] = useState(1);

    return <Container style={{height:'70vh',overflowY: 'auto'}}> 

        {/* For File type select  */}
        {
            mediatype == -1&&
            <ButtonGroup>
                    <Button
                    color="primary"
                    outline
                    onClick={() => setftypem(1)}
                    active={ftypem === 1}
                    >
                      All
                    </Button>
                    <Button
                    color="primary"
                    outline
                    onClick={() => setftypem(2)}
                    active={ftypem === 2}
                    >
                       Music
                    </Button>

                    <Button
                    color="primary"
                    outline
                    onClick={() => setftypem(3)}
                    active={ftypem === 3}
                    >
                       Image
                    </Button>
            </ButtonGroup>
        }
        {/*======================= */}

        { /* drop zone   */}
        <Row style={{width:'100%',height:'10vh'}}>
            <div style={{width:'100%',height:'10vh'}} className="file-uploader" {...getRootProps()}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag and drop files here, or click to select files</p>
                )}
            </div>
        </Row>
        <Row>
            {
            uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                <h3>Selected Files:</h3>
                <ul>
                    {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                    ))}
                </ul>
                </div>
            )
            }
        </Row>
        {
            uploadedFiles.length > 0 && 
            <Button 
            onClick={()=>{uploadmultiplefiles()}}
            color='primary'
            > Upload 
            </Button>
        }
        { /* drop zone   */}

        <Row style={{width:'100%',height:'3vh'}}/>
        <Row>
            <Col xs='5'>
                รายการไฟล์ทั้งหมด: {musics.filesname != null?musics.filesname.length:'-'} ไฟล์
            </Col>
            <Col xs='4'>
               <Button
                onClick={()=>{setisbulk(!isbulk)}}
                color='primary'
               > 
                  {isbulk==true?'Back to single':'Bulk Del'}
               </Button>
            </Col>
            {
                isbulk==true?
                <>
                  <Col xs='3'>
                      <Button 
                      onClick={()=>{fdeletefiles()}}
                      color='primary'>
                          ลบไฟล์ที่เลือก
                      </Button>
                  </Col>
                </>:<></>
            }
        </Row>
        <Row style={{width:'100%',height:'3vh'}}>

        </Row>


         <Table hover bordered>
        <thead>
         <tr>
            <th>ลำดับ</th>
            <th>ชื่อไฟล์</th>
        </tr>
        </thead>
        <tbody>
        {

           musics.filesname != null&&
            musics.filesname.map((item, index) => (
            <tr key={index} className="border">
                <td>{index+1}</td>
                <td>{item}</td>
                <td>
                    <Button
                     onClick={()=>{callbackprop(musics.filespath[index])}}
                    >
                        เลือก
                    </Button>
                </td>
                <td>
                    <Button
                    onClick={()=>{fdeletefile(musics.filespath[index],index)}}
                    >
                        -
                    </Button>
                </td>
                {
                    isbulk==true?<>
                         <td>
                            <Input 
                            onChange={handleselectfile.bind(null,index)}
                            type="switch" role="switch" />
                        </td>
                    </>:<></>
                }
            </tr>
            ))
            
        }
        </tbody>
        </Table>


    </Container>;

}

export default Musicsview;