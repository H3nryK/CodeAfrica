import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from 'web3';
import '../RegistrationScreen.css';
import { useWalletClient, usePublicClient } from 'wagmi';
import { userRegistrationABI, userRegistrationAddress } from "../constants/constants"; // Adjust the import path accordingly

const RegistrationScreen = () => {
  const [web3, setWeb3] = useState(null);
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  const {data: walletClient} = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          const _web3 = new Web3(window.ethereum);
          setWeb3(_web3);
          setIsMetaMaskConnected(true);
        } catch (error) {
          setIsMetaMaskConnected(false);
          console.error('User denied account access');
        }
      } else if (window.web3) {
        const _web3 = new Web3(window.web3.currentProvider);
        setWeb3(_web3);
        setIsMetaMaskConnected(true);
      } else {
        setIsMetaMaskConnected(false);
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    initWeb3();
  }, []);

  const handleMetaMaskConnect = async () => {
    try {
      const accounts = await web3.eth.requestAccounts();
      setIsMetaMaskConnected(accounts.length > 0);
    } catch (err) {
      setError(err.message || 'An error occurred while connecting to MetaMask');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isMetaMaskConnected) {
        setError('Please connect your MetaMask wallet first.');
        return;
      }

      // Check if the user has MetaMask identity here
      // Navigate to dashboard if MetaMask identity exists
      // Redirect logic to dashboard here

      setRole('');
      setUsername('');
      setAdditionalDetails({});
      setError('');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (walletClient) {
      try {
        let hash;
        if (role === 'Patient') {
          hash = await walletClient.writeContract({
            abi: userRegistrationABI,
            address: userRegistrationAddress,
            functionName: 'registerPatient',
            args: [username, additionalDetails.medicalHistory]
          });
        } else if (role === 'Hospital') {
          hash = await walletClient.writeContract({
            abi: userRegistrationABI,
            address: userRegistrationAddress,
            functionName: 'registerHospital',
            args: [username, additionalDetails.licenseNumber, additionalDetails.location]
          });
        } else if (role === 'Pharmacy') {
          hash = await walletClient.writeContract({
            abi: userRegistrationABI,
            address: userRegistrationAddress,
            functionName: 'registerPharmacy',
            args: [username, additionalDetails.licenseNumber, additionalDetails.postalAddress]
          });
        } else if (role === 'Supplier') {
          hash = await walletClient.writeContract({
            abi: userRegistrationABI,
            address: userRegistrationAddress,
            functionName: 'registerSupplier',
            args: [username, additionalDetails.companyName, additionalDetails.contactInfo]
          });
        }
        
        await publicClient.waitForTransactionReceipt({ hash });
      } catch (error) {
        console.error("Error", error);
      }
    }
  };
  
  

  return (
    <div className="background-image-container">
      <div className="background-overlay"></div>
      <Navbar bg="light" expand="lg" className="navbar">
        <Navbar.Brand href="#">PharmaChain</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">About</Nav.Link>
            <Nav.Link href="#">Contact</Nav.Link>
            <Nav.Link href="#">Services</Nav.Link>
            <Nav.Link href="/Dash">Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="container mt-5">
        <h2 className="text-center mb-4">User Registration Form</h2>
        {!isMetaMaskConnected && (
          <div className="metamask-connect">
            <p>Please connect your MetaMask wallet to proceed.</p>
            <Button variant="primary" onClick={handleMetaMaskConnect}>Connect MetaMask</Button>
          </div>
        )}
          
        {isMetaMaskConnected && (
          <div className="registration-form-container">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formRole">
                <Form.Label>Select Role</Form.Label>
                <Form.Control as="select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Patient">Patient</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Supplier">Supplier</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formAdditionalDetails">
                <Form.Label>Additional Details</Form.Label>
                {role === 'Patient' && (
                  <Form.Control
                    type="text"
                    placeholder="Enter your medical history (optional)"
                    value={additionalDetails.medicalHistory || ''}
                    onChange={(e) => setAdditionalDetails({ ...additionalDetails, medicalHistory: e.target.value })}
                  />
                )}
                {role === 'Hospital' && (
                  <>
                    <Form.Control
                      type="text"
                      placeholder="Enter your hospital license number"
                      value={additionalDetails.licenseNumber || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, licenseNumber: e.target.value })}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Enter your hospital location (optional)"
                      value={additionalDetails.location || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, location: e.target.value })}
                    />
                  </>
                )}
                {role === 'Pharmacy' && (
                  <>
                    <Form.Control
                      type="text"
                      placeholder="Enter your pharmacy license number"
                      value={additionalDetails.licenseNumber || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, licenseNumber: e.target.value })}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Enter your pharmacy address"
                      value={additionalDetails.address || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, address: e.target.value })}
                    />
                  </>
                )}
                {role === 'Supplier' && (
                  <>
                    <Form.Control
                      type="text"
                      placeholder="Enter your supplier company name"
                      value={additionalDetails.companyName || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, companyName: e.target.value })}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Enter your supplier contact information"
                      value={additionalDetails.contactInfo || ''}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactInfo: e.target.value })}
                    />
                  </>
                )}
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button variant="primary" type="submit" disabled={loading} block onClick={() => createUser()}>
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  'Register'
                )}
              </Button>
            </Form>
          </div>
        )}
      </div>
      <footer className="footer">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} PharmaChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationScreen;