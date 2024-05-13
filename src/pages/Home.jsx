import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function Home() {
  const [id, setId] = useState("");
  const [socketIds, setSocketIds] = useState([]);
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [chat, setChat] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socket.connected) {
      alert("Socket is disconnected. Please refresh the page.");
      return;
    }
    if (message && receiver) {
      if(receiver === id){
        alert("You can't send message to yourself");
      }else{
        if (socketIds.includes(receiver)) {
          const data = {
            sender: id,
            receiver,
            message,
          };
          socket.emit("message", data);
          setChat((prev) => [...prev, data]);
        } else {
          alert("User not found");
        }
      }
    } else {
      alert("Message or receiver is empty");
    }
  };

  useEffect(() => {
    socket.on("message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("newConnection", (socketId) => {
      setSocketIds((prevIds) => [...prevIds, socketId]);
    });

    socket.on("userDisconnected", (socketId) => {
      setSocketIds((prevIds) => prevIds.filter((id) => id !== socketId));
    });

    socket.on("getRunningSockets", (data) => {
      setSocketIds(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      setId(socket.id);
    });

    return () => {
      socket.off('connect');
    }
  }, []);

  useEffect(() => {
    const handleDisconnect = () => {
      alert("Socket is disconnected. Please refresh the page.");
      socket.disconnect();
      setSocketIds([]);
    };

    const handleConnect = () => {
      setId(socket.id);
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
    };
  }, []);

  return (
    <div className="bg-purple-200 flex md:justify-evenly md:flex-row md:items-start items-center flex-col py-4 overflow-y-scroll h-screen">
      <form onSubmit={handleSubmit} className="w-fit mt-12">
        <h1 className="text-xl">Socket ID : {id || "Loading...."}</h1>

        <div className="flex mt-6 flex-col gap-4">
          <label htmlFor="id" className="text-xl font-[500]">
            Send To :{" "}
          </label>
          <input
            onChange={(e) => setReceiver(e.target.value)}
            value={receiver}
            type="text"
            id="id"
            className="px-4 outline-none resize-none"
            placeholder="id...."
          />
        </div>
        <div className="flex mt-6 flex-col gap-4">
          <label htmlFor="message" className="text-xl font-[500]">
            Send Message :{" "}
          </label>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            type="text"
            className="px-4 h-24 outline-none resize-none"
            placeholder="message..."
          />
        </div>

        <button
          className="bg-purple-500 mt-6 text-white h-12 w-32"
          type="submit"
        >
          Send
        </button>
        <div
          onClick={() => navigate("/rooms")}
          className="bg-purple-500 mt-6 ml-2 cursor-pointer text-white inline-flex items-center justify-center h-12 w-32"
        >
          Rooms
        </div>
      </form>
      <div className="md:max-h-[80vh] md:overflow-y-scroll mt-12">
        <h1 className="text-2xl font-bold my-2">Your Chats</h1>
        {chat?.map((item, index) => (
          <div
            key={index}
            className={`m-2 rounded-md p-2 w-fit ${
              item.sender !== id ? "bg-green-500" : "bg-white"
            }`}
          >
            <p>Sender : {item.sender === id ? "me" : item.sender}</p>
            {item.receiver !== id && <p>Receiver : {item.receiver}</p>}
            <p>Message : {item.message}</p>
          </div>
        ))}
      </div>
      {/* <div>
        <h2 className="text-xl font-bold">Connected Sockets</h2>
        <ul>
          {socketIds.map((socketId) => (
            <li key={socketId}>{socketId}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}

export default Home;
