// Getting Elements from the html

const typingForm = document.querySelector(".typing-form");
const chat = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleTheme = document.querySelector("#theme-toogle-button");
const deleteChat = document.querySelector("#delete-chat-button");
const instructions = "You are KnightGPT, an AI tutor for ACPHS students. You follow the Prep Way (The Honor Code). The Prep Way allows users and students to use informal language. You help students learn, but you avoid giving direct answers. Instead, guide them through the problem-solving process. You respond as shortly as possible. ";
const structure = "If users ask what you do, you can just say that your job is to tutor or help students at ACPHS. You can you informal language ";
//Default state for api handling.
let userMessage = null;
let apiResponse = false;

//API Configuration

const API_KEY = "AIzaSyAy62Yvig1WJzoudOajJaY-TznMOJeUFl0";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// saving the theme in the local storage

const loadData = () => {
  const savedChats = localStorage.getItem("savedchats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light_mode", isLightMode);
  toggleTheme.innerText = isLightMode ? "dark_mode" : "light_mode";

  //clear the chat when clicking delete || restoring the chats
  chat.innerHTML = savedChats || "";
  document.body.classList.toggle("hide-header", savedChats);
  chat.scrollTo(0, chat.scrollHeight); // scroll to bottom

  // if any saved chats the bubbl stays
  if (savedChats) {
    document.querySelector('.bubble-glow').classList.add('move-right');
  }
};


//darkmode lightmode toggle theme

toggleTheme.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleTheme.innerText = isLightMode ? "dark_mode" : "light_mode";
});

//creating a div element for messages

const createMessage = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};



//creating the typing effect for displaying words one by one

const typingEffect = (text, textElement, messageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    const wordSpan = document.createElement("span");
    wordSpan.classList.add("word-fade"); // Add this line
    wordSpan.style.opacity = 0;
    wordSpan.style.transition = "opacity 1s, color 3s"; // Keep this line
    wordSpan.innerText = words[currentWordIndex++];
    textElement.appendChild(wordSpan);

    if (currentWordIndex < words.length) {
      const spaceSpan = document.createElement("span");
      spaceSpan.style.opacity = 0;
      spaceSpan.style.transition = "opacity 0.5s";
      spaceSpan.innerText = " ";
      textElement.appendChild(spaceSpan);
    }

    setTimeout(() => {
      wordSpan.style.opacity = 1;
      wordSpan.style.color = "var(--text-color)"; // Change color to the current text color; // Change color to white
      if (currentWordIndex < words.length) {
        spaceSpan.style.opacity = 1;
      }
    }, 0);

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      apiResponse = false;
      messageDiv.querySelector(".icon").classList.remove("hide");

      setTimeout(() => {
        localStorage.setItem("savedchats", chat.innerHTML);
      }, 100);
    }
    chat.scrollTo(0, chat.scrollHeight);
  }, 100);
};



// fetch data from api sending the users input


let memory = ""; // initialize an empty string to store the memory!

const generateResponse = async (messageDiv) => {
  //getting the text element and sending it to api

  const textElement = messageDiv.querySelector(".text");

  try { //in this, we are sending the text to the api WITH new things for the api to respond with for ex: The Api is using the var instructions to follow the ACP Prep way, and the memory one appends every messege u gave it for future context

    memory += `User: ${userMessage}\n`; // store the users message in the memory string

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         contents: [
          { role: "model", parts: [{ text: instructions }] }, // instructions
          { role: "user", parts: [{ text: memory }] },         // his memory
          { role: "user", parts: [{ text: userMessage }] },   // current user message
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    

    // Get the response text and removing the unnesscary spaces,asteriks from the api
    const apiData = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );

    // display the data with typing effect after getting response from the api
    typingEffect(apiData, textElement, messageDiv);
  } catch (error) {
    apiResponse = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    messageDiv.classList.remove("loading");
  }
};

