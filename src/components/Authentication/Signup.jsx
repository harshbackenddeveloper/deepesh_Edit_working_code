import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import commonApiRequest from '../../api/commonApi';

function Signup() {
    const [show, setShow] = useState()
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    // eslint-disable-next-line
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const handleClick = () => setShow(!show);


    const submitHandler = async () => {
        setLoading(true);
        // if (!name || !email || !password ) {
        //     toast.warn("Please Fill all the Feilds")
        //     setLoading(false);
        //     return;
        // }
        if (password !== confirmpassword) {
            toast.warn("Password Do Not Match")
            return;
        }
        try {
            const info = {
                name: name,
                email: email,
                password: password,
            }
            await commonApiRequest('post', '/api/user/register', info);
            swal({
                title: "Registration Successful",
                icon: "success",
                button: "OK"
            })

            // localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            window.location.reload()
            navigate('/', { replace: true });
        } catch (error) {
            toast.error("Error Occured")
        }
    }
    return <VStack spacing={"2px"}>
        <FormControl id="first-name" isRequired>
            <FormLabel className='sizeF fontS'>Name</FormLabel>
            <Input className='sizeF' placeholder='Enter Your Name' onChange={(e) => setName(e.target.value)} />
        </FormControl>

        <FormControl id="email" isRequired className="fontS sizeF">
            <FormLabel className='fontS sizeF'>Email</FormLabel>
            <Input className='fontS sizeF' placeholder='Enter Your Email' onChange={(e) => setEmail(e.target.value)} />
        </FormControl>

        <FormControl id="password" isRequired className="fontS sizeF">
            <FormLabel className='fontS sizeF'>Password</FormLabel>
            <InputGroup>
                <Input className='fontS sizeF' type={show ? "text" : "password"} placeholder='Enter Your Password' onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement width="4.5rem">
                    <Button className='fontS' h="1.75rem" size="sm" color={"black"} onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <FormControl id="password" isRequired className="fontS">
            <FormLabel className='fontS sizeF'>Confirm Password</FormLabel>
            <InputGroup>
                <Input className='fontS sizeF' type={show ? "text" : "password"} placeholder='Enter Your Confirm Password' onChange={(e) => setConfirmpassword(e.target.value)} />
                <InputRightElement width="4.5rem">
                    <Button className='fontS' h="1.75rem" size="sm" color={"black"} onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <Button className='fontS sizeF' colorScheme='blue' width="100%" style={{ marginTop: 15 }} onClick={submitHandler}>Sign Up</Button>
    </VStack>
}

export default Signup; 