import React, { useState } from 'react';
import "./addUser.css";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from '@/lib/userStore';

const AddUser = () => {
    const [searchedUser, setSearchedUser] = useState(null);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));

            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                setSearchedUser({ id: querySnapShot.docs[0].id, ...querySnapShot.docs[0].data() });
            } else {
                setSearchedUser(null);
            }
        } catch (err) {
            console.log(err);
        }
    };

   const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
            createdAt: serverTimestamp(),
            messages: [],
        });

        // Ensure receiver userchats document exists
        const searchedUserChatsDocRef = doc(userChatsRef, searchedUser.id);
        await setDoc(searchedUserChatsDocRef, { chats: [] }, { merge: true });

        // Ensure current user's userchats document exists
        const currentUserChatsDocRef = doc(userChatsRef, currentUser.id);
        await setDoc(currentUserChatsDocRef, { chats: [] }, { merge: true });

        // Now safe to update both documents
        await updateDoc(searchedUserChatsDocRef, {
            chats: arrayUnion({
                chatId: newChatRef.id,
                lastMessage: "",
                receiverId: currentUser.id,
                updatedAt: Date.now(),
            }),
        });

        await updateDoc(currentUserChatsDocRef, {
            chats: arrayUnion({
                chatId: newChatRef.id,
                lastMessage: "",
                receiverId: searchedUser.id,
                updatedAt: Date.now(),
            }),
        });

    } catch (err) {
        console.error("Error adding user:", err);
    }
};


    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>
            {searchedUser && (
                <div className="user" key={searchedUser.id}>
                    <div className="detail">
                        <img src={searchedUser.avatar || "./avatar.png"} alt="User avatar" />
                        <span>{searchedUser.username}</span>
                    </div>
                    <button onClick={handleAdd}>Add User</button>
                </div>
            )}
        </div>
    );
};

export default AddUser;
