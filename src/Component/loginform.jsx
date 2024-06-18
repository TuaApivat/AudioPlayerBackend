import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Button,
} from 'reactstrap';
import "bootstrap/dist/css/bootstrap.min.css"; 
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) =>  {
    e.preventDefault();
  
    var res = await axios.get('api/getAllMusicFile');
    alert(res.data.ret);
  };

  return (
    <div className="login-background">
      <Container>
        <Row className="justify-content-center">
          <Col xs="12">
            <Card className="login-card">
              <CardBody>
                <h4 className="text-center mb-4">Welcome</h4>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="text-right">
                      <a href="#" className="small text-muted">
                        Forgot password?
                      </a>
                    </div>
                  </FormGroup>
                  <Button color="primary" block className="mb-3">
                    Log in
                  </Button>
                  <div className="text-center mb-3">
                    <p className="mb-0">or</p>
                  </div>
                  <Button color="light" block className="mb-3" 
                    onClick={handleSubmit}
                  >
                    <img src="google-logo.png" alt="Google Logo" className="mr-2" />
                    Continue with Google
                  </Button>
                  <div className="text-center">
                    <p className="mb-0">Have no account yet? <a href="#" className="text-primary">Sign up</a></p>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginForm;