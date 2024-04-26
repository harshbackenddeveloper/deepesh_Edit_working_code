import React, { useEffect, useState } from 'react'
import { ChatState } from './Context/ChatProvider'
import { Box, Button, FormControl, IconButton, Input, InputGroup, InputLeftElement, InputRightElement, Spinner, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { generateHeaders, getSender, getSenderFull } from '../config/ChatLogic';
import ProfileModel from './miscelleniues/ProfileModel';
import UpdateGroupChatModel from './miscelleniues/UpdateGroupChatModel';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import io from "socket.io-client";
import ScrollableChat from './ScrollableChat';
import MoodIcon from '@mui/icons-material/Mood';
import data from '@emoji-mart/data'
import SendIcon from '@mui/icons-material/Send';
import Picker from '@emoji-mart/react'
import { toast } from 'react-toastify';
import '../assets/css/SingleChat.css'
import commonApiRequest from '../api/commonApi';
const ENDPOINT = "http://127.0.0.1:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const { user, selectedChat, setSelectedChat, setNotification, setVideo } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await commonApiRequest('get', `/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Error Occured!")
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("Connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on('receive_notification', (data) => {
      setVideo(data)
      navigation('/call/model')
    })
  })

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);


  const postNotification = async (newMessageReceived) => {
    try {
      const headers = generateHeaders(`${user.token}`)
      const { data } = await commonApiRequest('post', '/api/notification/send_notification',
        {
          chat: newMessageReceived.chat._id,
          sender_id: newMessageReceived.sender._id,
          receiver_id: user._id,
          names: newMessageReceived.sender.name,
          messageData: newMessageReceived.content
        },
        headers
      );
      setNotification(data);
    } catch (error) {
      toast.error("Error Occured!")
    }
  }
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if (newMessageReceived) {
          // postNotification(newMessageReceived)
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if (newMessageReceived) {
          postNotification(newMessageReceived)
        }
      }
    });
  }, []);

  const sendMessage = async (event) => {
    if (event.key === "Enter" ? event.key === "Enter" : event === "submit" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const headers = generateHeaders(`${user.token}`)
        setNewMessage("");
        const { data } = await commonApiRequest('post', '/api/message', {
          content: newMessage,
          chatId: selectedChat,
        }, headers);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast.error("Error Occured!")
      }
    }
  };
  // const addEmoji = (e) => {
  //   let sym = e.unified.split("-");
  //   let codesArray = [];
  //   sym.forEach((el) => codesArray.push("0x" + el));
  //   let emoji = String.fromCodePoint(...codesArray);
  //   setNewMessage(newMessage + emoji);

  // };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return; {
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text className='fontS sizeF singlechat_text' fontSize={{ base: "25px", md: "20px" }}          >
            <IconButton display={{ base: "flex", md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <div className='single_div_first'>
                  <div>
                    <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                  </div>
                  <div> {getSender(user, selectedChat.users)}</div>
                </div>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModel
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
            <div className='single-chat-div-sec'>
              <div className='single-chat-div-inner'><CallIcon /></div>
              <div className='single-chat-div-inner'><VideoCallIcon /></div>
            </div>
          </Text>

          <Box
            className='single-chat-box'>
            {loading ? (<Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3} onClick={sendMessage}            >
              {isTyping ? <div className='single-chat-div-third'>Typing... </div> : <></>}
              <InputGroup>
                <InputLeftElement >
                  <Button>  <div className="button" onClick={() => setShowEmojis(!showEmojis)}> <MoodIcon /> </div> </Button>
                </InputLeftElement>
                <Input variant="filled" bg="#E0E0E0" placeholder="Enter a message.." value={newMessage} onChange={typingHandler} />
                <InputRightElement className="button">
                  <Button type='submit' onClick={() => sendMessage('submit')}> <SendIcon /> </Button>
                </InputRightElement>
                {/* <div>
                  {showEmojis && (
                    <div className="divPiker">
                      <Picker
                        data={data}
                        emojiSize={20}
                        emojiButtonSize={28}
                        onEmojiSelect={addEmoji}
                        maxFrequentRows={0}
                      />
                    </div>
                  )}
                </div> */}
              </InputGroup>
            </FormControl>

          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box className='fontS sizeF single-chat-box1'>
          <Text pb={3} fontSize="20px" fontWeight={"600"}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat