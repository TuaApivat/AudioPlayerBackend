import React, { useState,useEffect,useRef } from 'react';
import {
    Container,
    Row,
    Col,Table,Button,
    Modal, ModalBody,
    ButtonGroup,Input
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import axios, { formToJSON } from 'axios';
import MusicForm from './dataform';

const MusicEditor = () => {

    const [musics,setmusics] = useState([]);
    const iinit = useRef(false);
    const toggle = () => setModal(!modal);
    const [modal, setModal] = useState(false);
    const [curmusic,setcurmusic] = useState({});
    const [isbulk,setisbulk] = useState(false);
    const [bulklist,setbulklist] = useState([]);

    const fetchmusics = async (nperpage=-1) => {
        var apistr = '/api/getMusic';
        if(nperpage != -1){
            apistr += '?nperpage=';
            apistr += nperpage;
        }
       
        var res = await axios.get(apistr);

        if(res.data.result == 'success'){
            setmusics(res.data.queryret);
            let nmusics = res.data.queryret.length;
            let thelist = [];
            for(let i=0; i<nmusics; i++){
                thelist.push(false);
            }
            setbulklist(thelist);
        }
    }

    const fdeletemusics = async () => {

        var dellist = '';
        let nmusics = bulklist.length;
    
        for(let i=0; i<nmusics; i++){
            if(bulklist[i] == true){
              dellist += musics[i]['id'];
              dellist += ',';
            }
        }
        dellist = dellist.slice(0,-1);
        
        const formData = new FormData();
        const formJson = Object.fromEntries(formData.entries());
        const data = formJson;
        data.idlist = dellist;
        data.delmode = 'multiple';        
        
        var apistr = '/api/delmudata';
        var res = await axios.post(apistr,data);
        
        if(res.data.result == 'success'){
            fetchmusics();
        }
        
    }

    const handleselectfile =(iindex,e) => {
        var tmpbluk = bulklist;
        tmpbluk[iindex] = !tmpbluk[iindex];
        setbulklist(tmpbluk);
    }

    const deletedata = async (inputdata) => {
    
        const formData = new FormData();
        const formJson = Object.fromEntries(formData.entries());
        const data = formJson;
        data.selectedid = inputdata['id'];
    
        var apistr = '/api/delmudata';
        var res = await axios.post(apistr,data);
        
        if(res.data.result == 'success'){
            fetchmusics();
        }
    }

    useEffect(() => {
        if(iinit.current == false){
             fetchmusics();
             iinit.current = true;
        }
     },[]);
   
    return <Container style={{width:'50vw', minHeight:'100vh'}}>
         
        <Row style={{width:'100%',height:'3vh'}}/>
        <Row>
            <Col xs='8'>
                ข้อมูลทั้งหมด: {musics != null?musics.length:'-'} ข้อมูล
            </Col>
            <Col xs='4'>
                <ButtonGroup>
                    <Button
                    color="primary"
                    outline
                    onClick={() => setisbulk(false)}
                    active={isbulk === false}
                    >
                      Single Edit
                    </Button>
                    <Button
                    color="primary"
                    outline
                    onClick={() => setisbulk(true)}
                    active={isbulk === true}
                    >
                      Bulk Edit
                    </Button>
                </ButtonGroup>
            </Col>
        </Row>

        <Row>
            {
                isbulk==true?
                <>
                  <Col xs='3'>
                      <Button 
                      onClick={()=>{fdeletemusics()}}
                      color='primary'>
                          ลบข้อมูลที่เลือก
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
            <th>รหัส</th>
            <th>ชื่อเพลง</th>
            <th>คำอธิบาย</th>
            <th>ชื่อปก</th>
            <th>ประเภทเพลง</th>
            <th>ที่อยู่ของเพลง</th>
        </tr>
        </thead>

        
        <tbody>
        {
            musics.map((item, index) => (
            <tr key={index} className="border">
                <td>{item['id']}</td>
                <td>{item['name']}</td>
                <td>{item['info']}</td>
                <td>{item['imgcoverurl']}</td>
                <td>{item['type']}</td>
                <td>{item['fileurl']}</td>
                <td>
                    <Button
                     onClick={()=>{toggle(); setcurmusic(item) }}
                    >
                        แก้ไข
                    </Button>
                </td>
                <td>
                    <Button
                      onClick={()=>{deletedata(item)}}
                    >
                        ลบ
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

        {
             
             <Modal 
             size="lg" style={{maxWidth: '700px', width: '100%'}}
             isOpen={modal} toggle={toggle}>
               <ModalBody>
                    <MusicForm actmode={2} inputdata={curmusic}/>
               </ModalBody>
             </Modal>
                
        }


    </Container>

};

export default MusicEditor;