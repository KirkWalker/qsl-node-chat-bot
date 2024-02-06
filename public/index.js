//const button = document.getElementById("button");
//const output = document.getElementById("output");
// button.addEventListener("click", () => {
//     loadMessages()
// });

const apiURL = "http://localhost:3500/chat";




window.onload = loadMessages();

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_MSGS = [
  "Hi, how are you?",
  "Ohh... I can't understand what you trying to say. Sorry!",
  "I like to play games... But I don't know how to play!",
  "Sorry if my answers are not relevant. :))",
  "I feel sleepy! :("
];

// Icons made by Freepik from www.flaticon.com
const BOT_IMG = "https://img.icons8.com/?size=77&id=37410&format=png";
const PERSON_IMG = "https://img.icons8.com/?size=77&id=23261&format=png";
const BOT_NAME = "QuakerBot";
const PERSON_NAME = "Kirk";

function loadMessages() {
  const UrlToLoad = `${apiURL}`
    fetch(UrlToLoad)
      .then(data=>{return data.json()})
      .then(res=>{
        console.log(res);
        appendMessage(res[0].name, res[0].img, "left", res[0].message)
        //appendMessage(res[1].name, res[0].img, "right", res[1].message)
        //output.innerText = res.me;
    });

}


msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";

  const UrlToLoad = `${apiURL}`
  fetch(UrlToLoad,{
    method: "POST",
    body: JSON.stringify({
      "name": "Kirk",
      "message": msgText
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }) 
  .then(data=>{return data.json()})
  .then(res=>{
      console.log(res);
      appendMessage(res.name, res.img, "left", res.message);
  });

});


function appendMessage(name, img, side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}


// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
