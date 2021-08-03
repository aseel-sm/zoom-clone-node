const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

let myVideoStream;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream);

    peer.on("call", (call) => {
      console.log("Call Hiited");
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("User Connected");
      setTimeout(connectToNewUser, 1000, userId, stream);
      // await connectToNewUser(userId, stream);
    });
  });

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  console.log("Make call");
  const call = peer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    console.log("remote stream");
    addVideoStream(video, userVideoStream);
  });
};

let text = $("input");
console.log(text);

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    socket.emit("message", text.val());
    $("ul").append(`<li class='message'><b>Me</b><br/>${text.val()}</li>`);
    scrollToBottom();
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class='message'><b>User</b><br/>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = (params) => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = (params) => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = (params) => {
  const html = `<i class='fas fa-microphone' ></i>
  <span>Mute</>`;

  document.querySelector(".main_mute_button").innerHTML = html;
};
const setUnmuteButton = (params) => {
  const html = `<i class='unmute fas fa-microphone-slash' ></i>
  <span>Unmute</>`;

  document.querySelector(".main_mute_button").innerHTML = html;
};

const playStop = (params) => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = (params) => {
  const html = `<i class='fas fa-video' ></i>
    <span>Stop Video</>`;

  document.querySelector(".main_video_button").innerHTML = html;
};

const setPlayVideo = (params) => {
  const html = `<i class='stop fas fa-video-slash' ></i>
    <span>Video</>`;

  document.querySelector(".main_video_button").innerHTML = html;
};
