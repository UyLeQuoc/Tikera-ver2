import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipient';
import { convertFirestoreTimestampToString, generateQueryGetMessages, tranformMessage } from '../utils/getMessagesInConversationId';
// import RecipientAvatar from './RecipientAvatar.component';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import Message from './Message';

import { async } from '@firebase/util';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Button, Input } from 'antd';

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: rgb(33,33,33);
  height: 60px;
  z-index: 50;
  top: 0;
  display: flex;
  align-items: center;
  padding: 8px;
  color: white;
`
const StyledRecipientHeaderLeft = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin: 0 10px;
`
const StyledRecipientHeaderInfo = styled.div`
  margin-left: 15px;
  flex-grow: 1;
  > h3 {
    font-size: 1.125rem;
    margin-top: 0;
    margin-bottom: 3px;
  }
`
const StyledEmailH3 = styled.h3`
  word-break: break-all;
`
const StyledLastActive = styled.div`
  color: rgb(170,170,170);
  font-size: .875rem;
`

const StyledRecipientHeaderRight = styled.div`
`

const StyledMessagesContainer = styled.div`
  width: 100%;
  /* height: calc(100vh - 164px); */
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  flex-direction: column;
  padding: 1rem 2rem 0 2rem;
`
const StyledEnterSendMessage = styled.button`
  padding: 15px;
  border-radius: 50%;
  background-color: rgb(33,33,33);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`
const StyledInputContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  padding: 10px;
  padding-right: 20px;
  position: sticky;
  bottom: 0;
  z-index: 100;
`
const StyledSendMessageContainer = styled.div`
  flex-grow: 1;
`

const StyledPaper = styled.div`
  :after {
    content: "";
    display: block;
    position: absolute;
    right: -10px;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-bottom: 20px solid rgb(33,33,33);
    clear: both;
    z-index: 2;
  }
`

const CoversationScreen = ({conversation, messages}) => {
  const [loggedInUser, loading, user] = useAuthState(auth)
  const [newMessage, setNewMessage] = useState('')
  
  const conversationUsers = conversation.users;

  const {recipientEmail, recipientData } = useRecipient(conversationUsers);

  // Get conversation ID from URL
  const router = useRouter()
  const conversationId = router.query.id;

  const queryGetMessages = generateQueryGetMessages(conversationId);
  const [messagesSnapshot, messagesLoading, messagesError] = useCollection(queryGetMessages);

  // Ref
  const endOfMessagesRef = useRef(null)

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({behavior: "smooth"})
  }

  const showMessages = () => {
    // messagesLoading
    if (messagesLoading) {
      return messages.map(message => (
        <Message key={message.id} message={message} />
      ))
    }

    if (messagesSnapshot) {
      return messagesSnapshot.docs.map(message => (
        <Message key={message.id} message={tranformMessage(message)} />
      ))
    }
  }

  const sendMessageOnEnter = (e) => {
    if(e.key === 'Enter'){
      if(newMessage) return addMessageToFirebaseAndUpdateLastSeen(newMessage);
    }
  }

  const addMessageToFirebaseAndUpdateLastSeen = async (newMessage) => {
    // update last active
    await setDoc(doc(db, 'users', loggedInUser.uid),{
      lastSeen: serverTimestamp()
    }, {merge: true})

    // add new message
    await addDoc(collection(db,'messages'),{
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text_message: newMessage,
      user: loggedInUser?.email
    })

    // reset input message
    setNewMessage('');

    // Scroll to bottom
    scrollToBottom();
  
  };

  useEffect(() => scrollToBottom(),[conversation])
  return (
    <>
      <StyledRecipientHeader>
        <StyledRecipientHeaderLeft>
          {/* <RecipientAvatar recipientData={recipientData} recipientEmail={recipientEmail}/> */}
          <StyledRecipientHeaderInfo>
            <StyledEmailH3>
              {recipientEmail}
            </StyledEmailH3>
            <StyledLastActive>
              {recipientData && <span>Last active: {convertFirestoreTimestampToString(recipientData.lastSeen)}</span>}
            </StyledLastActive>
          </StyledRecipientHeaderInfo>
        </StyledRecipientHeaderLeft>
        <StyledRecipientHeaderRight>
          
        </StyledRecipientHeaderRight>
      </StyledRecipientHeader>
      <StyledMessagesContainer>
        {showMessages()}
      </StyledMessagesContainer>
      <StyledInputContainer>
        <StyledSendMessageContainer>
          <StyledPaper
            component="div"
            sx={{ p: '2px 4px', m: '12px', display: 'flex', alignItems: 'center', flexGrow: '1', height: '60px', backgroundColor: 'rgb(33,33,33)', boxShadow: 0, position: 'relative'}}
          >
            <button type="submit" sx={{ p: '10px' }} aria-label="search">
              <div> GUiwr</div>
            </button>
            <Input
              sx={{ ml: 1, flex: 1 , color: 'white'}}
              placeholder="Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => sendMessageOnEnter(e)}
            />
          </StyledPaper>
        </StyledSendMessageContainer>
        <StyledEnterSendMessage>
          <Button sx={{display: 'flex', alignItem: 'center', justifyContent: 'center', color: 'rgb(135,116,225)'}}
            onClick={() => {
              if(newMessage) return addMessageToFirebaseAndUpdateLastSeen(newMessage);
            }}
          />
        </StyledEnterSendMessage>
      </StyledInputContainer>
    </>
  )
}

export default CoversationScreen