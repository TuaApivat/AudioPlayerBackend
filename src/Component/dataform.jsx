import React, { useState,useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  FormText,
  ButtonGroup,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Musicsview from './Allmusics';

const MusicForm = ({actmode=1,inputdata=null}) => {
  const [musicName, setMusicName] = useState('');
  const [artist, setArtist] = useState('');
  const [musicInfo, setMusicInfo] = useState('');
  const [musicType, setMusicType] = useState('');
  const [selmusicFile, setselMusicFile] = useState(null);
  const [selmusicCover, setselMusicCover] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fmode,setfmode] = useState(0);
  const [modal, setModal] = useState(false);
  const [fileseltp,setfileseltp] = useState(1); //1 music,2 music cover
  const toggle = () => setModal(!modal);


  const updatedata = async (e) => {
      e.preventDefault();
      const form = e.currentTarget
      const formData = new FormData(form);
      const formJson = Object.fromEntries(formData.entries());
      const data = formJson;

      data.selectedMusic = selmusicFile;
      data.selectedCover = selmusicCover;
      data.selectedid = inputdata['id'];

      var apistr = '/api/updatedata';
      var res = await axios.post(apistr,data);
      
      if(res.data.result == 'success'){
          alert('update successfully');
      }
  }

  useEffect(() => {
    
    if(inputdata != null){
       setMusicName(inputdata['name']);
       setMusicInfo(inputdata['info']);
       setMusicType(inputdata['type']);
       setselMusicFile(inputdata['fileurl']);
       setselMusicCover(inputdata['imgcoverurl']);
       setArtist(inputdata['artistid']);
    }
    
  },[]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    const data = formJson;

    //For case of selecting from library
    data.fmode = fmode;
    if(fmode == 1){
       data.selectedMusic = selmusicFile;
       data.selectedCover = selmusicCover;
    }
    //==================================

    const config = {
      headers: {
          'content-type': 'multipart/form-data'
      }
    }
    var res = await axios.post('/api/Music/upload',data,config)
        if(res.data.result == 'success'){
            alert(res.data.result)
    }
  };

  const handlemusicselclicked = (fpath) => {
     if(fileseltp == 1)
      setselMusicFile(fpath);
    else if(fileseltp == 2)
      setselMusicCover(fpath);
     toggle();
  };

  return (
    <Container style={{width:'100%'}}>
      <Row style={{width:'100%',height:'3vh'}}></Row>
      <Row className="justify-content-center">
        
          <Form 
             style={{width:'100%'}}
             onSubmit={actmode==1?handleSubmit:updatedata}>
            <FormGroup>
              <Label for="musicName">Music Name *</Label>
              <Input
                type="text"
                name="musicName"
                id="musicName"
                placeholder="Enter music name"
                value={musicName}
                onChange={(e) => setMusicName(e.target.value)}
                required
                valid={isSubmitted && musicName !== ''}
                invalid={isSubmitted && musicName === ''}
              />
              <FormFeedback>Music name is required</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="artist">Artist *</Label>
              <Input
                type="select"
                name="artist"
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              >
                <option value="">Select artist</option>
                <option value="artist1">Artist 1</option>
                <option value="artist2">Artist 2</option>
                <option value="artist3">Artist 3</option>
              </Input>
              <FormFeedback>Artist is required</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="musicInfo">Music Info</Label>
              <Input
                type="textarea"
                name="musicInfo"
                id="musicInfo"
                placeholder="Enter music information"
                value={musicInfo}
                onChange={(e) => setMusicInfo(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="musicType">Music Type *</Label>
              <Input
                type="select"
                name="musicType"
                id="musicType"
                value={musicType}
                onChange={(e) => setMusicType(e.target.value)}
                required
              >
                <option value="">Select music type</option>
                <option value="jazz">jazz</option>
                <option value="pop">pop</option>
                <option value="classic">classic</option>
              </Input>
              <FormFeedback>Music type is required</FormFeedback>
            </FormGroup>

          {actmode == 1&&
            <ButtonGroup>
              <Button
                color="primary"
                outline
                onClick={() => setfmode(0)}
                active={fmode === 0}
              >
                เพิ่มไฟล์ใหม่
              </Button>
              <Button
                color="primary"
                outline
                onClick={() => setfmode(1)}
                active={fmode === 1}
              >
                เลือกจากคลัง
              </Button>
          </ButtonGroup>
        }
    

          {
            actmode == 1?
            fmode == 0?
            <>
                <FormGroup>
                  <Label for="musicFile">Music File *</Label>
                  <Input
                    type="file"
                    name="musicFile"
                    id="musicFile"
                    accept=".wav,.mp3"
                    onChange={(e) => setselMusicFile(e.target.files[0])}
                    required
                  />
                  <FormText color="muted">Upload music file</FormText>

                </FormGroup>
                
                <FormGroup>
                  <Label for="musicCover">Music Cover</Label>
                  <Input
                    type="file"
                    name="musicCover"
                    id="musicCover"
                    accept=".gif,.jpg,.jpeg,.png"
                    onChange={(e) => setselMusicCover(e.target.files[0])}
                  />
                  <FormText color="muted">Upload music cover image</FormText>
                </FormGroup>
            </>:

            <>
                <FormGroup>
                <Label for="musicFile">เพลงที่เลือก</Label>
                <Row>
                    <Col xs='11'>
                        <Input
                          type="text"
                          name="musicFile"
                          id="musicFile"
                          disabled = {true}
                          required
                          value={selmusicFile}
                        />
                    </Col>
                    <Col xs='1'>
                        <Button 
                        onClick={()=>{setfileseltp(1); toggle()}}
                        color='primary'>
                          เปิด
                          </Button>
                    </Col>
                </Row>
                </FormGroup>

                <FormGroup>
                <Label for="musicCover">รูปที่เลือก</Label>
                <Row>
                    <Col xs='11'>
                        <Input
                          type="text"
                          name="musicCover"
                          id="musicCover"
                          required
                          disabled = {true}
                          value={selmusicCover}
                        />
                    </Col>
                    <Col xs='1'>
                        <Button 
                        onClick={()=>{setfileseltp(2); toggle()}}
                        color='primary'>
                          เปิด
                          </Button>
                    </Col>
                </Row>
                </FormGroup>
             </>:
             <>
                <FormGroup>
                <Label for="musicFile">เพลงที่เลือก</Label>
                <Row>
                    <Col xs='11'>
                        <Input
                          type="text"
                          name="musicFile"
                          id="musicFile"
                          disabled = {true}
                          required
                          value={selmusicFile}
                        />
                    </Col>
                    <Col xs='1'>
                        <Button 
                        onClick={()=>{setfileseltp(1); toggle()}}
                        color='primary'>
                          เปิด
                          </Button>
                    </Col>
                </Row>
                </FormGroup>

                <FormGroup>
                <Label for="musicCover">รูปที่เลือก</Label>
                <Row>
                    <Col xs='11'>
                        <Input
                          type="text"
                          name="musicCover"
                          id="musicCover"
                          required
                          disabled = {true}
                          value={selmusicCover}
                        />
                    </Col>
                    <Col xs='1'>
                        <Button 
                        onClick={()=>{setfileseltp(2); toggle()}}
                        color='primary'>
                          เปิด
                          </Button>
                    </Col>
                </Row>
                </FormGroup>
            </>
             
          }
        
           <Row style={{width:'100%',height:'3vh'}}> </Row>
            <Button color="primary" block>
              {actmode == 1?'Submit':'Update'}
            </Button>
          </Form>

    
        {
             
              <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>คลังไฟล์</ModalHeader>
                <ModalBody>
                    <Musicsview mediatype={fileseltp} callbackprop={handlemusicselclicked}></Musicsview>
                </ModalBody>
              </Modal>
                 
        }

        
      </Row>
    </Container>
  );
};

export default MusicForm;