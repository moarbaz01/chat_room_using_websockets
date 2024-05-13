import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { generateUsername } from "unique-username-generator";

const socket = io("http://localhost:5000");
const username = generateUsername();
function Rooms() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState({
    id: "",
    name: null,
  });
  const [typingData, setTypingData] = useState([]);
  const [showTyping, setShowTyping] = useState([]);
  const [roomNotify, setRoomNotify] = useState([]);
  const [roomChat, setRoomChat] = useState([]);
  const lastElement = useRef();
  const rooms = [
    {
      name: "funwithcoders",
    },
    {
      name: "technews",
    },
    {
      name: "premiumcourse",
    },
  ];

  const handleSendMessage = (roomId) => {
    socket.emit("message_in_room", { room: room.name, username, message });
    // alert("Message Sent");
  };

  const handleJoinRoom = (roomId) => {
    socket.emit("join_room", { room: roomId, username });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room", { username, room: room.name });
    setRoomNotify([]);
    setRoomChat([]);
  };

  useEffect(() => {
    socket.off("createRoom");
    socket.off("already_in_room");
    socket.off("room_message");
    socket.off("show_typing");
    socket.off("hide_typing");
    socket.off("leaveRoom");

    socket.on("createRoom", (data) => {
      const message = data.username + " " + "Joined in room";
      setRoomNotify((prev) => [...prev, { message, room: data.room }]);
    });

    socket.on("already_in_room", (data) => {
      alert(`${data.username} already joined in room ${data.room}`);
    });

    socket.on("room_message", (data) => {
      setRoomChat((prev) => [...prev, data]);
    });

    socket.on("show_typing", (data) => {
      setTypingData((prev) => [...prev, data]);
      console.log(typingData);
    });

    socket.on("hide_typing", (data) => {
      setTypingData((prev) =>
        prev.filter(
          (item) =>
            !(item.username === data.username && item.room === data.room)
        )
      );
    });

    socket.on("leaveRoom", (data) => {
      const message = data.username + " " + "Leave from room";
      setRoomNotify((prev) => [...prev, { message, room: data.room }]);
    });
  }, [socket]);

  useEffect(() => {
    lastElement.current?.scrollIntoView();
  }, [roomChat.length, typingData.length]);

  useEffect(() => {
    setRoomChat([])
    setRoomNotify([])
  }, [username]);


  const handleChangeMessageAndShowTyping = (e) => {
    const data = { username, room: room.name };
    socket.emit("typing", data);
  };

  const handleHideTyping = () => {
    socket.emit("typing_leave", { username, room: room.name });
  };

  return (
    <div className=" bg-purple-200 px-4 py-4 md:h-screen min-h-screen">
      <div className=" md:w-[30vw] md:float-start">
        <div
          onClick={() => navigate("/")}
          className=" text-violet-500 cursor-pointer font-bold mb-4"
        >
          Back To Home
        </div>
        <h1 className="py-2">Username : {username}</h1>
        <h1 className=" bg-violet-500 py-4 text-2xl text-white text-center ">
          Select Rooms
        </h1>
        <div>
          {rooms?.map((room, index) => {
            return (
              <div
                onClick={() => setRoom({ id: index, name: room.name })}
                key={index}
                className="border-b-2 border-purple-500 hover:bg-white/40 px-2 cursor-pointer transition py-4"
              >
                {room.name}

                <div
                  onClick={() => handleJoinRoom(room.name)}
                  className=" hover:bg-purple-300 transition text-xl bg-purple-500 h-8  w-8 rounded-full cursor-pointer text-white  inline-flex items-center justify-center float-end "
                >
                  +
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className=" md:w-[50vw] mt-12 md:mt-0 md:float-end pb-4 bg-white/50">
        <h1 className=" bg-violet-500 py-4 text-2xl text-white text-center ">
          {room.name || "Select Room"}

          <button
            onClick={handleLeaveRoom}
            className=" p-1 ml-6 text-sm bg-red-500"
          >
            Leave
          </button>
        </h1>
        <div className="md:h-[70vh] min-h-[20vh] overflow-y-scroll flex flex-col">
          {room.name !== null ? (
            <>
              {roomNotify
                ?.filter((item) => item.room === room.name)
                .map((item, index) => {
                  return (
                    <div
                      className=" w-fit p-2 m-1 text-white bg-red-400"
                      key={index}
                    >
                      {item.message}
                    </div>
                  );
                })}

              {roomChat
                ?.filter((item) => item.room === room.name)
                .map((item, index) => {
                  return (
                    <div
                      className={`${
                        item.username === username && "float-end"
                      } w-full`}
                      key={index}
                    >
                      <div
                        className={`${
                          item.username === username
                            ? "bg-green-500 float-end"
                            : "bg-purple-400"
                        } w-fit p-2 m-1 text-white `}
                      >
                        <p>{item.username}</p>
                        <p className=" ">{item.message}</p>
                      </div>
                    </div>
                  );
                })}
              {typingData
                ?.filter((item) => item.room === room.name)
                .map((item, index) => {
                  return (
                    <div
                      className={`${
                        item.username === username && "hidden"
                      } w-full`}
                      key={index}
                    >
                      <div
                        className={` bg-white
                        w-fit p-2 m-1  `}
                      >
                        <p>{item.username}</p>
                        <p className=" w-[50%]">{"Typing...."}</p>
                      </div>
                    </div>
                  );
                })}
              <div ref={lastElement}></div>
            </>
          ) : (
            ""
          )}
        </div>

        <div className="w-full flex items-center gap-4 justify-center">
          <input
            onFocus={handleChangeMessageAndShowTyping}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={handleHideTyping}
            value={message}
            type="text"
            id="id"
            className="px-4 h-12 w-[60%] outline-none resize-none"
            placeholder="message...."
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-500 text-white  h-12 w-32 "
            // type="submit"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rooms;
