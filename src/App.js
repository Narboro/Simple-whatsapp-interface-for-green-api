import React from "react";
import "./App.css";
import { useState } from "react";

function App() {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [viewDialog, setViewDialog] = useState(false);
  const [message, setMessage] = useState([]);
  const [dialog, setDialog] = useState([]);
  const [receiptId, setReceiptId] = useState('');

  const ContactListItem = () => {
    return <div className="contact-list-item">{phoneNumber}</div>;
  };

  const MessageListItem = () => {
    return (
      <div className="messages-container">
        {dialog.map((message) => {
          return <div className={message.type}>{message.message}</div>;
        })}
      </div>
    );
  };

  const sendMessage = () => {
    setViewDialog(true);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      chatId: [phoneNumber] + "@c.us",
      message: String([message]),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://api.green-api.com/waInstance" + [idInstance] + "/sendMessage/" + [apiTokenInstance],
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const receivedResult = JSON.parse(result);
        if(receivedResult.idMessage){
          setDialog([...dialog, { type: "message-sent", message: [message] }]);
        }
      })
      .catch((error) => console.log("error", error));
  };

  const getMessages = () => {
    if(phoneNumber){
      setViewDialog(true);
    }

    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://api.green-api.com/waInstance" +
        [idInstance] +
        "/receiveNotification/" +
        [apiTokenInstance],
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const received = JSON.parse(result);
        setReceiptId(received?.receiptId);
        if(received?.body?.typeWebhook === 'incomingMessageReceived' && received?.body?.senderData?.chatId.replace('@c.us', '') === phoneNumber){
          setDialog([...dialog, { type: "message-received", message: [received.body.messageData.textMessageData.textMessage] }]);
        }
        if(phoneNumber.length === 11){
          deleteMessages();
        }
      })
      .catch((error) => console.log("error", error));
  };

  const deleteMessages = () => {
    var requestOptions = {
      method: "DELETE",
      redirect: "follow",
    };

    fetch(
      "https://api.green-api.com/waInstance" +
        [idInstance] +
        "/deleteNotification/" +
        [apiTokenInstance] +
        "/" +
        [receiptId],
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const receivedResult = JSON.parse(result);
        if(receivedResult.result){
          getMessages();
        }
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <div className="app">
      <div className="main-window">
        <div className="contact-list">
          <div className="input-holder">
            <div className="inner-input">
              <div className="sign">IdInstance:</div>
              <input
                className="my-input"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                autoFocus
                placeholder="введите IdInstance"
              />
            </div>
          </div>
          <div className="input-holder">
            <div className="inner-input">
              <div className="sign">apiTokenInstance:</div>
              <input
                className="my-input"
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                placeholder="введите apiTokenInstance"
              />
            </div>
          </div>
          <button className="button-two" onClick={getMessages}>
            Получить сообщения
          </button>
          <div className="separator"></div>
          {viewDialog && <ContactListItem />}1
        </div>
        <div className="messages-list">
          <div className="input-holder">
            <div className="inner-input">
              <div className="sign">Номер телефона:</div>
              <input
                className="my-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="формат: 79269999999"
              />
            </div>
          </div>
          <div className="inner-input">
            <div className="sign">Сообщение:</div>
            <input
              className="my-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="введите сообщение"
            />
            <button className="button-one" onClick={sendMessage}>
              Отправить
            </button>
          </div>
          <div className="separator"></div>
          {viewDialog && <MessageListItem />}
        </div>
      </div>
    </div>
  );
}

export default App;
