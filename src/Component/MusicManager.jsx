import React, { useState } from 'react';
import {
  Container,
  Row,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import MusicForm from './dataform';
import CcsvUpload from './Csvupload';
import MusicEditor from './MusicEditor';
import Musicsview from './Allmusics';

const MusicMng = () => {


    const [tabsel,settabsel] = useState(0);
   
    return <Container style={{width:'50vw', minHeight:'100vh'}}>
         <Row>
        {
            <div>
            <Nav tabs>
                <NavItem>
                <NavLink
                    className= {tabsel==0?'active':''}
                    onClick={()=>{settabsel(0)}}
                >
                    ใส่ข้อมูลเพลงใหม่
                </NavLink>
                </NavItem>

                <NavItem>
                <NavLink
                    className= {tabsel==1?'active':''}
                    onClick={()=>{settabsel(1)}}
                >
                    ใส่ข้อมูลแบบกลุ่ม
                </NavLink>
                </NavItem>

                <NavItem>
                <NavLink
                    className= {tabsel==2?'active':''}
                    onClick={()=>{settabsel(2)}}
                >
                    ดูและแก้ไขข้อมูล
                </NavLink>
                </NavItem>

                <NavItem>
                <NavLink
                    className= {tabsel==2?'active':''}
                    onClick={()=>{settabsel(3)}}
                >
                   คลังไฟล์
                </NavLink>
                </NavItem>
            </Nav>
            </div>
      }
      </Row>
        {tabsel==0&&<MusicForm/>}
        {tabsel==1&&<CcsvUpload/>}
        {tabsel==2&&<MusicEditor/>}
        {tabsel==3&&<Musicsview mediatype={-1} callbackprop={()=> {}}/>}
    </Container>

};

export default MusicMng;