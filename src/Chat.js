import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  IconButton
} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  chatCard: {
    width: "100%",
    height: "100%",
    margin: "auto",
    marginTop: 0
  },
  title: {
    fontSize: "1.5rem"
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    marginBottom: "1%"
  },
  inputField: {
    flexGrow: 1,
    marginRight: "8px"
  }
});

const Chat = () => {
  const classes = useStyles();
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const chatContainerRef = useRef(null);

  const handleUserMessageChange = (event) => {
    setUserMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (userMessage) {
      const botMessage = { message: "Typing...", isBot: true };
      setChatMessages((prevChatMessages) => [
        ...prevChatMessages,
        { message: userMessage, isBot: false },
        botMessage
      ]);
      setIsButtonClicked(true);
    }
  };

  const fetchBotMessage = useCallback(() => {
    fetch(
      `https://walrus-app-hodhq.ondigitalocean.app/android?q=${userMessage}`
    )
      .then((response) => response.text())
      .then((data) => {
        const botMessage = { message: data, isBot: true };
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages.slice(0, -1),
          botMessage
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userMessage]);

  useEffect(() => {
    if (isButtonClicked) {
      fetchBotMessage();
      setIsButtonClicked(false);
      setUserMessage("");
    }
  }, [isButtonClicked, fetchBotMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const formatMessage = (message) => {
    return message.split("```").map((snippet, index) => {
      if (index % 2 === 1) {
        const languageMatch = snippet.match(/^(\w+)\n/);
        const language = languageMatch ? languageMatch[1] : null;
        const cleanedSnippet = snippet.replace(/^\w+\n/, "");
        const highlightedSnippet = hljs.highlightAuto(
          cleanedSnippet,
          language ? [language] : null
        ).value;
        return (
          <div key={index} style={{ position: "relative" }}>
            <pre
              style={{
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
              }}
              dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
            ></pre>
            <IconButton
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: 0,
                fontSize: "0.8rem"
              }}
              onClick={() => {
                navigator.clipboard.writeText(cleanedSnippet);
              }}
            >
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </div>
        );
      } else {
        return <span key={index}>{snippet}</span>;
      }
    });
  };

  return (
    <div className={classes.root}>
      <Card className={classes.chatCard}>
        <CardContent>
          <Typography className={classes.title} align="center" gutterBottom>
            Jarvis
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "60vh",
              overflow: "auto"
            }}
            ref={chatContainerRef}
          >
            {chatMessages.map((message, index) => (
              // ... rest of the code remains the same
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: message.isBot ? "flex-start" : "flex-end",
                  marginBottom: "8px"
                }}
              >
                <Card
                  style={{
                    width: "auto",
                    maxWidth: "85%",
                    backgroundColor:
                      message.isBot === false ? "#f7f7f7" : "white"
                  }}
                >
                  <CardContent
                    style={{
                      padding: "5px"
                    }}
                  >
                    <Typography variant="body1" style={{ fontSize: 14 }}>
                      {formatMessage(message.message)}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className={classes.inputContainer}>
        <TextField
          className={classes.inputField}
          label="Type a message"
          value={userMessage}
          onChange={handleUserMessageChange}
          autoComplete="off"
          autoFocus
          multiline
          rows={4}
          inputProps={{
            style: {
              overflow: "auto",
              resize: "both"
            }
          }}
          variant="outlined"
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
};
export default Chat;
