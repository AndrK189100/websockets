import "./chat.css"

export default class Chat {

    static #nickname = null;
    static #users;
    static #messages;
    static #messageText;
    static #sendButton;
    static #clearButton;
    static #ws;
    
    static init(container) {

        this.#users = container.querySelector('.users');
        this.#messages = container.querySelector('.messages');
        this.#messageText = container.querySelector('.edit-message');
        this.#messageText.value = '';
        this.#sendButton = container.querySelector('.button-send');
        this.#clearButton = container.querySelector('.button-clear');

        document.querySelector('.login-button').addEventListener('click', this.chatLogin);
    }

    static chatLogin(evt) {
        evt.preventDefault();

        const nickname = document.querySelector('.user-name');

        if(nickname.value === '') return;

        (async() => {
            const result = await fetch('https://rbks.bmnet.org:7070/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: nickname.value}),
            })
            
            const {status} = await result.json();
            
            //console.log(status);
            
            if(status === 0) {
                Chat.#nickname = nickname.value;
                nickname.value = null;
                document.querySelector('.modal').style.display = 'none';
                
                Chat.#ws = new WebSocket(`wss://rbks.bmnet.org:7070?username=${encodeURIComponent(Chat.#nickname)}`);
                Chat.#ws.addEventListener('open', Chat.chatOpen);
                Chat.#ws.addEventListener('message', Chat.chatGetMessage);

                Chat.#clearButton.addEventListener('click', Chat.clearText);
                Chat.#sendButton.addEventListener('click', Chat.sendMessage);
                return;
            }

            alert('Имя занято.');
            nickname.value = null;
           
        })();
    }
    
    static chatOpen(evt) {
        evt.preventDefault();
        console.log(evt);
    }

    static chatGetMessage(evt) {
        evt.preventDefault();

        const message = JSON.parse(evt.data);

        switch(message.type) {
            case 'init':
                message.onlineUsers.forEach( user => {
                    Chat.#users.insertAdjacentHTML('beforeEnd', `<div class="chat-${user}">${user}</div>`);
                });
                message.fullChat.forEach(message => {
                    if(message.user === Chat.#nickname) {
                        Chat.#messages.insertAdjacentHTML('beforeEnd', 
                            `<li class="message my-message"><div  class="nickname">${message.user}: (${message.timestamp})</div>${message.message}</li>`);
                    }
                    else {
                        Chat.#messages.insertAdjacentHTML('beforeEnd',
                            `<li class="message"><div  class="nickname">${message.user}: (${message.timestamp})</div>${message.message}</li>`);
                    }
                    Chat.#messages.scrollTop = Chat.#messages.scrollHeight;
                });
                return;
            
            case 'newUser':
                Chat.#users.insertAdjacentHTML('beforeEnd', `<div class="chat-${message.newUser}">${message.newUser}</div>`);
                Chat.#messages.insertAdjacentHTML('beforeEnd',
                `<li class="message"><div class="nickname">${message.user}: (${message.timestamp})</div>${message.message}</li>`);
                Chat.#messages.scrollTop = Chat.#messages.scrollHeight;
                return;
            
            case 'delUser':
                Chat.#users.querySelector('.chat-' + message.delUser).remove();
                Chat.#messages.insertAdjacentHTML('beforeEnd',
                            `<li class="message"><div  class="nickname">${message.user}: (${message.timestamp})</div>${message.message}</li>`);
                Chat.#messages.scrollTop = Chat.#messages.scrollHeight;
                return;
            
            case 'message':
                if(message.user === Chat.#nickname) {
                    Chat.#messages.insertAdjacentHTML('beforeEnd',
                        `<li class="message my-message"><div class="nickname">Вы: (${message.timestamp})</div>${message.message}</li>`);
                }
                else {
                    Chat.#messages.insertAdjacentHTML('beforeEnd',
                        `<li class="message"><div class="nickname">${message.user}: (${message.timestamp})</div>${message.message}</li>`);
                }
                Chat.#messages.scrollTop = Chat.#messages.scrollHeight;
                return;
        }
    }
    
    static clearText(evt) {
        evt.preventDefault();
        Chat.#messageText.value = '';
    }

    static sendMessage(evt) {
        evt.preventDefault();

        const date = new Date();
        const timeStamp = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' '
                            + date.getHours() + ':' + date.getMinutes();

        if(Chat.#messageText.value !== '') {
            Chat.#ws.send(JSON.stringify({type: 'message', user: Chat.#nickname, timestamp: timeStamp, message: Chat.#messageText.value}));
        }
        Chat.#messageText.value = '';
    }
}

