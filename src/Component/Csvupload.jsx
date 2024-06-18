import React, { useState } from 'react';
import {
  Container,
  Row,
  Form,
  FormGroup,
  Button,Input,Label,FormText, Col
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

const CcsvUpload = () => {

    const handleSubmit = async (e) => {

        e.preventDefault();
    
        const form = e.currentTarget
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        const data = formJson;

        const config = {
          headers: {
              'content-type': 'multipart/form-data'
          }
        }

        var res = await axios.post('/api/uploadcsv',data,config)

        if(res.data.result == 'success'){
                alert(res.data.result)
         }
      };
 
     return <Container>
        <h2>
            Click the below button to insert data from csv
        </h2>

        <Row style={{width:'100%'}}>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Row>
                        <Label for="csvFile">Choose your Csv *</Label>
                    </Row>
                    <Row>
                        <Col xs='8'>
                            <Input
                                type="file"
                                name="csvFile"
                                id="csvFile"
                                accept=".csv"
                                required
                            />
                            <FormText color="muted">select File</FormText>
                        </Col>
                            <Col xs='2'>
                                <FormGroup>
                                    <Button>
                                        ตกลง
                                    </Button>
                                </FormGroup>
                            </Col>
                    </Row>
                </FormGroup>
            </Form>
        </Row>
        
     </Container>
  
}

export default CcsvUpload;