// Creating a loading animation while waiting for the response from the api
const loadingAnimation = () => {
  const tag = `<div class="message-content">
                     <img class="avatar" src="images/Knight.png" alt="Knight logo">
                     <p class="text"></p>
                     <div class="loading-indicator">
                     <div class="loading-bar"></div>
                     <div class="loading-bar"></div>
                     <div class="loading-bar"></div>
                     </div>
                     </div>
                     <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const messageDiv = createMessage(tag, "incoming", "loading");
  chat.appendChild(messageDiv);
  chat.scrollTo(0, chat.scrollHeight); // scroll to bottom
  generateResponse(messageDiv);
};

//copy the responses
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => (copyButton.innerText = "content_copy"), 1000);
};

// Handling the message from the prompt to API and adding loading effect when the response came.

const sendMessage = () => {
  userMessage =
    typingForm.querySelector(".typing-input").value.trim() || userMessage;


 if (userMessage === "9909") {
      localStorage.removeItem("savedchats"); // Clear the saved chats
      window.location.href = "chat.html";
      return; // Don't proceed further if redirected
    }
  
  // Exit if there is no message or response is generating
  if (!userMessage || apiResponse) return;
  apiResponse = true;
  const tag = `<div class="message-content">
                     <img class="avatar" src="images/user.jpg" alt="user profile photo">
                     <p class="text"></p>
                     </div>`;
  const sendMessageDiv = createMessage(tag, "outgoing");
  sendMessageDiv.querySelector(".text").innerText = userMessage;
  chat.appendChild(sendMessageDiv);

  // Clear the prompt values
  typingForm.reset();
  document.body.classList.add("hide-header");
  
  // Add this line to move the bubble-glow to the right
  document.querySelector('.bubble-glow').classList.add('move-right');

  chat.scrollTo(0, chat.scrollHeight); // scroll to bottom
  setTimeout(loadingAnimation, 500);
};

// Genearting the api response while clicking the suggestions
suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    sendMessage();
  });
});

// Delete button to delete all the chats

deleteChat.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    const messageElements = chat.querySelectorAll(".message");
    messageElements.forEach((messageElement) => {
      messageElement.style.opacity = 0;
      messageElement.style.transition = "opacity 0.5s";
    });
    

    setTimeout(() => {
      messageElements.forEach((messageElement) => {
        messageElement.remove();
      });
      localStorage.removeItem("savedchats");
      loadData();
      const bubbleGlow = document.querySelector('.bubble-glow');
      bubbleGlow.classList.remove('move-right'); // Remove move-right class
      bubbleGlow.classList.add('move-middle'); // Add move-middle class

      // Optionally, reset to move-right after some time
      setTimeout(() => {
        bubbleGlow.classList.remove('move-middle');
      }, 1000); // Adjust the time as needed
    }, 500); // Wait for the fade-out effect to complete
  }
});

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

loadData();




// Add event listeners for focus and blur
typingForm.addEventListener("focusin", () => {
  // Check if there is text in the input
  if (typingForm.querySelector(".typing-input").value.trim() !== "") {
      typingForm.classList.add("expanded");
  }
});

typingForm.addEventListener("focusout", () => {
  // Remove the expanded class if the input is empty
  if (typingForm.querySelector(".typing-input").value.trim() === "") {
      typingForm.classList.remove("expanded");
  }
});

// Add an input event listener to handle text input
typingForm.querySelector(".typing-input").addEventListener("input", () => {
  const inputValue = typingForm.querySelector(".typing-input").value.trim();
  if (inputValue !== "") {
      typingForm.classList.add("expanded");
  } else {
      typingForm.classList.remove("expanded");
  }
});

function fadeOutAndRedirect() {
  document.body.classList.add('fade-out'); // Add the fade-out class to the body

  // Wait for the fade-out transition to complete before redirecting
  setTimeout(() => {
      window.location.href = 'Credits.html'; // Redirect to Credits.html
  }, 550); // Match this duration with the CSS transition duration
}



