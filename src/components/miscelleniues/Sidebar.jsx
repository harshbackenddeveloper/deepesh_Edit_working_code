import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons"
import { ChatState } from '../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useNavigate } from 'react-router-dom';
import ChatLoading from './ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { toast } from 'react-toastify';
import "../../assets/css/miscelleniues/Sidebar.css"
import commonApiRequest from '../../api/commonApi';
import { generateHeaders } from '../../config/ChatLogic';
const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState();
  const [data, setData] = useState("")
  const [getUser, seGetUser] = useState("")
  const { user, setSelectedChat, chats, setChats, notification, noti, setNoti } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchNotifacation = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    try {
      const headers = generateHeaders(`${userInfo.token}`)
      const { data } = await commonApiRequest('get', `/api/notification/get_notification`, {}, headers)
      setNoti(data);
    } catch (error) {
      toast.error("Error Occured!")
    }
  };

  const allUser = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    try {
      const headers = generateHeaders(`${userInfo.token}`)
      const userData = await commonApiRequest('get', `/api/user/getuser/user`, {}, headers)
      seGetUser(userData.data)
    } catch (error) {
      toast.error("Error Occured!")
    }
  }

  useEffect(() => {
    fetchNotifacation();
    allUser()
  }, [data, notification])

  const deleteNotifacation = async (_id) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    try {
      const headers = generateHeaders(`${userInfo.token}`)
      const data = await commonApiRequest('delete', `/api/notification/delete_notification/${_id}`, {}, headers)
      setData(data)
    } catch (error) {
      toast.error("Error Occured!")
    }
  }

  const logoutHandler = () => {
    localStorage.removeItem("userInfo")
    navigate('/', { replace: true })
  }

  const handleSearch = async (value) => {
    setSearch(value)
    if (!value) {
      setSearchResult([])
      return;
    }
    try {
      setLoading(true)
      const headers = generateHeaders(`${user.token}`)
      const { data } = await commonApiRequest('get', `/api/user/getalluser?search=${value}`, {}, headers)
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error("Error Occured!")
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)
      const headers = generateHeaders(`${user.token}`)
      const { data } = await commonApiRequest('post', "/api/chat", { userId }, headers)
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats])
      setSelectedChat(data)
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast.error("Error fetching the chat")
    }
  }
  
  return (
    <div>
      <Box className='sidebar_container'>
        <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'        >
          <Button className='btn' variant="ghost" onClick={onOpen}>
            <i className="fas fa-search" />
            <Text className='fontS sidebar_taxt_first' display={{ base: "none", md: "flex" }}>Search User</Text>
          </Button>
        </Tooltip>
        <Text className='fontS sidebar_taxt_sec' >ChatApp</Text>
        <div>
          <Menu>
            <MenuButton p={1} className='bellIconBox' >
              <h5 className='IconInner' >
                {noti && noti.data && noti.data.length > 0 ? <span>{noti.data.length}</span> : 0}
              </h5>
              <BellIcon className='bell' fontSize={"20px"} m={1} />
            </MenuButton>

            <MenuList >
              {noti && noti.data && noti.data.length > 0 && noti.data.map((noti) => (
                <MenuItem key={noti.chat._id} onClick={() => { setSelectedChat(noti.chat); deleteNotifacation(noti._id) }}>
                  {/* show notification details functionality */}
                  {noti.length > 0 ? <span> {"No Notifacation Message"}</span> : <span> {noti.names} :  {noti.messageData} </span>}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu  >
            <MenuButton className='fontS sizeF ' as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size={'sm'} cursor={'pointer'} name={user.name} src={user.pic.url} />
            </MenuButton>
            <MenuList className='fontS sizeF'>
              <ProfileModel user={user}>
                <MenuItem >My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>LogOut</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen} >
        <Tabs variant='enclosed'>
          <DrawerOverlay />
          <DrawerContent borderWidth={'1px'}>
            <TabList>
              <div className='fontS sizeF sidebar_div_first'>
                <Tab> <div><DrawerHeader className='sizeF' cursor={'pointer'}>All Users</DrawerHeader> </div></Tab>
                <Tab><div><DrawerHeader className='sizeF'>Search User</DrawerHeader></div></Tab>
              </div>
            </TabList>
            <TabPanels className='fontS sizeF'>
              <TabPanel height={'555px'} overflow={'scroll'}>
                <div className='sidebar_div_sec'>
                  {getUser && getUser.data.map((value) => {
                    return (
                      <div className="Mhover sidebar_div_third" onClick={() => accessChat(value._id)} >
                        <div>
                          <Avatar size={'md'} cursor={'pointer'} src={value.pic.url} />
                        </div>
                        <div>
                          <div><Text>{value.name}</Text></div>
                          <div><Text>{value.email}</Text></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabPanel>

              <TabPanel>
                <DrawerBody>
                  <Box display={'flex'}>
                    <Input className='sizeF' placeholder='Search by name or email' mr={2} value={search} onChange={(e) => handleSearch(e.target.value)} />
                  </Box>
                  {loading ? (<ChatLoading />) : (searchResult?.map(user => (<UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />)))}
                  {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
                </DrawerBody>
              </TabPanel>
            </TabPanels>
          </DrawerContent>
        </Tabs>
      </Drawer>
    </div>
  )
}

export default Sidebar