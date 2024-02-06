const apiURL = "http://localhost:3500/chat";
window.onload = loadMessages();

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_IMG = "https://img.icons8.com/?size=77&id=AiI2Vzcqt9Op&format=png";
const PERSON_IMG = "https://img.icons8.com/?size=77&id=iBnwfeZ6ioYp&format=png";
const BOT_NAME = "QuakerBot";
const PERSON_NAME = "BloodBag";

function loadMessages() {
  const UrlToLoad = `${apiURL}`
    fetch(UrlToLoad)
      .then(data=>{return data.json()})
      .then(res=>{
        console.log(res);
        res.forEach(message => {
          appendMessage(
            message.role==="user" ? PERSON_NAME : BOT_NAME, 
            message.role==="user" ? PERSON_IMG : BOT_IMG, 
            message.role==="user" ? "right" : "left", 
            message.message,
            message.time)
        });
    });
}


msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
  msgerInput.value = "";

  const UrlToLoad = `${apiURL}`
  fetch(UrlToLoad,{
    method: "POST",
    body: JSON.stringify({
      "name": PERSON_NAME,
      "message": msgText
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }) 
  .then(data=>{return data.json()})
  .then(res=>{
      console.log(res);
      appendMessage(BOT_NAME, BOT_IMG, "left", res.message, formatDate(new Date()));
  });

});


function appendMessage(name, img, side, text, time) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${time}</div>
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
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-') + " " + strTime;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
