// ? Chatbox Stuff
const log = (text,autor,color) =>{  // This function will be modified to do not use console.log but to use the chat box
    // document.getElementById("usernameError").innerHTML = `<span style='${color}'>**Message</span>`;

    const parent = document.getElementById("chat-list");
    const el = document.createElement('li'); // Create a <li> node num <ul>
    el.innerHTML = `<span style='color: ${color}'>${autor}: </span> ${text}`;
    parent.appendChild(el); // appends the <li> node to the <ul> node
    parent.scrollTop = parent.scrollHeight; // scrolls the chat box to the bottom
};

export {log};