import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { OnboardingScreen } from "@/components/auth/OnboardingScreen";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  conversations,
  type Message,
  type Conversation,
} from "@/lib/chat-data";
import { getMessages, sendMessage } from "@/lib/api";
import { socket } from "@/lib/socket";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { mode } = useAuth();

  // ✅ handle loading FIRST
  if (mode === "loading") return null;

  if (mode === "onboarding") return <OnboardingScreen />;
  if (mode === "login") return <LoginScreen />;

  return <ChatApp />;
}


function ChatApp() {
  
  const { currentUser, logout } = useAuth();

  // ✅ ONLINE USERS
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // 🔥 Load chat list
  const [chatList, setChatList] = useState<Conversation[]>([]);
   
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // useEffect(() => {
  // //   if (!currentUser) return;
  
  // //   const saved = localStorage.getItem(
  // //     `chatList_${currentUser.username}`
  // //   );
  
  // //   if (saved) {
  // //     setChatList(JSON.parse(saved));
  // //   } else {
  // //     setChatList([]);
  // //   }
  // // }, [currentUser]);

 useEffect(() => {
  if (!currentUser) return;
 
  fetch(`http://localhost:5000/conversations/${currentUser.username}`)
    .then(res => res.json())
    .then((data) => {
      const chats = data.map((c: any) => ({
        id: c._id,
        name: c._id,
        initials: c._id.slice(0, 2).toUpperCase(),
        avatarTone: "blue",
        preview: c.lastMessage,
        time: c.time,//changes 4
      }));

      setChatList(chats);
    });
 }, [currentUser]);


 const [activeId, setActiveId] = useState("");
 
 // useEffect(() => {
 //   if (!currentUser) return; // ✅ fix
 
 //   const saved = localStorage.getItem(
 //     `activeChat_${currentUser.username}`
 //   );
 
 //   if (saved) setActiveId(saved);
 // }, [currentUser]); // ✅ also fix dependency
 
 useEffect(() => {
   if (!currentUser || chatList.length === 0) return;
 
   const saved = localStorage.getItem(
     `activeChat_${currentUser.username}`
   );
 
   if (saved) {
     const exists = chatList.find((c) => c.id === saved);
 
     if (exists) {
       setActiveId(saved);
     }
   }
 }, [chatList, currentUser]);
 
 
 
   const [query, setQuery] = useState("");
   const [findUser, setFindUser] = useState("");
   const [messages, setMessages] = useState<Message[]>([]);
 
 const active = useMemo(
   () => chatList.find((c) => c.id === activeId) || null,
   [activeId, chatList]
 );
 
 useEffect(() => {
   if (!currentUser?.username) return;
 
   const username = currentUser.username.toLowerCase().trim();
 
   const handleConnect = () => {
     console.log("🔥 JOIN EMIT:", username);
     socket.emit("join", username);
   };
 
   socket.connect();
 
   // if already connected
   if (socket.connected) {
     handleConnect();
   }
 
   // if connects later
   socket.on("connect", handleConnect);
 
   return () => {
     socket.emit("leave", username);   // 🔥 ADD THIS
     socket.disconnect();              // 🔥 ADD THIS
     socket.off("connect", handleConnect);
   };
 }, [currentUser]);
 
   // =========================
   // 🔥 ONLINE USERS LISTENER
   // =========================
   useEffect(() => {
     socket.on("online_users", (users) => {
       console.log("🟢 ONLINE USERS:", users);
       setOnlineUsers(users);
     });
 
     return () => {
       socket.off("online_users");
     };
   }, []);
 
   // =========================
   // 🔥 SAVE ACTIVE CHAT
   // =========================
  useEffect(() => {
   if (!currentUser || !activeId) return; // ✅ FIX
 
   localStorage.setItem(
     `activeChat_${currentUser.username}`,
     activeId
   );
 }, [activeId, currentUser]); // ✅ FIX dependency
 
   // =========================
   // 🔥 RECEIVE MESSAGE (REALTIME)
   // =========================
 useEffect(() => {
 const handler = (data: any) => {
   if (!currentUser) return;
 
   const me = currentUser.username.toLowerCase();
   const sender = data.sender.toLowerCase();
   const receiver = data.receiver.toLowerCase();
 
   // ✅ update current chat messages
   if (active) {
     const other = active.name.toLowerCase();
 
     if (
       (sender === other && receiver === me) ||
       (sender === me && receiver === other)
     ) {
       setMessages((prev) => [
         ...prev,
         {
           id: Date.now().toString() + Math.random().toString(36),
           conversationId: active.id,
           authorId: sender === me ? "me" : "other",
           text: data.text,
           time: new Date().toISOString(),
         },
       ]);
     }
   }
 const otherUser = sender === me ? receiver : sender;
   // ✅ ALWAYS update sidebar (important fix)
 setChatList((prev) => {
   // 🔥 check if chat already exists
 const exists = prev.find((c) => c.id === otherUser);
 
   let updated;
 
   if (!exists) {
     // 🔥 CREATE NEW CHAT AUTOMATICALLY
     const newUser = sender === me ? receiver : sender;
 
     const newConv = {
       id: newUser,
       name: newUser,
       initials: newUser.slice(0, 2).toUpperCase(),
       avatarTone: "blue" as any,
       preview: data.text,
       time: new Date().toLocaleTimeString([], {
         hour: "numeric",
         minute: "2-digit",
       }),
     };
     //changes 1
     updated = [newConv,...prev];
   } else {
     // 🔥 UPDATE EXISTING CHAT
     //changes2
     updated = prev
       .map((c) =>
         c.id === otherUser
           ? {
               ...c,
               preview: data.text,
               time: new Date().toLocaleTimeString([], {
                 hour: "numeric",
                 minute: "2-digit",
               }),
             }
           : c
       )
       .sort(
           (a, b) =>
           new Date(b.time).getTime() - new Date(a.time).getTime()
         );
   }
 
   // localStorage.setItem(
   //   `chatList_${currentUser.username}`,
   //   JSON.stringify(updated)
   // );
 
   return updated;
 });
 };
 
   socket.on("receive_message", handler);
 
   return () => {
     socket.off("receive_message", handler);
   };
 }, [active, currentUser]);
 
   // =========================
   // 🔥 LOAD MESSAGES
   // =========================
   useEffect(() => {
     if (!active || !currentUser) return;
 
     const load = async () => {
 const data = await getMessages(
   currentUser.username.toLowerCase(),
   active.name.toLowerCase()
 );
 
     const mapped = data.map((m: any) => ({
         id: m._id,
         conversationId: active.id,
         authorId:
           m.sender === currentUser.username.toLowerCase() ? "me" : "other",
         text: m.text,
         time: m.createdAt,
       }));
 
       setMessages(mapped);
 
       const last = data[data.length - 1];
 
         setChatList((prev) => {
           const updated = prev.map((c) =>
             c.id === active.id
               ? {
                   ...c,
                   preview: last?.text || "",
                   time: last?.createdAt || null,
                 }
               : c
           );
         
           return updated.sort(
             (a, b) =>
               new Date(b.time || 0).getTime() -
               new Date(a.time || 0).getTime()
           );
         });
     };
 
     load();
   }, [activeId,currentUser]);
 
   // =========================
   // 🔥 SEND MESSAGE
   // =========================
 const handleSend = async (text: string) => {
   if (!active || !currentUser) return;
 
 await sendMessage({
   sender: currentUser.username.toLowerCase(),
   receiver: active.name.toLowerCase(),
   text,
 });
 
   socket.emit("send_message", {
     sender: currentUser.username,
     receiver: active.name,
     text,
   });
 
   // ✅ ADD THIS BLOCK (MISSING PART)
   setMessages((prev) => [
     ...prev,
     {
       id: Date.now().toString() + Math.random().toString(36),
       conversationId: active.id,
       authorId: "me",
       text,
       time: new Date().toISOString(),
     },
   ]);
 
   // existing sidebar update (keep this)
   setChatList((prev) => {
     const updatedList = prev.map((c) =>
       c.id === active.id
         ? {
             ...c,
             preview: text,
             time: new Date().toLocaleTimeString([], {
               hour: "numeric",
               minute: "2-digit",
             }),
           }
         : c
     );
 
 //     localStorage.setItem(
 //   `chatList_${currentUser.username}`,
 //   JSON.stringify(updatedList)
 // );
     //changes 3
       return updatedList.sort(
        (a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
       );
   });
 };
 
   // =========================
   // 🔥 START CHAT
   // =========================
   const handleStartChat = (user: any) => {
 const existing = chatList.find(
   (c) => c.id === user.username
 );
 
     if (existing) {
       setActiveId(existing.id);
       return;
     }
 
     const newConv: Conversation = {
       id: user.username, // ✅ FIXED
       name: user.username,
       initials: user.username.slice(0, 2).toUpperCase(),
       avatarTone: "blue" as any,
       preview: "",
       time: "",
     };
 
 if (!currentUser) return; // ✅ IMPORTANT
 
 setChatList((prev) => {
   const updated = [newConv, ...prev];
 
   // localStorage.setItem(
   //   `chatList_${currentUser.username}`,
   //   JSON.stringify(updated)
   // );
 
   return updated;
 });
 
 setActiveId(newConv.id);
 
 // localStorage.setItem(
 //   `activeChat_${currentUser.username}`,
 //   newConv.id
 // );
 
   };
 
   return (
     <main className="min-h-screen bg-background p-4 md:p-6">
      {/* 🔥 MOBILE HEADER */}
       <div className="md:hidden flex items-center justify-between px-4 h-[60px] border-b border-border mb-3">
         <button
           onClick={() => setIsSidebarOpen(true)}
           className="text-xl"
         >
           ☰
         </button>
       
        <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <MessageSquare className="h-5 w-5" />
        </div>
      
        <span className="text-lg font-semibold tracking-tight">
          nexchat
        </span>
      </div>
       </div>
       <div className="mx-auto flex h-[calc(100dvh-80px)] max-w-[1400px] gap-4">
       <div
         className={`
           fixed md:static top-0 left-0 h-full z-50
           w-[80%] max-w-[320px]
           transform transition-transform duration-300
           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
           md:translate-x-0
         `}
       >
         <Sidebar
           conversations={chatList}
           activeId={activeId}
           onSelect={(id) => {
             setActiveId(id);
             setIsSidebarOpen(false); // 🔥 close after click
           }}
           query={query}
           onQuery={setQuery}
           findUser={findUser}
           onFindUser={setFindUser}
           currentUsername={currentUser?.username ?? ""}
           onLogout={logout}
           onUserSelect={(user) => {
             handleStartChat(user);
             setIsSidebarOpen(false); // 🔥 close after selecting user
           }}
           onlineUsers={onlineUsers}
         />
       </div>

       
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {active ? (
           <ChatWindow
              conversation={active}
              messages={messages}
              onSend={handleSend}
              onlineUsers={onlineUsers}
            />
          ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                      Search a user and start chatting
              </div>
           )}
      </div>
    </main>
  );
}