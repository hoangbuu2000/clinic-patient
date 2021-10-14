import {
    Avatar, Dialog, DialogContent, DialogContentText, DialogTitle,
    Grid, IconButton, makeStyles, TextField, Tooltip, Typography
} from "@material-ui/core";
import { useState } from "react"
import SendIcon from '@material-ui/icons/Send';
import {
    getFirestore, collection, addDoc, Timestamp,
    where, query, getDocs, onSnapshot, setDoc, doc, documentId
} from "firebase/firestore";

const useStyles = makeStyles({
    sender: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 16,
        borderRadius: 30,
        background: '#eeeeee',
        width: '50%',
        padding: '8px 8px 8px 15px',
        fontWeight: 'bold'
    },
    receiver: {
        display: 'inline-block',
        marginTop: 16,
        marginLeft: 10,
        borderRadius: 30,
        background: '#3d5afe',
        color: 'white',
        width: '50%',
        padding: '8px 8px 8px 15px',
        marginLeft: 200
    }
})

export default function Chat(props) {
    const [isOpen, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const classes = useStyles();
    const { uid, displayName, email, photoURL } = props;

    const handleOpenChat = () => {
        const db = getFirestore();

        const q = query(collection(db, "chats"), where(documentId(), "==", uid));

        onSnapshot(q, (snapShot) => {
            let arr = []
            snapShot.docs.forEach((doc) => {
                const element = {
                    messageId: doc.id,
                    messages: doc.data().messages
                }
                arr.push(element);
            })
            setMessages(arr);
        })

        setTimeout(() => {
            setOpen(true);
        }, 200)

    }

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    const handleSubmit = (e) => {
        //check user existed on firebase, if not create new
        const db = getFirestore();
        const q = query(collection(db, 'users'), where(documentId(), "==", uid));
        getDocs(q).then(value => {
            if (value.docs.length === 0) {
                const ref = collection(db, 'users');
                const docRef = doc(ref, uid);
                const data = {
                    displayName: displayName,
                    email: email,
                    photoURL: photoURL,
                    uid: uid
                }
                setDoc(docRef, data, { merge: true });
            }
        }).catch(err => console.log(err));

        let data;
        if (typeof messages !== 'undefined' && messages.length > 0) {
            data = {
                messages: [
                    ...messages[0].messages,
                    {
                        content: message,
                        uid: uid || '',
                        time: Timestamp.now()
                    }
                ]
            }
        } else {
            data = {
                messages: [
                    {
                        content: message,
                        uid: uid || '',
                        time: Timestamp.now()
                    }
                ]
            }
        }

        const ref = collection(db, 'chats');
        const docRef = doc(ref, uid);
        setDoc(docRef, data, { merge: true })
            .then(res => setMessage('')).catch(err => console.log(err));

        e.preventDefault();
    }

    return (
        <>
            <div style={{ position: 'fixed', bottom: 70, right: 7, cursor: 'pointer', width: 70 }}
                onClick={handleOpenChat}>
                <img width="100%" src='https://res.cloudinary.com/dk5jgf3xj/image/upload/v1633499175/doank18/logo/chat-removebg-preview_xbkxge.png'
                    alt="Chat" />
            </div>

            <Dialog
                open={isOpen}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>
                    <Typography>Chat with hospital</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <div style={{ height: 300, overflow: 'auto' }}>
                                    {messages[0]?.messages && messages[0]?.messages.map(m => {
                                        let time = new Date(1970, 0, 1);
                                        time.setUTCSeconds(m.time?.seconds);
                                        return (
                                            <div>
                                                {m.uid !== uid ? (
                                                    <Tooltip title={time.toString()}>
                                                        <Avatar
                                                            style={{ display: 'inline-block', width: 30, height: 30 }}
                                                            src="https://res.cloudinary.com/dk5jgf3xj/image/upload/v1633504071/doank18/logo/logo_lqelbp.png" />
                                                    </Tooltip>
                                                ) : ''}
                                                <span className={m.uid !== uid ? classes.sender : classes.receiver}
                                                >
                                                    {m.content}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <form
                                    style={{ width: 500, marginTop: 20 }}
                                    onSubmit={handleSubmit}>
                                    <TextField placeholder="Aa" style={{ width: '90%' }}
                                        onChange={handleChange} value={message} />
                                    <IconButton disabled={message === ""} type="submit">
                                        <SendIcon color={message === "" ? '' : 'primary'} />
                                    </IconButton>
                                </form>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    )
}