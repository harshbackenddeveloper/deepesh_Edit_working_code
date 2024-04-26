import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();
const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState();
    const [noti, setNoti] = useState([])
    const [notification, setNotification] = useState([]);
    const [fetchAgain, setFetchAgain] = useState(false)
    const [name, setName] = useState("");
    const [video, setVideo] = useState([]);
    const [Audio, setAudio] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        setUser(userInfo)

        if (!userInfo) {
            navigate('/', { replace: true })
        }
    }, [navigate])
    return (
        <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification, fetchAgain, setFetchAgain, noti, setNoti, name, setName, video, setVideo, Audio, setAudio}}>
            {children}
        </ChatContext.Provider>
    )
}
export const ChatState = () => {
    return useContext(ChatContext);
}
export default ChatProvider;